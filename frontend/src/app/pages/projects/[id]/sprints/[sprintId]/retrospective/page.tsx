import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { retrospectivesService } from "@/features/retrospectives/retrospectives.service";
import { useRetrospectivesStore } from "@/features/retrospectives/retrospectives.store";
import {
    Retrospective,
    RetroItem,
    CreateRetroItemDTO,
    UpdateRetroItemDTO,
    UserVotingStatus,
    RetroSettings
} from "@/features/retrospectives/retrospectives.types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  PlusCircle,
  ThumbsUp,
  ThumbsDown,
  Check,
  Trash2,
  Settings,
  Download,
  Users,
  Calendar,
  User,
  Eye,
  EyeOff,
  Vote,
  Target
} from "lucide-react";
import { format } from "date-fns";

type RetroCategory = 'POSITIVE' | 'IMPROVE' | 'ACTION';

const categoryTitles: Record<RetroCategory, string> = {
    POSITIVE: "What went well?",
    IMPROVE: "What could be improved?",
    ACTION: "Action Items",
};

const categoryColors: Record<RetroCategory, string> = {
    POSITIVE: "bg-green-50 border-green-200 dark:bg-green-950/20",
    IMPROVE: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20",
    ACTION: "bg-blue-50 border-blue-200 dark:bg-blue-950/20",
};

const categoryIcons: Record<RetroCategory, React.ReactNode> = {
    POSITIVE: <ThumbsUp className="h-5 w-5 text-green-600" />,
    IMPROVE: <Target className="h-5 w-5 text-yellow-600" />,
    ACTION: <Check className="h-5 w-5 text-blue-600" />,
};

export default function RetrospectivePage() {
    const { sprintId, id: projectId } = useParams<{ sprintId: string; id: string }>();
    const { toast } = useToast();
    const { user } = useAuthStore();

    const {
        currentRetro,
        userVotingStatus,
        settings,
        loading,
        setCurrentRetro,
        setUserVotingStatus,
        setSettings,
        updateRetroItem,
        getSortedItemsByCategory,
        canUserVote,
        getRemainingVotes,
        setLoading,
        setError
    } = useRetrospectivesStore();

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedActionItem, setSelectedActionItem] = useState<RetroItem | null>(null);
    const [newItemText, setNewItemText] = useState("");
    const [newItemCategory, setNewItemCategory] = useState<RetroCategory>('POSITIVE');
    const [actionAssignee, setActionAssignee] = useState("");
    const [actionDueDate, setActionDueDate] = useState("");

    const fetchRetrospective = useCallback(async () => {
        if (!sprintId) return;
        try {
            setLoading(true);
            const retroData = await retrospectivesService.getBySprint(sprintId);
            if (retroData) {
                setCurrentRetro(retroData);

                // Fetch voting status and settings
                const votingStatus = await retrospectivesService.getUserVotingStatus(retroData.id);
                setUserVotingStatus(votingStatus);

                // Set settings from retrospective
                setSettings({
                    is_anonymous: retroData.is_anonymous,
                    votes_per_user: retroData.votes_per_user,
                    allow_multiple_votes: retroData.allow_multiple_votes
                });
            } else {
                setCurrentRetro(null);
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                setCurrentRetro(null);
            } else {
                setError("Error fetching retrospective");
                toast({ title: "Error fetching retrospective", variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    }, [sprintId, toast, setCurrentRetro, setUserVotingStatus, setSettings, setLoading, setError]);

    useEffect(() => {
        fetchRetrospective();
    }, [fetchRetrospective]);

    const handleCreateRetrospective = async () => {
        if (!sprintId) return;
        try {
            const retroData = await retrospectivesService.create({
                sprint_id: sprintId,
                date: new Date().toISOString(),
                is_anonymous: false,
                votes_per_user: 3,
                allow_multiple_votes: false
            });
            toast({ title: "Retrospective created!" });
            fetchRetrospective();
        } catch (error) {
            toast({ title: "Failed to create retrospective", variant: "destructive" });
        }
    };

    const handleAddItem = async () => {
        if (!currentRetro || !newItemText.trim()) {
            toast({ title: "Please enter some text.", variant: "destructive" });
            return;
        }

        const dto: CreateRetroItemDTO = {
            retrospective_id: currentRetro.id,
            text: newItemText.trim(),
            category: newItemCategory,
        };

        try {
            await retrospectivesService.addItem(dto);
            toast({ title: "Item added!" });
            fetchRetrospective();
            setAddModalOpen(false);
            setNewItemText("");
        } catch (error) {
            toast({ title: "Failed to add item", variant: "destructive" });
        }
    };

    const handleVote = async (itemId: string) => {
        try {
            const result = await retrospectivesService.voteItem(itemId);
            if (result.can_vote) {
                toast({ title: "Vote recorded!" });
                fetchRetrospective(); // Refresh to get updated vote counts
            } else {
                toast({ title: "No votes remaining for this category", variant: "destructive" });
            }
        } catch (error: any) {
            toast({ title: error.response?.data?.message || "Failed to vote", variant: "destructive" });
        }
    };

    const handleUnvote = async (itemId: string) => {
        try {
            await retrospectivesService.unvoteItem(itemId);
            toast({ title: "Vote removed!" });
            fetchRetrospective();
        } catch (error) {
            toast({ title: "Failed to remove vote", variant: "destructive" });
        }
    };

    const handleToggleActionItem = async (item: RetroItem) => {
        try {
            await retrospectivesService.updateItemStatus(item.id, !item.is_completed);
            updateRetroItem(item.id, { is_completed: !item.is_completed });
            toast({ title: `Action item ${!item.is_completed ? 'completed' : 're-opened'}!` });
        } catch (error) {
            toast({ title: "Failed to update item", variant: "destructive" });
        }
    };

    const handleAssignActionItem = async () => {
        if (!selectedActionItem || !actionAssignee) return;

        try {
            const updates: UpdateRetroItemDTO = {
                assigned_to_id: actionAssignee,
                due_date: actionDueDate || undefined,
            };

            await retrospectivesService.updateItem(selectedActionItem.id, updates);
            updateRetroItem(selectedActionItem.id, {
                assigned_to_id: actionAssignee,
                assigned_to_name: "Assignee", // Would need to fetch actual name
                due_date: actionDueDate
            });
            toast({ title: "Action item assigned!" });
            setIsActionModalOpen(false);
            setSelectedActionItem(null);
            setActionAssignee("");
            setActionDueDate("");
        } catch (error) {
            toast({ title: "Failed to assign action item", variant: "destructive" });
        }
    };

    const handleUpdateSettings = async (newSettings: RetroSettings) => {
        if (!currentRetro) return;

        try {
            await retrospectivesService.updateSettings(currentRetro.id, newSettings);
            setSettings(newSettings);
            toast({ title: "Settings updated!" });
            setIsSettingsModalOpen(false);
        } catch (error) {
            toast({ title: "Failed to update settings", variant: "destructive" });
        }
    };

    const handlePublishRetrospective = async () => {
        if (!currentRetro) return;

        try {
            await retrospectivesService.publish(currentRetro.id);
            setCurrentRetro({ ...currentRetro, status: 'PUBLISHED' });
            toast({ title: "Retrospective published!" });
        } catch (error) {
            toast({ title: "Failed to publish retrospective", variant: "destructive" });
        }
    };

    const handleExportPDF = async () => {
        if (!currentRetro) return;

        try {
            const blob = await retrospectivesService.exportPDF(currentRetro.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `retrospective-${currentRetro.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: "PDF exported successfully!" });
        } catch (error) {
            toast({ title: "Failed to export PDF", variant: "destructive" });
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await retrospectivesService.deleteItem(itemId);
            toast({ title: "Item deleted" });
            fetchRetrospective();
        } catch (error) {
            toast({ title: "Failed to delete item", variant: "destructive" });
        }
    };

    const openAddModal = (category: RetroCategory) => {
        setNewItemCategory(category);
        setAddModalOpen(true);
    };

    const openActionModal = (item: RetroItem) => {
        setSelectedActionItem(item);
        setActionAssignee(item.assigned_to_id || "");
        setActionDueDate(item.due_date || "");
        setIsActionModalOpen(true);
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading retrospective...</div>;

    if (!currentRetro) {
        return (
            <div className="container mx-auto py-8 text-center">
                <div className="max-w-md mx-auto">
                    <div className="mb-6">
                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">No Retrospective Found</h1>
                        <p className="text-gray-600">
                            A retrospective for this sprint has not been created yet. Create one to start the retrospective process.
                        </p>
                    </div>
                    <Button onClick={handleCreateRetrospective} size="lg">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Retrospective
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Sprint Retrospective</h1>
                    <p className="text-gray-600 mt-1">
                        {currentRetro.status === 'DRAFT' ? 'Draft - Collecting feedback' : 'Published - Final results'}
                    </p>
                </div>

                <div className="flex gap-2">
                    {currentRetro.status === 'DRAFT' && (
                        <>
                            <Button variant="outline" onClick={() => setIsSettingsModalOpen(true)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                            <Button variant="outline" onClick={handlePublishRetrospective}>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                            </Button>
                        </>
                    )}
                    <Button variant="outline" onClick={handleExportPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Voting Status */}
            {userVotingStatus && settings && (
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Vote className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium">Your Voting Status</p>
                                    <p className="text-sm text-gray-600">
                                        {settings.is_anonymous ? 'Anonymous voting enabled' : 'Signed voting enabled'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                {(['POSITIVE', 'IMPROVE', 'ACTION'] as RetroCategory[]).map(category => (
                                    <div key={category} className="text-center">
                                        <p className="text-sm font-medium">{categoryTitles[category].split(' ')[0]}</p>
                                        <p className="text-lg font-bold text-blue-600">
                                            {getRemainingVotes(category)}/{settings.votes_per_user}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Item Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {categoryIcons[newItemCategory]}
                            Add to: {categoryTitles[newItemCategory]}
                        </DialogTitle>
                        <DialogDescription>
                            Share your thoughts about this sprint.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="What would you like to share?"
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddItem} disabled={!newItemText.trim()}>
                            Add Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Settings Dialog */}
            <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Retrospective Settings</DialogTitle>
                        <DialogDescription>
                            Configure how the retrospective works for your team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="anonymous"
                                checked={settings?.is_anonymous || false}
                                onCheckedChange={(checked) =>
                                    handleUpdateSettings({
                                        ...settings!,
                                        is_anonymous: checked as boolean
                                    })
                                }
                            />
                            <Label htmlFor="anonymous" className="flex items-center gap-2">
                                {settings?.is_anonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                Anonymous voting
                            </Label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Votes per user per category</Label>
                                <Select
                                    value={settings?.votes_per_user?.toString() || "3"}
                                    onValueChange={(value) =>
                                        handleUpdateSettings({
                                            ...settings!,
                                            votes_per_user: parseInt(value)
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 vote</SelectItem>
                                        <SelectItem value="2">2 votes</SelectItem>
                                        <SelectItem value="3">3 votes</SelectItem>
                                        <SelectItem value="5">5 votes</SelectItem>
                                        <SelectItem value="10">10 votes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Multiple votes per item</Label>
                                <Select
                                    value={settings?.allow_multiple_votes?.toString() || "false"}
                                    onValueChange={(value) =>
                                        handleUpdateSettings({
                                            ...settings!,
                                            allow_multiple_votes: value === "true"
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">No</SelectItem>
                                        <SelectItem value="true">Yes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsSettingsModalOpen(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Action Assignment Dialog */}
            <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Action Item</DialogTitle>
                        <DialogDescription>
                            Assign responsibility and set a due date for this action item.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Action Item</Label>
                            <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                                {selectedActionItem?.text}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="assignee">Assignee</Label>
                            <Select value={actionAssignee} onValueChange={setActionAssignee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select team member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* TODO: Populate with actual team members */}
                                    <SelectItem value="user1">John Doe</SelectItem>
                                    <SelectItem value="user2">Jane Smith</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="due-date">Due Date</Label>
                            <Input
                                id="due-date"
                                type="date"
                                value={actionDueDate}
                                onChange={(e) => setActionDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignActionItem} disabled={!actionAssignee}>
                            Assign Action
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Retrospective Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(Object.keys(categoryTitles) as RetroCategory[]).map(category => {
                    const sortedItems = getSortedItemsByCategory(category);
                    const remainingVotes = getRemainingVotes(category);
                    const canVote = canUserVote(category);

                    return (
                        <Card key={category} className={categoryColors[category]}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {categoryIcons[category]}
                                        <CardTitle className="text-lg">{categoryTitles[category]}</CardTitle>
                                    </div>
                                    <Badge variant="secondary">
                                        {sortedItems.length}
                                    </Badge>
                                </div>
                                {category !== 'ACTION' && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {remainingVotes} votes remaining
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {currentRetro.status === 'DRAFT' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => openAddModal(category)}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                )}

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {sortedItems.map(item => (
                                        <Card key={item.id} className="bg-white dark:bg-gray-800 shadow-sm">
                                            <CardContent className="p-3">
                                                <p className={`text-sm ${item.is_completed ? 'line-through text-gray-500' : ''}`}>
                                                    {item.text}
                                                </p>

                                                {item.category === 'ACTION' && item.assigned_to_name && (
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                                                        <User className="h-3 w-3" />
                                                        <span>{item.assigned_to_name}</span>
                                                        {item.due_date && (
                                                            <>
                                                                <Calendar className="h-3 w-3 ml-2" />
                                                                <span>{format(new Date(item.due_date), 'MMM dd')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {!settings?.is_anonymous && item.author_name && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        by {item.author_name}
                                                    </p>
                                                )}
                                            </CardContent>
                                            <CardFooter className="p-2 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                                                <div className="flex items-center gap-1">
                                                    {item.category !== 'ACTION' ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0"
                                                                onClick={() => canVote ? handleVote(item.id) : null}
                                                                disabled={!canVote}
                                                            >
                                                                <ThumbsUp className={`h-3 w-3 ${canVote ? 'text-blue-600' : 'text-gray-400'}`} />
                                                            </Button>
                                                            <span className="text-xs font-medium min-w-6 text-center">{item.votes}</span>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => handleToggleActionItem(item)}
                                                        >
                                                            <Check className={`h-3 w-3 ${item.is_completed ? 'text-green-600' : 'text-gray-400'}`} />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {item.category === 'ACTION' && currentRetro.status === 'DRAFT' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => openActionModal(item)}
                                                        >
                                                            <User className="h-3 w-3" />
                                                        </Button>
                                                    )}

                                                    {(item.author_id === user?.id || currentRetro.facilitator_id === user?.id) && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="text-destructive"
                                                                >
                                                                    Delete Item
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}

                                    {sortedItems.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm">No items yet</p>
                                            <p className="text-xs">Add the first item to get started</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}