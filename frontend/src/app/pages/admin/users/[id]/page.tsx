import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usersService } from "@/features/users/users.service";
import { User } from "@/features/auth/auth.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const AdminUserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const userData = await usersService.getById(id);
        setUser(userData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch user details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, toast]);

  const handleUpdateRole = async (newRole: User["role"]) => {
    if (!user) return;
    try {
      await usersService.update(user.id, { role: newRole });
      setUser((prevUser) => (prevUser ? { ...prevUser, role: newRole } : null));
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
  };

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      await usersService.update(user.id, { isActive: !user.isActive });
      setUser((prevUser) =>
        prevUser ? { ...prevUser, isActive: !prevUser.isActive } : null
      );
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

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName ? firstName[0] : ""}${lastName ? lastName[0] : ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center text-muted-foreground">
        User not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 animate-fade-in">
      <div className="mb-6">
        <Link to="/admin/users">
          <Button variant="outline" className="mb-4">
            ← Back to Users
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Details</h1>
        <p className="text-muted-foreground mt-2">Manage specific user account and permissions</p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {user.email}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={user.isActive ? "default" : "destructive"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
            <Select onValueChange={handleUpdateRole} value={user.role}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SCRUM_MASTER">Scrum Master</SelectItem>
                <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Account Status</h3>
              <p>
                Status:{" "}
                <Badge variant={user.isActive ? "default" : "destructive"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </p>
              <Button
                variant={user.isActive ? "destructive" : "default"}
                onClick={handleToggleActive}
                className="mt-4"
              >
                {user.isActive ? "Deactivate User" : "Activate User"}
              </Button>
            </div>
            {/* Placeholder for Activity Metadata */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Activity Metadata</h3>
              <p className="text-sm text-muted-foreground">Last Login: N/A</p>
              <p className="text-sm text-muted-foreground">Joined Date: N/A</p>
              {/* Add more activity metadata here */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserDetailsPage;
