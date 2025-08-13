
'use client';

import { DonationCard } from "@/components/donations/donation-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Donation = {
  id: string;
  title: string;
  listerName: string;
  location: string;
  serves: number;
  pickup_time: string;
  image_url: string;
  image_hint: string;
  status: string;
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('public_donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching donations:", error);
      } else {
        setDonations(data as any);
      }
      setLoading(false);
    };

    fetchDonations();
  }, [supabase]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Available Donations</h1>
        <p className="text-muted-foreground">Find fresh, surplus food available for pickup near you.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by food or lister..." className="pl-8" />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="koramangala">Koramangala</SelectItem>
            <SelectItem value="indiranagar">Indiranagar</SelectItem>
            <SelectItem value="jayanagar">Jayanagar</SelectItem>
            <SelectItem value="whitefield">Whitefield</SelectItem>
          </SelectContent>
        </Select>
        <Button>Search</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
             <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
          ))
        ) : (
          donations.map((donation) => (
            <DonationCard key={donation.id} {...donation} lister={donation.listerName} />
          ))
        )}
      </div>

      <Button asChild variant="outline" className="fixed bottom-28 right-4 md:bottom-8 md:right-8 h-16 w-16 rounded-full shadow-lg z-50 bg-card/80 backdrop-blur-md border-primary hover:bg-primary/20 p-0">
        <Link href="/dashboard/donations">
          <Plus className="h-8 w-8 text-primary" />
          <span className="sr-only">Add new donation</span>
        </Link>
      </Button>
    </div>
  );
}
