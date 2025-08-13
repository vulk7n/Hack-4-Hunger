
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import React, { useState, useRef, useEffect } from "react";

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
import { CalendarIcon, Upload, Sparkles, Loader2, Camera, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { suggestDonationDetails } from "@/ai/flows/suggest-donation-details";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


const formSchema = z.object({
  foodName: z.string().min(3, "Food name must be at least 3 characters."),
  description: z.string().optional(),
  quantity: z.preprocess((val) => Number(val), z.number().min(1, "Quantity must be at least 1")),
  location: z.string().min(3, "Location is required"),
  pickupDate: z.date({ required_error: "A pickup date is required." }),
  pickupTime: z.string().min(1, "Please specify a pickup time."),
  image: z.any().refine((file) => file, "An image is required."),
});

export function NewDonationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: "",
      description: "",
      quantity: 1,
      pickupTime: "",
      location: "Indiranagar, Bengaluru"
    },
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (!isCameraOpen) {
        if (stream && videoRef.current) {
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraOpen]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      form.setValue('image', file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            setSelectedFile(file);
            form.setValue('image', file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setIsCameraOpen(false);
          }
        }, 'image/jpeg');
      }
    }
  };


  const handleGenerateDetails = async () => {
    if (!selectedFile) {
        toast({ title: "Please select an image first.", variant: "destructive" });
        return;
    }
    setIsGenerating(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = async () => {
            const dataUri = reader.result as string;
            const result = await suggestDonationDetails({ photoDataUri: dataUri });
            if (result) {
                form.setValue("foodName", result.suggestedTitle, { shouldValidate: true });
                
                const nutritionalInfo = `\n\nEst. Nutrition (per serving):\nCalories: ${result.calories}\nFat: ${result.fat}\nEnergy: ${result.energy}`;
                const aiDisclaimer = "\n\n(Description and nutritional info generated by AI)";

                const fullDescription = `${result.suggestedDescription}${nutritionalInfo}${aiDisclaimer}`;

                form.setValue("description", fullDescription, { shouldValidate: true });
                toast({ title: "Details generated!", description: "The AI has suggested a title and description for you." });
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            toast({ title: "Error reading image file.", variant: "destructive" });
        };
    } catch (error) {
        console.error("Error generating details:", error);
        toast({ title: "AI Generation Failed", description: "Could not generate details. Please try again or fill them in manually.", variant: "destructive" });
    } finally {
        setIsGenerating(false);
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ title: 'Error', description: 'You must be logged in to create a donation.', variant: 'destructive' });
        return;
    }

    const imageFile = values.image;
    const pickupDateTime = new Date(values.pickupDate);
    const [hours, minutes] = values.pickupTime.split(':');
    pickupDateTime.setHours(Number(hours), Number(minutes));

    // 1. Insert donation data first with a null image_url
    const { data: newDonation, error: insertError } = await supabase.from('donations').insert({
        title: values.foodName,
        description: values.description,
        serves: values.quantity,
        location: values.location,
        pickup_time: pickupDateTime.toISOString(),
        lister_id: user.id,
        image_url: null, // Temp null value
        image_hint: 'food meal',
        status: 'Available',
    }).select().single();

    if (insertError) {
        toast({ title: 'Error Creating Donation', description: insertError.message, variant: 'destructive' });
        return;
    }

    // 2. Give immediate feedback to the user
    toast({
      title: "Donation Listed!",
      description: "Your food donation has been successfully listed. Uploading image in the background.",
      className: "bg-green-100 border-green-300 text-green-800",
    });
    form.reset();
    setSelectedFile(null);
    setPreviewUrl(null);
    router.push('/dashboard');
    router.refresh();

    // 3. Upload image in the background
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('bucket', 'donations');
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }
        
        const imagePath = result.path;

        // 4. Update the donation record with the image path
        const { error: updateError } = await supabase
            .from('donations')
            .update({ image_url: imagePath })
            .eq('id', newDonation.id);

        if (updateError) {
             throw new Error(updateError.message);
        }

        // Optional: refresh the page again to show the final image
        router.refresh();

    } catch (e: any) {
        console.error("Background upload failed:", e.message);
        toast({ title: 'Image Upload Failed', description: `Your donation is listed, but the image upload failed: ${e.message}`, variant: 'destructive' });
        // Optionally, you could try to delete the donation record here or mark it as incomplete.
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Food Image</FormLabel>
                            <FormControl>
                                <div className="flex items-center justify-center w-full">
                                    <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 border-muted-foreground/50">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Selected preview" className="h-full w-full object-cover rounded-lg"/>
                                        ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG or GIF</p>
                                        </div>
                                        )}
                                        <Input id="dropzone-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </Label>
                                </div> 
                            </FormControl>
                            <FormMessage />
                            <FormDescription className="flex items-center justify-between">
                                Or use your device's camera.
                                 <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" type="button"><Camera className="mr-2"/>Use Camera</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-xl bg-card/95 backdrop-blur-lg">
                                        <DialogHeader>
                                            <DialogTitle>Capture Image</DialogTitle>
                                            <DialogDescription>
                                               Position the food item in the frame and capture.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="relative">
                                            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                                            <canvas ref={canvasRef} className="hidden" />
                                            {hasCameraPermission === false && (
                                                <Alert variant="destructive" className="absolute top-4 left-4 right-4">
                                                    <AlertTitle>Camera Access Denied</AlertTitle>
                                                    <AlertDescription>
                                                        Please enable camera permissions in your browser settings.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" disabled={!hasCameraPermission} onClick={handleCapture}>
                                                <CircleDot className="mr-2" /> Capture
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </FormDescription>
                        </FormItem>
                    )}
                />
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
                            <Textarea placeholder="Briefly describe the food item, ingredients, etc." {...field} rows={8} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 {selectedFile && (
                    <Button type="button" variant="outline" onClick={handleGenerateDetails} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </Button>
                )}
            </div>
            <div className="space-y-6">
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
            </div>
        </div>

       
        <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Listing...' : 'List My Donation'}</Button>
        </div>
      </form>
    </Form>
  );
}
