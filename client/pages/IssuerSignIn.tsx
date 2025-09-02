import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Award,
  ArrowLeft,
  AlertCircle,
  LogIn,
  CheckCircle,
} from "lucide-react";
import { signInIssuer, isValidEmail, type IssuerSignIn } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function IssuerSignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<IssuerSignIn>({
    email: "",
  });
  const [errors, setErrors] = useState<Partial<IssuerSignIn>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof IssuerSignIn, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<IssuerSignIn> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const profile = signInIssuer(formData);

      if (!profile) {
        toast.error("Sign In Failed", {
          description:
            "No issuer account found with this email address. Please check your email or register a new account.",
        });
        return;
      }

      // Login the user
      login(profile);

      toast.success("Sign In Successful!", {
        description: `Welcome back, ${profile.name}! Redirecting to your dashboard...`,
      });

      // Redirect to issuer dashboard after a short delay
      setTimeout(() => {
        navigate("/issuer");
      }, 1500);
    } catch (error: any) {
      console.error("Sign in failed:", error);
      toast.error("Sign In Failed", {
        description:
          error.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <span className="font-bold text-xl text-gray-900">CredVault</span>
              <Badge variant="secondary">Issuer Sign In</Badge>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/signin"
                className="text-gray-700 hover:text-primary flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Issuer Sign In
          </h1>
          <p className="text-gray-600">
            Sign in to access your credential minting dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In to Your Account</CardTitle>
            <CardDescription>
              Enter your email address to access your issuer dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@institution.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Use the same email address you registered with
                </p>
              </div>

              {/* Info Alert */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Issuers only need their email address to sign in. Your wallet
                  address is stored securely and used automatically for
                  credential minting.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In to Issuer Dashboard
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register/issuer"
              className="text-primary hover:underline"
            >
              Register as Issuer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
