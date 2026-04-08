import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/lib/wagmi";
import AppRouter from "@/pages/AppRouter";

const queryClient = new QueryClient();

function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                        <AppRouter />
                    </WouterRouter>
                    <Toaster />
                </TooltipProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default App;
