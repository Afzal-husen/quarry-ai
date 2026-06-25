import os
import logging
import threading
from typing import Any, Dict, List, Optional, Sequence
from pydantic import SecretStr

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langchain_groq import ChatGroq


class GroqConnectionError(Exception):
    """Exception raised when the Groq client connection fails or key is missing."""
    pass


class InferenceError(Exception):
    """Exception raised when the Groq generative answering model fails during inference."""
    pass


class GroqConnectionManager:
    """Thread-safe singleton class to load and cache standard ChatGroq client connections."""

    _instance: Optional[ChatGroq] = None
    _lock = threading.Lock()

    @classmethod
    def get_chat_model(cls) -> ChatGroq:
        """Loads and caches the ChatGroq model instance thread-safely.

        Returns:
            The instantiated ChatGroq object.

        Raises:
            GroqConnectionError: If the GROQ_API_KEY environment variable is not configured.
        """
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    api_key = os.getenv("GROQ_API_KEY")
                    if not api_key:
                        raise GroqConnectionError(
                            "GROQ_API_KEY is not configured inside .env or the system environment."
                        )
                    model_name = os.getenv(
                        "GROQ_MODEL", "llama-3.1-8b-instant")
                    try:
                        cls._instance = ChatGroq(
                            model=model_name,
                            api_key=SecretStr(api_key)
                        )
                    except Exception as e:
                        raise GroqConnectionError(
                            f"Failed to connect to Groq client using model '{model_name}': {str(e)}"
                        ) from e
        return cls._instance


class QAPipeline:
    """Orchestrates strict grounding prompts assembly and Groq generative answering workflows."""

    def generate_answer(self, query: str, retrieved_docs: Sequence[Document]) -> Dict[str, Any]:
        """Synthesizes an answer to the query based strictly on retrieved document context.

        Args:
            query: The user's natural language question.
            retrieved_docs: A list of relevant semantic LangChain Document chunks.

        Returns:
            A dictionary containing the generated "answer" and a list of source "citations".

        Raises:
            InferenceError: If generative answering fails or API calls crash.
        """
        # 1. Format document snippets context
        context_blocks = []
        for doc in retrieved_docs:
            filename = doc.metadata.get("source_filename", "Unknown Document")
            page = doc.metadata.get("page_index", 0)
            context_blocks.append(
                f"Source: {filename} (Page {page})\n"
                f"Snippet:\n{doc.page_content}"
            )

        context_text = "\n\n---\n\n".join(
            context_blocks) if context_blocks else "NO DOCUMENT CONTEXT AVAILABLE"

        # 2. Build the strict grounding system prompt instruction
        fallback_msg = "I am sorry, but the provided documents do not contain the answer to your question."
        system_instruction = (
            "You are a helpful assistant designed to perform question-answering over documents.\n"
            "Answer the user's question based strictly on the provided context snippets below.\n"
            f"If the answer cannot be found or inferred from the provided context snippets, you MUST respond EXACTLY with: '{fallback_msg}'\n"
            "Do NOT use any external or general knowledge, and do NOT make up or extrapolate facts.\n\n"
            f"Retrieved Document Context:\n{context_text}"
        )

        # 3. Assemble and trigger ChatGroq model
        try:
            model = GroqConnectionManager.get_chat_model()
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_instruction),
                ("human", "{question}")
            ])
            chain = prompt | model | StrOutputParser()
            answer = chain.invoke({"context": context_text, "question": query})
        except Exception as e:
            raise InferenceError(
                f"Groq generative inference failed: {str(e)}") from e

        # 4. Format structured citation outputs
        citations = []
        # If the LLM successfully answered, bind source references
        if answer != fallback_msg and retrieved_docs:
            for doc in retrieved_docs:
                citations.append({
                    "source_filename": doc.metadata.get("source_filename", "Unknown Document"),
                    "page_index": doc.metadata.get("page_index", 0),
                    "document_id": doc.metadata.get("document_id", ""),
                    "text": doc.page_content
                })

        return {
            "answer": answer,
            "citations": citations
        }

    async def generate_answer_stream(
        self,
        query: str,
        retrieved_docs: Sequence[Document],
    ):
        """Streams the generative answer token-by-token using ChatGroq's async streaming.

        Builds the same strict-grounding system prompt as generate_answer(), but invokes
        the LangChain chain with .astream() to yield individual text tokens as they arrive.

        Args:
            query: The user's natural language question.
            retrieved_docs: A list of reranked LangChain Document chunks.

        Yields:
            Individual string tokens from the LLM response.

        Raises:
            InferenceError: Raised inside the generator if the streaming call fails.
        """
        # 1. Format document snippets context — identical logic to generate_answer()
        context_blocks = []
        for doc in retrieved_docs:
            filename = doc.metadata.get("source_filename", "Unknown Document")
            page = doc.metadata.get("page_index", 0)
            context_blocks.append(
                f"Source: {filename} (Page {page})\n"
                f"Snippet:\n{doc.page_content}"
            )

        context_text = "\n\n---\n\n".join(
            context_blocks) if context_blocks else "NO DOCUMENT CONTEXT AVAILABLE"

        # 2. Build the strict grounding system prompt — same constraints as the sync path
        fallback_msg = "I am sorry, but the provided documents do not contain the answer to your question."
        system_instruction = (
            "You are a helpful assistant designed to perform question-answering over documents.\n"
            "Answer the user's question based strictly on the provided context snippets below.\n"
            f"If the answer cannot be found or inferred from the provided context snippets, you MUST respond EXACTLY with: '{fallback_msg}'\n"
            "Do NOT use any external or general knowledge, and do NOT make up or extrapolate facts.\n\n"
            f"Retrieved Document Context:\n{context_text}"
        )

        # 3. Assemble the LangChain chain and stream tokens via async generator
        try:
            model = GroqConnectionManager.get_chat_model()
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_instruction),
                ("human", "{question}")
            ])
            chain = prompt | model | StrOutputParser()
            async for token in chain.astream({"context": context_text, "question": query}):
                yield token
        except Exception as e:
            raise InferenceError(
                f"Groq streaming inference failed: {str(e)}") from e

    def condense_query(self, chat_history: List[Dict[str, Any]], question: str) -> str:
        """Rewrites a follow-up user query into a standalone query using the chat history context.

        Args:
            chat_history: A list of dicts with keys "role" and "content" representing past turns.
            question: The latest user question.

        Returns:
            The standalone rewritten question.
        """
        if not chat_history:
            return question

        try:
            model = GroqConnectionManager.get_chat_model()
            
            # Map database messages to LangChain prompt roles
            messages = [("system", (
                "Given the following chat history and a follow-up question, "
                "rephrase the follow-up question to be a standalone question, "
                "in its original language, that can be answered independently of the chat history.\n"
                "Do NOT answer the question. Just rephrase it as a search query.\n"
                "If the follow-up question is already a standalone question or does not reference "
                "prior context, return the follow-up question exactly as is."
            ))]
            
            for msg in chat_history:
                role = "human" if msg["role"] == "user" else "ai"
                messages.append((role, msg["content"]))
                
            messages.append(("human", "{question}"))
            
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | model | StrOutputParser()
            
            condensed = chain.invoke({"question": question})
            return condensed.strip()
        except Exception as e:
            # Fallback to the original question if inference fails to keep the system resilient
            logging.getLogger("app.exception").warning(
                f"Query condensation failed: {str(e)}. Falling back to raw user query."
            )
            return question

    def generate_session_title(self, question: str) -> str:
        """Summarizes the user question in 3-5 words as a chat session title.

        Args:
            question: The user's question.

        Returns:
            The summarized session title, or "New Chat" on failure.
        """
        try:
            model = GroqConnectionManager.get_chat_model()
            prompt = ChatPromptTemplate.from_messages([
                ("human", "Summarize the user question in 3-5 words as a chat session title. Do not use quotes, punctuation, or preamble. Question: {question}")
            ])
            chain = prompt | model | StrOutputParser()
            title = chain.invoke({"question": question})
            return title.strip().strip('"').strip("'")
        except Exception as e:
            logging.getLogger("app.exception").warning(
                f"Session title generation failed: {str(e)}. Falling back to 'New Chat'."
            )
            return "New Chat"

