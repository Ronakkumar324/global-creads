import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QRModal } from "@/components/ui/qr-modal";
import { toast } from "sonner";
import { copyToClipboard, getClipboardMessage } from "@/lib/clipboard";
import {
  parseUrlParams,
  isValidWalletAddress,
  isValidCredentialId,
} from "@/lib/url-utils";
import {
  Shield,
  Search,
  QrCode,
  CheckCircle,
  XCircle,
  Award,
  Building,
  Calendar,
  ExternalLink,
  Trophy,
  BookOpen,
  Copy,
  Download,
} from "lucide-react";

// Mock verification data
const mockVerificationResults = {
  "0x1234...abcd": [
    {
      id: "1",
      title: "React Developer Certification",
      issuer: "TechAcademy",
      issuerLogo: "/placeholder.svg",
      date: "2024-01-15",
      type: "Certificate",
      verified: true,
      onChainAddress: "0xabc123...",
      metadata: {
        grade: "A+",
        hours: "40",
        skills: ["React", "TypeScript", "Testing"],
      },
    },
    {
      id: "2",
      title: "Blockchain Hackathon Winner",
      issuer: "CryptoHack 2024",
      issuerLogo: "/placeholder.svg",
      date: "2024-02-20",
      type: "Achievement",
      verified: true,
      onChainAddress: "0xdef456...",
      metadata: {
        placement: "1st Place",
        team: "4 members",
        prize: "$10,000",
      },
    },
  ],
};

export default function VerificationPage() {
  const [searchAddress, setSearchAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Handle URL parameters from QR codes or direct links
  useEffect(() => {
    const urlParams = parseUrlParams();

    if (urlParams.address) {
      if (isValidWalletAddress(urlParams.address)) {
        setSearchAddress(urlParams.address);

        // Auto-search if we have a valid address
        if (urlParams.address.trim()) {
          // Small delay to allow state to update
          setTimeout(() => {
            handleSearch(urlParams.address);
          }, 100);
        }
      } else {
        toast.error("Invalid URL", {
          description: "The wallet address in the URL is not valid.",
        });
      }
    }

    if (
      urlParams.credentialId &&
      !isValidCredentialId(urlParams.credentialId)
    ) {
      toast.error("Invalid URL", {
        description: "The credential ID in the URL is not valid.",
      });
    }
  }, []);

  const handleSearch = async (addressOverride?: string) => {
    const addressToSearch = addressOverride || searchAddress;

    if (!addressToSearch.trim()) return;

    if (!isValidWalletAddress(addressToSearch)) {
      toast.error("Invalid Address", {
        description: "Please enter a valid wallet address.",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Mock search - in real app would query Aptos blockchain
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      const results =
        mockVerificationResults[
          addressToSearch as keyof typeof mockVerificationResults
        ] || [];
      setSearchResults(results);

      // Show success message for URL-based searches
      if (addressOverride && results.length > 0) {
        toast.success("Credentials Found", {
          description: `Found ${results.length} credential(s) for this address.`,
        });
      }
    } catch (error) {
      setSearchResults([]);
      toast.error("Search Failed", {
        description: "Unable to search for credentials. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleQRScan = async () => {
    // In a real implementation, this would use the device camera
    // For demo purposes, we'll simulate scanning by using sample data

    try {
      // Check if the browser supports the Web API for camera access
      if (
        "mediaDevices" in navigator &&
        "getUserMedia" in navigator.mediaDevices
      ) {
        // For demo, we'll show an alert and use sample data
        const confirmScan = confirm(
          "QR Scanner: Would you like to scan a QR code?\n\nFor demo purposes, this will use sample credential data.",
        );

        if (confirmScan) {
          setSearchAddress("0x1234...abcd");
          await handleSearch();
        }
      } else {
        alert(
          "Camera access is not supported in this browser. Please enter a wallet address manually.",
        );
      }
    } catch (error) {
      console.error("QR Scanner error:", error);
      alert(
        "QR Scanner not available. Please enter a wallet address manually.",
      );
    }
  };

  const generateQRForCredential = (credential: any) => {
    setSelectedCredential(credential);
    setQrModalOpen(true);
  };

  const copyToClipboardLocal = async (text: string) => {
    const result = await copyToClipboard(text);

    if (result.success) {
      toast.success("Copied to clipboard!", {
        description: getClipboardMessage(result),
      });
    } else {
      toast.error("Failed to copy", {
        description: "Please try selecting and copying the text manually.",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Certificate":
        return <Award className="h-5 w-5" />;
      case "Achievement":
        return <Trophy className="h-5 w-5" />;
      case "Course Completion":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Certificate":
        return "bg-blue-100 text-blue-800";
      case "Achievement":
        return "bg-yellow-100 text-yellow-800";
      case "Course Completion":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                Verify
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/student" className="text-gray-700 hover:text-primary">
                Student
              </Link>
              <Link to="/issuer" className="text-gray-700 hover:text-primary">
                Issuer
              </Link>
              <Button variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verify Credentials
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Instantly verify the authenticity of academic credentials and
            achievements stored on the Aptos blockchain.
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Credentials</span>
            </CardTitle>
            <CardDescription>
              Enter a wallet address or scan a QR code to view and verify
              credentials.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Wallet Address</Label>
                <Input
                  id="search"
                  placeholder="0x1234abcd... or student.apt"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex gap-2 items-end">
                <Button
                  onClick={() => handleSearch()}
                  disabled={isSearching || !searchAddress.trim()}
                >
                  {isSearching ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
                <Button variant="outline" onClick={handleQRScan}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR
                </Button>
              </div>
            </div>

            {hasSearched && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Search completed. {searchResults.length} credential(s) found
                  for address: {searchAddress}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Verification Results</h2>

            {searchResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Credentials Found
                  </h3>
                  <p className="text-gray-600">
                    No verified credentials were found for this wallet address.
                    Please check the address and try again.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {searchResults.map((credential) => (
                  <Card
                    key={credential.id}
                    className="border-2 hover:border-primary/20 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={credential.issuerLogo} />
                            <AvatarFallback>
                              <Building className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl flex items-center space-x-2">
                              <span>{credential.title}</span>
                              {credential.verified && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                              <Building className="h-4 w-4" />
                              <span>{credential.issuer}</span>
                              <Separator
                                orientation="vertical"
                                className="h-4"
                              />
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(credential.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(credential.type)}>
                            {getTypeIcon(credential.type)}
                            <span className="ml-1">{credential.type}</span>
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Verification Status */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-800">
                            Credential Verified
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          This credential has been verified on the Aptos
                          blockchain and is authentic.
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-green-600">
                          <span>On-chain: {credential.onChainAddress}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboardLocal(credential.onChainAddress)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Metadata */}
                      {Object.keys(credential.metadata).length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">
                            Credential Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(credential.metadata).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="bg-gray-50 p-3 rounded-lg"
                                >
                                  <p className="text-sm font-medium text-gray-900 capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {String(value)}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateQRForCredential(credential)}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Generate QR
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCredential(credential)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* How Verification Works */}
        {!hasSearched && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>How Credential Verification Works</CardTitle>
                <CardDescription>
                  Understanding the verification process for blockchain-based
                  credentials
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">1. Search</h3>
                    <p className="text-sm text-gray-600">
                      Enter a wallet address or scan a QR code to look up
                      credentials
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-blockchain-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-6 w-6 text-blockchain-600" />
                    </div>
                    <h3 className="font-semibold mb-2">2. Verify</h3>
                    <p className="text-sm text-gray-600">
                      Check the Aptos blockchain to confirm credential
                      authenticity
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-credential-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-credential-600" />
                    </div>
                    <h3 className="font-semibold mb-2">3. Confirm</h3>
                    <p className="text-sm text-gray-600">
                      Instantly view verified credential details and metadata
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        credential={selectedCredential}
        walletAddress={searchAddress}
      />
    </div>
  );
}
