import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query";
import { Medicine } from "@/types/medicine";
import axios from "axios";
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const { data: medicines } = useQuery<Medicine[]>({
    queryKey: ["medicines"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/api/v1/medicines/");
        return data;
      } catch (error) {
        console.error("Error fetching medicines:", error);
        throw error;
      }
    }
  });

  const totalProducts = medicines?.length || 0;
  const totalValue = medicines?.reduce((sum, med) => sum + (med.sale_price * (med.inventory?.quantity || 0)), 0) || 0;
  const lowStock = medicines?.filter(med => (med.inventory?.quantity || 0) < 10).length || 0;
  const mostExpensive = medicines?.sort((a, b) => b.sale_price - a.sale_price)[0]?.name || "N/A";

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Productos en catalogo</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalProducts}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {totalProducts > 0 ? `+${totalProducts * 2}%` : '0%'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registros nuevos del mes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Medicamentos registrados
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Valor del inventario</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${totalValue.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              {totalValue > 0 ? `-${totalValue * 2}%` : '0%'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registros en baja {lowStock > 0 ? `${lowStock * 2}%` : '0%'} este periodo <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Necesita atención de adquisición
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Stock Bajo</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {lowStock.toLocaleString()} {/* Display total value dynamically */}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              {lowStock > 0 ? `+${lowStock * 2}%` : '0%'} {/* Display total value change dynamically */}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registros en baja {lowStock > 0 ? `${lowStock * 2}%` : '0%'} este periodo <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Productos con menos de 10 unidades</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Producto mas costoso</CardDescription> {/* Updated description */}
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {mostExpensive} {/* Display most expensive product dynamically */}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {mostExpensive} {/* Display most expensive product change dynamically */}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Medicamento de mayor precio <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground" />
        </CardFooter>
      </Card>
    </div>
  )
}
