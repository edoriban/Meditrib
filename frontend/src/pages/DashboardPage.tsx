import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { FulfillmentWidgets } from "@/components/dashboard/FulfillmentWidgets";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { ExpensesList } from "@/components/expenses/ExpensesList";
import { FinancialReports } from "@/components/financial-reports/FinancialReports";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardPage() {
    const [timeframe, setTimeRange] = useState<"7d" | "30d">("30d");

    return (
        <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-transparent">
            {/* Header con selector de tiempo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
                    <p className="text-muted-foreground mt-1">Inteligencia de negocio y seguimiento de cumplimiento.</p>
                </div>
                <Select value={timeframe} onValueChange={(v) => setTimeRange(v as "7d" | "30d")}>
                    <SelectTrigger className="w-[180px] bg-background">
                        <SelectValue placeholder="Periodo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Últimos 7 días</SelectItem>
                        <SelectItem value="30d">Últimos 30 días</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-8">
                {/* 1. Widgets de Cumplimiento (Prioridad Operativa) */}
                <section>
                    <FulfillmentWidgets />
                </section>

                {/* 2. Métricas de Negocio con Comparativa (KPIs) */}
                <section>
                    <DashboardStats timeframe={timeframe} />
                </section>

                {/* 3. Visualizaciones de Tendencia y Top Ventas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Gráfica de tendencias (8/12) */}
                    <div className="lg:col-span-8 flex">
                        <ChartAreaInteractive />
                    </div>

                    {/* Top Productos (4/12) */}
                    <div className="lg:col-span-4 flex">
                        <TopProductsChart />
                    </div>
                </div>

                {/* 4. Reportes Detallados y Gastos (Sin resúmenes duplicados) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FinancialReports hideSummary />
                    <ExpensesList hideSummary />
                </div>
            </div>
        </div>
    );
}