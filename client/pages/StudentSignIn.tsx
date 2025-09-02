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
import { Users, ArrowLeft, AlertCircle, LogIn } from "lucide-react";
import {
  signInStudent,
  isValidEmail,
  isValidWallet,
  type StudentSignIn,
} from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function StudentSignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<StudentSignIn>({
    email: "",
    walletAddress: "",
  });
  const [errors, setErrors] = useState<Partial<StudentSignIn>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof StudentSignIn, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentSignIn> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required";
    } else if (!isValidWallet(formData.walletAddress)) {
      newErrors.walletAddress =
        "Please enter a valid Aptos wallet address (0x... or username.apt)";
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
      const profile = signInStudent(formData);

      if (!profile) {
        toast.error("Sign In Failed", {
          description:
            "No student account found with this email and wallet address combination. Please check your credentials or register a new account.",
        });
        return;
      }

      // Login the user
      login(profile);

      toast.success("Sign In Successful!", {
        description: `Welcome back, ${profile.name}! Redirecting to your dashboard...`,
      });

      // Redirect to student dashboard after a short delay
      setTimeout(() => {
        navigate("/student");
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
              <Badge variant="secondary">Student Sign In</Badge>
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
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Sign In
          </h1>
          <p className="text-gray-600">
            Sign in to access your credential dashboard and manage your
            achievements
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In to Your Account</CardTitle>
            <CardDescription>
              Enter your email and wallet address to access your student
              dashboard
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
                  placeholder="your.email@university.edu"
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
              </div>

              {/* Wallet Address Field */}
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Aptos Wallet Address *</Label>
                <Input
                  id="walletAddress"
                  type="text"
                  placeholder="0x1234... or username.apt"
                  value={formData.walletAddress}
                  onChange={(e) =>
                    handleInputChange("walletAddress", e.target.value)
                  }
                  className={errors.walletAddress ? "border-red-500" : ""}
                />
                {errors.walletAddress && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.walletAddress}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Use the same wallet address you registered with
                </p>
              </div>

              {/* Info Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Students need both email and wallet address to sign in for
                  security and NFT management.
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
                    Sign In
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
              to="/register/student"
              className="text-primary hover:underline"
            >
              Register as Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
