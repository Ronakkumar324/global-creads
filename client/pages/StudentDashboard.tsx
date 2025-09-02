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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QRModal } from "@/components/ui/qr-modal";
import { copyToClipboard, getClipboardMessage } from "@/lib/clipboard";
import {
  createShareableUrl,
  generateProfileUrl,
  handleUrlError,
} from "@/lib/url-utils";
import { useAuth } from "@/lib/auth-context";
import {
  getCredentialsForStudent,
  submitCredentialRequest,
  type IssuedCredential,
} from "@/lib/auth";
import { toast } from "sonner";
import {
  Shield,
  Award,
  ExternalLink,
  Calendar,
  Building,
  QrCode,
  Wallet,
  Trophy,
  BookOpen,
  Code,
  Users,
  Share,
  Plus,
  LogOut,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Mail,
  Send,
} from "lucide-react";

// Mock issuer data for request functionality
const mockIssuers = [
  {
    id: "1",
    name: "MIT Technology Institute",
    walletAddress: "0x1234567890abcdef",
    specializations: ["Computer Science", "AI/ML", "Blockchain"],
  },
  {
    id: "2",
    name: "Stanford Online Learning",
    walletAddress: "0xabcdef1234567890",
    specializations: ["Business", "Engineering", "Data Science"],
  },
  {
    id: "3",
    name: "Harvard Extension School",
    walletAddress: "0x5678901234abcdef",
    specializations: [
      "Liberal Arts",
      "Professional Development",
      "Certificates",
    ],
  },
];

// Mock data for demonstration (will be replaced with real data from localStorage)
const fallbackCredentials = [
  {
    id: "demo-1",
    title: "React Developer Certification",
    description:
      "Advanced React development skills including hooks, state management, and testing",
    studentWalletAddress: "",
    issuerWalletAddress: "0x1234567890abcdef",
    issuerName: "TechAcademy",
    issuerInstitution: "MIT Technology Institute",
    issuedDate: "2024-01-15T00:00:00.000Z",
    status: "issued" as const,
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [credentials, setCredentials] = useState<IssuedCredential[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    issuerWalletAddress: "",
    credentialTitle: "",
    description: "",
    issuerName: "",
  });

  // Check if user is authenticated and is a student
  useEffect(() => {
    if (!isAuthenticated) {
      // Show registration prompt instead of redirecting
      return;
    }

    if (user?.role !== "student") {
      toast.error("Access Denied", {
        description:
          "This dashboard is only for students. Please register as a student.",
      });
      navigate("/register");
      return;
    }

    // If authenticated as student, use their wallet address
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
      setIsConnected(true);
    }
  }, [user, isAuthenticated, navigate]);

  // Load credentials when wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      loadCredentials();
    }
  }, [isConnected, walletAddress]);

  const loadCredentials = () => {
    const studentCredentials = getCredentialsForStudent(walletAddress);

    // If no real credentials, show demo data
    if (studentCredentials.length === 0) {
      setCredentials(
        fallbackCredentials.map((cred) => ({
          ...cred,
          studentWalletAddress: walletAddress,
        })),
      );
    } else {
      setCredentials(studentCredentials);
    }
  };

  const connectWallet = async () => {
    if (!isAuthenticated) {
      toast.error("Registration Required", {
        description:
          "Please register as a student first to connect your wallet.",
      });
      navigate("/register/student");
      return;
    }

    // In a real app, this would connect to actual Aptos wallet
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
      setIsConnected(true);
      toast.success("Wallet Connected", {
        description: `Connected to ${user.walletAddress}`,
      });
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged Out", {
      description: "You have been logged out successfully.",
    });
  };

  const handleSubmitRequest = () => {
    if (
      !requestForm.issuerWalletAddress ||
      !requestForm.credentialTitle ||
      !user
    ) {
      toast.error("Incomplete Form", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      // Submit the credential request using the new system
      const newRequest = submitCredentialRequest({
        studentName: user.name,
        studentEmail: user.email,
        studentWalletAddress: user.walletAddress,
        issuerWalletAddress: requestForm.issuerWalletAddress,
        issuerName: requestForm.issuerName,
        issuerInstitution: requestForm.issuerName, // Using name as institution for now
        credentialTitle: requestForm.credentialTitle,
        description: requestForm.description || "",
      });

      toast.success("Request Sent!", {
        description: `Your credential request has been sent to ${requestForm.issuerName}. They will review and issue the credential if approved.`,
      });

      // Reset form and close modal
      setRequestForm({
        issuerWalletAddress: "",
        credentialTitle: "",
        description: "",
        issuerName: "",
      });
      setRequestModalOpen(false);
    } catch (error) {
      console.error("Failed to submit request:", error);
      toast.error("Request Failed", {
        description:
          "Failed to submit your credential request. Please try again.",
      });
    }
  };

  const handleGenerateQR = (credential: IssuedCredential) => {
    // Convert IssuedCredential to format expected by QRModal
    const qrCredential = {
      id: credential.id,
      title: credential.title,
      issuer: credential.issuerName,
      date: credential.issuedDate,
      type: "Credential",
      description: credential.description,
      eventLink: "",
      metadata: {},
    };
    setSelectedCredential(qrCredential);
    setQrModalOpen(true);
  };

  const handleShare = async (credential: IssuedCredential) => {
    if (!walletAddress) {
      toast.error("Share failed", {
        description: "Wallet not connected. Please connect your wallet first.",
      });
      return;
    }

    try {
      const shareCredential = {
        id: credential.id,
        title: credential.title,
        issuer: credential.issuerName,
        type: "Credential",
      };

      const shareData = createShareableUrl(shareCredential, walletAddress);

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          console.error("Share failed:", error);
        }
      }

      // Fallback to copying URL
      const result = await copyToClipboard(shareData.url);

      if (result.success) {
        toast.success("Ready to share!", {
          description:
            "Verification URL copied to clipboard. You can now paste it anywhere to share this credential.",
        });
      } else {
        toast.error("Share failed", {
          description:
            "Please copy the verification URL manually and share it.",
        });
      }
    } catch (error) {
      const errorMessage = handleUrlError(error);
      toast.error("Share Failed", {
        description: errorMessage,
      });
    }
  };

  const handleShareProfile = () => {
    if (!walletAddress) {
      toast.error("Share failed", {
        description: "Wallet not connected. Please connect your wallet first.",
      });
      return;
    }

    try {
      const profileCredential = {
        id: "profile",
        title: `${user?.name || "Student"}'s Credential Profile`,
        issuer: "CredVault",
        date: new Date().toISOString(),
        type: "Profile",
        description: `Complete credential collection for ${user?.name || "student"}`,
        eventLink: generateProfileUrl(walletAddress),
        metadata: {
          totalCredentials: credentials.length,
          studentName: user?.name || "Student",
          walletAddress: walletAddress,
        },
      };
      setSelectedCredential(profileCredential);
      setQrModalOpen(true);
    } catch (error) {
      const errorMessage = handleUrlError(error);
      toast.error("Profile Share Failed", {
        description: errorMessage,
      });
    }
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
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F3b9f4625fce44be98ad7372162d270d4%2F992deceba13b40919d5622915996ada9?format=webp&width=800"
                    alt="Global Cread APEX"
                    className="h-8 w-auto"
                  />
                </Link>
                <Badge variant="secondary" className="ml-2">
                  Student
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/verify" className="text-gray-700 hover:text-primary">
                  Verify
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
              Student Registration Required
            </h2>
            <p className="text-gray-600 mb-8">
              Please register as a student to access your credential dashboard
              and manage your academic achievements.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/register/student")}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Register as Student
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
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F3b9f4625fce44be98ad7372162d270d4%2F992deceba13b40919d5622915996ada9?format=webp&width=800"
                  alt="Global Cread APEX"
                  className="h-8 w-auto"
                />
              </Link>
              <Badge variant="secondary" className="ml-2">
                Student
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <Link to="/verify" className="text-gray-700 hover:text-primary">
                Verify
              </Link>
              <Link to="/issuer" className="text-gray-700 hover:text-primary">
                Issuer
              </Link>
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          /* Wallet Connection Prompt */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-8">
                Connect your Aptos wallet to view your credential collection and
                manage your achievements.
              </p>
              <Button
                onClick={connectWallet}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                <Wallet className="h-5 w-5 mr-2" />
                Connect Petra or Martian Wallet
              </Button>
            </div>
          </div>
        ) : (
          /* Dashboard Content */
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase() || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user?.name}'s Credentials
                    </h1>
                    <p className="text-gray-600">Wallet: {walletAddress}</p>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setRequestModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request Credential
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">
                          {credentials.length}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Credentials
                        </p>
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
                          {
                            credentials.filter((c) => c.status === "issued")
                              .length
                          }
                        </p>
                        <p className="text-sm text-gray-600">Verified</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {
                            new Set(credentials.map((c) => c.issuerInstitution))
                              .size
                          }
                        </p>
                        <p className="text-sm text-gray-600">Institutions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {credentials.length > 0
                            ? new Date().getFullYear() -
                              new Date(
                                credentials[0]?.issuedDate,
                              ).getFullYear() +
                              1
                            : 0}
                        </p>
                        <p className="text-sm text-gray-600">Years Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Credentials Grid */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Credential Collection</h2>
                <Button variant="outline" onClick={handleShareProfile}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </div>

              {credentials.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Credentials Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start earning credentials by requesting them from verified
                      issuers or completing courses and achievements.
                    </p>
                    <Button onClick={() => setRequestModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Request Your First Credential
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {credentials.map((credential) => (
                    <Card
                      key={credential.id}
                      className="border-2 hover:border-primary/20 transition-colors"
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
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {credential.status === "issued"
                                ? "Verified"
                                : credential.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          {credential.description}
                        </p>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            ID: {credential.id}
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateQR(credential)}
                            >
                              <QrCode className="h-4 w-4 mr-2" />
                              Generate QR
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(credential)}
                            >
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Request Credential Modal */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request New Credential</DialogTitle>
            <DialogDescription>
              Send a request to an issuer to receive a new credential
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issuer">Select Issuer</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={requestForm.issuerWalletAddress}
                onChange={(e) => {
                  const selectedIssuer = mockIssuers.find(
                    (i) => i.walletAddress === e.target.value,
                  );
                  setRequestForm({
                    ...requestForm,
                    issuerWalletAddress: e.target.value,
                    issuerName: selectedIssuer?.name || "",
                  });
                }}
              >
                <option value="">Choose an issuer...</option>
                {mockIssuers.map((issuer) => (
                  <option key={issuer.id} value={issuer.walletAddress}>
                    {issuer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Credential Title</Label>
              <Input
                id="title"
                placeholder="e.g., Computer Science Degree, React Certification"
                value={requestForm.credentialTitle}
                onChange={(e) =>
                  setRequestForm({
                    ...requestForm,
                    credentialTitle: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Additional details about the credential request"
                value={requestForm.description}
                onChange={(e) =>
                  setRequestForm({
                    ...requestForm,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Your request will be sent to the issuer for review. They will
                verify your eligibility and issue the credential if approved.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setRequestModalOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitRequest} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        credential={selectedCredential}
        walletAddress={walletAddress}
      />
    </div>
  );
}
