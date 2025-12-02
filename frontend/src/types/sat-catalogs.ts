/**
 * Catálogos del SAT para facturación electrónica CFDI 4.0
 * Estos catálogos son necesarios para la emisión de facturas electrónicas en México
 */

// Regímenes fiscales del SAT
export const TAX_REGIMES = [
    { code: "601", label: "General de Ley Personas Morales" },
    { code: "603", label: "Personas Morales con Fines no Lucrativos" },
    { code: "605", label: "Sueldos y Salarios e Ingresos Asimilados a Salarios" },
    { code: "606", label: "Arrendamiento" },
    { code: "607", label: "Régimen de Enajenación o Adquisición de Bienes" },
    { code: "608", label: "Demás ingresos" },
    { code: "610", label: "Residentes en el Extranjero sin Establecimiento Permanente en México" },
    { code: "611", label: "Ingresos por Dividendos (socios y accionistas)" },
    { code: "612", label: "Personas Físicas con Actividades Empresariales y Profesionales" },
    { code: "614", label: "Ingresos por intereses" },
    { code: "615", label: "Régimen de los ingresos por obtención de premios" },
    { code: "616", label: "Sin obligaciones fiscales" },
    { code: "620", label: "Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
    { code: "621", label: "Incorporación Fiscal" },
    { code: "622", label: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
    { code: "623", label: "Opcional para Grupos de Sociedades" },
    { code: "624", label: "Coordinados" },
    { code: "625", label: "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
    { code: "626", label: "Régimen Simplificado de Confianza" },
] as const;

// Usos de CFDI del SAT
export const CFDI_USES = [
    { code: "G01", label: "Adquisición de mercancías" },
    { code: "G02", label: "Devoluciones, descuentos o bonificaciones" },
    { code: "G03", label: "Gastos en general" },
    { code: "I01", label: "Construcciones" },
    { code: "I02", label: "Mobiliario y equipo de oficina por inversiones" },
    { code: "I03", label: "Equipo de transporte" },
    { code: "I04", label: "Equipo de cómputo y accesorios" },
    { code: "I05", label: "Dados, troqueles, moldes, matrices y herramental" },
    { code: "I06", label: "Comunicaciones telefónicas" },
    { code: "I07", label: "Comunicaciones satelitales" },
    { code: "I08", label: "Otra maquinaria y equipo" },
    { code: "D01", label: "Honorarios médicos, dentales y gastos hospitalarios" },
    { code: "D02", label: "Gastos médicos por incapacidad o discapacidad" },
    { code: "D03", label: "Gastos funerales" },
    { code: "D04", label: "Donativos" },
    { code: "D05", label: "Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)" },
    { code: "D06", label: "Aportaciones voluntarias al SAR" },
    { code: "D07", label: "Primas por seguros de gastos médicos" },
    { code: "D08", label: "Gastos de transportación escolar obligatoria" },
    { code: "D09", label: "Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones" },
    { code: "D10", label: "Pagos por servicios educativos (colegiaturas)" },
    { code: "S01", label: "Sin efectos fiscales" },
    { code: "CP01", label: "Pagos" },
    { code: "CN01", label: "Nómina" },
] as const;

// Estados de México para dirección fiscal
export const MEXICAN_STATES = [
    { code: "AGU", label: "Aguascalientes" },
    { code: "BCN", label: "Baja California" },
    { code: "BCS", label: "Baja California Sur" },
    { code: "CAM", label: "Campeche" },
    { code: "CHP", label: "Chiapas" },
    { code: "CHH", label: "Chihuahua" },
    { code: "COA", label: "Coahuila de Zaragoza" },
    { code: "COL", label: "Colima" },
    { code: "DIF", label: "Ciudad de México" },
    { code: "DUR", label: "Durango" },
    { code: "GUA", label: "Guanajuato" },
    { code: "GRO", label: "Guerrero" },
    { code: "HID", label: "Hidalgo" },
    { code: "JAL", label: "Jalisco" },
    { code: "MEX", label: "Estado de México" },
    { code: "MIC", label: "Michoacán de Ocampo" },
    { code: "MOR", label: "Morelos" },
    { code: "NAY", label: "Nayarit" },
    { code: "NLE", label: "Nuevo León" },
    { code: "OAX", label: "Oaxaca" },
    { code: "PUE", label: "Puebla" },
    { code: "QUE", label: "Querétaro" },
    { code: "ROO", label: "Quintana Roo" },
    { code: "SLP", label: "San Luis Potosí" },
    { code: "SIN", label: "Sinaloa" },
    { code: "SON", label: "Sonora" },
    { code: "TAB", label: "Tabasco" },
    { code: "TAM", label: "Tamaulipas" },
    { code: "TLA", label: "Tlaxcala" },
    { code: "VER", label: "Veracruz de Ignacio de la Llave" },
    { code: "YUC", label: "Yucatán" },
    { code: "ZAC", label: "Zacatecas" },
] as const;

// Formas de pago del SAT
export const PAYMENT_FORMS = [
    { code: "01", label: "Efectivo" },
    { code: "02", label: "Cheque nominativo" },
    { code: "03", label: "Transferencia electrónica de fondos" },
    { code: "04", label: "Tarjeta de crédito" },
    { code: "05", label: "Monedero electrónico" },
    { code: "06", label: "Dinero electrónico" },
    { code: "08", label: "Vales de despensa" },
    { code: "12", label: "Dación en pago" },
    { code: "13", label: "Pago por subrogación" },
    { code: "14", label: "Pago por consignación" },
    { code: "15", label: "Condonación" },
    { code: "17", label: "Compensación" },
    { code: "23", label: "Novación" },
    { code: "24", label: "Confusión" },
    { code: "25", label: "Remisión de deuda" },
    { code: "26", label: "Prescripción o caducidad" },
    { code: "27", label: "A satisfacción del acreedor" },
    { code: "28", label: "Tarjeta de débito" },
    { code: "29", label: "Tarjeta de servicios" },
    { code: "30", label: "Aplicación de anticipos" },
    { code: "31", label: "Intermediario pagos" },
    { code: "99", label: "Por definir" },
] as const;

// Métodos de pago del SAT
export const PAYMENT_METHODS = [
    { code: "PUE", label: "Pago en una sola exhibición" },
    { code: "PPD", label: "Pago en parcialidades o diferido" },
] as const;

// Tipos de inferidos
export type TaxRegimeCode = typeof TAX_REGIMES[number]["code"];
export type CfdiUseCode = typeof CFDI_USES[number]["code"];
export type MexicanStateCode = typeof MEXICAN_STATES[number]["code"];
export type PaymentFormCode = typeof PAYMENT_FORMS[number]["code"];
export type PaymentMethodCode = typeof PAYMENT_METHODS[number]["code"];

// Helpers para obtener labels
export function getTaxRegimeLabel(code: string): string {
    const regime = TAX_REGIMES.find(r => r.code === code);
    return regime ? `${regime.code} - ${regime.label}` : code;
}

export function getCfdiUseLabel(code: string): string {
    const use = CFDI_USES.find(u => u.code === code);
    return use ? `${use.code} - ${use.label}` : code;
}

export function getMexicanStateLabel(code: string): string {
    const state = MEXICAN_STATES.find(s => s.code === code);
    return state ? state.label : code;
}

export function getPaymentFormLabel(code: string): string {
    const form = PAYMENT_FORMS.find(f => f.code === code);
    return form ? `${form.code} - ${form.label}` : code;
}

export function getPaymentMethodLabel(code: string): string {
    const method = PAYMENT_METHODS.find(m => m.code === code);
    return method ? `${method.code} - ${method.label}` : code;
}
