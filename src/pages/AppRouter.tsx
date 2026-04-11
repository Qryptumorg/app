import { Suspense, lazy } from "react";
import { Switch, Route, useLocation } from "wouter";
import { LanguageProvider } from "@/lib/LanguageContext";
import PageLoader from "@/components/PageLoader";
import CreateVaultPage from "./CreateVaultPage";

const DashboardPage = lazy(() => import("./DashboardPage"));
const CreateQryptSafePage = lazy(() => import("./CreateQryptSafePage"));
const NotFound = lazy(() => import("./not-found"));

function CreateVaultRoute() {
  const [, navigate] = useLocation();
  return <CreateVaultPage onVaultCreated={() => navigate("/dashboard")} />;
}

export default function AppRouter() {
  return (
    <LanguageProvider>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/create-vault" component={CreateVaultRoute} />
          <Route path="/create" component={CreateQryptSafePage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </LanguageProvider>
  );
}
