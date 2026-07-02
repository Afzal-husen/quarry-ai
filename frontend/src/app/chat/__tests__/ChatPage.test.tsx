// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import ChatShell from '../../../components/ChatShell';

vi.mock('../../../lib/api-client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('../../../app/actions/cookies', () => ({
  getTokenAction: vi.fn().mockResolvedValue('mock-token'),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/chat',
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

describe('Chat Interface Component', () => {
  const mockSessions = [
    { id: 'session-1', title: 'First Conversation', created_at: '2026-06-27T10:00:00Z' },
    { id: 'session-2', title: 'Second Conversation', created_at: '2026-06-27T10:05:00Z' },
  ];

  const mockDocuments = [
    { document_id: 'doc-1', filename: 'document_one.pdf', status: 'complete', chunk_count: 5 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders chat layout welcome screen and action triggers correctly', async () => {
    // Return empty list of sessions initially
    const { apiGet } = await import('../../../lib/api-client');
    vi.mocked(apiGet).mockImplementation((path) => {
      if (path.startsWith('/sessions')) {
        return Promise.resolve({ items: mockSessions });
      }
      if (path === '/documents') {
        return Promise.resolve({ items: mockDocuments });
      }
      return Promise.resolve({ items: [] });
    });

    render(<ChatShell username="test-user" />);

    // Renders the header and welcome prompts
    expect(screen.getByText('No active session.')).toBeDefined();
    expect(screen.getByText('Start Chatting')).toBeDefined();
    expect(screen.getByText('New Chat')).toBeDefined();

    // Verify session titles render in sidebar list
    await screen.findByText('First Conversation');
    await screen.findByText('Second Conversation');
  });

  it('renders active session chat view with input plus button and selected document badges', async () => {
    const { apiGet } = await import('../../../lib/api-client');
    vi.mocked(apiGet).mockImplementation((path) => {
      if (path.startsWith('/sessions/session-1/chats')) {
        return Promise.resolve({ items: [] });
      }
      if (path.startsWith('/sessions')) {
        return Promise.resolve({ items: mockSessions });
      }
      if (path === '/documents') {
        return Promise.resolve({ items: mockDocuments });
      }
      return Promise.resolve({ items: [] });
    });

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockImplementation((key) => {
        if (key === 'document_rag_active_session_id') return 'session-1';
        if (key === 'document_rag_session_docs_session-1') return JSON.stringify(['doc-1']);
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    render(<ChatShell username="test-user" />);

    // Verify active context badge displays the document name (waits for async state update)
    const badge = await screen.findByText('document_one.pdf');
    expect(badge).toBeDefined();

    // Assert that input is visible and placeholder is for active document scoping
    const textInput = screen.getByPlaceholderText('Ask a question about your documents...');
    expect(textInput).toBeDefined();

    // Verify Plus icon button is rendered (button with aria-label="Add context or actions")
    const plusButton = screen.getByLabelText('Add context or actions');
    expect(plusButton).toBeDefined();
  });

  it('parses and renders Markdown content (headers, bold, italic, list items, code blocks, and tables) correctly', async () => {
    const markdownContent = `
# Main Header
**bold text** and *italic text* and \`inline code\`

- item one
- item two

| Header A | Header B |
|----------|----------|
| Val A    | Val B    |

\`\`\`javascript
const test = 123;
\`\`\`
[1]
`;

    const { apiGet } = await import('../../../lib/api-client');
    vi.mocked(apiGet).mockImplementation((path) => {
      if (path === '/sessions/session-1') {
        return Promise.resolve({
          id: 'session-1',
          title: 'First Conversation',
          messages: [
            {
              id: 'chat-1',
              role: 'assistant',
              content: markdownContent,
              metadata: {
                citations: [
                  { source_filename: 'document_one.pdf', page_index: 2, text: 'Cited text content' }
                ]
              },
              created_at: '2026-06-27T10:10:00Z'
            }
          ]
        });
      }
      if (path.startsWith('/sessions')) {
        return Promise.resolve({ items: mockSessions });
      }
      if (path === '/documents') {
        return Promise.resolve({ items: mockDocuments });
      }
      return Promise.resolve({ items: [] });
    });

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockImplementation((key) => {
        if (key === 'document_rag_active_session_id') return 'session-1';
        if (key === 'document_rag_session_docs_session-1') return JSON.stringify(['doc-1']);
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    render(<ChatShell username="test-user" />);

    // Wait for the markdown components to render in the chat window
    await screen.findByText('Main Header');
    expect(screen.getByText('bold text')).toBeDefined();
    expect(screen.getByText('italic text')).toBeDefined();
    expect(screen.getByText('inline code')).toBeDefined();
    expect(screen.getByText('item one')).toBeDefined();
    expect(screen.getByText('item two')).toBeDefined();
    expect(screen.getByText('Header A')).toBeDefined();
    expect(screen.getByText('Val B')).toBeDefined();
    expect(screen.getByText('const test = 123;')).toBeDefined();
    
    // Check citation badge renders
    expect(screen.getByText('[1]')).toBeDefined();
  });
});
