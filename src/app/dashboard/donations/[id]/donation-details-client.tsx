
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, MapPin, Package, Edit, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatedCounter } from "@/components/animated-counter";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicUrl } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { EditDonationForm } from "@/components/donations/edit-donation-form";

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

interface DonationDetailsClientProps {
    donation: Donation;
    user: User | null;
}

export function DonationDetailsClient({ donation, user }: DonationDetailsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pickupOption, setPickupOption] = useState("delivery");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const deliveryFee = 50;
  const isOwner = user && donation.lister_id === user.id;

  const handleConfirmReservation = async () => {
    if (!donation.id || !user) {
        toast({ title: 'Error', description: 'You must be logged in to reserve.', variant: 'destructive' });
        return;
    }

    // 1. Create order
    const { error: orderError } = await supabase.from('orders').insert({
        donation_id: donation.id,
        receiver_id: user.id,
        status: 'Reserved',
        pickup_method: pickupOption,
        delivery_fee: pickupOption === 'delivery' ? deliveryFee : 0,
    });

    if (orderError) {
        toast({ title: 'Error', description: orderError.message, variant: 'destructive' });
        return;
    }

    // 2. Update donation status
    const { error: donationError } = await supabase
        .from('donations')
        .update({ status: 'Reserved' })
        .eq('id', donation.id);

    if (donationError) {
        toast({ title: 'Error updating donation', description: donationError.message, variant: 'destructive' });
        // TODO: Handle rollback or compensation logic
        return;
    }
    
    toast({
        title: "Reservation Confirmed!",
        description: `Your reservation for ${donation.title} is confirmed. ${pickupOption === 'delivery' ? 'A delivery agent will be assigned shortly.' : 'Please proceed to the pickup location.'}`,
        className: "bg-green-100 border-green-300 text-green-800",
    });
    router.push('/dashboard');
    router.refresh();
  };

  const handleDeleteDonation = async () => {
    if (!isOwner || !donation.image_url) return;

    const filePath = donation.image_url;
    
    const { error: storageError } = await supabase.storage.from('donations').remove([filePath]);
    if (storageError) {
        toast({ title: 'Error Deleting Image', description: storageError.message, variant: 'destructive' });
        return;
    }

    const { error } = await supabase.from('donations').delete().eq('id', donation.id);
    if(error) {
         toast({ title: 'Error Deleting Donation', description: error.message, variant: 'destructive' });
    } else {
        toast({
            title: "Donation Deleted",
            description: "The donation listing has been successfully removed.",
            className: "bg-green-100 border-green-300 text-green-800",
        });
        router.push('/dashboard');
        router.refresh();
    }
  }

  const isReserved = donation.status === 'Reserved';
  const publicUrl = getPublicUrl(supabase, 'donations', donation.image_url);
  const listerName = donation.profiles?.name || 'Anonymous Donor';

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
            <Card className="overflow-hidden">
                <div className="relative h-96 w-full">
                    <Image src={publicUrl} alt={donation.title} layout="fill" objectFit="cover" data-ai-hint={donation.image_hint} />
                </div>
            </Card>
            <div className="mt-6">
                <h1 className="text-3xl font-bold font-headline">{donation.title}</h1>
                <p className="text-muted-foreground">Listed by {listerName}</p>
                <p className="mt-4 text-foreground/90">{donation.description}</p>
            </div>
             <Separator className="my-6" />
             <div className="flex flex-col space-y-3 text-muted-foreground">
                <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{donation.location}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Serves approximately {donation.serves} people</span>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Available for pickup until {new Date(donation.pickup_time).toLocaleString()}</span>
                </div>
            </div>
        </div>
        <div>
             {isOwner ? (
                <Card className="bg-card backdrop-blur-md">
                     <CardHeader>
                        <CardTitle>Manage Your Listing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">You can edit the details of your listing or delete it permanently.</p>
                        <div className="flex gap-4">
                            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full"><Edit className="mr-2"/> Edit Listing</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-lg">
                                    <DialogHeader>
                                        <DialogTitle>Edit Donation Details</DialogTitle>
                                        <DialogDescription>
                                            Update the information for your listing here.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <EditDonationForm donation={donation} onFinished={() => setIsEditOpen(false)} />
                                </DialogContent>
                            </Dialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full"><Trash className="mr-2"/> Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your donation listing.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteDonation}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            ) : (
            <Card className="bg-card backdrop-blur-md">
                <CardHeader>
                    <CardTitle>Confirm Your Reservation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">Choose your preferred method to receive this donation.</p>
                     <RadioGroup defaultValue="delivery" value={pickupOption} onValueChange={setPickupOption} disabled={isReserved}>
                        <Label htmlFor="delivery" className={`flex items-start gap-4 p-4 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all ${isReserved ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                            <RadioGroupItem value="delivery" id="delivery" className="mt-1"/>
                            <div className="grid gap-1.5">
                                <span className="font-semibold">Opt for Delivery</span>
                                <span className="text-sm text-muted-foreground">A delivery agent will pick up and deliver the food to you.</span>
                                {pickupOption === 'delivery' && (
                                    <span className="text-xs font-semibold text-primary">Estimated Fee: ?<AnimatedCounter value={deliveryFee} /></span>
                                )}
                            </div>
                        </Label>
                         <Label htmlFor="pickup" className={`flex items-start gap-4 p-4 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all ${isReserved ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                            <RadioGroupItem value="pickup" id="pickup" className="mt-1"/>
                            <div className="grid gap-1.5">
                                <span className="font-semibold">Self-Pickup</span>
                                <span className="text-sm text-muted-foreground">You can pick up the donation directly from the location.</span>
                                <span className="text-xs font-semibold text-primary">No additional charges</span>
                            </div>
                        </Label>
                    </RadioGroup>
                     <Separator />
                     <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" className="w-full" disabled={isReserved}><MapPin className="mr-2"/> View on Map</Button>
                        <Button className="w-full" onClick={handleConfirmReservation} disabled={isReserved}><Package className="mr-2"/> {isReserved ? "Already Reserved" : "Confirm Reservation"}</Button>
                     </div>
                </CardContent>
            </Card>
            )}
        </div>
    </div>
  )
}
