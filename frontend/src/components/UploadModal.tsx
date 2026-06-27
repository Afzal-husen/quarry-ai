"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertTriangle } from 'lucide-react';
import { apiPost } from '../lib/api-client';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadStarted: (jobId: string, filename: string) => void;
}

export default function UploadModal({ isOpen, onClose, onUploadStarted }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const allowedExtensions = ['.pdf', '.docx'];
    const filename = selectedFile.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => filename.endsWith(ext));

    if (!hasValidExtension) {
      setError("Invalid file format. Only PDF and DOCX files are allowed.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File exceeds maximum size limit of 50 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiPost('/upload', formData);
      if (response && response.job_id) {
        onUploadStarted(response.job_id, file.name);
        setFile(null);
        onClose();
      } else {
        setError('Failed to initiate document ingestion.');
      }
    } catch (err: any) {
      setError(err.detail || 'An unexpected error occurred during file upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h3 id="upload-modal-title" className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-500" />
            Upload Document
          </h3>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/5' 
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
            }`}
            onClick={handleButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleChange}
              disabled={loading}
            />

            {file ? (
              <div className="space-y-3">
                <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                <p className="text-sm font-medium text-zinc-200 max-w-xs truncate mx-auto">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-zinc-600 mx-auto transition-transform group-hover:scale-105" />
                <p className="text-sm text-zinc-300">
                  Drag & drop your file here, or <span className="text-indigo-500 font-medium hover:text-indigo-400">browse</span>
                </p>
                <p className="text-xs text-zinc-500">
                  PDF or DOCX only · Max 50 MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4 bg-zinc-900/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 disabled:text-zinc-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
}
