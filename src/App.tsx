import { Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/lib/wagmi";
import AppRouter from "@/pages/AppRouter";
import { TxStatusProvider } from "@/lib/txStatusContext";
import TxStatusBanner from "@/components/TxStatusBanner";

const queryClient = new QueryClient();

function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <TxStatusProvider>
                    <TooltipProvider>
                        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                            <AppRouter />
                        </WouterRouter>
                        <Toaster />
                        <TxStatusBanner />
                    </TooltipProvider>
                </TxStatusProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default App;
