import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { AlertsList } from "@/components/alerts/AlertsList";
import { ExpensesList } from "@/components/expenses/ExpensesList";
import { FinancialReports } from "@/components/financial-reports/FinancialReports";

export default function DashboardPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Alertas - Importante mostrar primero */}
                <div className="px-4 lg:px-6">
                    <AlertsList />
                </div>

                {/* Cards de métricas principales */}
                <SectionCards />

                {/* Gráfica de ventas vs costos */}
                <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                </div>

                {/* Reportes financieros */}
                <div className="px-4 lg:px-6">
                    <FinancialReports />
                </div>

                {/* Resumen de gastos */}
                <div className="px-4 lg:px-6">
                    <ExpensesList />
                </div>
            </div>
        </div>
    );
}