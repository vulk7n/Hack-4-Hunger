
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicUrl } from "@/lib/utils";
import { Label } from "../ui/label";


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type Profile = {
    name: string;
    email: string;
    avatar_url: string;
    phone: string;
    address: string;
    [key: string]: any; 
};

interface EditProfileFormProps {
    profile: Profile;
}


export function EditProfileForm({ profile }: EditProfileFormProps) {
  const { toast } = useToast();
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(getPublicUrl(supabase, 'avatars', profile.avatar_url));
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
    },
  });

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({ title: 'Error', description: 'Not authenticated.', variant: 'destructive'});
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'avatars');


    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        toast({ title: 'Upload Error', description: result.error || 'An unknown error occurred', variant: 'destructive'});
        return;
    }

    const { path } = result;
    
    const { error: updateError } = await supabase.from('profiles').update({
        avatar_url: path
    }).eq('id', user.id);

    if (updateError) {
       toast({ title: 'Error updating avatar', description: updateError.message, variant: 'destructive' });
    } else {
        setAvatarUrl(getPublicUrl(supabase, 'avatars', path));
        toast({ title: 'Avatar updated!', className: "bg-green-100 border-green-300 text-green-800" });
        router.refresh();
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ title: 'Error', description: 'Not authenticated.', variant: 'destructive'});
        return;
    }

    const { error } = await supabase.from('profiles').update({
        name: values.name,
        phone: values.phone,
        address: values.address,
    }).eq('id', user.id);


    if (error) {
        toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    } else {
        toast({
        title: "Profile Updated!",
        description: "Your profile information has been successfully saved.",
        className: "bg-green-100 border-green-300 text-green-800",
        });
        router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormItem className="flex flex-col items-center">
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="relative group">
                  <img src={avatarUrl || 'https://placehold.co/100x100.png'} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white"/>
                  </div>
              </div>
            </Label>
            <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </FormItem>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="your.email@example.com" {...field} disabled />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input type="tel" placeholder="Your phone number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                    <Textarea placeholder="Your full address" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
