import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger
} from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LucideIcon, UserCircle } from "lucide-react";
import { ModeToggle } from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationItem {
    title: string;
    icon: LucideIcon;
    href: string;
}

interface ActionItem {
    title: string;
    icon: LucideIcon;
    onClick: () => void;
}

interface AppShellProps {
    children: ReactNode;
    navigationItems: NavigationItem[];
    userActions?: ActionItem[];
    appName: string;
    appDescription?: string;
}

export function AppShell({
    children,
    navigationItems,
    userActions = [],
    appName,
    appDescription
}: AppShellProps) {
    const location = useLocation();
    const isMobile = useIsMobile();

    return (
        <SidebarProvider defaultOpen={!isMobile}>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar side="left" variant={isMobile ? "floating" : "sidebar"}>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 px-2">
                            <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-primary/10">
                                <div className="flex h-full items-center justify-center rounded-full">
                                    <span className="text-primary font-bold text-lg">M</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-sm font-semibold leading-none tracking-tight">
                                    {appName}
                                </span>
                                {appDescription && (
                                    <span className="text-xs text-muted-foreground">
                                        {appDescription}
                                    </span>
                                )}
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="pt-2">
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <Link to={item.href} className="w-full">
                                        <SidebarMenuButton
                                            isActive={location.pathname === item.href}
                                            tooltip={item.title}
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>

                        {userActions.length > 0 && (
                            <>
                                <Separator className="my-4" />
                                <SidebarMenu>
                                    {userActions.map((action, idx) => (
                                        <SidebarMenuItem key={idx}>
                                            <SidebarMenuButton
                                                onClick={action.onClick}
                                                tooltip={action.title}
                                            >
                                                <action.icon className="mr-2 h-4 w-4" />
                                                <span>{action.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </>
                        )}
                    </SidebarContent>

                    <SidebarFooter>
                        <div className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-2">
                                <Avatar>
                                    <AvatarImage src="" />
                                    <AvatarFallback>
                                        <UserCircle className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">Usuario</span>
                                    <span className="text-xs text-muted-foreground">Admin</span>
                                </div>
                            </div>
                            <ModeToggle />
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex flex-col h-full w-full overflow-hidden">
                    <div className="flex h-14 items-center gap-2 border-b bg-background px-4 sm:px-6">
                        <SidebarTrigger />
                        <div className="flex-1" />
                    </div>
                    <SidebarInset>
                        <div className="container mx-auto max-w-6xl py-6 px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
}