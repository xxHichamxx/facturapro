"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  FilePlus,
  Quote,
  Package,
  Settings,
  ChevronLeft,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useCallback } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const checkAdmin = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_super_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.is_super_admin) setIsSuperAdmin(true);
    }
  }, []);

  useEffect(() => { checkAdmin(); }, [checkAdmin]);

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Factures", href: "/dashboard/invoices", icon: FileText },
    { name: "Devis", href: "/dashboard/quotes", icon: Quote },
    { name: "Clients", href: "/dashboard/clients", icon: Users },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-12 items-center px-3 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <FileText className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              FacturaPro
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-1 space-y-0.5">
        <Link
          href="/dashboard/products"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/dashboard/products")
              ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white",
          )}
        >
          <Package className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Produits</span>}
        </Link>
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/dashboard/settings")
              ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Paramètres</span>}
        </Link>
      </div>

      {isSuperAdmin && (
        <div className="px-2 pb-1">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white",
            )}
          >
            <Shield className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Administration</span>}
          </Link>
        </div>
      )}

      <div className="px-2 py-3 space-y-1.5">
        <Link
          href="/dashboard/new-invoice"
          className="flex items-center gap-2.5 rounded-md bg-primary px-2.5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          <FilePlus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Nouvelle facture</span>}
        </Link>
        <Link
          href="/dashboard/new-quote"
          className="flex items-center gap-2.5 rounded-md bg-gray-100 px-2.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <Quote className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Nouveau devis</span>}
        </Link>
      </div>

      <Separator />

      <div className="p-2 flex items-center gap-1">
        <ThemeToggle />
        <form action="/auth/signout" method="post">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            type="submit"
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
