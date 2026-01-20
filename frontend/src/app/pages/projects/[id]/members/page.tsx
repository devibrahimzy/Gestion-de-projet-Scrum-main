import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { projectsService } from "@/features/projects/projects.service";
import { usersService } from "@/features/users/users.service";
import { ProjectMemberWithUser } from "@/features/projects/projects.types";
import { User } from "@/features/auth/auth.types";
import { PlusCircle, Trash2, UserPlus } from "lucide-react";

type MemberRole = 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'TEAM_MEMBER';

const roleDisplayNames: Record<MemberRole, string> = {
    PRODUCT_OWNER: "Product Owner",
    SCRUM_MASTER: "Scrum Master",
    TEAM_MEMBER: "Team Member",
};

export default function MembersPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const { toast } = useToast();

    const [members, setMembers] = useState<ProjectMemberWithUser[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddMemberOpen, setAddMemberOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState<MemberRole>("TEAM_MEMBER");

    const fetchMembers = async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const projectMembers = await projectsService.getMembers(projectId);
            setMembers(projectMembers);
        } catch (error) {
            toast({
                title: "Error fetching members",
                description: "Could not load project members. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const users = await usersService.getAll();
            setAllUsers(users);
        } catch (error) {
            toast({
                title: "Error fetching users",
                description: "Could not load users for invitation.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchAllUsers();
    }, [projectId]);

    const handleAddMember = async () => {
        if (!projectId || !selectedUser) {
            toast({ title: "Please select a user.", variant: "destructive" });
            return;
        }

        try {
            await projectsService.addMember({
                project_id: projectId,
                user_id: selectedUser,
                role: selectedRole,
            });
            toast({ title: "Member added successfully!" });
            fetchMembers(); // Refresh member list
            setAddMemberOpen(false);
            setSelectedUser("");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
            toast({
                title: "Failed to add member",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!projectId) return;

        if (!window.confirm("Are you sure you want to remove this member?")) return;

        try {
            await projectsService.removeMember(projectId, userId);
            toast({ title: "Member removed successfully!" });
            fetchMembers(); // Refresh member list
        } catch (error) {
            toast({
                title: "Failed to remove member",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    const availableUsers = useMemo(() => {
        const memberIds = new Set(members.map(m => m.id));
        return allUsers.filter(u => !memberIds.has(u.id) && u.role !== 'ADMIN');
    }, [allUsers, members]);


    if (loading) {
        return <div>Loading members...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Project Members</h1>
                <Dialog open={isAddMemberOpen} onOpenChange={setAddMemberOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a new member</DialogTitle>
                            <DialogDescription>
                                Select a user and assign them a role in the project.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Select onValueChange={setSelectedUser} value={selectedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user to add" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(value) => setSelectedRole(value as MemberRole)} value={selectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roleDisplayNames).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>{value}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddMember}>Add Member</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length > 0 ? (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.first_name} {member.last_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                                    <TableCell>{roleDisplayNames[member.role]}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveMember(member.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No members found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}