import React from "react";
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
import { Users, Shield, Award, ArrowRight } from "lucide-react";

export default function SignIn() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "student",
      title: "Student",
      description:
        "Access your credentials and manage your academic achievements",
      icon: Users,
      signInRequirements: ["Email address", "Aptos wallet address"],
      path: "/signin/student",
    },
    {
      id: "staff",
      title: "Staff (Verifier)",
      description: "Verify student credentials for your organization",
      icon: Shield,
      signInRequirements: ["Email address only"],
      path: "/signin/staff",
    },
    {
      id: "issuer",
      title: "Issuer",
      description: "Issue and manage credentials for your institution",
      icon: Award,
      signInRequirements: ["Email address only"],
      path: "/signin/issuer",
    },
  ];

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
              <Badge variant="secondary">Sign In</Badge>
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-primary">
                Home
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-primary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sign In to CredVault
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your role to sign in and access your CredVault dashboard.
            Different roles have different sign-in requirements.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card
                key={role.id}
                className="relative hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {role.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">
                      Sign-in Requirements:
                    </h4>
                    <ul className="space-y-1">
                      {role.signInRequirements.map((requirement, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-center"
                        >
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => navigate(role.path)}
                    className="w-full group-hover:bg-primary-600"
                  >
                    Sign In as {role.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 border">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Don't have an account yet?
            </h2>
            <p className="text-gray-600 mb-6">
              Register for a new account to get started with CredVault.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate("/register")}>
                Register New Account
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/signin/staff")}
              >
                Staff (Verifier) Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
