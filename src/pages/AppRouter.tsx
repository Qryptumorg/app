import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { LanguageProvider } from "@/lib/LanguageContext";
import PageLoader from "@/components/PageLoader";

const DashboardPage = lazy(() => import("./DashboardPage"));
const QryptAirPWAPage = lazy(() => import("./QryptAirPWAPage"));
const NotFound = lazy(() => import("./not-found"));

export default function AppRouter() {
    return (
        <LanguageProvider>
            <Suspense fallback={<PageLoader />}>
                <Switch>
                    <Route path="/" component={DashboardPage} />
                    <Route path="/app" component={DashboardPage} />
                    <Route path="/air" component={QryptAirPWAPage} />
                    <Route component={NotFound} />
                </Switch>
            </Suspense>
        </LanguageProvider>
    );
}
