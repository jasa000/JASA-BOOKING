
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "@/components/ui/separator";
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
import { sendPasswordResetEmail, deleteUser } from "firebase/auth";

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  mobileNumber: z.string().optional(),
  altMobileNumber: z.string().optional(),
  schoolOrCollege: z.string().optional(),
  address: z.string().optional(),
  altEmail: z.string().email("Invalid email address.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

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

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userDocRef) return;
    setIsSubmitting(true);
    try {
      await setDoc(userDocRef, data, { merge: true });
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
    if (!user || !user.email) return;

    const lastRequest = localStorage.getItem("passwordResetRequest");
    const sixHours = 6 * 60 * 60 * 1000;
    if (lastRequest && Date.now() - parseInt(lastRequest) < sixHours) {
      toast({
        variant: "destructive",
        title: "Rate limit exceeded",
        description: "You can only request a password reset once every 6 hours.",
      });
      return;
    }

    if (!auth) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      localStorage.setItem("passwordResetRequest", Date.now().toString());
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
    if (!user || !userDocRef) return;
    setIsDeleting(true);
    try {
      // First delete firestore doc
      await deleteDoc(userDocRef);
      // Then delete auth user
      if (auth?.currentUser?.uid === user.uid) {
         await deleteUser(auth.currentUser);
      } else {
        throw new Error("User not authenticated for this action.");
      }
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      router.push("/");
    } catch (error: any) {
      setIsDeleting(false);
      toast({
        variant: "destructive",
        title: "Failed to delete account.",
        description: error.message,
      });
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
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ""} />
                <AvatarFallback className="text-3xl">
                  {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-headline">{form.watch('displayName') || 'User'}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
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
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">Reset your password via email.</p>
                </div>
                 <Button variant="outline" onClick={handlePasswordReset}>Send Reset Link</Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 border-t border-destructive/50 pt-4 bg-destructive/5 rounded-b-lg">
             <CardTitle className="text-destructive">Danger Zone</CardTitle>
             <CardDescription className="text-destructive">
                Deleting your account is a permanent action and cannot be undone.
              </CardDescription>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
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
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    