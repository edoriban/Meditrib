import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconArrowLeft } from "@tabler/icons-react";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto py-8 px-4">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => window.history.back()}
                >
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Términos de Servicio</CardTitle>
                        <p className="text-muted-foreground">Última actualización: 2 de diciembre de 2025</p>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">1. Aceptación de los Términos</h2>
                            <p className="text-muted-foreground mb-4">
                                Al acceder y utilizar VanPOS ("el Sistema"), usted acepta estar sujeto a estos
                                Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no está
                                de acuerdo con alguno de estos términos, no utilice el Sistema.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">2. Descripción del Servicio</h2>
                            <p className="text-muted-foreground mb-4">
                                VanPOS es un sistema de inventario y punto de venta diseñado para
                                negocios y distribuidoras. El Sistema permite:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Gestión de inventario de productos</li>
                                <li>Control de lotes y fechas de caducidad</li>
                                <li>Generación de facturas electrónicas (CFDI)</li>
                                <li>Administración de proveedores y clientes</li>
                                <li>Reportes financieros y operativos</li>
                                <li>Control de usuarios y roles</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">3. Registro y Cuenta de Usuario</h2>
                            <p className="text-muted-foreground mb-4">
                                Para utilizar el Sistema, debe crear una cuenta proporcionando información
                                veraz y completa. Usted es responsable de:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Mantener la confidencialidad de su contraseña</li>
                                <li>Todas las actividades que ocurran bajo su cuenta</li>
                                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                                <li>Mantener actualizada la información de su cuenta</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">4. Uso Aceptable</h2>
                            <p className="text-muted-foreground mb-4">
                                El usuario se compromete a utilizar el Sistema únicamente para fines legales
                                y de acuerdo con estos Términos. Está prohibido:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Usar el Sistema para actividades ilegales</li>
                                <li>Intentar acceder a cuentas de otros usuarios</li>
                                <li>Modificar, copiar o distribuir el software sin autorización</li>
                                <li>Introducir virus o código malicioso</li>
                                <li>Utilizar el Sistema para vender productos controlados sin las licencias correspondientes</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">5. Cumplimiento Regulatorio</h2>
                            <p className="text-muted-foreground mb-4">
                                El usuario es responsable de cumplir con todas las leyes y regulaciones
                                aplicables a su industria, incluyendo pero no limitado a:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Ley General de Salud</li>
                                <li>Reglamento de Insumos para la Salud</li>
                                <li>Normas Oficiales Mexicanas aplicables</li>
                                <li>Requisitos de la COFEPRIS</li>
                                <li>Código Fiscal de la Federación (para facturación)</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">6. Propiedad Intelectual</h2>
                            <p className="text-muted-foreground mb-4">
                                El Sistema, incluyendo su código fuente, diseño, logos y contenido, son
                                propiedad de VanPOS y están protegidos por leyes de propiedad intelectual.
                                Se otorga una licencia limitada y no exclusiva para usar el Sistema según
                                estos Términos.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">7. Privacidad y Datos</h2>
                            <p className="text-muted-foreground mb-4">
                                El tratamiento de datos personales se rige por nuestra{" "}
                                <a href="/privacy" className="text-primary underline">Política de Privacidad</a>.
                                Al usar el Sistema, acepta dicha política.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">8. Limitación de Responsabilidad</h2>
                            <p className="text-muted-foreground mb-4">
                                VanPOS no será responsable por:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Pérdidas derivadas del uso o incapacidad de uso del Sistema</li>
                                <li>Errores en la información ingresada por usuarios</li>
                                <li>Interrupciones del servicio por mantenimiento o causas de fuerza mayor</li>
                                <li>Decisiones comerciales tomadas basándose en los reportes del Sistema</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">9. Modificaciones</h2>
                            <p className="text-muted-foreground mb-4">
                                Nos reservamos el derecho de modificar estos Términos en cualquier momento.
                                Los cambios serán efectivos al publicarse en el Sistema. El uso continuado
                                después de las modificaciones constituye aceptación de los nuevos Términos.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">10. Contacto</h2>
                            <p className="text-muted-foreground mb-4">
                                Para preguntas sobre estos Términos de Servicio, contacte a:
                            </p>
                            <p className="text-muted-foreground">
                                <strong>Email:</strong> soporte@vanpos.com<br />
                                <strong>Teléfono:</strong> (55) 1234-5678
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
