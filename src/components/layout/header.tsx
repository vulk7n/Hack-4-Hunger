
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, UtensilsCrossed, Trophy, Home, Package, Store } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn, getPublicUrl } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useProfile } from "@/contexts/profile-context";

const menuItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/orders", label: "Orders", icon: Package },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/dashboard/shop", label: "Shop", icon: Store },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const { user, profile } = useProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const avatarUrl = getPublicUrl(supabase, 'avatars', profile?.avatar_url || null);
  const fallback = profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-primary font-headline">AnnaDaan</span>
            </Link>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                 <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Toggle notifications</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <Avatar>
                        <AvatarImage src={avatarUrl} alt="User" />
                        <AvatarFallback>{fallback}</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-full bg-background/80 backdrop-blur-md shadow-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4 flex-1 justify-start">
            <Link href="/dashboard" className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-primary font-headline">AnnaDaan</span>
            </Link>
          </div>

          <nav className="flex flex-1 justify-center items-center gap-2">
            <Button variant="ghost" asChild className={cn("text-sm font-medium", pathname === "/dashboard" ? "text-primary" : "text-muted-foreground")}>
                <Link href="/dashboard">Donations</Link>
            </Button>
             <Button variant="ghost" asChild className={cn("text-sm font-medium", pathname.startsWith("/dashboard/orders") ? "text-primary" : "text-muted-foreground")}>
                <Link href="/dashboard/orders">Orders</Link>
            </Button>
            <Button variant="ghost" asChild className={cn("text-sm font-medium", pathname.startsWith("/dashboard/leaderboard") ? "text-primary" : "text-muted-foreground")}>
                <Link href="/dashboard/leaderboard">Leaderboard</Link>
            </Button>
            <Button variant="ghost" asChild className={cn("text-sm font-medium", pathname.startsWith("/dashboard/shop") ? "text-primary" : "text-muted-foreground")}>
                <Link href="/dashboard/shop">Point Shop</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={avatarUrl} alt="User" />
                    <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
       <header className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50 rounded-full bg-background/80 backdrop-blur-md shadow-lg p-2">
        <nav className="flex justify-around items-center h-12">
            {menuItems.map((item, index) => (
                <React.Fragment key={item.href}>
                    <Link href={item.href} className={cn(
                        "flex flex-col items-center justify-center h-full w-full rounded-full text-xs",
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}>
                        <item.icon className="h-5 w-5" />
                    </Link>
                    {index < menuItems.length - 1 && <Separator orientation="vertical" className="h-6" />}
                </React.Fragment>
            ))}
        </nav>
      </header>
    </>
  );
}
