import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getCurrentUser, logout, type UserProfile } from "./auth";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user profile from localStorage on app start
    const loadUserProfile = () => {
      try {
        const profile = getCurrentUser();
        setUser(profile);
      } catch (error) {
        console.error("Error loading user profile:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const login = (profile: UserProfile) => {
    setUser(profile);
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout(); // Clear localStorage
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;

    const updatedProfile = { ...user, ...updates };
    setUser(updatedProfile);

    // Save to localStorage
    try {
      localStorage.setItem(
        "credvault_user_profile",
        JSON.stringify(updatedProfile),
      );
    } catch (error) {
      console.error("Error saving updated profile:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout: handleLogout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Role-specific hooks for convenience
export function useStudent() {
  const { user, isAuthenticated } = useAuth();
  return {
    isStudent: isAuthenticated && user?.role === "student",
    student: user?.role === "student" ? user : null,
  };
}

export function useStaff() {
  const { user, isAuthenticated } = useAuth();
  return {
    isStaff: isAuthenticated && user?.role === "staff",
    staff: user?.role === "staff" ? user : null,
  };
}

export function useIssuer() {
  const { user, isAuthenticated } = useAuth();
  return {
    isIssuer: isAuthenticated && user?.role === "issuer",
    issuer: user?.role === "issuer" ? user : null,
  };
}

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
  roles?: ("student" | "staff" | "issuer")[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  roles,
  fallback = <div>Access denied. Please log in with the appropriate role.</div>,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  if (roles && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Role-based navigation component
interface RoleGuardProps {
  roles: ("student" | "staff" | "issuer")[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({
  roles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
