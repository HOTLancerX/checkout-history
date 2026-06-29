"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

function fmtDate(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <Icon icon={icon} width={18} className="text-gray-500 shrink-0" />
                <h2 className="text-sm font-bold text-gray-800">{title}</h2>
            </div>
            <div className="px-5 py-4">{children}</div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-3 py-1.5">
            <dt className="text-gray-500 shrink-0">{label}</dt>
            <dd className="text-gray-800 text-right break-all">{value || "—"}</dd>
        </div>
    );
}

export default function CheckoutHistoryDetailPage() {
    const params = useParams<{ slug?: string[] }>();
    const id = Array.isArray(params?.slug)
        ? params.slug[params.slug.length - 1]
        : (params as any)?.id ?? "";

    const [draft,   setDraft]   = useState<Draft | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");
    const [deleting, setDeleting] = useState(false);
    const [locationMap, setLocationMap] = useState<Record<string, string>>({});

    const fetchDraft = async () => {
        if (!id) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/checkout-history/id/${id}`, { credentials: "include" });
            if (res.status === 404) { setError("Draft not found."); return; }
            if (!res.ok) { setError("Failed to load draft."); return; }
            const data = await res.json();
            setDraft(data.draft);
        } catch {
            setError("Network error — could not load draft.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDraft(); }, [id]);

    useEffect(() => {
        fetch("/api/location/category?type=location")
            .then((r) => (r.ok ? r.json() : { categories: [] }))
            .then((data) => {
                const map: Record<string, string> = {};
                for (const loc of data.categories || []) {
                    const id = loc.id || loc._id;
                    if (id) map[id] = loc.title;
                }
                setLocationMap(map);
            })
            .catch(() => {});
    }, []);

    const handleDelete = async () => {
        if (!draft || !confirm("Delete this draft permanently?")) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/checkout-history/id/${draft._id}`, { method: "DELETE" });
            if (res.ok) {
                window.location.href = "/admin/checkout-history";
            }
        } catch { /* silent */ }
        finally { setDeleting(false); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={36} />
            </div>
        );
    }

    if (error || !draft) {
        return (
            <div className="text-center py-32 text-gray-400">
                <Icon icon="mdi:history" width={52} className="mx-auto mb-4 opacity-40" />
                <p className="text-lg font-semibold text-gray-600">{error || "Draft not found."}</p>
                <Link href="/admin/checkout-history"
                    className="mt-4 inline-flex items-center gap-1.5 text-indigo-500 hover:underline text-sm">
                    <Icon icon="solar:arrow-left-bold" width={14} />
                    Back to Drafts
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <Link href="/admin/checkout-history"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
                        <Icon icon="solar:arrow-left-bold" width={16} />
                        Drafts
                    </Link>
                    <span className="text-gray-300">/</span>
                    <h1 className="text-xl font-bold text-gray-900">
                        {draft.name || "Unnamed Visitor"}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{fmtDate(draft.lastUpdated)}</span>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                    >
                        <Icon icon="mdi:delete-outline" width={13} />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Information */}
                    <Card title="Contact Information" icon="mdi:account-outline">
                        <dl className="space-y-1 text-sm">
                            <Row label="Name"  value={draft.name} />
                            <Row label="Phone" value={
                                draft.phone ? (
                                    <span className="flex items-center gap-1.5 justify-end">
                                        <Icon icon="mdi:phone-outline" width={14} className="text-gray-400" />
                                        {draft.phone}
                                    </span>
                                ) : "—"
                            } />
                            <Row label="Email" value={
                                draft.email ? (
                                    <span className="flex items-center gap-1.5 justify-end">
                                        <Icon icon="mdi:email-outline" width={14} className="text-gray-400" />
                                        {draft.email}
                                    </span>
                                ) : "—"
                            } />
                        </dl>
                    </Card>

                    {/* Shipping Address */}
                    <Card title="Shipping Address" icon="mdi:map-marker-outline">
                        <dl className="space-y-1 text-sm">
                            <Row label="Address" value={draft.address} />
                            <Row label="City"    value={locationMap[draft.city] || draft.city} />
                            <Row label="State"   value={locationMap[draft.state] || draft.state} />
                            <Row label="Zip"     value={draft.zipCode} />
                        </dl>
                    </Card>

                    {/* Order Preferences */}
                    <Card title="Order Preferences" icon="mdi:cart-outline">
                        <dl className="space-y-1 text-sm">
                            <Row label="Shipping Method" value={
                                <span className="capitalize">{draft.shippingMethod || "—"}</span>
                            } />
                            <Row label="Payment Method" value={
                                <span className="capitalize">{(draft.paymentMethod || "—").replace(/_/g, " ")}</span>
                            } />
                            <Row label="Notes" value={
                                draft.notes ? (
                                    <span className="max-w-[200px] text-right">{draft.notes}</span>
                                ) : "—"
                            } />
                        </dl>
                    </Card>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Summary */}
                    <Card title="Summary" icon="mdi:information-outline">
                        <dl className="space-y-1 text-sm">
                            <Row label="IP Address" value={
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {draft.ip}
                                </span>
                            } />
                            <Row label="Created"    value={fmtDate(draft.createdAt)} />
                            <Row label="Last Seen"  value={fmtDate(draft.lastUpdated)} />
                        </dl>
                    </Card>

                    {/* Info */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-1">
                        <p className="font-semibold flex items-center gap-1.5">
                            <Icon icon="mdi:information-outline" width={14} />
                            About this draft
                        </p>
                        <p>This draft was saved automatically when a visitor filled out the checkout form but did not submit their order.</p>
                        <p>If the same visitor returns, their form will be pre-filled with this data.</p>
                        <p>Drafts auto-expire after 7 days.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
