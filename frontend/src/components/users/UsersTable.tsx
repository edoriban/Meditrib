import * as React from "react";
import { User } from "@/types/user";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserFormValues } from "@/types/forms";
import { UserCellViewer } from "./UserCellViewer";
import { UserActionsMenu } from "./UserActionsMenu";

interface UsersTableProps {
    users: User[];
    onUpdate: (userId: number, userData: Partial<UserFormValues>) => void;
    onDelete: (userId: number) => void;
    roles?: any[];
}

export function UsersTable({ users, onUpdate, onDelete, roles }: UsersTableProps) {
    const editRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});

    return (
        <div className="overflow-hidden rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-[80px]">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>

                                <UserCellViewer
                                    user={user}
                                    onUpdate={(data) => onUpdate(user.id, data)}
                                    onDelete={() => onDelete(user.id)}
                                    ref={(el) => {
                                        editRefs.current[user.id] = el;
                                    }}
                                />
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={user.role.name === "Admin" ? "default" : "secondary"}
                                    className="font-normal"
                                >
                                    {user.role.name}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-normal">
                                    Activo
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <UserActionsMenu
                                    user={user}
                                    onDelete={() => onDelete(user.id)}
                                    onEdit={() => {
                                        if (editRefs.current[user.id]) {
                                            editRefs.current[user.id]?.click();
                                        }
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No se encontraron usuarios
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}