"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface Draft {
    _id: string;
    ip: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    state: string;
    city: string;
    zipCode: string;
    shippingMethod: string;
    paymentMethod: string;
    notes: string;
    lastUpdated: string;
    createdAt: string;
}

interface PagedDrafts {
    drafts: Draft[];
    total: number;
    page: number;
    pages: number;
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function DraftsTable() {
    const [data,    setData]    = useState<PagedDrafts | null>(null);
    const [loading, setLoading] = useState(true);
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState("");
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchDrafts = useCallback(async (p: number, q: string) => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({ page: String(p), limit: "20" });
            if (q) qs.set("search", q);
            const res = await fetch(`/api/checkout-history/list?${qs}`, { credentials: "include" });
            if (res.ok) setData(await res.json());
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setPage(1);
            fetchDrafts(1, search);
        }, 350);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [search]);

    useEffect(() => {
        fetchDrafts(page, search);
    }, [page, search]);

    const drafts = data?.drafts ?? [];

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this draft?")) return;
        try {
            await fetch(`/api/checkout-history/id/${id}`, { method: "DELETE" });
            fetchDrafts(page, search);
        } catch { /* silent */ }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Checkout Drafts</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {data ? `${data.total} draft${data.total !== 1 ? "s" : ""} total` : ""}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Icon icon="solar:magnifer-linear" width={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, phone, email, IP..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    {search && (
                        <button onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <Icon icon="mdi:close" width={14} />
                        </button>
                    )}
                </div>
                {search && (
                    <button
                        onClick={() => { setSearch(""); setPage(1); }}
                        className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <Icon icon="svg-spinners:ring-resize" width={32} />
                </div>
            )}

            {/* Empty */}
            {!loading && drafts.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <Icon icon="mdi:history" width={48} className="mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium text-gray-500">No drafts found</p>
                    {search && (
                        <p className="text-sm mt-1">Try adjusting your search.</p>
                    )}
                </div>
            )}

            {/* Table */}
            {!loading && drafts.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Phone</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">IP Address</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Last Updated</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {drafts.map(draft => (
                                <tr key={draft._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3">
                                        <p className="font-medium text-gray-800 truncate max-w-[160px]">
                                            {draft.name || "—"}
                                        </p>
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">
                                        {draft.phone || "—"}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600 truncate max-w-[180px]">
                                        {draft.email || "—"}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {draft.ip}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                                        {fmtDate(draft.lastUpdated)}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/checkout-history/${draft._id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition whitespace-nowrap">
                                                <Icon icon="solar:eye-bold" width={13} />
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(draft._id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition whitespace-nowrap"
                                            >
                                                <Icon icon="mdi:delete-outline" width={13} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {data && data.pages > 1 && (
                <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-sm text-gray-500">Page {data.page} of {data.pages} — {data.total} drafts</p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            aria-label="Previous">
                            <Icon icon="mdi:chevron-left" width={18} />
                        </button>
                        <span className="text-sm font-medium text-gray-700 px-1">{page}</span>
                        <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page >= data.pages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            aria-label="Next">
                            <Icon icon="mdi:chevron-right" width={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
