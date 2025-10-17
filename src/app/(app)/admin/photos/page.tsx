
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';


interface CloudinaryImage {
  public_id: string;
  url: string;
  created_at: string;
  bytes: number;
  isUsed: boolean;
}

interface CloudinaryUsage {
    plan: string;
    credits: {
        usage: number;
        limit: number;
        used_percent: number;
    };
    transformations: {
        usage: number;
        limit: number;
        used_percent: number;
    };
    objects: {
        usage: number;
        limit: number;
        used_percent: number;
    };
    bandwidth: {
        usage: number;
        limit: number;
        used_percent: number;
    };
    storage: {
        usage: number;
        limit: number;
        used_percent: number;
    };
}


function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export default function PhotoManagementPage() {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [usage, setUsage] = useState<CloudinaryUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { toast } = useToast();

  const { usedImages, unusedImages } = useMemo(() => {
    const used = images.filter(img => img.isUsed);
    const unused = images.filter(img => !img.isUsed);
    return { usedImages: used, unusedImages: unused };
  }, [images]);

  useEffect(() => {
    setSelectedImages([]);
  }, [unusedImages]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSelectedImages([]);
    try {
      const res = await fetch('/api/cloudinary');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }
      const data = await res.json();
      setImages(data.images);
      setUsage(data.usage);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (public_ids: string[]) => {
    if (public_ids.length === 0) return;
    setDeletingId(public_ids[0]); // to show loading state
    try {
      const res = await fetch('/api/cloudinary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_ids }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete image(s)');
      }
      setImages(images.filter((img) => !public_ids.includes(img.public_id)));
      setSelectedImages([]);
      toast({
        title: `Image${public_ids.length > 1 ? 's' : ''} Deleted`,
        description: `${public_ids.length} unused image${public_ids.length > 1 ? 's have' : ' has'} been removed.`,
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: e.message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => ({
    total: images.length,
    used: usedImages.length,
    unused: unusedImages.length,
    totalSize: images.reduce((acc, img) => acc + img.bytes, 0),
    unusedSize: unusedImages.reduce((acc, img) => acc + img.bytes, 0),
  }), [images, usedImages, unusedImages]);

  const handleSelect = (public_id: string) => {
    setSelectedImages(prev => 
      prev.includes(public_id) 
        ? prev.filter(id => id !== public_id)
        : [...prev, public_id]
    );
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedImages(unusedImages.map(img => img.public_id));
    } else {
      setSelectedImages([]);
    }
  };
  
  const renderTable = (data: CloudinaryImage[], isUnusedTable = false) => (
     <div className="border rounded-md">
        <Table>
            <TableHeader>
                <TableRow>
                    {isUnusedTable && (
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedImages.length > 0 && selectedImages.length === unusedImages.length ? true : (selectedImages.length > 0 ? 'indeterminate' : false)}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead>Preview</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((image) => (
                <TableRow key={image.public_id} data-state={selectedImages.includes(image.public_id) && 'selected'}>
                    {isUnusedTable && (
                      <TableCell>
                        <Checkbox
                          checked={selectedImages.includes(image.public_id)}
                          onCheckedChange={() => handleSelect(image.public_id)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                        <a href={image.url} target="_blank" rel="noopener noreferrer">
                            <Image
                                src={image.url}
                                alt={image.public_id}
                                width={80}
                                height={60}
                                className="object-cover rounded-md"
                            />
                        </a>
                    </TableCell>
                    <TableCell>
                        <Badge variant={image.isUsed ? 'secondary' : 'outline'}>
                            {image.isUsed ? 'In Use' : 'Unused'}
                        </Badge>
                    </TableCell>
                    <TableCell>{formatBytes(image.bytes)}</TableCell>
                    <TableCell>
                    {format(new Date(image.created_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                    {!image.isUsed && !isUnusedTable && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={deletingId === image.public_id}
                                >
                                    {deletingId === image.public_id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the image from Cloudinary. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDelete([image.public_id])}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Yes, Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
        {data.length === 0 && <div className="text-center p-8 text-muted-foreground">No images found in this category.</div>}
     </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Photo Management</h1>
            <p className="text-muted-foreground">
                View, manage, and optimize your Cloudinary media assets.
            </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
        </Button>
      </div>

      {loading ? (
         <Card className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Fetching Cloudinary data...</p>
        </Card>
      ) : error ? (
        <Card className="border-destructive/50 bg-destructive/5 text-destructive p-6">
            <div className="flex items-center">
                <AlertCircle className="h-6 w-6 mr-3"/>
                <div>
                    <h3 className="font-bold">Failed to load data</h3>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        </Card>
      ) : (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unused Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.unused}</div>
                        <p className="text-xs text-muted-foreground">{formatBytes(stats.unusedSize)} of space</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
                        {usage && <p className="text-xs text-muted-foreground">of {formatBytes(usage.storage.limit)}</p>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credits Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {usage ? (
                            <>
                                <div className="text-2xl font-bold">{usage.credits.used_percent.toFixed(2)}%</div>
                                <Progress value={usage.credits.used_percent} className="h-2 mt-2" />
                            </>
                        ) : <div className="text-sm text-muted-foreground">Not available</div>}
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardContent className="p-0">
                    <Tabs defaultValue="all">
                        <TabsList className="p-2 h-auto m-2">
                            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                            <TabsTrigger value="used">Used ({stats.used})</TabsTrigger>
                            <TabsTrigger value="unused" className="text-amber-600">Unused ({stats.unused})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="p-4 pt-0">
                            {renderTable(images)}
                        </TabsContent>
                        <TabsContent value="used" className="p-4 pt-0">
                            {renderTable(usedImages)}
                        </TabsContent>
                        <TabsContent value="unused" className="p-4 pt-0">
                             <div className="flex items-center justify-end p-2">
                                {selectedImages.length > 0 && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={deletingId !== null}>
                                            {deletingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                            Delete Selected ({selectedImages.length})
                                        </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete {selectedImages.length} image(s) from Cloudinary. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(selectedImages)}
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    Yes, Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                            {renderTable(unusedImages, true)}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}

    