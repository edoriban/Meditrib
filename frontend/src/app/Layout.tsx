import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import DashboardPage from "./dashboard/page"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (

        <DashboardPage />

    )
}
