
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Award } from "lucide-react";

const shopItems = [
  { id: 1, name: "Premium Helmet", price: 4000, imageUrl: "https://placehold.co/600x400.png", imageHint: "helmet safety" },
  { id: 2, name: "Riding Gloves", price: 1500, imageUrl: "https://placehold.co/600x400.png", imageHint: "riding gloves" },
  { id: 3, name: "Fuel Card (₹500)", price: 5000, imageUrl: "https://placehold.co/600x400.png", imageHint: "fuel card" },
  { id: 4, name: "Vehicle Service Voucher", price: 10000, imageUrl: "https://placehold.co/600x400.png", imageHint: "mechanic service" },
  { id: 5, name: "Meal Voucher for Partner Restaurant", price: 2000, imageUrl: "https://placehold.co/600x400.png", imageHint: "food voucher" },
  { id: 6, name: "Phone Mount", price: 2500, imageUrl: "https://placehold.co/600x400.png", imageHint: "phone mount" },
  { id: 7, name: "Raincoat", price: 3000, imageUrl: "https://placehold.co/600x400.png", imageHint: "raincoat waterproof" },
  { id: 8, name: "Mystery Swag Box", price: 5000, imageUrl: "https://placehold.co/600x400.png", imageHint: "mystery box" },
];

export default function DeliveryShopPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Agent Point Shop</h1>
        <p className="text-muted-foreground">Redeem your Power Coins for exclusive gear and rewards!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {shopItems.map((item) => (
          <Card key={item.id} className="overflow-hidden bg-card backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={item.imageHint}/>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-lg font-headline mb-2 h-12">{item.name}</CardTitle>
              <div className="flex items-center gap-2 font-bold text-primary">
                <Award className="h-5 w-5"/>
                <span>{item.price.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full">Redeem</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
