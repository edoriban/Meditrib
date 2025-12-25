import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IconHelp, IconPackage, IconShoppingCart, IconUsers, IconFileInvoice, IconChartBar, IconAlertTriangle, IconPhone } from "@tabler/icons-react";

export default function HelpPage() {
    const faqItems = [
        {
            question: "¿Cómo registro una nueva venta?",
            answer: "Ve a la sección 'Ventas' en el menú lateral. Haz clic en 'Nueva Venta', selecciona el cliente, agrega los productos escaneando el código de barras o buscándolos manualmente, y finaliza la venta. Puedes aplicar descuentos y seleccionar el método de pago."
        },
        {
            question: "¿Cómo agrego un nuevo producto al inventario?",
            answer: "En la sección 'Productos', haz clic en 'Agregar Producto'. Completa la información del producto incluyendo nombre, precio de compra, precio de venta, código de barras, laboratorio y cantidad inicial. Los productos con receta deben marcarse apropiadamente."
        },
        {
            question: "¿Cómo funcionan las alertas de stock bajo?",
            answer: "El sistema genera alertas automáticas cuando el inventario de un producto cae por debajo del umbral configurado. Puedes ajustar estos umbrales en Configuración. Las alertas se muestran en el Centro de Alertas y pueden resolverse manualmente una vez que hayas reabastecido."
        },
        {
            question: "¿Cómo genero una factura (CFDI)?",
            answer: "Las facturas se generan desde la sección 'Facturas'. Puedes crear una factura manualmente o generarla automáticamente desde una venta existente. El sistema genera el XML compatible con el SAT que puedes timbrar con tu proveedor de certificación."
        },
        {
            question: "¿Cómo registro gastos operativos?",
            answer: "En la sección 'Gastos', haz clic en 'Nuevo Gasto'. Selecciona la categoría, ingresa el monto, fecha y descripción. Puedes marcar si el gasto es deducible de impuestos para facilitar la contabilidad."
        },
        {
            question: "¿Cómo creo una orden de compra?",
            answer: "Ve a 'Órdenes de Compra' y haz clic en 'Nueva Orden'. Selecciona el proveedor, agrega los productos que necesitas reabastecer con sus cantidades y precios de compra. Una vez recibida la mercancía, marca la orden como completada para actualizar el inventario."
        },
        {
            question: "¿Cómo funcionan los lotes y fechas de caducidad?",
            answer: "Cada entrada de producto puede tener un número de lote y fecha de caducidad. El sistema te alertará automáticamente cuando los productos estén próximos a caducar. Puedes ver el estado de los lotes en la sección 'Lotes'."
        },
        {
            question: "¿Cómo exporto reportes financieros?",
            answer: "En la sección 'Reportes' puedes ver el estado de resultados, tendencias mensuales y rentabilidad por producto. Usa los botones 'Exportar Excel' o 'Exportar PDF' para descargar los reportes."
        }
    ];

    const modules = [
        { icon: IconShoppingCart, name: "Ventas", description: "Registro de ventas, tickets y punto de venta" },
        { icon: IconPackage, name: "Inventario", description: "Productos, lotes y control de stock" },
        { icon: IconUsers, name: "Clientes/Proveedores", description: "Gestión de contactos comerciales" },
        { icon: IconFileInvoice, name: "Facturación", description: "CFDI, facturas electrónicas" },
        { icon: IconChartBar, name: "Reportes", description: "Análisis financieros y estadísticas" },
        { icon: IconAlertTriangle, name: "Alertas", description: "Notificaciones de stock y caducidad" },
    ];

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Centro de Ayuda</h1>
                        <p className="text-muted-foreground mt-2">
                            Guías y preguntas frecuentes sobre el uso del sistema.
                        </p>
                    </div>
                </div>
            </div>

            {/* Módulos del Sistema */}
            <Card>
                <CardHeader>
                    <CardTitle>Módulos del Sistema</CardTitle>
                    <CardDescription>Descripción de las principales funcionalidades</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.map((module) => (
                            <div key={module.name} className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <module.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{module.name}</h3>
                                    <p className="text-sm text-muted-foreground">{module.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Preguntas Frecuentes */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <IconHelp className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Preguntas Frecuentes</CardTitle>
                    </div>
                    <CardDescription>Respuestas a las dudas más comunes</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            {/* Soporte */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <IconPhone className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>¿Necesitas más ayuda?</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 p-4 rounded-lg border">
                            <h3 className="font-medium mb-2">Soporte Técnico</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Para problemas técnicos o errores del sistema.
                            </p>
                            <p className="text-sm font-medium">soporte@vanpos.mx</p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg border">
                            <h3 className="font-medium mb-2">Capacitación</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Solicita capacitación para tu equipo.
                            </p>
                            <p className="text-sm font-medium">capacitacion@vanpos.mx</p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg border">
                            <h3 className="font-medium mb-2">Ventas</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Información sobre licencias y módulos adicionales.
                            </p>
                            <p className="text-sm font-medium">ventas@meditrib.com</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
