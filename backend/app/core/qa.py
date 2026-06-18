import os
import threading
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
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
                            temperature=0.0,
                            api_key=api_key
                        )
                    except Exception as e:
                        raise GroqConnectionError(
                            f"Failed to connect to Groq client using model '{model_name}': {str(e)}"
                        ) from e
        return cls._instance


class QAPipeline:
    """Orchestrates strict grounding prompts assembly and Groq generative answering workflows."""

    def generate_answer(self, query: str, retrieved_docs: List[Document]) -> Dict[str, Any]:
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
            messages = [
                SystemMessage(content=system_instruction),
                HumanMessage(content=query)
            ]
            response = model.invoke(messages)
            # Robustly extract text content from Groq response (handles str or list)
            if isinstance(response.content, str):
                answer = response.content.strip()
            else:
                # Handles list-of-chunks format
                answer = "\n".join([
                    str(item).strip() for item in response.content
                ])
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
                    "text": doc.page_content
                })

        return {
            "answer": answer,
            "citations": citations
        }
