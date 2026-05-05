import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForma } from "@/store/forma";
import { register, setAuthToken } from "@/services/api";

export const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuthToken: setStoreToken, setUser, setIsAuthenticated } = useForma();
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
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
      // Call backend registration API
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      if (response.success && response.data) {
        // Store token
        setAuthToken(response.data.access_token);
        setStoreToken(response.data.access_token);
        setIsAuthenticated(true);
        
        // Store user info
        setUser({
          id: "",
          email: formData.email,
          name: formData.name,
          created_at: new Date().toISOString(),
        });
        
        toast({
          title: "Success",
          description: "Your account has been created successfully!",
        });
        
        // Redirect to /overview
        navigate("/overview");
      } else {
        setGeneralError(response.error || "Registration failed. Please try again.");
        toast({
          title: "Error",
          description: response.error || "Registration failed",
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
            maison<span className="italic text-primary">.</span>
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
              <h1 className="font-display text-4xl tracking-tight">Create account</h1>
              <p className="text-muted-foreground text-lg">
                Get started designing your interior spaces today
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
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.name ? "border-destructive focus:border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

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
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <button
                onClick={() => navigate("/signin")}
                className="text-primary hover:opacity-80 transition-opacity font-medium"
              >
                Sign in
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

export default SignUp;
