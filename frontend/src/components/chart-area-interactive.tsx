"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart showing sales profit"

// Placeholder data representing daily total purchase price vs total sale price
// In a real application, this data would be fetched from your backend API
// TODO: Replace with actual data fetching logic
const chartData = [
  { date: "2024-05-01", compra: 100, venta: 150 },
  { date: "2024-05-02", compra: 200, venta: 300 },
  { date: "2024-05-03", compra: 150, venta: 200 },
  { date: "2024-05-04", compra: 250, venta: 350 },
  { date: "2024-05-05", compra: 300, venta: 400 },
  { date: "2024-05-06", compra: 400, venta: 500 },
  { date: "2024-05-07", compra: 50, venta: 70 },
  { date: "2024-05-08", compra: 120, venta: 180 },
  { date: "2024-05-09", compra: 90, venta: 130 },
  { date: "2024-05-10", compra: 60, venta: 90 },
  { date: "2024-05-11", compra: 80, venta: 110 },
  { date: "2024-05-12", compra: 70, venta: 100 },
  { date: "2024-05-13", compra: 130, venta: 190 },
  { date: "2024-06-01", compra: 120, venta: 178 },
  { date: "2024-06-02", compra: 350, venta: 470 },
  { date: "2024-06-03", compra: 80, venta: 103 },
  { date: "2024-06-04", compra: 300, venta: 439 },
  { date: "2024-06-05", compra: 60, venta: 88 },
  { date: "2024-06-06", compra: 200, venta: 294 },
  { date: "2024-06-07", compra: 250, venta: 323 },
  { date: "2024-06-08", compra: 280, venta: 385 },
  { date: "2024-06-09", compra: 350, venta: 438 },
  { date: "2024-06-10", compra: 110, venta: 155 },
  { date: "2024-06-11", compra: 70, venta: 92 },
  { date: "2024-06-12", compra: 380, venta: 492 },
  { date: "2024-06-13", compra: 50, venta: 81 },
  { date: "2024-06-14", compra: 320, venta: 426 },
  { date: "2024-06-15", compra: 250, venta: 307 },
  { date: "2024-06-16", compra: 280, venta: 371 },
  { date: "2024-06-17", compra: 400, venta: 475 },
  { date: "2024-06-18", compra: 80, venta: 107 },
  { date: "2024-06-19", compra: 250, venta: 341 },
  { date: "2024-06-20", compra: 330, venta: 408 },
  { date: "2024-06-21", compra: 120, venta: 169 },
  { date: "2024-06-22", compra: 220, venta: 317 },
  { date: "2024-06-23", compra: 410, venta: 480 },
  { date: "2024-06-24", compra: 90, venta: 132 },
  { date: "2024-06-25", compra: 100, venta: 141 },
  { date: "2024-06-26", compra: 350, venta: 434 },
  { date: "2024-06-27", compra: 380, venta: 448 },
  { date: "2024-06-28", compra: 110, venta: 149 },
  { date: "2024-06-29", compra: 75, venta: 103 },
  { date: "2024-06-30", compra: 360, venta: 446 },
]

const chartConfig = {
  venta: {
    label: "Ventas Totales",
    color: "hsl(var(--primary))",
  },
  compra: {
    label: "Costo Total",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    // Adjust reference date if needed, maybe to the latest date in your data
    const referenceDate = new Date(chartData[chartData.length - 1].date)
    let daysToSubtract = 30
    if (timeRange === "90d") {
      daysToSubtract = 90
    } else if (timeRange === "15d") {
      daysToSubtract = 15
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract + 1) // Adjust to include the start date
    return date >= startDate && date <= referenceDate // Ensure filtering up to the reference date
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Resumen de Ventas y Costos</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Ventas totales vs Costo total de los productos vendidos en el período seleccionado
          </span>
          <span className="@[540px]/card:hidden">Últimos 3 meses</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 90 días</ToggleGroupItem>
            <ToggleGroupItem value="30d">Último mes</ToggleGroupItem>
            <ToggleGroupItem value="15d">Últimos 15 días</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Último mes" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">
                Último mes
              </SelectItem>
              <SelectItem value="15d" className="rounded-lg">
                Últimos 15 días
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {/* Gradient for Venta */}
              <linearGradient id="fillVenta" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-venta)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-venta)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              {/* Gradient for Compra */}
              <linearGradient id="fillCompra" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-compra)"
                  stopOpacity={0.8} // Adjust opacity if needed
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-compra)"
                  stopOpacity={0.1} // Adjust opacity if needed
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("es-ES", { // Use Spanish locale
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("es-ES", { // Use Spanish locale
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                  formatter={(value, name, item) => {
                    // Use the label from chartConfig based on the data key (name)
                    const label = chartConfig[name as keyof typeof chartConfig]?.label || name;
                    // Optional: Format currency
                    const formattedValue = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value as number);
                    return `${label}: ${formattedValue}`
                  }}
                />
              }
            />
            {/* Area for Compra (drawn first to be potentially behind) */}
            <Area
              dataKey="compra"
              type="natural"
              fill="url(#fillCompra)"
              stroke="var(--color-compra)"
              stackId="a" // Keep stackId if you want stacked areas, remove if you want overlay
            />
            {/* Area for Venta */}
            <Area
              dataKey="venta"
              type="natural"
              fill="url(#fillVenta)"
              stroke="var(--color-venta)"
              stackId="a" // Keep stackId if you want stacked areas, remove if you want overlay
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
