import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";

export async function Header() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initials = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="flex h-12 items-center justify-end border-b border-gray-200 bg-white px-4 dark:bg-gray-900 dark:border-gray-800">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium dark:bg-gray-800 dark:text-gray-300">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Mon compte</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/dashboard/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action="/auth/signout" method="post">
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
