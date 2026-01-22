import React, { useState, useEffect } from "react";
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
import { Input } from "@/shared/components/ui/input";
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
import { ProjectMemberWithUser } from "@/features/projects/projects.types";
import { Trash2, Mail } from "lucide-react";

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
    const [loading, setLoading] = useState(true);
    const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState<string>("");
    const [inviteRole, setInviteRole] = useState<MemberRole>("TEAM_MEMBER");

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

    useEffect(() => {
        fetchMembers();
    }, [projectId]);



    const handleInviteMember = async () => {
        if (!projectId || !inviteEmail.trim()) {
            toast({ title: "Please enter a valid email address.", variant: "destructive" });
            return;
        }

        try {
            await projectsService.inviteMember({
                project_id: projectId,
                email: inviteEmail.trim(),
                role: inviteRole,
            });
            toast({ title: "Invitation sent successfully!", description: "The user will receive an email with instructions to join the project." });
            setIsInviteMemberOpen(false);
            setInviteEmail("");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
            toast({
                title: "Failed to send invitation",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!projectId) return;

        if (!window.confirm("Are you sure you want to remove this member? Their assigned tasks will be moved back to the backlog.")) return;

        try {
            await projectsService.removeMember(projectId, userId);
            toast({ title: "Member removed successfully!", description: "Their tasks have been reassigned to the backlog." });
            fetchMembers(); // Refresh member list
        } catch (error) {
            toast({
                title: "Failed to remove member",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    const handleChangeRole = async (userId: string, newRole: MemberRole) => {
        if (!projectId) return;

        try {
            await projectsService.updateMemberRole(projectId, userId, newRole);
            toast({ title: "Member role updated successfully!" });
            fetchMembers(); // Refresh member list
        } catch (error) {
            toast({
                title: "Failed to update member role",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };




    if (loading) {
        return <div>Loading members...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Project Members</h1>

                <Dialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Mail className="mr-2 h-4 w-4" /> Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite a new member</DialogTitle>
                            <DialogDescription>
                                Send an invitation email to add someone to the project.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <Select onValueChange={(value) => setInviteRole(value as MemberRole)} value={inviteRole}>
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
                            <Button variant="ghost" onClick={() => setIsInviteMemberOpen(false)}>Cancel</Button>
                            <Button onClick={handleInviteMember}>Send Invitation</Button>
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
                                     <TableCell>
                                         <Select
                                             value={member.role}
                                             onValueChange={(value) => handleChangeRole(member.id, value as MemberRole)}
                                         >
                                             <SelectTrigger className="w-40">
                                                 <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                 {Object.entries(roleDisplayNames).map(([key, value]) => (
                                                     <SelectItem key={key} value={key}>{value}</SelectItem>
                                                 ))}
                                             </SelectContent>
                                         </Select>
                                     </TableCell>
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