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
import { useAuth } from "@/lib/auth-context";
import {
  seedTestUsers,
  testUsersExist,
  TEST_CREDENTIALS,
} from "@/lib/seed-data";
import { toast } from "sonner";
import {
  Shield,
  Award,
  Users,
  QrCode,
  Lock,
  CheckCircle,
  UserPlus,
  LogOut,
  ChevronDown,
  TestTube,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Index() {
  const { user, isAuthenticated, logout } = useAuth();
  const hasTestUsers = testUsersExist();

  const handleSeedTestUsers = () => {
    seedTestUsers();
    toast.success("Test users created!", {
      description: "You can now sign in with the test credentials below.",
    });
  };

  const getRoleDashboardPath = () => {
    if (!user) return "/register";
    switch (user.role) {
      case "student":
        return "/student";
      case "staff":
        return "/staff";
      case "issuer":
        return "/issuer";
      default:
        return "/register";
    }
  };

  const getRoleDisplayName = () => {
    if (!user) return "Guest";
    switch (user.role) {
      case "student":
        return "Student";
      case "staff":
        return "Staff";
      case "issuer":
        return "Issuer";
      default:
        return "User";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F3b9f4625fce44be98ad7372162d270d4%2F992deceba13b40919d5622915996ada9?format=webp&width=800"
                alt="Global Cread APEX"
                className="h-8 w-auto"
              />
              <Badge variant="secondary" className="ml-2">
                Aptos
              </Badge>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/student" className="text-gray-700 hover:text-primary">
                Student
              </Link>
              <Link to="/staff" className="text-gray-700 hover:text-primary">
                Staff (Verifier)
              </Link>
              <Link to="/issuer" className="text-gray-700 hover:text-primary">
                Issuer
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{getRoleDisplayName()}</Badge>
                    <span className="text-sm text-gray-600">{user?.name}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={getRoleDashboardPath()}>Dashboard</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        Get Started
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Sign In</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/signin/student" className="cursor-pointer">
                          Student Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/signin/staff" className="cursor-pointer">
                          Staff (Verifier) Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/signin/issuer" className="cursor-pointer">
                          Issuer Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Register</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/register/student" className="cursor-pointer">
                          Student Register
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/register/staff" className="cursor-pointer">
                          Staff (Verifier) Register
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/register/issuer" className="cursor-pointer">
                          Issuer Register
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-blockchain-100 text-blockchain-800 border-blockchain-200">
              Powered by Aptos Blockchain
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Academic Achievements,
              <span className="block text-primary">Forever Verified</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              CredVault uses soulbound NFTs on Aptos to create tamper-proof,
              permanently verifiable academic credentials. Certificates, course
              completions, and achievements that follow you everywhere.
            </p>

            {/* Dynamic CTA based on auth status */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    asChild
                  >
                    <Link to={getRoleDashboardPath()}>
                      Go to {getRoleDisplayName()} Dashboard
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/signin/staff">Verify Credentials</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    asChild
                  >
                    <Link to="/register/student">Get Started as Student</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/signin/staff">Verify Credentials</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section (for non-authenticated users) */}
      {!isAuthenticated && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Role
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Different roles have different capabilities in the CredVault
                ecosystem. Select the one that best describes you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary/20 transition-colors group cursor-pointer">
                <Link to="/register/student">
                  <CardHeader className="text-center">
                    <Users className="h-12 w-12 text-blue-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <CardTitle>Student</CardTitle>
                    <CardDescription>
                      Request and manage your academic credentials. View your
                      achievements and share them with employers or
                      institutions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Register as Student
                    </Button>
                  </CardContent>
                </Link>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors group cursor-pointer">
                <Link to="/register/staff">
                  <CardHeader className="text-center">
                    <Shield className="h-12 w-12 text-green-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <CardTitle>Staff (Verifier)</CardTitle>
                    <CardDescription>
                      Verify student credentials and manage verification tasks.
                      Access the unified staff dashboard for all verification
                      activities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Register as Staff (Verifier)
                    </Button>
                  </CardContent>
                </Link>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors group cursor-pointer">
                <Link to="/register/issuer">
                  <CardHeader className="text-center">
                    <Award className="h-12 w-12 text-purple-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <CardTitle>Issuer</CardTitle>
                    <CardDescription>
                      Issue verifiable credentials for your institution. Mint
                      and manage academic NFTs for students.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Register as Issuer
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Trust and Permanence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Leveraging blockchain technology to ensure your credentials are
              secure, verifiable, and yours forever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <Lock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Soulbound & Secure</CardTitle>
                <CardDescription>
                  Non-transferable NFTs that are permanently bound to your
                  wallet, preventing fraud and unauthorized transfers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <Award className="h-12 w-12 text-credential-500 mb-4" />
                <CardTitle>Instant Verification</CardTitle>
                <CardDescription>
                  Anyone can verify your credentials instantly using your wallet
                  address or by scanning a QR code.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-500 mb-4" />
                <CardTitle>Trusted Issuers</CardTitle>
                <CardDescription>
                  Only verified institutions and organizations can mint
                  credentials, ensuring authenticity and trust.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Test Credentials Section (Development Helper) */}
      {!isAuthenticated && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Alert className="mb-8 border-blue-200 bg-blue-50">
              <TestTube className="h-4 w-4" />
              <AlertTitle>Testing & Development</AlertTitle>
              <AlertDescription>
                Need test credentials to try the sign-in functionality? Click
                below to create sample users.
              </AlertDescription>
            </Alert>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-blue-600" />
                  <span>Test Credentials</span>
                </CardTitle>
                <CardDescription>
                  Use these credentials to test the sign-in functionality for
                  different roles.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {!hasTestUsers && (
                  <div className="text-center p-4 bg-white/60 rounded-lg border border-blue-200">
                    <Button onClick={handleSeedTestUsers} className="mb-4">
                      <TestTube className="h-4 w-4 mr-2" />
                      Create Test Users
                    </Button>
                    <p className="text-sm text-gray-600">
                      Click above to create sample users for testing
                    </p>
                  </div>
                )}

                {hasTestUsers && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/80 p-4 rounded-lg border">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Student
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Email:</strong> student@test.com
                        </p>
                        <p>
                          <strong>Wallet:</strong> 0x1234...5678
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Requires both email + wallet address
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                        asChild
                      >
                        <Link to="/signin/student">Student Sign In</Link>
                      </Button>
                    </div>

                    <div className="bg-white/80 p-4 rounded-lg border">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Staff (Verifier)
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Email:</strong> staff@university.edu
                        </p>
                        <p>
                          <strong>Org:</strong> Tech University
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Requires only email address
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                        asChild
                      >
                        <Link to="/signin/staff">Staff Sign In</Link>
                      </Button>
                    </div>

                    <div className="bg-white/80 p-4 rounded-lg border">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        Issuer
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Email:</strong> issuer@techacademy.edu
                        </p>
                        <p>
                          <strong>Institution:</strong> TechAcademy
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Requires only email address
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                        asChild
                      >
                        <Link to="/signin/issuer">Issuer Sign In</Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-xs text-gray-600">
                    💡 Tip: Students need both email and wallet address, while
                    Staff and Issuers only need email
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How CredVault Works
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Earn Achievement</h3>
              <p className="text-gray-600">
                Complete a course, win a hackathon, or earn a certificate from
                an accredited institution.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-credential-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-credential-600">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Receive Credential</h3>
              <p className="text-gray-600">
                Authorized issuers mint a soulbound NFT directly to your wallet
                with all relevant metadata.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Share & Verify</h3>
              <p className="text-gray-600">
                Share your credentials with employers or institutions who can
                instantly verify their authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-credential-500/5">
            <CardContent className="pt-8">
              {isAuthenticated ? (
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome back, {user?.name}!
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Continue managing your credentials and exploring the
                    CredVault ecosystem.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                      asChild
                    >
                      <Link to={getRoleDashboardPath()}>
                        Go to {getRoleDisplayName()} Dashboard
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/signin/staff">Verify Credentials</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Ready to Secure Your Credentials?
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Join thousands of students and institutions using CredVault
                    to issue, store, and verify academic achievements on the
                    blockchain.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                      asChild
                    >
                      <Link to="/register/student">Get Started as Student</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/register/issuer">Register as Issuer</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F3b9f4625fce44be98ad7372162d270d4%2F992deceba13b40919d5622915996ada9?format=webp&width=800"
                  alt="Global Cread APEX"
                  className="h-6 w-auto"
                />
              </div>
              <p className="text-gray-600 mb-4">
                Secure, verifiable academic credentials powered by Aptos
                blockchain technology.
              </p>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-credential-500" />
                <span className="text-sm text-gray-600">
                  Deployed on Aptos Testnet
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link to="/student" className="hover:text-primary">
                    Student Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/staff" className="hover:text-primary">
                    Staff (Verifier) Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/issuer" className="hover:text-primary">
                    Issuer Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link to="/signin" className="hover:text-primary">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/signin/student" className="hover:text-primary">
                    Student Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signin/staff" className="hover:text-primary">
                    Staff (Verifier) Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signin/issuer" className="hover:text-primary">
                    Issuer Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 CredVault. Built with Move on Aptos.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
