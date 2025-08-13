import { NewDonationForm } from "@/components/donations/new-donation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewDonationPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">List a New Donation</h1>
        <p className="text-muted-foreground">Fill out the details below to make your surplus food available to the community.</p>
      </div>

      <Card className="bg-card backdrop-blur-md">
        <CardHeader>
            <CardTitle>Food Donation Details</CardTitle>
            <CardDescription>Your contribution can make a big difference. Please provide as much detail as possible.</CardDescription>
        </CardHeader>
        <CardContent>
            <NewDonationForm />
        </CardContent>
      </Card>
    </div>
  );
}
