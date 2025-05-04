import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/users/UsersTable";
import { UserFilters } from "@/components/users/UserFilters";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { CreateRoleDialog } from "@/components/roles/CreateRoleDialog";
import { useUserMutations } from "@/hooks/useUserMutations";
import { BASE_API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [roleFilter, setRoleFilter] = React.useState<number | "all">("all");
    const [selectedTab, setSelectedTab] = React.useState("all");
    const { updateUser, deleteUser } = useUserMutations();

    const { data: users, isLoading, error } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/users/`);
            return data;
        },
    });

    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/roles/`);
            return data;
        },
    });

    const getFilteredByTab = React.useCallback((users: any[]) => {
        if (selectedTab === "all") return users;

        const roleId = selectedTab === "admin" ? 2 : 1;
        return users.filter(user => user.role.id === roleId);
    }, [selectedTab]);

    const filteredUsers = React.useMemo(() => {
        if (!users) return [];

        const filteredBySearch = users.filter((user: any) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === "all" || user.role.id === roleFilter;

            return matchesSearch && matchesRole;
        });

        return getFilteredByTab(filteredBySearch);
    }, [users, searchTerm, roleFilter, getFilteredByTab]);

    const handleExport = () => {
        toast.success("Exportando usuarios...");
    };

    const handleImport = () => {
        toast.success("Importando usuarios...");
    };

    if (isLoading) return <div className="flex items-center justify-center h-full">Cargando usuarios...</div>;
    if (error) return <div className="text-red-500 p-4">Error al cargar usuarios: {(error as Error).message}</div>;

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
                <p className="text-muted-foreground">
                    Gestiona los usuarios de la plataforma, sus roles y permisos.
                </p>
            </div>

            <Tabs
                defaultValue="all"
                className="w-full"
                value={selectedTab}
                onValueChange={setSelectedTab}
            >
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="admin">Administradores</TabsTrigger>
                        <TabsTrigger value="user">Usuarios</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <IconDownload className="mr-1 h-4 w-4" />
                            Exportar
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleImport}>
                            <IconUpload className="mr-1 h-4 w-4" />
                            Importar
                        </Button>
                        <CreateRoleDialog />
                        <CreateUserDialog />
                    </div>
                </div>

                <UserFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    roles={roles}
                    resultsCount={filteredUsers.length}
                />

                <TabsContent value="all" className="mt-0">
                    <UsersTable
                        users={filteredUsers}
                        onUpdate={updateUser}
                        onDelete={deleteUser}
                        roles={roles}
                    />
                </TabsContent>
                <TabsContent value="admin" className="mt-0">
                    <UsersTable
                        users={filteredUsers}
                        onUpdate={updateUser}
                        onDelete={deleteUser}
                        roles={roles}
                    />
                </TabsContent>
                <TabsContent value="user" className="mt-0">
                    <UsersTable
                        users={filteredUsers}
                        onUpdate={updateUser}
                        onDelete={deleteUser}
                        roles={roles}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}