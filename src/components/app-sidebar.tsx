'use client'

import { Calendar, Home, Mic } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { CustomTrigger } from "./CustomSidebarTrigger"
import { cn } from "@/lib/utils"

const items = [
    {
        title: "Home",
        url: "/home",
        icon: Home,
    },
    {
        title: "Practice Live",
        url: "/call",
        icon: Mic,
    },
    {
        title: "Pitch History",
        url: "/history",
        icon: Calendar,
    }
]

export function AppSidebar() {

    const { open } = useSidebar()
    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <div className={cn("flex items-center ", open ? "justify-between" : "justify-center")}>
                    {open && <p className="font-bold">Glimpse</p>}
                    <CustomTrigger />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}