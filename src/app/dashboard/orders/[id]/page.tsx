
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, User, Truck, Coins, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatedCounter } from "@/components/animated-counter";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";


type OrderDetails = {
    id: string;
    created_at: string;
    status: string;
    pickup_method: string;
    delivery_fee: number;
    donor_points_earned: number;
    agent_points_earned: number;
    donations: {
        title: string;
        location: string;
        image_url: string;
        image_hint: string;
        profiles: {
            name: string;
        }
    };
    // Add receiver and agent relations if needed
};


export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                donations (
                    title,
                    location,
                    image_url,
                    image_hint,
                    profiles ( name )
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) {
            console.error('Error fetching order details:', error);
            setOrder(null);
        } else {
            setOrder(data as any);
        }
        setLoading(false);
    };
    fetchOrder();

  }, [orderId, supabase]);

  if (loading) {
    return <OrderDetailsSkeleton />
  }

  if (!order) {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">Order not found</h1>
            <p className="text-muted-foreground">This order may have been removed or is no longer available.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/orders">Back to Orders</Link>
            </Button>
        </div>
    )
  }

  const {
      donations,
      created_at,
      pickup_method,
      delivery_fee,
      donor_points_earned,
      agent_points_earned,
  } = order;

  const { title, location: from, profiles: { name: donor }, image_url, image_hint } = donations;
  const publicUrl = getPublicUrl(supabase, 'donations', image_url);

  // Assuming 'to' location is the user's location, which we don't have yet.
  const toLocation = 'Your Location, Bengaluru';

  return (
    <div className="flex flex-col gap-8">
        <div>
            <Button variant="ghost" asChild>
                <Link href="/dashboard/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Back to orders</Link>
            </Button>
        </div>

        <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden shadow-lg">
            <Image src={publicUrl} alt={title} layout="fill" objectFit="cover" data-ai-hint={image_hint} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>Donated by {donor} on {new Date(created_at).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <p className="font-semibold">Pickup Location</p>
                                <p className="text-muted-foreground">{from}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <p className="font-semibold">Drop-off Location</p>
                                <p className="text-muted-foreground">{toLocation}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction Summary</CardTitle>
                         <CardDescription>Details of this donation transaction.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                {pickup_method === 'Delivery' ? <Truck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                <span>Pickup Method</span>
                            </div>
                            <span className="font-semibold">{pickup_method}</span>
                        </div>
                        {pickup_method === 'Delivery' && (
                             <div className="flex items-center justify-between">
                                <p className="text-muted-foreground">Delivery Fee</p>
                                <p className="font-semibold">₹{delivery_fee}</p>
                            </div>
                        )}
                        <Separator />
                        <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <p className="text-muted-foreground">Donor Points Earned</p>
                                <div className="font-semibold text-primary flex items-center gap-2">
                                    <Award className="h-5 w-5"/>
                                    <AnimatedCounter value={donor_points_earned || 0} />
                                </div>
                            </div>
                            {pickup_method === 'Delivery' && (
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground">Agent Points Earned</p>
                                    <div className="font-semibold text-primary flex items-center gap-2">
                                        <Coins className="h-5 w-5"/>
                                        <AnimatedCounter value={agent_points_earned || 0} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}


function OrderDetailsSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-64 md:h-80 w-full rounded-xl" />
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <Skeleton className="h-6 w-full" />
                       <Skeleton className="h-6 w-full" />
                        <Separator />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
