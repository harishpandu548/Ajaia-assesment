"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Upload,
  LogOut,
  Trash2,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import UploadModal from "@/components/UploadModal";

type DocumentSummary = {
  id: string;
  title: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string };
  shares?: { permission: string }[];
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function DocCard({
  doc,
  isShared,
  onDelete,
  onClick,
}: {
  doc: DocumentSummary;
  isShared: boolean;
  onDelete?: () => void;
  onClick: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${doc.title}"?`)) return;
    setDeleting(true);
    await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    onDelete?.();
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-indigo-500" />
        </div>
        {!isShared && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate text-sm">{doc.title}</h3>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{formatDate(doc.updatedAt)}</span>
        </div>
      </div>

      {isShared && (
        <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full w-fit">
          <Users className="w-3 h-3" />
          <span>by {doc.owner.name}</span>
        </div>
      )}

      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
    </div>
  );
}

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [owned, setOwned] = useState<DocumentSummary[]>([]);
  const [shared, setShared] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const fetchDocs = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (res.ok) {
      const data = await res.json();
      setOwned(data.owned);
      setShared(data.shared);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchDocs();
  }, [status, router, fetchDocs]);

  async function createDocument() {
    setCreating(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Document" }),
    });
    if (res.ok) {
      const doc = await res.json();
      router.push(`/documents/${doc.id}`);
    }
    setCreating(false);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg">AjaiaDocs</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={createDocument}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {creating ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              New document
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm">
                {session?.user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 hidden sm:block">{session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* My documents */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">My Documents</h2>
            <span className="text-sm text-gray-400">{owned.length} document{owned.length !== 1 ? "s" : ""}</span>
          </div>

          {owned.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No documents yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first document or upload a file</p>
              <button
                onClick={createDocument}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {owned.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  isShared={false}
                  onDelete={fetchDocs}
                  onClick={() => router.push(`/documents/${doc.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Shared with me */}
        {shared.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Shared with me</h2>
              <span className="text-sm text-gray-400">{shared.length} document{shared.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {shared.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  isShared={true}
                  onClick={() => router.push(`/documents/${doc.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={(id) => router.push(`/documents/${id}`)}
        />
      )}
    </div>
  );
}
