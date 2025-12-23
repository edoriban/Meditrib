import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconUsers, IconUserPlus, IconMail, IconLoader2, IconCrown, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: { name: string };
    is_owner: boolean;
}

interface TenantInfo {
    id: number;
    name: string;
    slug: string;
    subscription_status: string;
    subscription_plan: string;
    owner: TeamMember;
    members_count: number;
}

interface Invitation {
    id: number;
    email: string;
    role: string;
    token: string;
    expires_at: string;
    created_at: string;
}

export default function TeamPage() {
    const queryClient = useQueryClient();
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Usuario");

    // Get current tenant info
    const { data: tenant, isLoading: isLoadingTenant } = useQuery<TenantInfo>({
        queryKey: ["tenant"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/tenants/me`);
            return data;
        }
    });

    // Get team members
    const { data: members, isLoading: isLoadingMembers } = useQuery<TeamMember[]>({
        queryKey: ["team-members"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/tenants/members`);
            return data;
        }
    });

    // Get pending invitations
    const { data: invitations, isLoading: isLoadingInvitations } = useQuery<Invitation[]>({
        queryKey: ["invitations"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/tenants/invitations`);
            return data;
        }
    });

    // Invite mutation
    const inviteMutation = useMutation({
        mutationFn: async ({ email, role }: { email: string; role: string }) => {
            const { data } = await axios.post(`${BASE_API_URL}/tenants/invite`, { email, role });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            setInviteDialogOpen(false);
            setInviteEmail("");
            setInviteRole("Usuario");
            toast.success("Invitación enviada correctamente");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Error al enviar invitación");
        }
    });

    // Cancel invitation mutation
    const cancelInviteMutation = useMutation({
        mutationFn: async (invitationId: number) => {
            await axios.delete(`${BASE_API_URL}/tenants/invitations/${invitationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            toast.success("Invitación cancelada");
        },
        onError: () => {
            toast.error("Error al cancelar invitación");
        }
    });

    const handleInvite = () => {
        if (!inviteEmail) {
            toast.error("Ingresa un email");
            return;
        }
        inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
    };

    const isLoading = isLoadingTenant || isLoadingMembers || isLoadingInvitations;

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Equipo</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona los miembros de tu organización.
                        </p>
                    </div>
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <IconUserPlus className="mr-2 h-4 w-4" />
                                Invitar Miembro
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invitar Miembro</DialogTitle>
                                <DialogDescription>
                                    Envía una invitación por email para unirse a tu organización.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="colaborador@ejemplo.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol</Label>
                                    <Select value={inviteRole} onValueChange={setInviteRole}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Admin">Administrador</SelectItem>
                                            <SelectItem value="Usuario">Usuario</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                                    {inviteMutation.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Enviar Invitación
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Tenant Info */}
                    {tenant && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <IconUsers className="h-5 w-5 text-muted-foreground" />
                                        <CardTitle>{tenant.name}</CardTitle>
                                    </div>
                                    <Badge variant={tenant.subscription_status === "active" ? "default" : "secondary"}>
                                        {tenant.subscription_status === "trial" && "Prueba"}
                                        {tenant.subscription_status === "active" && "Activo"}
                                        {tenant.subscription_status === "expired" && "Expirado"}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    Plan: {tenant.subscription_plan} • {members?.length || 0} miembro(s)
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}

                    {/* Team Members */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Miembros del Equipo</CardTitle>
                            <CardDescription>
                                Usuarios con acceso a la organización
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {members?.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-medium text-primary">
                                                {member.name?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{member.name}</span>
                                                {member.is_owner && (
                                                    <IconCrown className="h-4 w-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{member.role?.name || "Usuario"}</Badge>
                                </div>
                            ))}
                            {(!members || members.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No hay miembros en el equipo
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending Invitations */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <IconMail className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Invitaciones Pendientes</CardTitle>
                            </div>
                            <CardDescription>
                                Invitaciones enviadas que aún no han sido aceptadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {invitations?.map((invite) => (
                                <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{invite.email}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Rol: {invite.role} • Expira: {new Date(invite.expires_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => cancelInviteMutation.mutate(invite.id)}
                                        disabled={cancelInviteMutation.isPending}
                                    >
                                        <IconX className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {(!invitations || invitations.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No hay invitaciones pendientes
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
