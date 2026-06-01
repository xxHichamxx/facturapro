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
        .single();
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
        "flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <FileText className="h-6 w-6 shrink-0 text-primary" />
          {!collapsed && (
            <span className="text-lg font-bold text-primary-dark">
              FacturaPro
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-1 space-y-0.5">
        <Link href="/dashboard/products" className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", pathname.startsWith("/dashboard/products") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <Package className="h-5 w-5 shrink-0" />{!collapsed && <span>Produits</span>}
        </Link>
        <Link href="/dashboard/settings" className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", pathname.startsWith("/dashboard/settings") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <Settings className="h-5 w-5 shrink-0" />{!collapsed && <span>Param&egrave;tres</span>}
        </Link>
      </div>

      {isSuperAdmin && (
        <div className="px-2 pb-1">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-alert/10 text-alert"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Shield className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Administration</span>}
          </Link>
        </div>
      )}

      <Separator />

      <div className="p-2">
        <Link
          href="/dashboard/new-invoice"
          className={cn(
            "flex items-center gap-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90",
          )}
        >
          <FilePlus className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Nouvelle Facture</span>}
        </Link>
        <Link
          href="/dashboard/new-quote"
          className={cn(
            "mt-2 flex items-center gap-3 rounded-md border border-input px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
          )}
        >
          <Quote className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Nouveau Devis</span>}
        </Link>
      </div>

      <div className="p-2">
        <form action="/auth/signout" method="post">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
            type="submit"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Déconnexion</span>}
          </Button>
        </form>
      </div>
    </aside>
  );
}
