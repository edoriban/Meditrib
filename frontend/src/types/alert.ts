export interface Alert {
    id: number;
    type: 'low_stock' | 'expiring' | 'expired' | 'critical_stock';
    message: string;
    medicine_id: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    is_active: boolean;
    created_at: string;
    resolved_at?: string;
    medicine: {
        id: number;
        name: string;
        expiration_date?: string;
        inventory?: {
            quantity: number;
        };
    };
}