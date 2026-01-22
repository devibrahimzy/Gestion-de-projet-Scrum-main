import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginFormData } from "@/features/auth/auth.validation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading, clearError, user } = useAuthStore();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [apiError, setApiError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setApiError("");
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    // Validate with Zod
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<LoginFormData> = {};
      result.error.errors.forEach((error) => {
        const path = error.path[0] as string;
        fieldErrors[path as keyof LoginFormData] = error.message as any;
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
      await login({ email: formData.email, password: formData.password });
      toast({
        title: "Success",
        description: "Logged in successfully! Redirecting...",
        variant: "default",
      });
      const authUser = useAuthStore.getState().user;
      if(authUser?.role === 'ADMIN'){
        navigate('/admin')
      }else{
        navigate("/projects");
      }
    } catch (err: any) {
      let errorMessage =
        err?.response?.data?.message || err?.message || "Login failed. Please try again.";

      // Handle unverified account - redirect to verify email page
      if (errorMessage.includes("not verified") || errorMessage.includes("verify")) {
        toast({
          title: "Account Not Verified",
          description: "Please verify your email before logging in.",
          variant: "default",
        });
        setTimeout(() => {
          navigate(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 1000);
        return;
      }

      setApiError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted animate-fade-in">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your projects
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

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className={`transition-colors ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`transition-colors ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2">⚙️</div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/auth/register"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
