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
        "flex h-screen flex-col glass-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <FileText className="h-6 w-6 shrink-0 text-primary" />
          {!collapsed && (
            <span className="text-lg font-bold text-foreground">
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
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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

      <div className="px-2 pb-1 space-y-0.5">
        <Link href="/dashboard/products" className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition-all duration-200", pathname.startsWith("/dashboard/products") ? "bg-[#e8e8ed] text-foreground" : "text-[#86868b] hover:bg-[#e8e8ed]/50 hover:text-foreground")}>
          <Package className="h-5 w-5 shrink-0" />{!collapsed && <span>Produits</span>}
        </Link>
        <Link href="/dashboard/settings" className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition-all duration-200", pathname.startsWith("/dashboard/settings") ? "bg-[#e8e8ed] text-foreground" : "text-[#86868b] hover:bg-[#e8e8ed]/50 hover:text-foreground")}>
          <Settings className="h-5 w-5 shrink-0" />{!collapsed && <span>Param&egrave;tres</span>}
        </Link>
      </div>

      {isSuperAdmin && (
        <div className="px-2 pb-1">
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-medium transition-all duration-200",
                pathname.startsWith("/admin")
                  ? "bg-[#e8e8ed] text-foreground"
                  : "text-[#86868b] hover:bg-[#e8e8ed]/50 hover:text-foreground",
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
            "flex items-center gap-3 rounded-xl bg-primary px-3 py-2.5 text-[15px] font-medium text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97]",
          )}
        >
          <FilePlus className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Nouvelle Facture</span>}
        </Link>
        <Link
          href="/dashboard/new-quote"
          className={cn(
            "mt-2 flex items-center gap-3 rounded-xl bg-[#e8e8ed] px-3 py-2.5 text-[15px] font-medium text-foreground transition-all duration-200 hover:bg-[#dcdce0]",
          )}
        >
          <Quote className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Nouveau Devis</span>}
        </Link>
      </div>

      <div className="p-2">
        <ThemeToggle />
      </div>

      <div className="p-2 pt-0">
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
