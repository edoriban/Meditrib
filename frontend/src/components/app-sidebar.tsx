import { useEffect, useState } from "react";
import {
  IconAlertTriangle,
  IconBox,
  IconChartBar,
  IconCoin,
  IconDashboard,
  IconDatabase,
  IconFileInvoice,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSettings,
  IconShield,
  IconShoppingCart,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { auth } from "@/utils/auth";
import { User } from "@/types/user";
import { Link } from "react-router-dom";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Ventas",
      url: "/sales",
      icon: IconChartBar,
    },
    {
      title: "Clientes",
      url: "/clients",
      icon: IconFolder,
    },
    {
      title: "Proveedores",
      url: "/suppliers",
      icon: IconListDetails,
    },
    {
      title: "Órdenes de Compra",
      url: "/purchase-orders",
      icon: IconShoppingCart,
    },
  ],
  documents: [
    {
      name: "Productos",
      url: "/products",
      icon: IconDatabase,
    },
    {
      name: "Lotes",
      url: "/batches",
      icon: IconBox,
    },
    {
      name: "Alertas",
      url: "/alerts",
      icon: IconAlertTriangle,
    },
  ],
  navFinance: [
    {
      name: "Facturas",
      url: "/invoices",
      icon: IconFileInvoice,
    },
    {
      name: "Gastos",
      url: "/expenses",
      icon: IconCoin,
    },
    {
      name: "Reportes",
      url: "/reports",
      icon: IconReport,
    },
  ],
  navAdmin: [
    {
      name: "Usuarios",
      url: "/users",
      icon: IconUsers,
    },
    {
      name: "Roles",
      url: "/roles",
      icon: IconShield,
    },
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Ayuda",
      url: "/help",
      icon: IconHelp,
    },
  ],
}

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await auth.getCurrentUser();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };

    fetchUser();
  }, []);

  const userData = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    avatar: "",
    initials: currentUser.name.charAt(0).toUpperCase(),
  } : {
    name: "Cargando...",
    email: "",
    avatar: "",
    initials: "?"
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">VanPOS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} label="Inventario" />
        <NavDocuments items={data.navFinance} label="Finanzas" />
        <NavDocuments items={data.navAdmin} label="Administración" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
export default AppSidebar