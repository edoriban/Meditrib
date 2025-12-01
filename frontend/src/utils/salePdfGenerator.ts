import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Sale } from "@/types/sales";

interface CompanySettings {
    companyName: string;
    companyRfc: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    companyLogo?: string; // Base64 string de la imagen
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const getPaymentStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
        pending: "Pendiente",
        partial: "Parcial",
        paid: "Pagado",
        refunded: "Reembolsado",
    };
    return labels[status] || status;
};

const getShippingStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
        pending: "Pendiente",
        shipped: "Enviado",
        delivered: "Entregado",
        canceled: "Cancelado",
    };
    return labels[status] || status;
};

const getDocumentTypeLabel = (type: string) => {
    return type === "invoice" ? "FACTURA" : "NOTA DE REMISIÓN";
};

export function generateSalePDF(sale: Sale): void {
    // Obtener configuración de la empresa desde localStorage
    const settingsStr = localStorage.getItem('meditrib_settings');
    const settings: CompanySettings = settingsStr ? JSON.parse(settingsStr) : {
        companyName: "Mi Empresa",
        companyRfc: "",
        companyAddress: "",
        companyPhone: "",
        companyEmail: "",
    };

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // ====== ENCABEZADO CON LOGO ======
    const logoHeight = 25;
    
    if (settings.companyLogo) {
        try {
            doc.addImage(settings.companyLogo, 'PNG', 15, yPosition - 5, 30, logoHeight);
        } catch (e) {
            console.error("Error al agregar logo:", e);
        }
    }

    // Información de la empresa (a la derecha del logo)
    const companyStartX = settings.companyLogo ? 50 : 15;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(settings.companyName || "Mi Empresa", companyStartX, yPosition);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    
    yPosition += 6;
    if (settings.companyRfc) {
        doc.text(`RFC: ${settings.companyRfc}`, companyStartX, yPosition);
        yPosition += 4;
    }
    if (settings.companyAddress) {
        doc.text(settings.companyAddress, companyStartX, yPosition);
        yPosition += 4;
    }
    if (settings.companyPhone || settings.companyEmail) {
        const contactInfo = [settings.companyPhone, settings.companyEmail].filter(Boolean).join(" | ");
        doc.text(contactInfo, companyStartX, yPosition);
    }

    // ====== TIPO DE DOCUMENTO Y FOLIO ======
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    
    const documentType = getDocumentTypeLabel(sale.document_type);
    const folio = `#${sale.id.toString().padStart(4, '0')}`;
    
    // Alinear a la derecha
    doc.text(documentType, pageWidth - 15, 20, { align: "right" });
    doc.setFontSize(11);
    doc.text(`Folio: ${folio}`, pageWidth - 15, 27, { align: "right" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const saleDate = new Date(sale.sale_date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Fecha: ${saleDate}`, pageWidth - 15, 34, { align: "right" });

    yPosition = Math.max(yPosition, 35) + 15;

    // ====== LÍNEA SEPARADORA ======
    doc.setDrawColor(200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;

    // ====== INFORMACIÓN DEL CLIENTE ======
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("DATOS DEL CLIENTE", 15, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    // Cliente y vendedor en dos columnas
    doc.text(`Cliente: ${sale.client?.name || 'N/A'}`, 15, yPosition);
    doc.text(`Vendedor: ${sale.user?.name || 'N/A'}`, pageWidth / 2, yPosition);
    yPosition += 5;
    
    doc.text(`Estado de Pago: ${getPaymentStatusLabel(sale.payment_status)}`, 15, yPosition);
    doc.text(`Estado de Envío: ${getShippingStatusLabel(sale.shipping_status)}`, pageWidth / 2, yPosition);
    yPosition += 5;
    
    if (sale.payment_method) {
        const paymentMethods: { [key: string]: string } = {
            cash: "Efectivo",
            transfer: "Transferencia",
            credit: "Crédito",
            check: "Cheque"
        };
        doc.text(`Método de Pago: ${paymentMethods[sale.payment_method] || sale.payment_method}`, 15, yPosition);
        yPosition += 5;
    }

    yPosition += 8;

    // ====== TABLA DE PRODUCTOS ======
    const tableData = sale.items?.map((item) => [
        item.medicine?.name || 'Producto',
        item.quantity.toString(),
        formatCurrency(item.unit_price),
        `${((item.iva_rate || 0) * 100).toFixed(0)}%`,
        formatCurrency(item.subtotal)
    ]) || [];

    autoTable(doc, {
        startY: yPosition,
        head: [['Producto', 'Cant.', 'Precio Unit.', 'IVA', 'Subtotal']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: 15, right: 15 },
    });

    // Obtener la posición Y después de la tabla
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    yPosition = finalY + 10;

    // ====== TOTALES ======
    const totalsStartX = pageWidth - 80;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    doc.text("Subtotal:", totalsStartX, yPosition);
    doc.text(formatCurrency(sale.subtotal), pageWidth - 15, yPosition, { align: "right" });
    yPosition += 6;

    if (sale.document_type === 'invoice' && sale.iva_amount > 0) {
        doc.setTextColor(180, 120, 0);
        doc.text("IVA (productos gravados):", totalsStartX, yPosition);
        doc.text(formatCurrency(sale.iva_amount), pageWidth - 15, yPosition, { align: "right" });
        yPosition += 6;
    }

    // Línea antes del total
    doc.setDrawColor(200);
    doc.line(totalsStartX, yPosition, pageWidth - 15, yPosition);
    yPosition += 6;

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", totalsStartX, yPosition);
    doc.text(formatCurrency(sale.total), pageWidth - 15, yPosition, { align: "right" });
    yPosition += 15;

    // ====== NOTAS ======
    if (sale.notes) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Notas:", 15, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        
        // Dividir las notas si son muy largas
        const splitNotes = doc.splitTextToSize(sale.notes, pageWidth - 30);
        doc.text(splitNotes, 15, yPosition);
    }

    // ====== PIE DE PÁGINA ======
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.text(
        `Generado el ${new Date().toLocaleString('es-MX')} - ${settings.companyName}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
    );

    // Guardar el PDF
    const fileName = `${sale.document_type === 'invoice' ? 'Factura' : 'Remision'}_${sale.id.toString().padStart(4, '0')}.pdf`;
    doc.save(fileName);
}
