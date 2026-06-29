"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { xFetch } from "@/lib/express";

export default function CheckoutHistorySettings() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await xFetch("/settings", { cache: "no-store" });
            const data = await res.json();
            setEnabled(data.checkout_history_enabled !== "false");
        } catch {
            setEnabled(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            const res = await xFetch("/settings", {
                method: "PUT",
                body: JSON.stringify({ checkout_history_enabled: String(enabled) }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(`Error: ${data.error ?? "Failed to save"}`);
            } else {
                setMessage("Settings saved!");
                setTimeout(() => setMessage(""), 3000);
            }
        } catch {
            setMessage("Network error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400">
                <Icon icon="svg-spinners:ring-resize" width={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Checkout History</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Automatically save checkout form data by visitor IP address.
                    When enabled, returning visitors will have their previously entered
                    name, phone, and email pre-filled — so they don&apos;t have to type it again.
                </p>
            </div>

            {message && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${
                    message.startsWith("Error")
                        ? "bg-red-400/10 text-red-400 border-red-400/25"
                        : "bg-emerald-400/10 text-emerald-400 border-emerald-400/25"
                }`}>
                    {message}
                </div>
            )}

            {/* Status indicator */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                enabled
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-gray-50 border-gray-200"
            }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    enabled ? "bg-emerald-100" : "bg-gray-100"
                }`}>
                    <Icon
                        icon={enabled ? "mdi:check-circle" : "mdi:clock-outline"}
                        width={20}
                        className={enabled ? "text-emerald-600" : "text-gray-400"}
                    />
                </div>
                <div>
                    <p className={`text-sm font-semibold ${enabled ? "text-emerald-800" : "text-gray-600"}`}>
                        {enabled ? "Checkout History is Active" : "Checkout History is Disabled"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {enabled
                            ? "Visitor checkout data is being saved and pre-filled on return visits."
                            : "Enable this to save visitor checkout data for pre-filling on return visits."
                        }
                    </p>
                </div>
            </div>

            {/* Enable toggle */}
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                <div>
                    <p className="text-sm font-semibold text-gray-800">Enable Checkout History</p>
                    <p className="text-xs text-gray-500">
                        Save checkout form data (name, phone, email) by visitor IP address.
                        Drafts are automatically cleaned up after 7 days.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setEnabled(prev => !prev)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? "bg-emerald-500" : "bg-gray-200"}`}
                >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
            </div>

            {/* Info card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-2">
                <p className="font-semibold flex items-center gap-2">
                    <Icon icon="mdi:information-outline" width={16} />
                    How it works
                </p>
                <ul className="list-disc list-inspace space-y-1 text-xs text-blue-700">
                    <li>When a visitor fills out the checkout form but doesn&apos;t submit, the data is saved by their IP address.</li>
                    <li>When the same visitor returns, their previously entered data is automatically pre-filled.</li>
                    <li>If the visitor submits an order, the saved draft is cleared.</li>
                    <li>Drafts automatically expire after 7 days for privacy.</li>
                    <li>Same IP = same saved data — no duplicate entries are created.</li>
                </ul>
            </div>

            {/* Save */}
            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition disabled:opacity-55 disabled:cursor-not-allowed"
                >
                    {saving
                        ? <><Icon icon="svg-spinners:ring-resize" width={16} /> Saving...</>
                        : <><Icon icon="solar:check-circle-bold" width={16} /> Save Settings</>
                    }
                </button>
            </div>
        </div>
    );
}
