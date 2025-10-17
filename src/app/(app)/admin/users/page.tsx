
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
} from "@/components/ui/alert-dialog";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, doc, updateDoc } from 'firebase/firestore';
import React, { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Label } from '@/components/ui/label';

const ADMIN_SECRET_CODE = "AD642531";
const USER_SECRET_CODE = "US642531";

export default function ManageUsersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [roleFilter, setRoleFilter] = useState('all');
  const [secretCode, setSecretCode] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<'promote' | 'demote' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const usersCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const usersQuery = useMemo(() => {
    if (!usersCollectionRef) return null;
    return query(usersCollectionRef);
  }, [usersCollectionRef]);

  const {
    data: allUsers,
    loading,
    error,
  } = useCollection<UserProfile>(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    if (roleFilter === 'all') return allUsers;
    return allUsers.filter((user) => user.role === roleFilter);
  }, [allUsers, roleFilter]);
  
  const handleRoleChange = async () => {
    if (!firestore || !selectedUser || !actionType) return;

    const targetRole = actionType === 'promote' ? 'admin' : 'user';
    const requiredCode = actionType === 'promote' ? ADMIN_SECRET_CODE : USER_SECRET_CODE;
    
    if (secretCode !== requiredCode) {
        toast({
            variant: "destructive",
            title: "Incorrect Secret Code",
            description: "The secret code you entered is not valid. Please try again.",
        });
        setSecretCode('');
        return;
    }
    
    setIsUpdating(true);
    const userDocRef = doc(firestore, 'users', selectedUser.uid);
    try {
        await updateDoc(userDocRef, { role: targetRole });
        toast({
            title: "User Role Updated",
            description: `${selectedUser.displayName || selectedUser.email} has been ${actionType === 'promote' ? 'promoted to Admin' : 'demoted to User'}.`,
        });
        setSelectedUser(null);
        setSecretCode('');
        setActionType(null);
    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: e.message || "Could not update the user's role.",
        });
    } finally {
        setIsUpdating(false);
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>
              {loading
                ? 'Loading users...'
                : `Showing ${filteredUsers?.length} of ${allUsers?.length || 0} users.`}
            </CardDescription>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[180px] mt-4 md:mt-0">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                       <TableCell className="text-right">
                        <Skeleton className="h-8 w-24 rounded-md ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-destructive"
                    >
                      Error loading users: {error.message}
                    </TableCell>
                  </TableRow>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                            <AvatarFallback>
                              {user.displayName?.charAt(0) || user.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {user.displayName || 'No Name'}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                       <TableCell className="text-right">
                        <AlertDialog onOpenChange={(open) => {if (!open) { setSelectedUser(null); setActionType(null); setSecretCode(''); }}}>
                            {user.role === 'user' ? (
                                <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setActionType('promote'); }}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Make Admin
                                </Button>
                                </AlertDialogTrigger>
                            ) : (
                                <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => { setSelectedUser(user); setActionType('demote'); }}>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Make User
                                </Button>
                                </AlertDialogTrigger>
                            )}
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                                {actionType === 'promote' ? (
                                <AlertDialogDescription>
                                  To upgrade <span className="font-bold">{selectedUser?.displayName || selectedUser?.email}</span> to an Admin role, please enter the secret code.
                                </AlertDialogDescription>
                                ) : (
                                <AlertDialogDescription>
                                   To downgrade <span className="font-bold">{selectedUser?.displayName || selectedUser?.email}</span> to a User role, please enter the secret code.
                                </AlertDialogDescription>
                                )}
                              </AlertDialogHeader>
                              <div className="space-y-2">
                                <Label htmlFor="secret-code">Secret Code</Label>
                                <Input 
                                    id="secret-code"
                                    type="password"
                                    value={secretCode}
                                    onChange={(e) => setSecretCode(e.target.value)}
                                    placeholder="Enter secret code"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleRoleChange} disabled={isUpdating || !secretCode}>
                                    {isUpdating ? "Updating..." : "Confirm Role Change"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
