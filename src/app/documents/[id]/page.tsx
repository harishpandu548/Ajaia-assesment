"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Share2,
  Upload,
  Check,
  Loader2,
  Lock,
  Eye,
} from "lucide-react";
import ShareModal from "@/components/ShareModal";
import UploadModal from "@/components/UploadModal";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

type Share = {
  id: string;
  permission: string;
  user: { id: string; name: string; email: string };
};

type DocumentData = {
  id: string;
  title: string;
  content: string;
  access: "owner" | "edit" | "view";
  owner: { id: string; name: string; email: string };
  shares: Share[];
  updatedAt: string;
};

type SaveState = "saved" | "saving" | "unsaved" | "error";

export default function DocumentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [showShare, setShowShare] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(content);
  const titleRef = useRef(title);

  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { titleRef.current = title; }, [title]);

  const fetchDoc = useCallback(async () => {
    const res = await fetch(`/api/documents/${id}`);
    if (res.status === 404 || res.status === 401) {
      setNotFound(true);
      return;
    }
    if (res.ok) {
      const data: DocumentData = await res.json();
      setDoc(data);
      setTitle(data.title);
      setContent(data.content);
      setSaveState("saved");
    }
  }, [id]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchDoc();
  }, [status, router, fetchDoc]);

  const save = useCallback(
    async (newTitle?: string, newContent?: string) => {
      const t = newTitle ?? titleRef.current;
      const c = newContent ?? contentRef.current;
      setSaveState("saving");
      try {
        const res = await fetch(`/api/documents/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: t, content: c }),
        });
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    },
    [id]
  );

  function scheduleSave() {
    setSaveState("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => save(), 1500);
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    scheduleSave();
  }

  function handleTitleBlur() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    save();
  }

  function handleContentChange(html: string) {
    setContent(html);
    scheduleSave();
  }

  const canEdit = doc?.access === "owner" || doc?.access === "edit";
  const isOwner = doc?.access === "owner";

  if (status === "loading" || (!doc && !notFound)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500 text-lg">Document not found or access denied.</p>
        <button
          onClick={() => router.push("/documents")}
          className="text-indigo-600 hover:underline text-sm"
        >
          Back to documents
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push("/documents")}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            disabled={!canEdit}
            placeholder="Untitled Document"
            className="flex-1 text-base font-semibold text-gray-900 bg-transparent border-none outline-none placeholder-gray-400 disabled:cursor-default min-w-0"
          />

          {/* Save indicator */}
          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            {saveState === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving…</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600">Saved</span>
              </>
            )}
            {saveState === "unsaved" && <span>Unsaved changes</span>}
            {saveState === "error" && <span className="text-red-500">Save failed</span>}
          </div>

          {!canEdit && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full flex-shrink-0">
              <Eye className="w-3 h-3" />
              <span>View only</span>
            </div>
          )}

          {!isOwner && (
            <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
              <Lock className="w-3 h-3" />
              <span>{doc?.owner.name}</span>
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
          )}
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-16">
        {session && (
          <Editor
            content={content}
            onChange={handleContentChange}
            editable={canEdit}
          />
        )}
      </main>

      {showShare && doc && (
        <ShareModal
          documentId={doc.id}
          documentTitle={doc.title}
          existingShares={doc.shares}
          onClose={() => setShowShare(false)}
          onUpdate={fetchDoc}
        />
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={(newId) => router.push(`/documents/${newId}`)}
        />
      )}
    </div>
  );
}
