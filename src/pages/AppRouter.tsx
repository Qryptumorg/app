import { Suspense, lazy, useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { LanguageProvider } from "@/lib/LanguageContext";
import PageLoader from "@/components/PageLoader";

const DashboardPage = lazy(() => import("./DashboardPage"));

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
        <Suspense fallback={<PageLoader />}>
        <Switch>
            <Route path="/" component={DashboardRoute} />            <Route>
                <Redirect to="/" />
            </Route>
        </Switch>
        </Suspense>
        </LanguageProvider>
    );
}
