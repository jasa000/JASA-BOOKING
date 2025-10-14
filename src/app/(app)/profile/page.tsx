

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser, useDoc, useFirestore, useAuth } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { sendPasswordResetEmail, deleteUser, updateProfile } from "firebase/auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Camera, Trash2 } from "lucide-react";
import { ImageCropper } from "@/components/image-cropper";
import { uploadImage } from "@/lib/cloudinary";
import { formatDistanceToNowStrict } from "date-fns";


const profileFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  mobileNumber: z.string().optional(),
  altMobileNumber: z.string().optional(),
  schoolOrCollege: z.string().optional(),
  address: z.string().optional(),
  altEmail: z.string().email("Invalid email address.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;

export default function ProfilePage() {
  const { user, loading: userLoading, setUser } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [imageToCrop, setImageToCrop] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [resetCooldown, setResetCooldown] = React.useState(0);
  const [cooldownDisplay, setCooldownDisplay] = React.useState("");

  const userDocRef = React.useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile, loading: profileLoading } = useDoc(userDocRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      mobileNumber: "",
      altMobileNumber: "",
      schoolOrCollege: "",
      address: "",
      altEmail: "",
    },
  });
  
  React.useEffect(() => {
    const lastRequest = localStorage.getItem("passwordResetRequest");
    if (lastRequest) {
      const remainingTime = (parseInt(lastRequest) + SIX_HOURS_IN_MS) - Date.now();
      if (remainingTime > 0) {
        setResetCooldown(Math.ceil(remainingTime / 1000));
      }
    }
  }, []);

  React.useEffect(() => {
    if (resetCooldown <= 0) {
      setCooldownDisplay("");
      return;
    };

    const intervalId = setInterval(() => {
      setResetCooldown(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [resetCooldown]);

  React.useEffect(() => {
    if (resetCooldown > 0) {
      const futureDate = new Date(Date.now() + resetCooldown * 1000);
      setCooldownDisplay(formatDistanceToNowStrict(futureDate));
    }
  }, [resetCooldown]);


  React.useEffect(() => {
    if (user) {
      if (userProfile) {
        form.reset({
          displayName: userProfile.displayName || user.displayName || "",
          mobileNumber: userProfile.mobileNumber || "",
          altMobileNumber: userProfile.altMobileNumber || "",
          schoolOrCollege: userProfile.schoolOrCollege || "",
          address: userProfile.address || "",
          altEmail: userProfile.altEmail || "",
        });
      } else if (!profileLoading) {
        form.reset({
          displayName: user.displayName || "",
          mobileNumber: "",
          altMobileNumber: "",
          schoolOrCollege: "",
          address: "",
          altEmail: "",
        });
      }
    }
  }, [user, userProfile, profileLoading, form]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (croppedImage: Blob) => {
    if (!user || !userDocRef) return;
    setIsUploading(true);
    setImageToCrop(null);
    try {
      const file = new File([croppedImage], `${user.uid}.png`, { type: 'image/png' });
      const photoURL = await uploadImage(file);

      // Update auth profile
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { photoURL });
      }
      
      // Update firestore
      await setDoc(userDocRef, { photoURL }, { merge: true });

      // Force a re-render/re-fetch of user to get new photoURL
      setUser({ ...user, photoURL });

      toast({
        title: "Profile Photo Updated",
        description: "Your new profile photo has been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Could not update your profile photo. Please try again.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !userDocRef) return;
    setIsUploading(true);
    try {
      const photoURL = null;
      // Update auth profile
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { photoURL });
      }
      
      // Update firestore
      await setDoc(userDocRef, { photoURL }, { merge: true });
      
      // Force a re-render/re-fetch of user to get new photoURL
      setUser({ ...user, photoURL: null });

      toast({
        title: "Profile Photo Removed",
        description: "Your profile photo has been removed.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not remove your profile photo. Please try again.",
      });
    } finally {
        setIsUploading(false);
    }
  }
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!userDocRef) return;
    setIsSubmitting(true);
    try {
      await setDoc(userDocRef, data, { merge: true });
      if(auth?.currentUser && auth.currentUser.displayName !== data.displayName) {
          await updateProfile(auth.currentUser, { displayName: data.displayName });
          setUser({...user!, displayName: data.displayName});
      }
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not update your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user || !user.email || !auth) return;
    
    if (resetCooldown > 0) {
       toast({
        variant: "destructive",
        title: "Rate limit exceeded",
        description: `You can request another password reset in ${cooldownDisplay}.`,
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      const requestTime = Date.now();
      localStorage.setItem("passwordResetRequest", requestTime.toString());
      setResetCooldown(Math.ceil(SIX_HOURS_IN_MS / 1000));
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send reset email.",
        description: error.message,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !userDocRef || !auth?.currentUser) return;
    setIsDeleting(true);
    try {
      await deleteDoc(userDocRef);
      await deleteUser(auth.currentUser);

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      router.push("/");
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast({
          variant: "destructive",
          title: "Action Required",
          description: "This is a sensitive action. Please sign out and sign in again before deleting your account.",
          duration: 8000,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to delete account.",
          description: error.message,
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };


  const loading = userLoading || profileLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ImageCropper
        image={imageToCrop}
        onCropComplete={handleImageUpload}
        onClose={() => {
          setImageToCrop(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
      />
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader className="items-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-primary">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ""} />
                  <AvatarFallback className="text-3xl">
                    {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Change photo"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                   {user.photoURL && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-10 w-10 text-white hover:bg-white/20 hover:text-white"
                              disabled={isUploading}
                              title="Remove photo"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Profile Photo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove your profile photo? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRemovePhoto}>
                              Yes, Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  )}
                </div>
                 {isUploading && <p className="text-sm text-muted-foreground animate-pulse absolute -bottom-6">Updating photo...</p>}
              </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input value={user.email || ""} readOnly disabled className="cursor-not-allowed" />
                  </FormItem>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +1 234 567 890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="altMobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternative Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +1 987 654 321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="schoolOrCollege"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School or College Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. University of Example" {...field} />
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
                        <Input placeholder="e.g. 123 Main St, Anytown, USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="altEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternative Email</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. personal@example.com" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security & Account Settings</CardTitle>
            <CardDescription>Manage your password and account data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Password Reset</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-sm text-muted-foreground">Reset your password via email. Limited to one request per 6 hours.</p>
                      </div>
                      <Button variant="outline" onClick={handlePasswordReset} disabled={resetCooldown > 0}>
                        {resetCooldown > 0 ? `Try again in ${cooldownDisplay}`: "Send Reset Link"}
                      </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-destructive">Danger Zone</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 border border-destructive/50 rounded-md bg-destructive/5">
                      <h3 className="font-medium text-destructive">Delete Account</h3>
                      <p className="text-sm text-destructive/80 mb-4">
                          This action is permanent and cannot be undone.
                      </p>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete My Account"}
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete your account and remove your data from our servers. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                Yes, delete account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

    

    

