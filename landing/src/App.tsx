import { useState, useEffect } from "react";
import LandingPage from "@/pages/LandingPage";
import StatusPage from "@/pages/StatusPage";

function getCurrentRoute(): string {
    const path = window.location.pathname;
    if (path.endsWith("/status") || path.includes("/status/")) return "status";
    const hash = window.location.hash;
    if (hash === "#/status") return "status";
    return "home";
}

export default function App() {
    const [route, setRoute] = useState(getCurrentRoute);

    useEffect(() => {
        const onHashChange = () => setRoute(getCurrentRoute());
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    if (route === "status") return <StatusPage />;
    return <LandingPage />;
}
