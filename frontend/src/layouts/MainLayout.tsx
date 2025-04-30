import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from '@/components/Header';   // Asume que tienes o crearás este componente
import DashboardPage from "@/pages/DashboardPage";

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <SidebarProvider>
            {/* Puedes ajustar el variant según necesites */}
            <AppSidebar variant="inset" />
            <SidebarInset>
                <Header />  {/* Agregar el componente Header aquí */}
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    {/* Contenedor principal para el contenido de la página */}
                    <DashboardPage /> {/* Aquí puedes incluir el componente DashboardPage o cualquier otro contenido */}
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}