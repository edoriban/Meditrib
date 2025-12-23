import * as React from "react";
import { SiteHeader } from "@/components/site-header";
const AppSidebar = React.lazy(() => import("@/components/app-sidebar"));
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";

interface MainLayoutProps {
    children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
    // Check onboarding status and redirect if incomplete
    const { isLoading } = useOnboardingCheck();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-pulse">Cargando...</div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<div>Cargando...</div>}>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col">
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </Suspense>
        </ErrorBoundary>
    );
}

export default MainLayout;