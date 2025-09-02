import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import {
  getCredentialsForStudent,
  isValidWallet,
  type IssuedCredential,
} from "@/lib/auth";
import { toast } from "sonner";
import {
  Shield,
  Search,
  Calendar,
  Building,
  LogOut,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Users,
  Award,
  FileText,
  Eye,
  Clock,
  Verified,
  X,
} from "lucide-react";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchWallet, setSearchWallet] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<IssuedCredential[]>([]);
  const [verifiedCredentials, setVerifiedCredentials] = useState<Set<string>>(
    new Set(),
  );
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [currentStudent, setCurrentStudent] = useState<string>("");

  // Check if user is authenticated and is staff
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (user?.role !== "staff") {
      toast.error("Access Denied", {
        description:
          "This dashboard is only for staff members. Please register as staff.",
      });
      navigate("/register");
      return;
    }
  }, [user, isAuthenticated, navigate]);

  const handleSearch = async () => {
    if (!searchWallet.trim()) {
      toast.error("Invalid Input", {
        description: "Please enter a wallet address to search.",
      });
      return;
    }

    if (!isValidWallet(searchWallet.trim())) {
      toast.error("Invalid Wallet Address", {
        description:
          "Please enter a valid Aptos wallet address (0x... or username.apt).",
      });
      return;
    }

    setIsSearching(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const credentials = getCredentialsForStudent(searchWallet.trim());
      setSearchResults(credentials);
      setCurrentStudent(searchWallet.trim());

      // Add to search history if not already present
      if (!searchHistory.includes(searchWallet.trim())) {
        setSearchHistory((prev) => [searchWallet.trim(), ...prev.slice(0, 4)]);
      }

      if (credentials.length === 0) {
        toast.info("No Credentials Found", {
          description: "This wallet address has no issued credentials.",
        });
      } else {
        toast.success("Search Complete", {
          description: `Found ${credentials.length} credential${credentials.length === 1 ? "" : "s"} for this wallet.`,
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search Failed", {
        description: "Unable to search for credentials. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyCredential = (credentialId: string) => {
    const newVerified = new Set(verifiedCredentials);

    if (verifiedCredentials.has(credentialId)) {
      newVerified.delete(credentialId);
      toast.info("Verification Removed", {
        description: "Credential verification has been removed.",
      });
    } else {
      newVerified.add(credentialId);
      toast.success("Credential Verified", {
        description:
          "Credential has been marked as verified by your organization.",
      });
    }

    setVerifiedCredentials(newVerified);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged Out", {
      description: "You have been logged out successfully.",
    });
  };

  const clearSearch = () => {
    setSearchResults([]);
    setCurrentStudent("");
    setSearchWallet("");
  };

  // If not authenticated, show registration prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50">
        <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Link to="/" className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <span className="font-bold text-xl text-gray-900">
                    CredVault
                  </span>
                </Link>
                <Badge variant="secondary" className="ml-2">
                  Staff (Verifier)
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/student"
                  className="text-gray-700 hover:text-primary"
                >
                  Student
                </Link>
                <Link to="/issuer" className="text-gray-700 hover:text-primary">
                  Issuer
                </Link>
                <Link
                  to="/register"
                  className="text-gray-700 hover:text-primary"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Staff Registration Required
            </h2>
            <p className="text-gray-600 mb-8">
              Please register as staff to access the verification dashboard and
              manage credential verification for your organization.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/register/staff")}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Register as Staff
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/register")}
                size="lg"
                className="w-full"
              >
                View All Registration Options
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl text-gray-900">
                  CredVault
                </span>
              </Link>
              <Badge variant="secondary" className="ml-2">
                Staff (Verifier)
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <span className="text-xs text-gray-500">
                {user?.organization}
              </span>
              <Link to="/student" className="text-gray-700 hover:text-primary">
                Student
              </Link>
              <Link to="/issuer" className="text-gray-700 hover:text-primary">
                Issuer
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {user?.name?.charAt(0).toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Staff (Verifier) Dashboard
              </h1>
              <p className="text-gray-600">
                {user?.name} - {user?.organization}
              </p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{searchHistory.length}</p>
                    <p className="text-sm text-gray-600">Searches Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {verifiedCredentials.size}
                    </p>
                    <p className="text-sm text-gray-600">Verified Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{searchResults.length}</p>
                    <p className="text-sm text-gray-600">Current Results</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-gray-600">Organization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Student Credential Search</span>
            </CardTitle>
            <CardDescription>
              Enter a student's wallet address to view and verify their
              credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="wallet-search">Student Wallet Address</Label>
                <Input
                  id="wallet-search"
                  placeholder="0x1234... or username.apt"
                  value={searchWallet}
                  onChange={(e) => setSearchWallet(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                {searchResults.length > 0 && (
                  <Button variant="outline" onClick={clearSearch}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm text-gray-600">
                  Recent Searches:
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {searchHistory.map((wallet, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setSearchWallet(wallet)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {wallet.slice(0, 6)}...{wallet.slice(-4)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {currentStudent && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Credentials for {currentStudent.slice(0, 6)}...
                {currentStudent.slice(-4)}
              </h2>
              <Badge variant="outline" className="text-sm">
                {searchResults.length} credential
                {searchResults.length === 1 ? "" : "s"} found
              </Badge>
            </div>

            {searchResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Credentials Found
                  </h3>
                  <p className="text-gray-600">
                    This wallet address does not have any issued credentials in
                    our system.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {searchResults.map((credential) => {
                  const isVerified = verifiedCredentials.has(credential.id);
                  return (
                    <Card
                      key={credential.id}
                      className={`border-2 transition-colors ${isVerified ? "border-green-200 bg-green-50" : "hover:border-primary/20"}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                <Building className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-xl">
                                {credential.title}
                              </CardTitle>
                              <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                                <Building className="h-4 w-4" />
                                <span>{credential.issuerInstitution}</span>
                                <Separator
                                  orientation="vertical"
                                  className="h-4"
                                />
                                <span>By {credential.issuerName}</span>
                                <Separator
                                  orientation="vertical"
                                  className="h-4"
                                />
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(
                                    credential.issuedDate,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                credential.status === "issued"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              <Award className="h-4 w-4 mr-1" />
                              {credential.status === "issued"
                                ? "Issued"
                                : credential.status}
                            </Badge>
                            {isVerified && (
                              <Badge className="bg-green-100 text-green-800">
                                <Verified className="h-4 w-4 mr-1" />
                                Verified by {user?.organization}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          {credential.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">
                              Credential ID
                            </p>
                            <p className="text-sm text-gray-600 font-mono">
                              {credential.id}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">
                              Issuer Wallet
                            </p>
                            <p className="text-sm text-gray-600 font-mono">
                              {credential.issuerWalletAddress.slice(0, 6)}...
                              {credential.issuerWalletAddress.slice(-4)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">
                              Status
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {credential.status}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Last verified:{" "}
                            {isVerified ? "Just now" : "Not yet verified"}
                          </div>

                          <Button
                            onClick={() =>
                              handleVerifyCredential(credential.id)
                            }
                            variant={isVerified ? "destructive" : "default"}
                            size="sm"
                          >
                            {isVerified ? (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Remove Verification
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />✅
                                Verify Credential
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        {!currentStudent && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to Staff Verification
              </h3>
              <p className="text-gray-600 mb-4">
                Enter a student's wallet address above to search for their
                credentials and verify them on behalf of your organization.
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  As a staff member for {user?.organization}, you can verify
                  credentials to help maintain trust in the CredVault ecosystem.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
