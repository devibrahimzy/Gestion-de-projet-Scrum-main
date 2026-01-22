import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { authService } from "@/features/auth/auth.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2, User, Mail, Shield, Lock, Calendar, Clock, FolderOpen, Camera } from "lucide-react";

export default function ProfilePage() {
    const { user, isAuthenticated, setUser } = useAuthStore();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        profile_photo: "",
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await authService.getProfile();
                setProfileData(profile);
                setFormData({
                    first_name: profile.first_name || "",
                    last_name: profile.last_name || "",
                    profile_photo: profile.profile_photo || "",
                });
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated || !user) {
        return <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>;
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            const updateData = {
                first_name: formData.first_name || undefined,
                last_name: formData.last_name || undefined,
                profile_photo: formData.profile_photo || undefined,
            };

            await authService.updateProfile(updateData);

            // Update local user data
            const updatedUser = { ...user, ...updateData };
            setUser(updatedUser);

            // Update localStorage
            localStorage.setItem("authUser", JSON.stringify(updatedUser));

            toast({ title: "Profile updated successfully!" });
            setIsEditing(false);
        } catch (error) {
            toast({
                title: "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: profileData?.first_name || "",
            last_name: profileData?.last_name || "",
            profile_photo: profileData?.profile_photo || "",
        });
        setIsEditing(false);
    };

    const handlePasswordInputChange = (field: string, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast({ title: "Please fill all password fields", variant: "destructive" });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({ title: "New passwords do not match", variant: "destructive" });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast({ title: "Password must be at least 6 characters long", variant: "destructive" });
            return;
        }

        try {
            setIsPasswordLoading(true);
            await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);

            toast({ title: "Password changed successfully!" });

            // Reset password form
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setIsChangingPassword(false);
        } catch (error) {
            toast({
                title: "Failed to change password",
                variant: "destructive"
            });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleCancelPasswordChange = () => {
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setIsChangingPassword(false);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800';
            case 'PRODUCT_OWNER': return 'bg-purple-100 text-purple-800';
            case 'SCRUM_MASTER': return 'bg-blue-100 text-blue-800';
            case 'TEAM_MEMBER': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground mt-2">Manage your personal information</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Update your profile details
                            </CardDescription>
                        </div>
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="first-name">First Name</Label>
                            {isEditing ? (
                                <Input
                                    id="first-name"
                                    value={formData.first_name}
                                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                                    placeholder="Enter your first name"
                                />
                            ) : (
                                <p className="text-sm font-medium">
                                    {user.first_name || "Not set"}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            {isEditing ? (
                                <Input
                                    id="last-name"
                                    value={formData.last_name}
                                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                                    placeholder="Enter your last name"
                                />
                            ) : (
                                <p className="text-sm font-medium">
                                    {user.last_name || "Not set"}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile-photo" className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Profile Photo
                        </Label>
                        {isEditing ? (
                            <Input
                                id="profile-photo"
                                value={formData.profile_photo}
                                onChange={(e) => handleInputChange("profile_photo", e.target.value)}
                                placeholder="Enter profile photo URL"
                            />
                        ) : (
                            <div className="flex items-center gap-4">
                                {profileData?.profile_photo ? (
                                    <img
                                        src={profileData.profile_photo}
                                        alt="Profile"
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <p className="text-sm font-medium">
                                    {profileData?.profile_photo ? "Profile photo set" : "No profile photo"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                        </Label>
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                            Email can only be changed after email validation
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Role
                        </Label>
                        <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role.replace('_', ' ')}
                        </Badge>
                    </div>

                    {user.isActive !== undefined && (
                        <div className="space-y-2">
                            <Label>Account Status</Label>
                            <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    )}

                    {profileData?.created_at && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Registration Date
                            </Label>
                            <p className="text-sm font-medium">
                                {new Date(profileData.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {profileData?.lastLogin && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Last Login
                            </Label>
                            <p className="text-sm font-medium">
                                {new Date(profileData.lastLogin).toLocaleString()}
                            </p>
                        </div>
                    )}

                    {profileData?.projects && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                Associated Projects
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {profileData.projects.split(', ').map((project: string, index: number) => (
                                    <Badge key={index} variant="outline">
                                        {project}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure
                            </CardDescription>
                        </div>
                        {!isChangingPassword ? (
                            <Button onClick={() => setIsChangingPassword(true)}>
                                Change Password
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={handleCancelPasswordChange}
                                    disabled={isPasswordLoading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleChangePassword}
                                    disabled={isPasswordLoading}
                                >
                                    {isPasswordLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        "Change Password"
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isChangingPassword ? (
                        <div className="space-y-4">
                             <div className="space-y-2">
                                 <Label htmlFor="current-password">Current Password</Label>
                                 <Input
                                     id="current-password"
                                     type="password"
                                     value={passwordData.currentPassword}
                                     onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                                     placeholder="Enter your current password"
                                 />
                             </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                                    placeholder="Enter your new password"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                                    placeholder="Confirm your new password"
                                />
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                                Password must be at least 6 characters long
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Click "Change Password" to update your password
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}