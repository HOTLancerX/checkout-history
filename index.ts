import { addHook, type PluginMeta } from "@/hook";
import CheckoutHistorySettings from "./settings/CheckoutHistorySettings";
import CheckoutHistoryListPage from "./drafts/page";
import CheckoutHistoryDetailPage from "./drafts/[id]/page";

export const PLUGINS: PluginMeta = {
    nx: "checkout-history",
    name: "checkout-history",
    version: "1.0.0",
    description: "Saves checkout form data by visitor IP address for auto-fill on return visits.",
    author: "System",
    path: "https://github.com/HOTLancerX/checkout-history.git",
    icon: "mdi:history",
    color: "from-amber-500 to-orange-600",
};

export function register() {
    addHook("admin.nav", [
        {
            key: "checkout-history",
            label: "Checkout History",
            icon: "mdi:history",
            slug: "checkout-history",
            parent: "",
            position: 18,
        },
        {
            key: "checkout-history-settings",
            label: "Settings",
            icon: "solar:settings-bold",
            slug: "checkout-history/settings",
            parent: "checkout-history",
            position: 99,
        },
    ], PLUGINS.nx);

    addHook("admin.pages", [
        {
            key: "checkout-history",
            label: "Checkout Drafts",
            type: "checkout-history",
            style: "left",
            position: 40,
            path: CheckoutHistoryListPage,
        },
        {
            key: "checkout-history/",
            label: "Draft Detail",
            type: "checkout-history",
            style: "left",
            position: 41,
            path: CheckoutHistoryDetailPage,
        },
        {
            key: "checkout-history/settings",
            label: "Checkout History Settings",
            type: "checkout-history-settings",
            style: "left",
            position: 42,
            path: CheckoutHistorySettings,
        },
    ], PLUGINS.nx);
}
