import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { retrospectivesService } from "@/features/retrospectives/retrospectives.service";
import { Retrospective, RetroItem, CreateRetroItemDTO } from "@/features/retrospectives/retrospectives.types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { PlusCircle, ThumbsUp, Check, Trash2 } from "lucide-react";

type RetroCategory = 'POSITIVE' | 'IMPROVE' | 'ACTION';

const categoryTitles: Record<RetroCategory, string> = {
    POSITIVE: "What went well?",
    IMPROVE: "What could be improved?",
    ACTION: "Action Items",
};

export default function RetrospectivePage() {
    const { sprintId } = useParams<{ sprintId: string }>();
    const { toast } = useToast();
    const { user } = useAuthStore();

    const [retrospective, setRetrospective] = useState<Retrospective | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newItemText, setNewItemText] = useState("");
    const [newItemCategory, setNewItemCategory] = useState<RetroCategory>('POSITIVE');

    const fetchRetrospective = useCallback(async () => {
        if (!sprintId) return;
        try {
            setLoading(true);
            const retroData = await retrospectivesService.getBySprint(sprintId);
            setRetrospective(retroData);
        } catch (error: any) {
            if (error.response?.status === 404) {
                setRetrospective(null); // No retro found
            } else {
                toast({ title: "Error fetching retrospective", variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    }, [sprintId, toast]);

    useEffect(() => {
        fetchRetrospective();
    }, [fetchRetrospective]);

    const handleCreateRetrospective = async () => {
        if (!sprintId) return;
        try {
            await retrospectivesService.create({ sprint_id: sprintId, date: new Date().toISOString() });
            toast({ title: "Retrospective created!" });
            fetchRetrospective();
        } catch (error) {
            toast({ title: "Failed to create retrospective", variant: "destructive" });
        }
    };

    const handleAddItem = async () => {
        if (!retrospective || !newItemText) {
            toast({ title: "Please enter some text.", variant: "destructive" });
            return;
        }

        const dto: CreateRetroItemDTO = {
            retrospective_id: retrospective.id,
            text: newItemText,
            category: newItemCategory,
        };

        try {
            await retrospectivesService.addItem(dto);
            toast({ title: "Item added!" });
            fetchRetrospective(); // Refresh data
            setAddModalOpen(false);
            setNewItemText("");
        } catch (error) {
            toast({ title: "Failed to add item", variant: "destructive" });
        }
    };

    const handleVote = async (itemId: string) => {
        try {
            await retrospectivesService.voteItem(itemId);
            toast({ title: "Vote counted!" });
            fetchRetrospective();
        } catch (error) {
             toast({ title: "Failed to vote", variant: "destructive" });
        }
    };
    
    const handleToggleActionItem = async (item: RetroItem) => {
        try {
            await retrospectivesService.updateItemStatus(item.id, !item.is_completed);
            toast({ title: `Action item ${!item.is_completed ? 'completed' : 're-opened'}!` });
            fetchRetrospective();
        } catch (error) {
            toast({ title: "Failed to update item", variant: "destructive" });
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
    }

    const openAddModal = (category: RetroCategory) => {
        setNewItemCategory(category);
        setAddModalOpen(true);
    };

    if (loading) return <div>Loading retrospective...</div>;

    if (!retrospective) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl mb-4">No Retrospective Found</h1>
                <p className="mb-4">A retrospective for this sprint has not been created yet.</p>
                <Button onClick={handleCreateRetrospective}>Create Retrospective</Button>
            </div>
        );
    }
    
    const columns = {
        POSITIVE: retrospective.items?.filter(i => i.category === 'POSITIVE') || [],
        IMPROVE: retrospective.items?.filter(i => i.category === 'IMPROVE') || [],
        ACTION: retrospective.items?.filter(i => i.category === 'ACTION') || [],
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Sprint Retrospective</h1>
             <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add to: {categoryTitles[newItemCategory]}</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Your thoughts..."
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddItem}>Add Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(Object.keys(columns) as RetroCategory[]).map(category => (
                    <div key={category} className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                        <h2 className="font-bold text-lg mb-4 text-center">{categoryTitles[category]}</h2>
                        <Button variant="outline" size="sm" className="w-full mb-4" onClick={() => openAddModal(category)}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Item
                        </Button>
                        <div className="space-y-4">
                           {columns[category].map(item => (
                               <Card key={item.id} className={`${item.category === 'ACTION' && item.is_completed ? 'bg-green-100 dark:bg-green-900/50' : 'bg-white dark:bg-gray-800'}`}>
                                   <CardContent className="p-4 text-sm">
                                       <p className={`${item.category === 'ACTION' && item.is_completed ? 'line-through' : ''}`}>{item.text}</p>
                                   </CardContent>
                                   <CardFooter className="p-2 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                                       <div className="flex items-center gap-2">
                                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVote(item.id)}>
                                               <ThumbsUp className="h-4 w-4" />
                                           </Button>
                                           <span className="text-xs font-bold">{item.votes}</span>
                                       </div>
                                        <div className="flex items-center gap-2">
                                            {item.category === 'ACTION' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActionItem(item)}>
                                                    <Check className={`h-4 w-4 ${item.is_completed ? 'text-green-500' : ''}`} />
                                                </Button>
                                            )}
                                            {item.author_id === user?.id && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                   </CardFooter>
                               </Card>
                           ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}