"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

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
import { BASE_API_URL } from "@/config"

export const description = "An interactive area chart showing sales profit"

interface DailyTrendData {
  date: string;
  venta: number;
  compra: number;
}

const chartConfig = {
  venta: {
    label: "Ventas Totales",
    color: "hsl(var(--chart-1))",
  },
  compra: {
    label: "Costo Total",
    color: "hsl(var(--chart-2))",
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

  // Fetch real data from backend
  const { data: chartData = [], isLoading } = useQuery<DailyTrendData[]>({
    queryKey: ["daily-trend"],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE_API_URL}/financial-reports/daily-trend?days=90`)
      return data
    },
  })

  const filteredData = React.useMemo(() => {
    if (!chartData.length) return []

    const referenceDate = new Date(chartData[chartData.length - 1]?.date || new Date())
    let daysToSubtract = 30

    if (timeRange === "90d") {
      daysToSubtract = 90
    } else if (timeRange === "15d") {
      daysToSubtract = 15
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract + 1)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate && date <= referenceDate
    })
  }, [chartData, timeRange])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Ventas y Costos</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <div className="text-muted-foreground">Cargando gráfica...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card w-full h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight">Resumen de Ventas y Costos</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Ventas vs Costo de artículos vendidos
          </span>
          <span className="@[540px]/card:hidden">Último período</span>
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
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          {filteredData.length > 0 ? (
            <AreaChart data={filteredData}>
              <defs>
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
                <linearGradient id="fillCompra" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-compra)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-compra)"
                    stopOpacity={0.1}
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
                  return date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    indicator="dot"
                    formatter={(value, name) => {
                      const label = chartConfig[name as keyof typeof chartConfig]?.label || name;
                      const formattedValue = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value as number);
                      return `${label}: ${formattedValue}`
                    }}
                  />
                }
              />
              <Area
                dataKey="compra"
                type="natural"
                fill="url(#fillCompra)"
                stroke="var(--color-compra)"
                stackId="a"
              />
              <Area
                dataKey="venta"
                type="natural"
                fill="url(#fillVenta)"
                stroke="var(--color-venta)"
                stackId="a"
              />
            </AreaChart>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
              No hay datos para mostrar en este periodo
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
