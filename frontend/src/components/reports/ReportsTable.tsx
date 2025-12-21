import { Report } from "@/types/reports";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";

interface ReportsTableProps {
    data: Report[];
}

export function ReportsTable({ data }: ReportsTableProps) {
    const getReportTypeBadge = (type: string) => {
        const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
            sales: "default",
            inventory: "secondary",
            clients: "outline",
            suppliers: "destructive",
        };
        return <Badge variant={variants[type] || "default"}>{type}</Badge>;
    };

    const handleDownload = (_report: Report) => {
        // TODO: Implement download functionality
    };

    const handleView = (_report: Report) => {
        // TODO: Implement view functionality
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Generado Por</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="w-[140px]">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell>#{report.id}</TableCell>
                            <TableCell>{getReportTypeBadge(report.report_type)}</TableCell>
                            <TableCell>{report.user.name}</TableCell>
                            <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleView(report)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDownload(report)}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}