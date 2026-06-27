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
    expect(screen.getByText('Start Q&A Conversational Rooms')).toBeDefined();
    expect(screen.getByText('Start Chatting')).toBeDefined();
    expect(screen.getByText('New Chat')).toBeDefined();

    // Verify session titles render in sidebar list
    await screen.findByText('First Conversation');
    await screen.findByText('Second Conversation');
  });
});
