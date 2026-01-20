import React, { useEffect } from "react";
import { useUsersStore } from "@/features/users/users.store";
import { usersService } from "@/features/users/users.service";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/features/auth/auth.types";
import { Link } from "react-router-dom";

export const AdminUsersPage: React.FC = () => {
  const { users, loading, setUsers, setLoading, setError, updateUser, removeUser } = useUsersStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await usersService.getAll();
        setUsers(data);
      } catch (error: any) {
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [setLoading, setUsers, setError, toast]);

  const handleToggleActive = async (user: User) => {
    try {
      await usersService.update(user.id, { isActive: !user.isActive });
      updateUser(user.id, { isActive: !user.isActive });
      toast({
        title: "Success",
        description: `User ${user.email} ${!user.isActive ? "activated" : "deactivated"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.email}?`)) {
      try {
        await usersService.delete(user.id);
        removeUser(user.id);
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin">
            <Button variant="outline">Admin Dashboard</Button>
          </Link>
          <Link to="/admin/projects">
            <Button variant="outline">Manage Projects</Button>
          </Link>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link to={`/admin/users/${user.id}`} className="flex flex-col hover:underline">
                        <span className="font-medium">{user.first_name} {user.last_name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Select
                        onValueChange={async (newRole) => {
                          try {
                            await usersService.update(user.id, { role: newRole as User['role'] });
                            updateUser(user.id, { role: newRole as User['role'] });
                            toast({
                              title: "Success",
                              description: `User ${user.email}'s role updated to ${newRole}`,
                            });
                          } catch (error: any) {
                            toast({
                              title: "Error",
                              description: "Failed to update user role",
                              variant: "destructive",
                            });
                          }
                        }}
                        value={user.role}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SCRUM_MASTER">Scrum Master</SelectItem>
                          <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "destructive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/admin/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                                View
                            </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
