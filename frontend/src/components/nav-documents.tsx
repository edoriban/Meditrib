"use client"

import {
  type Icon,
} from "@tabler/icons-react"
import { Link, useLocation } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePrefetch } from "@/hooks/usePrefetch"

export function NavDocuments({
  items,
  label,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
  label?: string
}) {
  const location = useLocation()
  const { prefetch } = usePrefetch()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={location.pathname === item.url}>
              <Link
                to={item.url}
                onMouseEnter={() => prefetch(item.url)}
              >
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
