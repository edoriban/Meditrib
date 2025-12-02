import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconArrowLeft } from "@tabler/icons-react";

export default function PrivacyPolicyPage() {
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
                        <CardTitle className="text-3xl font-bold">Política de Privacidad</CardTitle>
                        <p className="text-muted-foreground">Última actualización: 2 de diciembre de 2025</p>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">1. Introducción</h2>
                            <p className="text-muted-foreground mb-4">
                                En Meditrib, nos comprometemos a proteger la privacidad de nuestros usuarios. 
                                Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y 
                                protegemos su información personal cuando utiliza nuestro sistema de gestión 
                                de medicamentos.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">2. Información que Recopilamos</h2>
                            <p className="text-muted-foreground mb-4">
                                Recopilamos los siguientes tipos de información:
                            </p>
                            
                            <h3 className="text-lg font-medium mb-2">2.1 Información de Cuenta</h3>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                                <li>Nombre completo</li>
                                <li>Correo electrónico</li>
                                <li>Contraseña (almacenada de forma encriptada)</li>
                                <li>Rol en la organización</li>
                            </ul>

                            <h3 className="text-lg font-medium mb-2">2.2 Información Comercial</h3>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                                <li>Datos de clientes y proveedores</li>
                                <li>Información fiscal (RFC, régimen fiscal, dirección fiscal)</li>
                                <li>Historial de ventas y compras</li>
                                <li>Inventario de medicamentos</li>
                            </ul>

                            <h3 className="text-lg font-medium mb-2">2.3 Información Técnica</h3>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Dirección IP</li>
                                <li>Tipo de navegador</li>
                                <li>Registro de actividades en el sistema</li>
                                <li>Cookies y tecnologías similares</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">3. Uso de la Información</h2>
                            <p className="text-muted-foreground mb-4">
                                Utilizamos la información recopilada para:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Proporcionar y mantener el servicio</li>
                                <li>Autenticar usuarios y proteger cuentas</li>
                                <li>Generar facturas electrónicas (CFDI)</li>
                                <li>Generar reportes y análisis para su negocio</li>
                                <li>Enviar notificaciones importantes del sistema</li>
                                <li>Mejorar y desarrollar nuevas funcionalidades</li>
                                <li>Cumplir con obligaciones legales y fiscales</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">4. Base Legal para el Tratamiento</h2>
                            <p className="text-muted-foreground mb-4">
                                El tratamiento de sus datos se basa en:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Consentimiento:</strong> Al registrarse y usar el Sistema</li>
                                <li><strong>Ejecución contractual:</strong> Para proveer el servicio contratado</li>
                                <li><strong>Obligación legal:</strong> Cumplimiento de requisitos fiscales y de salud</li>
                                <li><strong>Interés legítimo:</strong> Mejorar el servicio y prevenir fraudes</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">5. Compartir Información</h2>
                            <p className="text-muted-foreground mb-4">
                                No vendemos su información personal. Podemos compartir datos con:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>SAT:</strong> Para la emisión de CFDI (obligación legal)</li>
                                <li><strong>PAC (Proveedor Autorizado de Certificación):</strong> Para timbrado de facturas</li>
                                <li><strong>Proveedores de servicios:</strong> Hosting, seguridad, respaldos (bajo contratos de confidencialidad)</li>
                                <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">6. Seguridad de los Datos</h2>
                            <p className="text-muted-foreground mb-4">
                                Implementamos medidas de seguridad técnicas y organizativas:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Encriptación de contraseñas con algoritmos seguros</li>
                                <li>Conexiones HTTPS para toda la comunicación</li>
                                <li>Respaldos periódicos de la información</li>
                                <li>Control de acceso basado en roles</li>
                                <li>Monitoreo de actividades sospechosas</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">7. Retención de Datos</h2>
                            <p className="text-muted-foreground mb-4">
                                Conservamos su información:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Datos de cuenta:</strong> Mientras mantenga su cuenta activa</li>
                                <li><strong>Facturas y registros fiscales:</strong> 5 años (obligación legal SAT)</li>
                                <li><strong>Registros de medicamentos:</strong> Según normativa COFEPRIS</li>
                                <li><strong>Logs del sistema:</strong> 1 año para seguridad</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">8. Sus Derechos (Derechos ARCO)</h2>
                            <p className="text-muted-foreground mb-4">
                                De acuerdo con la Ley Federal de Protección de Datos Personales, usted tiene derecho a:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre usted</li>
                                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                                <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos</li>
                                <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos</li>
                            </ul>
                            <p className="text-muted-foreground mt-4">
                                Para ejercer estos derechos, envíe un correo a: <strong>privacidad@meditrib.com</strong>
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">9. Cookies</h2>
                            <p className="text-muted-foreground mb-4">
                                Utilizamos cookies esenciales para:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Mantener su sesión activa</li>
                                <li>Recordar sus preferencias</li>
                                <li>Garantizar la seguridad del sistema</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">10. Menores de Edad</h2>
                            <p className="text-muted-foreground mb-4">
                                El Sistema está diseñado para uso comercial y no está dirigido a menores de 18 años. 
                                No recopilamos intencionalmente información de menores.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">11. Cambios a esta Política</h2>
                            <p className="text-muted-foreground mb-4">
                                Podemos actualizar esta Política de Privacidad periódicamente. Los cambios 
                                significativos serán notificados a través del Sistema o por correo electrónico.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">12. Contacto</h2>
                            <p className="text-muted-foreground mb-4">
                                Para preguntas sobre esta Política de Privacidad o el tratamiento de sus datos:
                            </p>
                            <p className="text-muted-foreground">
                                <strong>Email:</strong> privacidad@meditrib.com<br />
                                <strong>Teléfono:</strong> (55) 1234-5678<br />
                                <strong>Responsable:</strong> Oficial de Protección de Datos de Meditrib
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
