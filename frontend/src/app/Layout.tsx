import { Routes, Route } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { MedicineTable } from "../components/inventory/MedicineTable";
import { ReportCards } from "../components/reports/ReportCards";

const Home = () => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Bienvenido</h2>
        {/* Contenido de inicio */}
    </div>
);

const Inventory = () => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Inventario</h2>
        <MedicineTable />
    </div>
);

const Reports = () => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Reportes</h2>
        <ReportCards />
    </div>
);

export function Layout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/reports" element={<Reports />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}