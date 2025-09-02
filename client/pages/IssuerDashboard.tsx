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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import {
  saveIssuedCredential,
  getCredentialsByIssuer,
  getPendingRequestsForIssuer,
  approveCredentialRequest,
  rejectCredentialRequest,
  isValidWallet,
  type IssuedCredential,
  type CredentialRequest,
} from "@/lib/auth";
import { toast } from "sonner";
import {
  Shield,
  Award,
  Building,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Users,
  Plus,
  LogOut,
  UserPlus,
  Eye,
  Hash,
  Clock,
  X,
  Mail,
} from "lucide-react";

export default function IssuerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [issuedCredentials, setIssuedCredentials] = useState<
    IssuedCredential[]
  >([]);
  const [pendingRequests, setPendingRequests] = useState<CredentialRequest[]>(
    [],
  );
  const [approvalFormOpen, setApprovalFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<CredentialRequest | null>(null);
  const [approvalMetadata, setApprovalMetadata] = useState({
    credentialType: "",
    eventLink: "",
    issueDate: "",
    additionalMetadata: "",
  });
  const [formData, setFormData] = useState({
    recipientAddress: "",
    credentialTitle: "",
    credentialType: "",
    description: "",
    eventLink: "",
    issueDate: "",
    additionalMetadata: "",
  });

  // Check if user is authenticated and is an issuer
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (user?.role !== "issuer") {
      toast.error("Access Denied", {
        description:
          "This dashboard is only for issuers. Please register as an issuer.",
      });
      navigate("/register");
      return;
    }

    // Load issued credentials and pending requests
    loadIssuedCredentials();
    loadPendingRequests();
  }, [user, isAuthenticated, navigate]);

  const loadIssuedCredentials = () => {
    if (user?.walletAddress) {
      const credentials = getCredentialsByIssuer(user.walletAddress);
      setIssuedCredentials(credentials);
    }
  };

  const loadPendingRequests = () => {
    if (user?.walletAddress) {
      const requests = getPendingRequestsForIssuer(user.walletAddress);
      setPendingRequests(requests);
    }
  };

  const handleApproveRequest = (request: CredentialRequest) => {
    setSelectedRequest(request);
    setApprovalFormOpen(true);
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      rejectCredentialRequest(requestId, "Request was rejected by the issuer");
      loadPendingRequests();
      toast.success("Request Rejected", {
        description: "The credential request has been rejected.",
      });
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error("Failed to Reject", {
        description: "Could not reject the request. Please try again.",
      });
    }
  };

  const handleCompleteApproval = async () => {
    if (!selectedRequest) return;

    try {
      const { credential } = approveCredentialRequest(
        selectedRequest.id,
        approvalMetadata,
      );

      loadIssuedCredentials();
      loadPendingRequests();

      // Reset approval form
      setApprovalFormOpen(false);
      setSelectedRequest(null);
      setApprovalMetadata({
        credentialType: "",
        eventLink: "",
        issueDate: "",
        additionalMetadata: "",
      });

      toast.success("Credential Issued!", {
        description: `The credential "${credential.title}" has been issued to ${selectedRequest.studentName}.`,
      });
    } catch (error) {
      console.error("Failed to approve request:", error);
      toast.error("Failed to Issue Credential", {
        description: "Could not issue the credential. Please try again.",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMintCredential = async () => {
    if (!isFormValid()) {
      toast.error("Invalid Form", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (!isValidWallet(formData.recipientAddress)) {
      toast.error("Invalid Wallet Address", {
        description: "Please enter a valid Aptos wallet address.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Parse additional metadata if provided
      let parsedMetadata = {};
      if (formData.additionalMetadata.trim()) {
        try {
          parsedMetadata = JSON.parse(formData.additionalMetadata);
        } catch (error) {
          toast.error("Invalid JSON", {
            description: "Additional metadata must be valid JSON format.",
          });
          setIsLoading(false);
          return;
        }
      }

      // Simulate blockchain transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save the credential
      const newCredential = saveIssuedCredential({
        title: formData.credentialTitle,
        description: formData.description,
        studentWalletAddress: formData.recipientAddress.trim(),
        issuerWalletAddress: user!.walletAddress,
        issuerName: user!.name,
        issuerInstitution: user!.institution || "Unknown Institution",
      });

      // Reload credentials
      loadIssuedCredentials();

      // Reset form
      setFormData({
        recipientAddress: "",
        credentialTitle: "",
        credentialType: "",
        description: "",
        eventLink: "",
        issueDate: "",
        additionalMetadata: "",
      });

      toast.success("Credential Minted Successfully!", {
        description: `The credential "${newCredential.title}" has been issued to ${formData.recipientAddress.slice(0, 6)}...${formData.recipientAddress.slice(-4)}.`,
      });
    } catch (error) {
      console.error("Failed to mint credential:", error);
      toast.error("Failed to Mint Credential", {
        description:
          "An error occurred while issuing the credential. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.recipientAddress.trim() &&
      formData.credentialTitle.trim() &&
      formData.credentialType &&
      formData.description.trim()
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged Out", {
      description: "You have been logged out successfully.",
    });
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
                  Issuer
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/verify" className="text-gray-700 hover:text-primary">
                  Verify
                </Link>
                <Link
                  to="/student"
                  className="text-gray-700 hover:text-primary"
                >
                  Student
                </Link>
                <Link to="/staff" className="text-gray-700 hover:text-primary">
                  Staff
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
              Issuer Registration Required
            </h2>
            <p className="text-gray-600 mb-8">
              Please register as an issuer to access the credential minting
              dashboard and manage your institution's credentials.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/register/issuer")}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Register as Issuer
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
                Issuer
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <span className="text-xs text-gray-500">{user?.institution}</span>
              <Link to="/student" className="text-gray-700 hover:text-primary">
                Student
              </Link>
              <Link to="/staff" className="text-gray-700 hover:text-primary">
                Staff
              </Link>
              <Link to="/verify" className="text-gray-700 hover:text-primary">
                Verify
              </Link>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Authorized
              </Badge>
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full flex items-center justify-center">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.institution} Dashboard
              </h1>
              <p className="text-gray-600">
                Mint and manage soulbound credential NFTs for your students and
                participants.
              </p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {issuedCredentials.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Issued</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        issuedCredentials.filter((c) => {
                          const issueDate = new Date(c.issuedDate);
                          const monthAgo = new Date();
                          monthAgo.setMonth(monthAgo.getMonth() - 1);
                          return issueDate > monthAgo;
                        }).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        new Set(
                          issuedCredentials.map((c) => c.studentWalletAddress),
                        ).size
                      }
                    </p>
                    <p className="text-sm text-gray-600">Unique Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        issuedCredentials.filter((c) => c.status === "issued")
                          .length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span>Pending Requests from Students</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {pendingRequests.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Review and approve credential requests from students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">
                              {request.credentialTitle}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Requested
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {request.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              <strong>Student:</strong> {request.studentName}
                            </span>
                            <span>
                              <strong>Email:</strong> {request.studentEmail}
                            </span>
                            <span>
                              <strong>Date:</strong>{" "}
                              {new Date(
                                request.requestDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(request)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve & Issue NFT
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mint Credential Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Mint New Credential</span>
                </CardTitle>
                <CardDescription>
                  Create a new soulbound NFT credential for a student or
                  participant.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientAddress">
                      Recipient Wallet Address *
                    </Label>
                    <Input
                      id="recipientAddress"
                      placeholder="0x1234abcd... or username.apt"
                      value={formData.recipientAddress}
                      onChange={(e) =>
                        handleInputChange("recipientAddress", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credentialType">Credential Type *</Label>
                    <Select
                      value={formData.credentialType}
                      onValueChange={(value) =>
                        handleInputChange("credentialType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="course_completion">
                          Course Completion
                        </SelectItem>
                        <SelectItem value="participation">
                          Event Participation
                        </SelectItem>
                        <SelectItem value="award">Award/Recognition</SelectItem>
                        <SelectItem value="degree">Degree</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credentialTitle">Credential Title *</Label>
                  <Input
                    id="credentialTitle"
                    placeholder="e.g., Computer Science Degree, React Certification"
                    value={formData.credentialTitle}
                    onChange={(e) =>
                      handleInputChange("credentialTitle", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the achievement, skills demonstrated, or requirements met..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventLink">Event/Course Link</Label>
                    <Input
                      id="eventLink"
                      placeholder="https://..."
                      value={formData.eventLink}
                      onChange={(e) =>
                        handleInputChange("eventLink", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) =>
                        handleInputChange("issueDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalMetadata">
                    Additional Metadata (JSON)
                  </Label>
                  <Textarea
                    id="additionalMetadata"
                    placeholder='{"grade": "A+", "hours": "40", "skills": ["React", "TypeScript"]}'
                    value={formData.additionalMetadata}
                    onChange={(e) =>
                      handleInputChange("additionalMetadata", e.target.value)
                    }
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">
                    Optional: Add custom metadata as JSON (e.g., grades,
                    duration, skills)
                  </p>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <Alert className="flex-1 mr-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Credentials are soulbound and cannot be transferred once
                      minted.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleMintCredential}
                    disabled={!isFormValid() || isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Mint Credential
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Issued Credentials */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Issued Credentials</span>
                </CardTitle>
                <CardDescription>
                  {issuedCredentials.length > 0
                    ? `${issuedCredentials.length} credentials issued`
                    : "No credentials issued yet"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issuedCredentials.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">
                      No credentials issued yet. Use the form to mint your first
                      credential.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {issuedCredentials
                      .sort(
                        (a, b) =>
                          new Date(b.issuedDate).getTime() -
                          new Date(a.issuedDate).getTime(),
                      )
                      .slice(0, 10)
                      .map((credential) => (
                        <div
                          key={credential.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {credential.title}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              To: {credential.studentWalletAddress.slice(0, 6)}
                              ...{credential.studentWalletAddress.slice(-4)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                credential.issuedDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-2">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {credential.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Credentials
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/verify">
                    <Eye className="h-4 w-4 mr-2" />
                    Verify Credentials
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/staff">
                    <Shield className="h-4 w-4 mr-2" />
                    Staff Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Institution Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Institution Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Name</p>
                  <p className="text-sm text-gray-600">{user?.institution}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Issuer</p>
                  <p className="text-sm text-gray-600">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Wallet</p>
                  <p className="text-sm text-gray-600 font-mono">
                    {user?.walletAddress.slice(0, 6)}...
                    {user?.walletAddress.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Contact</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approval Form Dialog */}
      <Dialog open={approvalFormOpen} onOpenChange={setApprovalFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve & Issue Credential</DialogTitle>
            <DialogDescription>
              Complete the credential details to issue it to{" "}
              {selectedRequest?.studentName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Request Details</h4>
              <p>
                <strong>Title:</strong> {selectedRequest?.credentialTitle}
              </p>
              <p>
                <strong>Student:</strong> {selectedRequest?.studentName}
              </p>
              <p>
                <strong>Description:</strong> {selectedRequest?.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approvalCredentialType">Credential Type</Label>
                <Select
                  value={approvalMetadata.credentialType}
                  onValueChange={(value) =>
                    setApprovalMetadata({
                      ...approvalMetadata,
                      credentialType: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="course_completion">
                      Course Completion
                    </SelectItem>
                    <SelectItem value="participation">
                      Event Participation
                    </SelectItem>
                    <SelectItem value="award">Award/Recognition</SelectItem>
                    <SelectItem value="degree">Degree</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approvalEventLink">Event/Course Link</Label>
                  <Input
                    id="approvalEventLink"
                    placeholder="https://..."
                    value={approvalMetadata.eventLink}
                    onChange={(e) =>
                      setApprovalMetadata({
                        ...approvalMetadata,
                        eventLink: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvalIssueDate">Issue Date</Label>
                  <Input
                    id="approvalIssueDate"
                    type="date"
                    value={approvalMetadata.issueDate}
                    onChange={(e) =>
                      setApprovalMetadata({
                        ...approvalMetadata,
                        issueDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approvalAdditionalMetadata">
                  Additional Metadata (JSON)
                </Label>
                <Textarea
                  id="approvalAdditionalMetadata"
                  placeholder='{"grade": "A+", "hours": "40", "skills": ["React", "TypeScript"]}'
                  value={approvalMetadata.additionalMetadata}
                  onChange={(e) =>
                    setApprovalMetadata({
                      ...approvalMetadata,
                      additionalMetadata: e.target.value,
                    })
                  }
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  Optional: Add custom metadata as JSON (e.g., grades, duration,
                  skills)
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will issue a soulbound NFT credential to the student's
                wallet. This action cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setApprovalFormOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteApproval}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Issue Credential
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
