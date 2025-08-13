
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star, Utensils, ShieldCheck, Calendar, Package, Coins, Edit } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/contexts/profile-context";
import { getPublicUrl } from "@/lib/utils";

const badges = [
    { name: "First Donation", icon: Star, color: "text-yellow-500" },
    { name: "Community Helper", icon: Utensils, color: "text-green-500" },
    { name: "Top Contributor", icon: Award, color: "text-blue-500" },
    { name: "Verified Donor", icon: ShieldCheck, color: "text-indigo-500" },
];

type DonationHistory = {
    id: string;
    title: string;
    serves: number;
    status: string;
    created_at: string;
    orders: { donor_points_earned: number }[] | null;
};


export default function ProfilePage() {
    const { user, profile, loading: profileLoading } = useProfile();
    const supabase = getSupabaseBrowserClient();
    const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);
    const [loadingDonations, setLoadingDonations] = useState(true);

    useEffect(() => {
        const fetchDonationHistory = async () => {
            if (user) {
                setLoadingDonations(true);
                const { data: donationData, error: donationError } = await supabase
                    .from('donations')
                    .select(`
                        id,
                        title,
                        serves,
                        status,
                        created_at,
                        orders!left ( donor_points_earned )
                    `)
                    .eq('lister_id', user.id)
                    .order('created_at', { ascending: false });

                if (donationError) {
                    // Only log if it's a real error, not an empty object
                    if (Object.keys(donationError).length > 0) {
                        console.error('Error fetching donation history:', donationError);
                    }
                } else {
                    setDonationHistory(donationData as any);
                }
                setLoadingDonations(false);
            }
        };
        fetchDonationHistory();
    }, [user, supabase]);

  if (profileLoading) {
      return <ProfileSkeleton />;
  }
  
  if (!profile) {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">Profile not found</h1>
            <p className="text-muted-foreground">We couldn't load your profile. Please try logging in again.</p>
        </div>
    )
  }

  const publicAvatarUrl = getPublicUrl(supabase, 'avatars', profile.avatar_url);

  return (
    <div className="flex flex-col gap-8">
      <Card className="bg-card backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={publicAvatarUrl} />
              <AvatarFallback>{profile.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold font-headline">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="md:ml-auto"><Edit className="mr-2"/> Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Your Profile</DialogTitle>
                        <DialogDescription>
                            Update your personal information here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <EditProfileForm profile={profile} />
                </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-card backdrop-blur-md">
            <CardHeader>
                <CardTitle>Power Coins</CardTitle>
                <CardDescription>Your total rewards earned.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <div className="flex items-center justify-center gap-4 text-5xl font-bold text-primary">
                    <Award className="h-12 w-12"/>
                    <AnimatedCounter value={profile.power_coins} />
                </div>
            </CardContent>
        </Card>
        <Card className="md:col-span-2 bg-card backdrop-blur-md">
            <CardHeader>
                <CardTitle>Your Badges</CardTitle>
                <CardDescription>Milestones you've achieved.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                    {badges.map((badge, index) => (
                        <div key={index} className="flex flex-col items-center gap-2">
                           <div className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10`}>
                                <badge.icon className={`h-8 w-8 ${badge.color}`} />
                           </div>
                           <span className="text-xs font-medium text-muted-foreground">{badge.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

       <Card className="bg-card backdrop-blur-md">
            <CardHeader>
                <CardTitle>Donation History</CardTitle>
                <CardDescription>A record of your past donations.</CardDescription>
            </CardHeader>
            <CardContent>
                {loadingDonations ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : donationHistory.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">You haven't made any donations yet.</p>
                ) : (
                <>
                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Food Item</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Coins Earned</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {donationHistory.map((item) => (
                                 <TableRow key={item.id}>
                                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>{item.serves} servings</TableCell>
                                    <TableCell>
                                         <Badge variant="default" className="bg-green-500/20 text-green-700 hover:bg-green-500/30">{item.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-primary">{item.orders?.[0]?.donor_points_earned || 0}</TableCell>
                                 </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {/* Mobile View */}
                 <div className="md:hidden space-y-4">
                    {donationHistory.map((item) => (
                        <Card key={item.id} className="bg-muted/50">
                            <CardContent className="p-4 flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <Package className="h-4 w-4" />
                                        <span>{item.serves} servings</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                     <Badge variant="default" className="bg-green-500/20 text-green-700 hover:bg-green-500/30 mb-2">{item.status}</Badge>
                                     <div className="flex items-center gap-1 font-bold text-primary">
                                        <Coins className="h-4 w-4"/>
                                        <span>{item.orders?.[0]?.donor_points_earned || 0}</span>
                                     </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                </>
                )}
            </CardContent>
        </Card>
    </div>
  );
}


function ProfileSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            <Card className="bg-card backdrop-blur-md">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2 text-center md:text-left">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-32 md:ml-auto" />
                    </div>
                </CardContent>
            </Card>
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 bg-card backdrop-blur-md">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
                        <div className="text-sm text-muted-foreground pt-1">
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
                <Card className="md:col-span-2 bg-card backdrop-blur-md">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
                         <div className="text-sm text-muted-foreground pt-1">
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex gap-6">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-16 w-16 rounded-full" />
                    </CardContent>
                </Card>
            </div>
            <Card className="bg-card backdrop-blur-md">
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
                     <div className="text-sm text-muted-foreground pt-1">
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

    

    