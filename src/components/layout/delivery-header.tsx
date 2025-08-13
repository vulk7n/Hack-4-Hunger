
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
import { UtensilsCrossed, ListChecks, Store, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useDelivery } from "@/contexts/delivery-context";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const menuItems = [
    { href: "/delivery", label: "Tasks", icon: ListChecks },
    { href: "/delivery/shop", label: "Shop", icon: Store },
];

export function DeliveryHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDutyOn, setIsDutyOn } = useDelivery();
  const supabase = getSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const dutyToggle = (
     <div className="flex items-center space-x-2">
        <Switch id="duty-toggle" checked={isDutyOn} onCheckedChange={setIsDutyOn} />
        <Label htmlFor="duty-toggle" className="text-xs">On Duty</Label>
    </div>
  );

  return (
    <>
       {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/delivery" className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-primary font-headline hidden sm:inline">Annapurna (Delivery)</span>
            </Link>
            <div className="flex items-center gap-2">
                {dutyToggle}
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <Avatar>
                        <AvatarImage src="https://placehold.co/40x40.png" alt="User" />
                        <AvatarFallback>DA</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Delivery Agent</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/delivery/profile">Profile</Link>
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
            <Link href="/delivery" className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-primary font-headline">Annapurna (Delivery)</span>
            </Link>
          </div>

          <nav className="flex flex-1 justify-center items-center gap-2">
            {menuItems.map((item) => (
            <Button key={item.href} variant="ghost" asChild className={cn(
                "text-sm font-medium",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}>
                <Link href={item.href}>{item.label}</Link>
            </Button>
            ))}
          </nav>

          <div className="flex items-center gap-4 flex-1 justify-end">
            {dutyToggle}
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" alt="User" />
                    <AvatarFallback>DA</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Delivery Agent</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/delivery/profile">Profile</Link>
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
            {[...menuItems, { href: "/delivery/profile", label: "Profile", icon: User }].map((item, index) => (
                <React.Fragment key={item.href}>
                    <Link href={item.href} className={cn(
                        "flex flex-col items-center justify-center h-full w-full rounded-full text-xs",
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}>
                        <item.icon className="h-5 w-5" />
                    </Link>
                    {index < [...menuItems, { href: "/delivery/profile", label: "Profile", icon: User }].length -1 && <Separator orientation="vertical" className="h-6" />}
                </React.Fragment>
            ))}
        </nav>
      </header>
    </>
  );
}
