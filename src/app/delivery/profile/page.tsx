
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Edit, Truck, Wallet, Filter, Coins } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export default function DeliveryProfilePage() {

  return (
    <div className="flex flex-col gap-8">
      <Card className="bg-card backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src="https://placehold.co/100x100.png" />
              <AvatarFallback>DA</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold font-headline">Delivery Agent Name</h1>
              <p className="text-muted-foreground">KA-01-AB-1234 (TVS Ntorq)</p>
              <p className="text-sm text-muted-foreground">Joined May 2024</p>
            </div>
            <Button className="md:ml-auto"><Edit className="mr-2"/> Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Earnings Summary</CardTitle>
                <CardDescription>Your total earnings summary.</CardDescription>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Filter className="mr-2"/> Filter</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>This Week</DropdownMenuItem>
                    <DropdownMenuItem>This Month</DropdownMenuItem>
                    <DropdownMenuItem>All Time</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-primary/5">
                <h3 className="font-semibold text-muted-foreground">Real Money Balance (INR)</h3>
                <div className="flex items-center justify-center gap-4 text-5xl font-bold text-green-500">
                    <Wallet className="h-12 w-12"/>
                    ₹<AnimatedCounter value={8500} />
                </div>
                <Button className="mt-4 bg-green-600 hover:bg-green-700"><Wallet className="mr-2"/> Withdraw Funds</Button>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-primary/5">
                 <h3 className="font-semibold text-muted-foreground">Power Coins Balance</h3>
                <div className="flex items-center justify-center gap-4 text-5xl font-bold text-primary">
                    <Coins className="h-12 w-12"/>
                    <AnimatedCounter value={12500} />
                </div>
                 <Button className="mt-4"><Award className="mr-2"/> Redeem in Shop</Button>
            </div>
        </CardContent>
      </Card>
      
       <Card className="bg-card backdrop-blur-md">
            <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>Details of your registered vehicle.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Vehicle Type</span>
                        <span className="font-semibold">Scooter</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Make/Model</span>
                        <span className="font-semibold">TVS Ntorq</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Vehicle Number</span>
                        <span className="font-semibold">KA-01-AB-1234</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
