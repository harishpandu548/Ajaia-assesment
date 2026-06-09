"use client";

import { useState, useEffect, useCallback } from "react";
import { X, UserPlus, Trash2, Check, Loader2, Search } from "lucide-react";

type ShareUser = { id: string; name: string; email: string };
type Share = { id: string; permission: string; user: ShareUser };

type Props = {
  documentId: string;
  documentTitle: string;
  existingShares: Share[];
  onClose: () => void;
  onUpdate: () => void;
};

export default function ShareModal({
  documentId,
  documentTitle,
  existingShares,
  onClose,
  onUpdate,
}: Props) {
  const [shares, setShares] = useState<Share[]>(existingShares);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"edit" | "view">("edit");
  const [searchResult, setSearchResult] = useState<ShareUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState("");

  const refreshShares = useCallback(async () => {
    const res = await fetch(`/api/documents/${documentId}/share`);
    if (res.ok) setShares(await res.json());
  }, [documentId]);

  useEffect(() => {
    refreshShares();
  }, [refreshShares]);

  async function searchUser() {
    if (!email.trim()) return;
    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    const res = await fetch(`/api/users?email=${encodeURIComponent(email.trim())}`);
    setSearching(false);

    if (res.ok) {
      setSearchResult(await res.json());
    } else {
      const data = await res.json();
      setSearchError(data.error || "User not found");
    }
  }

  async function addShare() {
    if (!searchResult) return;
    setAdding(true);
    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: searchResult.id, permission }),
    });
    setAdding(false);
    if (res.ok) {
      await refreshShares();
      onUpdate();
      setEmail("");
      setSearchResult(null);
      setSuccess(`Shared with ${searchResult.name}`);
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  async function removeShare(userId: string) {
    await fetch(`/api/documents/${documentId}/share?userId=${userId}`, {
      method: "DELETE",
    });
    await refreshShares();
    onUpdate();
  }

  async function updatePermission(userId: string, newPerm: string) {
    await fetch(`/api/documents/${documentId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, permission: newPerm }),
    });
    await refreshShares();
    onUpdate();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Share document</h2>
            <p className="text-xs text-gray-400 truncate mt-0.5 max-w-xs">{documentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add user */}
        <div className="px-6 py-4 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add people
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSearchResult(null); setSearchError(""); }}
              onKeyDown={(e) => e.key === "Enter" && searchUser()}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={searchUser}
              disabled={!email.trim() || searching}
              className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {searchError && (
            <p className="mt-2 text-xs text-red-600">{searchError}</p>
          )}

          {searchResult && (
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
                {searchResult.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{searchResult.name}</p>
                <p className="text-xs text-gray-500 truncate">{searchResult.email}</p>
              </div>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as "edit" | "view")}
                className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white"
              >
                <option value="edit">Can edit</option>
                <option value="view">Can view</option>
              </select>
              <button
                onClick={addShare}
                disabled={adding}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                Share
              </button>
            </div>
          )}

          {success && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <Check className="w-3.5 h-3.5" />
              {success}
            </div>
          )}
        </div>

        {/* Current shares */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            People with access {shares.length > 0 && `(${shares.length})`}
          </h3>

          {shares.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Not shared with anyone yet.
            </p>
          ) : (
            <ul className="space-y-2 max-h-52 overflow-y-auto">
              {shares.map((share) => (
                <li
                  key={share.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0">
                    {share.user.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{share.user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{share.user.email}</p>
                  </div>
                  <select
                    value={share.permission}
                    onChange={(e) => updatePermission(share.user.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
                  >
                    <option value="edit">Can edit</option>
                    <option value="view">Can view</option>
                  </select>
                  <button
                    onClick={() => removeShare(share.user.id)}
                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded"
                    title="Remove access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
