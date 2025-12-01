export interface Company {
    id: number;
    rfc: string;
    name: string;
    tax_regime: string;
    street: string;
    exterior_number: string;
    interior_number?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    email: string;
    phone?: string;
}

export interface InvoiceConcept {
    id: number;
    invoice_id: number;
    quantity: number;
    unit: string;
    description: string;
    unit_price: number;
    amount: number;
    discount: number;
    medicine_id?: number;
    medicine?: {
        id: number;
        name: string;
    };
}

export interface InvoiceTax {
    id: number;
    invoice_id: number;
    tax_type: string;
    tax_rate: number;
    tax_amount: number;
    tax_base: number;
}

export interface Invoice {
    id: number;
    uuid?: string;
    serie: string;
    folio?: string;
    invoice_type: string;
    payment_form: string;
    payment_method: string;
    currency: string;
    exchange_rate: number;
    subtotal: number;
    discount: number;
    total: number;
    total_taxes: number;
    issue_date: string;
    certification_date?: string;
    status: string;
    cfdi_xml?: string;
    cancellation_reason?: string;
    company_id: number;
    client_id: number;
    sale_id?: number;
    company: Company;
    client: {
        id: number;
        name: string;
        rfc?: string;
        tax_regime?: string;
        cfdi_use?: string;
    };
    sale?: {
        id: number;
        total_price: number;
    };
    concepts: InvoiceConcept[];
    taxes: InvoiceTax[];
}

export interface InvoiceCreate {
    serie?: string;
    folio?: string;
    invoice_type?: string;
    payment_form: string;
    payment_method: string;
    currency?: string;
    exchange_rate?: number;
    subtotal: number;
    discount?: number;
    total: number;
    total_taxes?: number;
    company_id: number;
    client_id: number;
    sale_id?: number;
    concepts: {
        quantity: number;
        unit: string;
        description: string;
        unit_price: number;
        amount: number;
        discount?: number;
        medicine_id?: number;
    }[];
    taxes: {
        tax_type: string;
        tax_rate: number;
        tax_amount: number;
        tax_base: number;
    }[];
}

export interface CompanyCreate {
    rfc: string;
    name: string;
    tax_regime: string;
    street: string;
    exterior_number: string;
    interior_number?: string;
    neighborhood: string;
    city: string;
    state: string;
    country?: string;
    postal_code: string;
    email: string;
    phone?: string;
}