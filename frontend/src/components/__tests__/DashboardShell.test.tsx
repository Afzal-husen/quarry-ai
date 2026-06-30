// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import DashboardShell from '../DashboardShell';

vi.mock('../../lib/api-client', () => ({
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('../../app/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

vi.mock('../PreviewModal', () => ({
  default: ({ isOpen, onClose, document }: { isOpen: boolean; onClose: () => void; document: { filename: string } | null }) => {
    if (!isOpen || !document) return null;
    return (
      <div data-testid="mock-preview-modal">
        <h3>Mock Preview: {document.filename}</h3>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

describe('DashboardShell Component', () => {
  const mockDocuments = [
    {
      document_id: 'doc-1',
      filename: 'document_one.pdf',
      upload_date: '2026-06-27T10:00:00Z',
      chunk_count: 12,
      status: 'complete',
      can_reindex: true,
    },
    {
      document_id: 'doc-2',
      filename: 'document_two.docx',
      upload_date: '2026-06-27T10:05:00Z',
      chunk_count: 8,
      status: 'complete',
      can_reindex: true,
    },
  ];

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('calculates and renders the document metrics cards correctly', () => {
    render(<DashboardShell initialDocuments={mockDocuments} username="test-user" />);

    const totalDocsLabel = screen.getByText('Total Documents');
    expect(totalDocsLabel).toBeDefined();
    
    const totalChunksLabel = screen.getByText('Indexed Chunks');
    expect(totalChunksLabel).toBeDefined();

    expect(screen.getByText('document_one.pdf')).toBeDefined();
    expect(screen.getByText('document_two.docx')).toBeDefined();
  });

  it('reads active jobs from localStorage on mount and initializes pending count', () => {
    const mockJobs = [
      { job_id: 'job-123', filename: 'uploading_file.pdf', status: 'pending' }
    ];
    vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify(mockJobs));

    render(<DashboardShell initialDocuments={mockDocuments} username="test-user" />);

    expect(localStorage.getItem).toHaveBeenCalledWith('document_rag_active_jobs');
    const pendingLabel = screen.getByText('Pending Ingestions');
    expect(pendingLabel).toBeDefined();
    expect(screen.getByText('uploading_file.pdf')).toBeDefined();
  });

  it('opens preview modal when a document card is clicked', () => {
    render(<DashboardShell initialDocuments={mockDocuments} username="test-user" />);

    const docCard = screen.getByText('document_one.pdf');
    expect(screen.queryByTestId('mock-preview-modal')).toBeNull();

    fireEvent.click(docCard);

    expect(screen.getByTestId('mock-preview-modal')).toBeDefined();
    expect(screen.getByText('Mock Preview: document_one.pdf')).toBeDefined();
  });
});
