"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Package,
  Tags,
  Palette,
  Percent,
  ChevronLeft,
  Shield,
  ArrowLeft,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

const navItems = [
  { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Entreprises", href: "/admin/companies", icon: Building2 },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Produits", href: "/admin/products", icon: Package },
  { name: "Catégories", href: "/admin/categories", icon: Tags },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Templates", href: "/admin/templates", icon: Palette },
  { name: "Taxes", href: "/admin/taxes", icon: Percent },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col glass-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="h-6 w-6 shrink-0 text-primary" />
          {!collapsed && <span className="text-lg font-bold text-foreground">Admin</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-medium transition-all duration-200",
                isActive
                  ? "bg-[#e8e8ed] text-foreground"
                  : "text-[#86868b] hover:bg-[#e8e8ed]/50 hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2">
        <ThemeToggle />
      </div>

      <div className="p-2 pt-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] text-[#86868b] hover:bg-[#e8e8ed]/50 hover:text-foreground transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          {!collapsed && <span>Retour &agrave; l&apos;app</span>}
        </Link>
      </div>
    </aside>
  );
}
