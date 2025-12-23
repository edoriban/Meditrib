import { useQuery } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

interface OnboardingStatus {
    setup_completed: boolean;
    company_created: boolean;
    has_products: boolean;
    has_clients: boolean;
}

export function useOnboardingCheck() {
    const navigate = useNavigate();
    const location = useLocation();

    const { data: status, isLoading } = useQuery<OnboardingStatus>({
        queryKey: ["onboarding-status"],
        queryFn: async () => {
            const response = await fetch(`${BASE_API_URL}/onboarding/status`);
            if (!response.ok) throw new Error("Error fetching onboarding status");
            return response.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        // Don't redirect if already on setup page, login, or public pages
        const publicPaths = ["/setup", "/login", "/register", "/forgot-password", "/terms", "/privacy"];
        if (isLoading || publicPaths.includes(location.pathname)) return;

        // Force redirect to setup if onboarding not completed
        if (status && !status.setup_completed) {
            navigate("/setup", { replace: true });
        }
    }, [status, isLoading, location.pathname, navigate]);

    return { status, isLoading, needsSetup: status && !status.setup_completed };
}
