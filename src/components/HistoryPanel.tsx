import { useQuery } from "@tanstack/react-query";
import {
    HistoryIcon, ExternalLinkIcon,
    ShieldIcon, SendIcon, UnlockIcon,
    ArrowDownIcon, WalletIcon, RotateCcwIcon,
    TicketIcon, WifiOffIcon, PackageIcon,
} from "lucide-react";
import { fetchTransactions } from "@/lib/api";

interface HistoryPanelProps {
    walletAddress: string;
}

export default function HistoryPanel({ walletAddress }: HistoryPanelProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["transactions", walletAddress],
        queryFn: () => fetchTransactions(walletAddress, 50, 0),
        enabled: !!walletAddress,
    });

    const transactions = data?.transactions || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <HistoryIcon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
            </div>
            <p className="text-muted-foreground text-sm">
                All your Qryptum activity. Click the Etherscan link to view on-chain details.
            </p>

            {isLoading && (
                <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
                    Loading transactions...
                </div>
            )}

            {!isLoading && transactions.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center">
                    <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No transactions yet. Shield some tokens to get started.</p>
                </div>
            )}

            <div className="space-y-3">
                {transactions.map((tx: Transaction) => (
                    <TxCard key={tx.id} tx={tx} />
                ))}
            </div>
        </div>
    );
}

interface Transaction {
    id: number;
    type: string;
    tokenSymbol: string;
    tokenName: string;
    amount: string;
    txHash: string;
    fromAddress: string;
    toAddress?: string;
    networkId: number;
    createdAt: string;
}

type TxMeta = {
    icon: React.ReactNode;
    label: string;
    color: string;
    amountPrefix: string;
    badge?: string;
    badgeColor?: string;
};

function getTxMeta(type: string): TxMeta {
    switch (type) {
        case "shield":
            return {
                icon: <ShieldIcon className="w-4 h-4 text-primary" />,
                label: "Shielded",
                color: "text-primary",
                amountPrefix: "",
            };
        case "unshield":
            return {
                icon: <UnlockIcon className="w-4 h-4 text-yellow-400" />,
                label: "Unshielded",
                color: "text-yellow-400",
                amountPrefix: "s",
            };
        case "transfer":
            return {
                icon: <SendIcon className="w-4 h-4 text-blue-400" />,
                label: "Transferred",
                color: "text-blue-400",
                amountPrefix: "s",
            };
        case "receive":
            return {
                icon: <ArrowDownIcon className="w-4 h-4 text-green-400" />,
                label: "Received",
                color: "text-green-400",
                amountPrefix: "s",
            };
        case "fund":
            return {
                icon: <WalletIcon className="w-4 h-4 text-amber-400" />,
                label: "Air Bag Funded",
                color: "text-amber-400",
                amountPrefix: "",
                badge: "AIR BAG",
                badgeColor: "bg-amber-500/20 text-amber-400",
            };
        case "reclaim":
            return {
                icon: <RotateCcwIcon className="w-4 h-4 text-orange-400" />,
                label: "Reclaimed",
                color: "text-orange-400",
                amountPrefix: "",
                badge: "AIR BAG",
                badgeColor: "bg-amber-500/20 text-amber-400",
            };
        case "voucher":
            return {
                icon: <TicketIcon className="w-4 h-4 text-amber-400" />,
                label: "Voucher Sent",
                color: "text-amber-400",
                amountPrefix: "",
                badge: "QRYPT AIR",
                badgeColor: "bg-amber-500/20 text-amber-400",
            };
        case "air-send":
            return {
                icon: <WifiOffIcon className="w-4 h-4 text-amber-400" />,
                label: "Air Sent",
                color: "text-amber-400",
                amountPrefix: "",
                badge: "QRYPT AIR",
                badgeColor: "bg-amber-500/20 text-amber-400",
            };
        case "air-receive":
            return {
                icon: <PackageIcon className="w-4 h-4 text-green-400" />,
                label: "Air Received",
                color: "text-green-400",
                amountPrefix: "",
                badge: "QRYPT AIR",
                badgeColor: "bg-amber-500/20 text-amber-400",
            };
        default:
            return {
                icon: <HistoryIcon className="w-4 h-4 text-muted-foreground" />,
                label: type,
                color: "text-muted-foreground",
                amountPrefix: "",
            };
    }
}

function TxCard({ tx }: { tx: Transaction }) {
    const meta = getTxMeta(tx.type);

    const etherscanBase = tx.networkId === 11155111
        ? "https://sepolia.etherscan.io/tx/"
        : tx.networkId === 1
            ? "https://etherscan.io/tx/"
            : null;

    const date = new Date(tx.createdAt).toLocaleString();

    return (
        <div className="glass rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {meta.icon}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${meta.color}`}>{meta.label}</p>
                        {meta.badge && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${meta.badgeColor}`}>
                                {meta.badge}
                            </span>
                        )}
                    </div>
                    <p className="text-foreground font-semibold">
                        {tx.amount} {meta.amountPrefix}{tx.tokenSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground">{date}</p>
                </div>
            </div>

            {etherscanBase && (
                <a
                    href={etherscanBase + tx.txHash}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
                >
                    Etherscan <ExternalLinkIcon className="w-3 h-3" />
                </a>
            )}
        </div>
    );
}
