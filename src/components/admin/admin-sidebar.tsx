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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { name: "Entreprises", href: "/admin/companies", icon: Building2 },
  { name: "Produits", href: "/admin/products", icon: Package },
  { name: "Catégories", href: "/admin/categories", icon: Tags },
  { name: "Templates", href: "/admin/templates", icon: Palette },
  { name: "Taxes", href: "/admin/taxes", icon: Percent },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="h-6 w-6 shrink-0 text-alert" />
          {!collapsed && <span className="text-lg font-bold text-alert">Admin</span>}
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
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-alert/10 text-alert"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
          {!collapsed && <span>Retour &agrave; l&apos;app</span>}
        </Link>
      </div>
    </aside>
  );
}
