import { Switch, Route } from "wouter";
import DashboardPage from "./DashboardPage";
import CreateQryptankPage from "./CreateQryptankPage";
import NotFound from "./not-found";

export default function AppRouter() {
    return (
        <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/create" component={CreateQryptankPage} />
            <Route component={NotFound} />
        </Switch>
    );
}
