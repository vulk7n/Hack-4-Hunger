import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DonationDetailsClient } from "./donation-details-client";
import { User } from "@supabase/supabase-js";
import { FC } from "react";

type Donation = {
  id: string;
  lister_id: string;
  title: string;
  description: string;
  serves: number;
  location: string;
  pickup_time: string;
  image_url: string | null;
  image_hint: string;
  status: string;
  profiles: {
    name: string;
  } | null;
};

interface PageProps {
  params: {
    id: string;
  };
}

const Page: FC<PageProps> = ({ params }) => {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (isNaN(parseInt(params.id, 10))) {
    notFound();
  }
  
  // Use the standard server client, RLS policies will handle access.
  const { data, error } = await supabase
    .from('donations')
    .select(`
        *,
        profiles ( name )
    `)
    .eq('id', params.id)
    .single();

  if (error || !data) {
    console.error("Error fetching donation:", error?.message);
    notFound();
  }
  
  const donation = data as Donation;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="ghost" asChild>
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to listings</Link>
        </Button>
      </div>
      <DonationDetailsClient donation={donation} user={user as User | null} />
    </div>
  );
}

export default Page;
