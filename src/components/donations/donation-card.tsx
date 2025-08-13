
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicUrl } from "@/lib/utils";

type DonationCardProps = {
  id: string;
  image_url: string | null;
  image_hint: string;
  title: string;
  lister: string;
  location: string;
  serves: number;
  pickup_time: string;
  status: string;
};

export function DonationCard({
  id,
  image_url,
  image_hint,
  title,
  lister,
  location,
  serves,
  pickup_time,
  status
}: DonationCardProps) {
  
  const isReserved = status === 'Reserved';
  const supabase = getSupabaseBrowserClient();
  const publicUrl = getPublicUrl(supabase, 'donations', image_url);

  return (
      <Card
        className={`overflow-hidden bg-card backdrop-blur-md transition-all hover:shadow-lg ${
          !isReserved && "hover:-translate-y-1"
        } flex flex-col`}
      >
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={publicUrl}
              alt={title}
              layout="fill"
              objectFit="cover"
              data-ai-hint={image_hint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Badge
            variant={isReserved ? "default" : "secondary"}
            className={
              isReserved
                ? "bg-blue-500/20 text-blue-700"
                : "bg-green-500/20 text-green-700"
            }
          >
            {status}
          </Badge>
          <CardTitle className="text-lg font-headline mb-1 mt-2 h-12">
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground mb-4">by {lister}</p>
          <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Serves ~{serves} people</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Pickup by {new Date(pickup_time).toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button asChild className="w-full" disabled={isReserved}>
              <Link href={`/dashboard/donations/${id}`}>{isReserved ? "View Details" : "View & Reserve"}</Link>
            </Button>
        </CardFooter>
      </Card>
  );
}
