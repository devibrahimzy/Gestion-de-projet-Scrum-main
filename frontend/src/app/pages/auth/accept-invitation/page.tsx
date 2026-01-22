import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { projectsService } from "@/features/projects/projects.service";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AcceptInvitationPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [accepted, setAccepted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const acceptInvitation = async () => {
            if (!token) {
                setError("Invalid invitation link");
                setLoading(false);
                return;
            }

            try {
                await projectsService.acceptInvitation(token);
                setAccepted(true);
                toast({
                    title: "Invitation accepted!",
                    description: "You have successfully joined the project.",
                });
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || "Failed to accept invitation";
                setError(errorMessage);
                toast({
                    title: "Failed to accept invitation",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        acceptInvitation();
    }, [token, toast]);

    const handleContinue = () => {
        navigate("/projects");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p className="text-muted-foreground">Accepting invitation...</p>
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
                        {accepted ? (
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        ) : (
                            <XCircle className="h-12 w-12 text-red-500" />
                        )}
                    </div>
                    <CardTitle>
                        {accepted ? "Invitation Accepted!" : "Failed to Accept Invitation"}
                    </CardTitle>
                    <CardDescription>
                        {accepted
                            ? "You have successfully joined the project. You can now access all project resources."
                            : error || "There was an error accepting your invitation. Please try again or contact the project administrator."
                        }
                    </CardDescription>
                </CardHeader>
                {accepted && (
                    <CardContent className="text-center">
                        <Button onClick={handleContinue} className="w-full">
                            Go to Projects
                        </Button>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}