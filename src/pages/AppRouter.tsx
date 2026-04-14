import { Suspense, lazy, useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { LanguageProvider } from "@/lib/LanguageContext";
import PageLoader from "@/components/PageLoader";

const DashboardPage = lazy(() => import("./DashboardPage"));
const QryptAirPWAPage = lazy(() => import("./QryptAirPWAPage"));
const NotFound = lazy(() => import("./not-found"));

function DashboardRoute() {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [forceShow, setForceShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setForceShow(true), 7000);

        import("./DashboardPage")
            .then(m => {
                clearTimeout(timer);
                setComponent(() => m.default as React.ComponentType);
            })
            .catch(() => {
                clearTimeout(timer);
                setForceShow(true);
            });

        return () => clearTimeout(timer);
    }, []);

    if (Component) return <Component />;
    if (forceShow) {
        return (
            <Suspense fallback={<PageLoader />}>
                <DashboardPage />
            </Suspense>
        );
    }
    return <PageLoader />;
}

export default function AppRouter() {
    return (
        <LanguageProvider>
        <Suspense fallback={null}>
        <Switch>
            <Route path="/" component={DashboardRoute} />
            <Route path="/app" component={DashboardRoute} />
            <Route path="/air" component={QryptAirPWAPage} />            <Route component={NotFound} />
        </Switch>
        </Suspense>
        </LanguageProvider>
    );
}
