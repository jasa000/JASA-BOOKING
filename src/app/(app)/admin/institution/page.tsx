
'use client';

import React from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { Pencil, Trash2 } from 'lucide-react';
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
import type { Institution } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const institutionFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Institution name must be at least 2 characters.',
  }),
});

export default function InstitutionsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingInstitution, setEditingInstitution] = React.useState<Institution | null>(null);

  const institutionsCollectionRef = React.useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions');
  }, [firestore]);

  const institutionsQuery = React.useMemo(() => {
    if (!institutionsCollectionRef) return null;
    return query(institutionsCollectionRef, orderBy('name', 'asc'));
  }, [institutionsCollectionRef]);

  const {
    data: institutions,
    loading,
    error,
  } = useCollection<Institution>(institutionsQuery);

  const form = useForm<z.infer<typeof institutionFormSchema>>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof institutionFormSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (editingInstitution) {
        // Update existing institution
        const institutionDocRef = doc(firestore, 'institutions', editingInstitution.id);
        await updateDoc(institutionDocRef, values);
        toast({
            title: 'Institution Updated',
            description: `The institution "${values.name}" has been updated.`,
        });
        setEditingInstitution(null);
      } else {
        // Add new institution
        const institutionsCollection = collection(firestore, 'institutions');
        await addDoc(institutionsCollection, {
          ...values,
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Institution Created',
          description: `The institution "${values.name}" has been added.`,
        });
      }
      form.reset({ name: '' });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: e.message || `Could not ${editingInstitution ? 'update' : 'create'} institution.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleEditClick = (institution: Institution) => {
    setEditingInstitution(institution);
    form.reset({
        name: institution.name,
    });
  };

  const handleCancelEdit = () => {
    setEditingInstitution(null);
    form.reset({ name: '' });
  };

  const handleDelete = async (institutionId: string) => {
    if (!firestore) return;
    const institutionDocRef = doc(firestore, 'institutions', institutionId);
    try {
      await deleteDoc(institutionDocRef);
      toast({
        title: 'Institution Deleted',
        description: 'The institution has been successfully deleted.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: e.message || 'Could not delete institution.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{editingInstitution ? 'Edit Institution' : 'Add New Institution'}</CardTitle>
            <CardDescription>
              {editingInstitution ? 'Update the name of this institution.' : 'Create a new institution for events.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Example University" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (editingInstitution ? 'Updating...' : 'Adding...') : (editingInstitution ? 'Update Institution' : 'Add Institution')}
                  </Button>
                  {editingInstitution && (
                    <Button variant="outline" type="button" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Institutions</CardTitle>
            <CardDescription>
              Edit and delete existing institutions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution Name</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-20 rounded-md ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="h-24 text-center text-destructive"
                      >
                        Error loading institutions: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : institutions && institutions.length > 0 ? (
                    institutions.map((institution) => (
                      <TableRow key={institution.id}>
                        <TableCell className="font-medium">
                          {institution.name}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClick(institution)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the institution.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(institution.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No institutions found.
                      </TableCell>
                    </TableRow>
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
