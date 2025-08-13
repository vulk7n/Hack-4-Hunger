
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Award } from "lucide-react";

const shopItems = [
  { id: 1, name: "Eco-Friendly Tote Bag", price: 500, imageUrl: "https://placehold.co/600x400.png", imageHint: "tote bag" },
  { id: 2, name: "Reusable Coffee Cup", price: 750, imageUrl: "https://placehold.co/600x400.png", imageHint: "coffee cup" },
  { id: 3, name: "Stainless Steel Water Bottle", price: 1000, imageUrl: "https://placehold.co/600x400.png", imageHint: "water bottle" },
  { id: 4, name: "Branded T-Shirt", price: 1500, imageUrl: "https://placehold.co/600x400.png", imageHint: "tshirt clothing" },
  { id: 5, name: "Meal Voucher for Partner Restaurant", price: 2000, imageUrl: "https://placehold.co/600x400.png", imageHint: "food voucher" },
  { id: 6, name: "Donate a Fruit Tree", price: 2500, imageUrl: "https://placehold.co/600x400.png", imageHint: "tree plant" },
  { id: 7, name: "Cooking Class Voucher", price: 3000, imageUrl: "https://placehold.co/600x400.png", imageHint: "cooking class" },
  { id: 8, name: "Mystery Swag Box", price: 5000, imageUrl: "https://placehold.co/600x400.png", imageHint: "mystery box" },
];

export default function ShopPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Point Shop</h1>
        <p className="text-muted-foreground">Redeem your Power Coins for exclusive rewards!</p>
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
