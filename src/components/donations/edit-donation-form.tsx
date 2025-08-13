
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const formSchema = z.object({
  foodName: z.string().min(3, "Food name must be at least 3 characters."),
  description: z.string().optional(),
  quantity: z.preprocess((val) => Number(val), z.number().min(1, "Quantity must be at least 1")),
  location: z.string().min(3, "Location is required"),
  pickupDate: z.date({ required_error: "A pickup date is required." }),
  pickupTime: z.string().min(1, "Please specify a pickup time."),
});

type Donation = {
    id: string;
    title: string;
    description: string | null;
    serves: number;
    location: string;
    pickup_time: string;
    [key: string]: any;
};

interface EditDonationFormProps {
    donation: Donation;
    onFinished: () => void;
}

export function EditDonationForm({ donation, onFinished }: EditDonationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  
  const pickupDateTime = new Date(donation.pickup_time);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: donation.title,
      description: donation.description || "",
      quantity: donation.serves,
      location: donation.location,
      pickupDate: pickupDateTime,
      pickupTime: format(pickupDateTime, "HH:mm"),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const pickupDateTime = new Date(values.pickupDate);
    const [hours, minutes] = values.pickupTime.split(':');
    pickupDateTime.setHours(Number(hours), Number(minutes));

    const { error } = await supabase.from('donations').update({
        title: values.foodName,
        description: values.description,
        serves: values.quantity,
        location: values.location,
        pickup_time: pickupDateTime.toISOString(),
    }).eq('id', donation.id);

    if (error) {
        toast({ title: 'Error Updating Donation', description: error.message, variant: 'destructive' });
    } else {
        toast({
            title: "Donation Updated!",
            description: "Your donation details have been successfully updated.",
            className: "bg-green-100 border-green-300 text-green-800",
        });
        onFinished();
        router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
            control={form.control}
            name="foodName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Food Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Vegetable Biryani" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                    <Textarea placeholder="Briefly describe the food item, ingredients, etc." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Serves (approx.)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 10" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Indiranagar, Bengaluru" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="pickupDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Pickup By (Date)</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                        date < new Date(new Date().setHours(0,0,0,0))
                        }
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="pickupTime"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Pickup By (Time)</FormLabel>
                <FormControl>
                    <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        </div>
        
        <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </Form>
  );
}
