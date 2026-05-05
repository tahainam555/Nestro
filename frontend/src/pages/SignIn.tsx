import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForma } from "@/store/forma";
import { login, setAuthToken } from "@/services/api";

export const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setAuthToken: setStoreToken, setUser, setIsAuthenticated } = useForma();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Call backend login API
      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      
      if (response.success && response.data) {
        // Store token
        setAuthToken(response.data.access_token);
        setStoreToken(response.data.access_token);
        setIsAuthenticated(true);
        
        // Optionally fetch user info and store it
        setUser({
          id: "",
          email: formData.email,
          name: "",
          created_at: new Date().toISOString(),
        });
        
        toast({
          title: "Success",
          description: "You've been signed in successfully!",
        });
        
        // Redirect to /overview or the page they came from
        const from = (location.state as any)?.from?.pathname || "/overview";
        navigate(from);
      } else {
        setGeneralError(response.error || "Login failed. Please try again.");
        toast({
          title: "Error",
          description: response.error || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
      setGeneralError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header with Logo */}
      <header className="border-b border-border/40 py-6">
        <div className="container flex items-center">
          <a
            href="/"
            className="flex items-center gap-2 font-display text-2xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
            atelier<span className="italic text-primary">.</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Form Container */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="font-display text-4xl tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground text-lg">
                Sign in to your account to continue designing
              </p>
            </div>

            {/* General Error Message */}
            {generalError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-sm text-destructive">{generalError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.email ? "border-destructive focus:border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.password ? "border-destructive focus:border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="clay"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <button
                onClick={() => navigate("/signup")}
                className="text-primary hover:opacity-80 transition-opacity font-medium"
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Atelier. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;
