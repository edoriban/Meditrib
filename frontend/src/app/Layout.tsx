import { Routes, Route } from "react-router-dom";
import { MedicineTable } from "../components/inventory/MedicineTable";
import { ReportCards } from "../components/reports/ReportCards";
import { AppShell } from "@/components/layout/AppShell";
import { Pill, BarChart3, PlusCircle, Home, PackageSearch, Users } from "lucide-react";
import { Separator } from "../components/ui/separator";

const Dashboard = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
                Bienvenido al sistema de gestión de medicamentos Meditrib
            </p>
        </div>
        <Separator />
        <ReportCards />
    </div>
);

const Inventory = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
            <p className="text-muted-foreground">
                Gestiona el inventario de medicamentos
            </p>
        </div>
        <Separator />
        <MedicineTable />
    </div>
);

const Reports = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground">
                Visualiza estadísticas y genera reportes
            </p>
        </div>
        <Separator />
        <ReportCards />
    </div>
);

const Suppliers = () => (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
            <p className="text-muted-foreground">
                Administra los proveedores de medicamentos
            </p>
        </div>
        <Separator />
        <div className="rounded-md border p-8 text-center">
            <h2 className="text-lg font-medium mb-2">Sección en desarrollo</h2>
            <p className="text-sm text-muted-foreground">
                La administración de proveedores estará disponible próximamente
            </p>
        </div>
    </div>
);

export function Layout() {
    const navigationItems = [
        {
            title: "Inicio",
            icon: Home,
            href: "/",
        },
        {
            title: "Medicamentos",
            icon: Pill,
            href: "/inventory",
        },
        {
            title: "Reportes",
            icon: BarChart3,
            href: "/reports",
        },
        {
            title: "Proveedores",
            icon: Users,
            href: "/suppliers",
        },
    ];

    const userActions = [
        {
            title: "Nuevo medicamento",
            icon: PlusCircle,
            onClick: () => alert("Función en desarrollo"),
        },
        {
            title: "Buscar",
            icon: PackageSearch,
            onClick: () => alert("Función en desarrollo"),
        }
    ];

    return (
        <AppShell
            navigationItems={navigationItems}
            userActions={userActions}
            appName="Meditrib"
            appDescription="Sistema de Gestión de Medicamentos"
        >
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/suppliers" element={<Suppliers />} />
            </Routes>
        </AppShell>
    );
}