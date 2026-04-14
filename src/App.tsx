import { Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/lib/wagmi";
import AppRouter from "@/pages/AppRouter";
import { TxStatusProvider } from "@/lib/txStatusContext";

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
                    </TooltipProvider>
                </TxStatusProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default App;
