import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { projectsService } from "@/features/projects/projects.service";
import { XCircle, Loader2 } from "lucide-react";

export default function RefuseInvitationPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [refused, setRefused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const refuseInvitation = async () => {
            if (!token) {
                setError("Invalid invitation link");
                setLoading(false);
                return;
            }

            try {
                await projectsService.refuseInvitation(token);
                setRefused(true);
                toast({
                    title: "Invitation refused",
                    description: "You have declined the project invitation.",
                });
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || "Failed to refuse invitation";
                setError(errorMessage);
                toast({
                    title: "Failed to refuse invitation",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        refuseInvitation();
    }, [token, toast]);

    const handleContinue = () => {
        navigate("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p className="text-muted-foreground">Processing...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <XCircle className="h-12 w-12 text-orange-500" />
                    </div>
                    <CardTitle>
                        {refused ? "Invitation Refused" : "Failed to Process Request"}
                    </CardTitle>
                    <CardDescription>
                        {refused
                            ? "You have declined the project invitation. If you change your mind, you can ask the project administrator to send you a new invitation."
                            : error || "There was an error processing your request. Please try again or contact the project administrator."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button onClick={handleContinue} className="w-full">
                        Go to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}