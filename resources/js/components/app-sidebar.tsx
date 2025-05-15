"use client"

import * as React from "react"
import {
  Command,
  FileCheck2,
  Home,
  LifeBuoy,
  Send,
  SquareTerminal,
  User,
  BriefcaseBusiness,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

// Define the structure of navigation items
interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  items?: SubNavItem[];
}

interface SubNavItem {
  title: string;
  url: string;
}

// Original navigation data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "User",
      url: "/users",
      icon: User,
    },
    {
      title: "Program Kegiatan",
      url: "/kegiatan",
      icon: SquareTerminal,
    },
    {
      title: "Pekerjaan",
      url: "/pekerjaan",
      icon: BriefcaseBusiness,
    },
     {
      title: "Checklist",
      url: "/status",
      icon: FileCheck2,
    },
    // {
    //   title: "Project",
    //   url: "#",
    //   icon: SquareTerminal,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Pekerjaan",
    //       url: "/pekerjaan",
    //     },
    //   ],
    // },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { auth } = usePage<PageProps>().props;
  const userPermissions = auth?.user?.permissions || [];

  // Function to check if user has permission for a route
  const hasPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  };

  // Filter navMain items based on permissions
  const filteredNavMain = data.navMain.filter((item: NavItem) => {
    if (item.title === "Dashboard") {
      // Dashboard is accessible to all authenticated users
      return true;
    }
    if (item.title === "Checklist") {
      // Requires any user-related permission
      return hasPermission(['view users', 'create users', 'edit users', 'delete users']);
    }

    if (item.title === "User") {
      // Requires any user-related permission
      return hasPermission(['view users', 'create users', 'edit users', 'delete users']);
    }

    if (item.title === "Program Kegiatan") {
        // Requires any user-related permission
        return hasPermission(['view kegiatan']);
    }
    if (item.title === "Pekerjaan") {
      // Requires any user-related permission
      return hasPermission(['view pekerjaan']);
  }

    // if (item.title === "Project") {
    //   // Kegiatan parent item requires either view kegiatan or view pekerjaan
    //   const hasParentPermission = hasPermission(['view pekerjaan']);
    //   if (!hasParentPermission) return false;

    //   // Filter sub-items
    //   const filteredSubItems = item.items?.filter((subItem: SubNavItem) => {
    //     if (subItem.title === "Pekerjaan") {
    //       return hasPermission(['view pekerjaan']);
    //     }
    //     return false;
    //   });

    //   // Only include Kegiatan if it has at least one visible sub-item
    //   return filteredSubItems && filteredSubItems.length > 0 ? { ...item, items: filteredSubItems } : false;
    // }

    return false;
  });

  // Filter navSecondary items based on permissions
  const filteredNavSecondary = data.navSecondary.filter((item: NavItem) => {
    if (item.title === "Support") {
      return hasPermission(['view support']);
    }
    if (item.title === "Feedback") {
      return hasPermission(['view feedback']);
    }
    return false;
  });

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={route('dashboard')}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AMSPRO</span>
                  <span className="truncate text-xs">Disperkim</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary items={filteredNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={auth.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
