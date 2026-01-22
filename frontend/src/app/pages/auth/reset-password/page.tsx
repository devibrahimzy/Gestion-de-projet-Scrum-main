import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authService } from "@/features/auth/auth.service";
import { useToast } from "@/hooks/use-toast";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/features/auth/auth.validation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof ResetPasswordFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    if (!email) {
      const errorMessage = "Email is required. Please go back to forgot password.";
      setApiError(errorMessage);
      toast({
        title: "Missing Email",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Validate with Zod
    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<ResetPasswordFormData> = {};
      result.error.errors.forEach((error) => {
        const path = error.path[0] as string;
        fieldErrors[path as keyof ResetPasswordFormData] = error.message as any;
      });
      setErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please check the form and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(formData.code, formData.password, email);

      setSuccess(true);
      toast({
        title: "Success",
        description: "Password reset successfully! Redirecting to login...",
        variant: "default",
      });

      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setApiError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted animate-fade-in">
        <div className="w-full max-w-md">
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Invalid Link</CardTitle>
              <CardDescription>
                Email parameter is missing. Please go back to forgot password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth/forgot-password" className="inline-block w-full">
                <Button className="w-full">Request Reset Code</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted animate-fade-in">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            Enter the reset code from your email and your new password
          </p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter the 6-character code sent to {email} and choose a new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {apiError && (
                <Alert variant="destructive" className="animate-fade-up">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950 animate-fade-up">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Password reset successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Reset Code
                </Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="ABC123"
                  disabled={isLoading || success}
                  className={`transition-colors text-center tracking-widest uppercase ${
                    errors.code ? "border-red-500" : ""
                  }`}
                  maxLength={6}
                  required
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  disabled={isLoading || success}
                  className={`transition-colors ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  disabled={isLoading || success}
                  className={`transition-colors ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || success}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-sm text-muted-foreground">
                <Link
                  to="/auth/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
