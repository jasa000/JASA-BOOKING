
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { Pencil, Trash2, X, Star, UploadCloud, Loader2, School } from 'lucide-react';
import type { Institution } from '@/lib/types';
import { uploadImage } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { indianStatesAndDistricts } from '@/lib/location-data';


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const institutionFormSchema = z.object({
  name: z.string().min(2, 'Institution name must be at least 2 characters.'),
  state: z.string().min(1, 'Please select a state.'),
  district: z.string().min(1, 'Please select a district.'),
  address: z.string().min(10, 'Please provide a detailed address.'),
  imageUrls: z.array(z.string().url()).min(1, 'Please upload at least one image.'),
  mainImageUrl: z.string().url().min(1, 'Please select a main image.'),
});

export default function InstitutionsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof institutionFormSchema>>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues: {
      name: '',
      state: '',
      district: '',
      address: '',
      imageUrls: [],
      mainImageUrl: '',
    },
  });
  
  const selectedState = form.watch('state');
  const states = Object.keys(indianStatesAndDistricts);
  const districts = selectedState ? indianStatesAndDistricts[selectedState] : [];

  const institutionsCollectionRef = React.useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions');
  }, [firestore]);

  const institutionsQuery = React.useMemo(() => {
    if (!institutionsCollectionRef) return null;
    return query(institutionsCollectionRef, orderBy('name', 'asc'));
  }, [institutionsCollectionRef]);

  const { data: institutions, loading, error } = useCollection<Institution>(institutionsQuery);

  useEffect(() => {
    if (editingInstitution) {
      form.reset({
        name: editingInstitution.name,
        state: editingInstitution.state,
        district: editingInstitution.district,
        address: editingInstitution.address,
        imageUrls: editingInstitution.imageUrls || [],
        mainImageUrl: editingInstitution.mainImageUrl,
      });
      setImagePreviews(editingInstitution.imageUrls || []);
      setImageFiles([]);
    } else {
      form.reset({ name: '', state: '', district: '', address: '', imageUrls: [], mainImageUrl: '' });
      setImageFiles([]);
      setImagePreviews([]);
    }
  }, [editingInstitution, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const validFiles = files.filter(file => ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE);
      
      if (validFiles.length !== files.length) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Some files were invalid (type or size) and were not added.' });
      }

      const newFiles = [...imageFiles, ...validFiles];
      setImageFiles(newFiles);
      
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      const allPreviews = [...imagePreviews, ...newPreviews];
      setImagePreviews(allPreviews);

      // We need to update the form's imageUrls so validation can pass
      // We will use the previews as temporary URLs for now
      form.setValue('imageUrls', allPreviews, { shouldValidate: true });
      if (form.getValues('mainImageUrl') === '' && allPreviews.length > 0) {
        form.setValue('mainImageUrl', allPreviews[0], { shouldValidate: true });
      }
    }
  };

  const removeImage = (index: number, url: string) => {
    const isLocalBlob = url.startsWith('blob:');

    if (isLocalBlob) {
        // It's a newly added file (not yet uploaded)
        const fileIndex = imagePreviews.filter(p => p.startsWith('blob:')).indexOf(url);
        if (fileIndex > -1) {
            const newImageFiles = imageFiles.filter((_, i) => i !== fileIndex);
            setImageFiles(newImageFiles);
        }
    }

    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newImagePreviews);
    form.setValue('imageUrls', newImagePreviews, { shouldValidate: true });

    if (form.getValues('mainImageUrl') === url) {
        const newMainUrl = newImagePreviews.length > 0 ? newImagePreviews[0] : '';
        form.setValue('mainImageUrl', newMainUrl, { shouldValidate: true });
    }
  };

  const setAsMainImage = (url: string) => {
    form.setValue('mainImageUrl', url, { shouldValidate: true });
  };
  
  async function onSubmit(values: z.infer<typeof institutionFormSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);
    setIsUploading(true);

    try {
        let finalImageUrls = values.imageUrls.filter(url => !url.startsWith('blob:'));
        
        if (imageFiles.length > 0) {
            toast({ title: 'Uploading Images', description: `Uploading ${imageFiles.length} new image(s)...` });
            const uploadedUrls = await Promise.all(
              imageFiles.map(file => uploadImage(file).catch(e => {
                console.error("Upload failed for a file", e);
                toast({variant: 'destructive', title: 'Upload Failed', description: `Could not upload ${file.name}`});
                return null;
              }))
            );
            const successfulUrls = uploadedUrls.filter((url): url is string => url !== null);
            finalImageUrls = [...finalImageUrls, ...successfulUrls];
        }
        
        setIsUploading(false);

        if (finalImageUrls.length === 0) {
            form.setError('imageUrls', { message: 'Please upload at least one image.'});
            setIsSubmitting(false);
            return;
        }

        // Map the blob URL of the main image to its final uploaded URL
        let finalMainImageUrl = values.mainImageUrl;
        if (values.mainImageUrl.startsWith('blob:')) {
            const previewIndex = imagePreviews.indexOf(values.mainImageUrl);
            const blobIndex = imagePreviews.filter(p => p.startsWith('blob:')).indexOf(values.mainImageUrl);
            
            // Find the corresponding final URL
            const finalUrl = finalImageUrls.find(url => !values.imageUrls.includes(url));
            // This is brittle. A better way: map blob urls to final urls.
            const uploadedUrls = finalImageUrls.slice(values.imageUrls.filter(u => !u.startsWith('blob:')).length);
            if (uploadedUrls[blobIndex]) {
                finalMainImageUrl = uploadedUrls[blobIndex];
            } else {
                finalMainImageUrl = finalImageUrls[0]; // fallback
            }
        } else if (!finalImageUrls.includes(values.mainImageUrl)) {
             finalMainImageUrl = finalImageUrls[0];
        }


      const dataToSave = {
        ...values,
        imageUrls: finalImageUrls,
        mainImageUrl: finalMainImageUrl,
      };

      if (editingInstitution) {
        const institutionDocRef = doc(firestore, 'institutions', editingInstitution.id);
        await updateDoc(institutionDocRef, dataToSave);
        toast({ title: 'Institution Updated', description: `The institution "${values.name}" has been updated.` });
      } else {
        const institutionsCollection = collection(firestore, 'institutions');
        await addDoc(institutionsCollection, { ...dataToSave, createdAt: serverTimestamp() });
        toast({ title: 'Institution Created', description: `The institution "${values.name}" has been added.` });
      }
      setEditingInstitution(null);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: e.message || `Could not ${editingInstitution ? 'update' : 'create'} institution.`,
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setImageFiles([]);
    }
  }

  const handleDelete = async (institutionId: string) => {
    if (!firestore) return;
    const institutionDocRef = doc(firestore, 'institutions', institutionId);
    try {
      await deleteDoc(institutionDocRef);
      toast({ title: 'Institution Deleted', description: 'The institution has been successfully deleted.' });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: e.message || 'Could not delete institution.',
      });
    }
  };
  
  const handleEditClick = (institution: Institution) => {
    setEditingInstitution(institution);
  };
  
  const handleCancelEdit = () => {
    setEditingInstitution(null);
  }
  
  const watchedMainImageUrl = form.watch('mainImageUrl');

  return (
    <div className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{editingInstitution ? 'Edit Institution' : 'Add New Institution'}</CardTitle>
            <CardDescription>
              {editingInstitution ? 'Update the details for this institution.' : 'Create a new institution for events.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormItem>
                  <FormLabel>Institution Images</FormLabel>
                   <FormControl>
                    <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Drag & drop images, or click to browse</p>
                      <p className="text-xs text-muted-foreground/80 mt-1">PNG, JPG, WEBP up to 5MB</p>
                      <Input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        multiple
                        onChange={handleFileChange}
                        disabled={isUploading || isSubmitting}
                        ref={fileInputRef}
                      />
                    </div>
                  </FormControl>
                  <FormMessage>{form.formState.errors.imageUrls?.message}</FormMessage>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {imagePreviews.map((url, index) => (
                      <div key={url} className="relative group aspect-square">
                        <Image src={url} alt={`Preview ${index}`} fill className="object-cover rounded-md" />
                         {isUploading && url.startsWith('blob:') ? (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                               <Loader2 className="h-5 w-5 text-white animate-spin" />
                            </div>
                         ) : (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded-md">
                                <Button type='button' variant="ghost" size="icon" className="h-7 w-7 text-white" onClick={() => setAsMainImage(url)}>
                                    <Star className={cn("h-4 w-4", watchedMainImageUrl === url && "fill-yellow-400 text-yellow-400")} />
                                </Button>
                                <Button type='button' variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeImage(index, url)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                         )}
                      </div>
                    ))}
                  </div>
                  <FormMessage>{form.formState.errors.mainImageUrl?.message}</FormMessage>
                </FormItem>


                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Example University" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select onValueChange={(value) => { field.onChange(value); form.setValue('district', ''); }} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="district" render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a district" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {districts.map(district => <SelectItem key={district} value={district}>{district}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl><Textarea placeholder="123 Main Street, City, Pin Code" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting || isUploading}>
                    {isSubmitting ? (editingInstitution ? 'Updating...' : 'Adding...') : (editingInstitution ? 'Update Institution' : 'Add Institution')}
                  </Button>
                  {editingInstitution && (
                    <Button variant="outline" type="button" onClick={handleCancelEdit}>Cancel</Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Institutions</CardTitle>
            <CardDescription>Edit and delete existing institutions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 rounded-md ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow><TableCell colSpan={3} className="h-24 text-center text-destructive">Error: {error.message}</TableCell></TableRow>
                  ) : institutions && institutions.length > 0 ? (
                    institutions.map((institution) => (
                      <TableRow key={institution.id}>
                        <TableCell className="font-medium flex items-center gap-3">
                          {institution.mainImageUrl ? (
                            <Image src={institution.mainImageUrl} alt={institution.name} width={40} height={40} className="rounded-md object-cover" />
                          ) : (
                             <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                <School className="h-5 w-5 text-muted-foreground" />
                             </div>
                          )}
                          {institution.name}
                        </TableCell>
                        <TableCell>{institution.district}, {institution.state}</TableCell>
                        <TableCell className="text-right space-x-1">
                           <Button variant="ghost" size="icon" onClick={() => handleEditClick(institution)}><Pencil className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete the institution and cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(institution.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} className="h-24 text-center">No institutions found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
