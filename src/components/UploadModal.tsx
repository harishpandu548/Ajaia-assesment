"use client";

import { useState, useRef } from "react";
import { X, Upload, FileText, Loader2, AlertCircle } from "lucide-react";

type Props = {
  onClose: () => void;
  onUploaded: (documentId: string) => void;
};

export default function UploadModal({ onClose, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File) {
    const allowed = [".txt", ".md", ".markdown"];
    const name = f.name.toLowerCase();
    return allowed.some((ext) => name.endsWith(ext));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) selectFile(f);
  }

  function selectFile(f: File) {
    setError("");
    if (!validateFile(f)) {
      setError("Unsupported file type. Please upload a .txt or .md file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }
    setFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setUploading(false);
        return;
      }

      onUploaded(data.id);
    } catch {
      setError("Network error. Please try again.");
      setUploading(false);
    }
  }

  const sizeKB = file ? (file.size / 1024).toFixed(1) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Upload file</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm text-gray-500 mb-4">
            Upload a <strong>.txt</strong> or <strong>.md</strong> file to create a new editable document.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-indigo-400 bg-indigo-50"
                : file
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".txt,.md,.markdown"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f); }}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 text-green-500" />
                <p className="font-medium text-gray-900 text-sm truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-400">{sizeKB} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">
                  Drop a file here, or <span className="text-indigo-600">browse</span>
                </p>
                <p className="text-xs text-gray-400">.txt, .md — max 5MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
            ) : (
              <><Upload className="w-4 h-4" /> Import as document</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
