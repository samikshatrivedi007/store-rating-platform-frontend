"use client"

import { Home, Users, Store, Star, Settings, BarChart3, User, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

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
    SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
    console.log("[AppSidebar] rendering sidebar")
    const { data: session } = useSession()
    const userRole = (session?.user as any)?.role || "USER"

    console.log("[AppSidebar] user role:", userRole)

    // Admin menu items
    const adminItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: Home,
            roles: ["ADMIN"],
        },
        {
            title: "Manage Users",
            url: "/users",
            icon: Users,
            roles: ["ADMIN"],
        },
        {
            title: "Manage Stores",
            url: "/stores",
            icon: Store,
            roles: ["ADMIN"],
        },
    ]

    // Normal user menu items
    const userItems = [
        {
            title: "Browse Stores",
            url: "/stores",
            icon: Store,
            roles: ["CUSTOMER"],
        },
        {
            title: "My Ratings",
            url: "/ratings",
            icon: Star,
            roles: ["CUSTOMER"],
        },
    ]

    // Store owner menu items
    const ownerItems = [
        {
            title: "My Store Dashboard",
            url: "/store-dashboard",
            icon: Home,
            roles: ["OWNER", "STORE_OWNER"],
        },
        {
            title: "Store Analytics",
            url: "/store-dashboard/analytics",
            icon: BarChart3,
            roles: ["OWNER", "STORE_OWNER"],
        },
        {
            title: "Customer Ratings",
            url: "/store-dashboard/ratings",
            icon: Star,
            roles: ["OWNER", "STORE_OWNER"],
        },
    ]

    // Common items for all users
    const commonItems = [
        {
            title: "Profile Settings",
            url: "/settings",
            icon: User,
            roles: ["CUSTOMER", "ADMIN", "OWNER", "STORE_OWNER"],
        },
        {
            title: "Change Password",
            url: "/settings/password",
            icon: Settings,
            roles: ["CUSTOMER", "ADMIN", "OWNER", "STORE_OWNER"],
        },
    ]

    // Filter items based on user role
    const filterItemsByRole = (items: typeof adminItems) => {
        return items.filter((item) => item.roles.includes(userRole))
    }

    const visibleAdminItems = filterItemsByRole(adminItems)
    const visibleUserItems = filterItemsByRole(userItems)
    const visibleOwnerItems = filterItemsByRole(ownerItems)
    const visibleCommonItems = filterItemsByRole(commonItems)

    console.log("[AppSidebar] visible items:", {
        admin: visibleAdminItems.length,
        user: visibleUserItems.length,
        owner: visibleOwnerItems.length,
        common: visibleCommonItems.length,
    })

    const handleLogout = async () => {
        console.log("[AppSidebar] user logging out")
        try {
            await signOut({
                callbackUrl: "/login",
                redirect: true,
            })
        } catch (error) {
            console.log("[AppSidebar] logout error:", JSON.stringify({ message: (error as Error).message }))
        }
    }

    return (
        <Sidebar className="border-r">
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Store className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">Store Rating</span>
                        <span className="text-xs text-muted-foreground">
              {userRole === "ADMIN"
                  ? "Administrator"
                  : userRole === "OWNER" || userRole === "STORE_OWNER"
                      ? "Store Owner"
                      : "User"}
            </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Admin Section */}
                {visibleAdminItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administration</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleAdminItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* Store Owner Section */}
                {visibleOwnerItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Store Management</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleOwnerItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* User Section */}
                {visibleUserItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Browse & Rate</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleUserItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* Common Section */}
                {visibleCommonItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Account</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleCommonItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarRail />
            {/* Logout Section */}
            <div className="mt-auto p-4 border-t">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </div>
        </Sidebar>
    )
}