
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type OrderHistory = {
  id: string;
  created_at: string;
  status: string;
  donations: { title: string };
};

export default function OrdersPage() {
    const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        created_at,
                        status,
                        donations ( title )
                    `)
                    .eq('receiver_id', user.id)
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.error("Error fetching orders:", error);
                } else {
                    setOrderHistory(data as any);
                }
            }
            setLoading(false);
        };
        fetchOrders();
    }, [supabase]);


  const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-500/20 text-green-700 hover:bg-green-500/30';
            case 'In Transit':
                 return 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30';
            default:
                return 'bg-muted hover:bg-muted/80';
        }
    }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Orders</h1>
        <p className="text-muted-foreground">A history of all your reserved donations.</p>
      </div>
      
       <Card className="bg-card backdrop-blur-md">
            <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>A record of your past food reservations. Click an order to see more details.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-muted-foreground text-center py-8">Loading your orders...</p>
                ) : orderHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">You have no order history yet.</p>
                ) : (
                <>
                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Food Item</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderHistory.map((item) => (
                                 <TableRow key={item.id} >
                                    <TableCell>
                                        <Link href={`/dashboard/orders/${item.id}`} className="block w-full h-full">{new Date(item.created_at).toLocaleDateString()}</Link>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/dashboard/orders/${item.id}`} className="block w-full h-full">{item.donations.title}</Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/orders/${item.id}`} className="block w-full h-full">
                                            <Badge variant="outline" className={getStatusBadge(item.status)}>{item.status}</Badge>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/orders/${item.id}`}>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </Link>
                                    </TableCell>
                                 </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {/* Mobile View */}
                 <div className="md:hidden space-y-4">
                    {orderHistory.map((item) => (
                        <Link href={`/dashboard/orders/${item.id}`} key={item.id} className="block cursor-pointer">
                            <Card className="bg-muted/50 hover:bg-muted/80 transition-colors">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.donations.title}</p>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant="outline" className={getStatusBadge(item.status)}>{item.status}</Badge>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
                </>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
