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
import { Shield, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import {
  registerStaff,
  isValidEmail,
  isValidWallet,
  type StaffRegistration,
} from "@/lib/auth";
import { toast } from "sonner";

export default function StaffRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StaffRegistration>({
    name: "",
    email: "",
    walletAddress: "",
    organization: "",
  });
  const [errors, setErrors] = useState<Partial<StaffRegistration>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof StaffRegistration, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StaffRegistration> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization is required";
    } else if (formData.organization.trim().length < 2) {
      newErrors.organization =
        "Organization name must be at least 2 characters";
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
      // Register the staff member
      const profile = registerStaff(formData);

      toast.success("Registration Successful!", {
        description: `Account created for ${profile.name}! Please sign in to access your dashboard.`,
      });

      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        navigate("/signin/staff");
      }, 1500);
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error("Registration Failed", {
        description:
          error.message ||
          "Please try again or contact support if the issue persists.",
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
              <Badge variant="secondary">Staff Registration</Badge>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/register"
                className="text-gray-700 hover:text-primary flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Roles
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Staff Registration
          </h1>
          <p className="text-gray-600">
            Join as a verifier to help validate and verify academic credentials
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Staff Account</CardTitle>
            <CardDescription>
              Register as a verification staff member for your organization
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@organization.com"
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

              {/* Organization Field */}
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="Your organization or company name"
                  value={formData.organization}
                  onChange={(e) =>
                    handleInputChange("organization", e.target.value)
                  }
                  className={errors.organization ? "border-red-500" : ""}
                />
                {errors.organization && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.organization}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  The organization you represent for credential verification
                </p>
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
                  Connect your Petra or Martian wallet to get your address
                </p>
              </div>

              {/* Info Alert */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  As staff, you'll be able to verify student credentials, check
                  wallet NFTs, and provide verification services for your
                  organization.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Staff Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/signin/staff" className="text-primary hover:underline">
              Sign In to Staff Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
