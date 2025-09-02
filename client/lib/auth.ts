/**
 * Authentication and role management utilities
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  role: "student" | "staff" | "issuer";
  organization?: string; // For staff
  institution?: string; // For issuer
  createdAt: string;
}

export interface StudentRegistration {
  name: string;
  email: string;
  walletAddress: string;
}

export interface StaffRegistration {
  name: string;
  email: string;
  walletAddress: string;
  organization: string;
}

export interface IssuerRegistration {
  name: string;
  email: string;
  walletAddress: string;
  institution: string;
}

export interface StudentSignIn {
  email: string;
  walletAddress: string;
}

export interface StaffSignIn {
  email: string;
}

export interface IssuerSignIn {
  email: string;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  role: "student" | "staff" | "issuer";
  organization?: string;
  institution?: string;
  createdAt: string;
}

const USER_PROFILE_KEY = "credvault_user_profile";
const ISSUED_CREDENTIALS_KEY = "credvault_issued_credentials";
const REGISTERED_USERS_KEY = "credvault_registered_users";
const CREDENTIAL_REQUESTS_KEY = "credvault_credential_requests";

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Get current user profile from localStorage
 */
export function getCurrentUser(): UserProfile | null {
  try {
    const stored = localStorage.getItem(USER_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error reading user profile:", error);
    return null;
  }
}

/**
 * Clear user session
 */
export function logout(): void {
  localStorage.removeItem(USER_PROFILE_KEY);
}

/**
 * Get all registered users
 */
function getRegisteredUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading registered users:", error);
    return [];
  }
}

/**
 * Save user to registered users list
 */
function saveToRegisteredUsers(user: StoredUser): void {
  const users = getRegisteredUsers();

  // Remove existing user with same email (update scenario)
  const filteredUsers = users.filter((u) => u.email !== user.email);
  filteredUsers.push(user);

  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(filteredUsers));
}

/**
 * Find user by email
 */
function findUserByEmail(email: string): StoredUser | null {
  const users = getRegisteredUsers();
  return (
    users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ||
    null
  );
}

/**
 * Find user by email and wallet address
 */
function findUserByEmailAndWallet(
  email: string,
  walletAddress: string,
): StoredUser | null {
  const users = getRegisteredUsers();
  return (
    users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.walletAddress === walletAddress,
    ) || null
  );
}

/**
 * Sign in a student (requires email and wallet address)
 */
export function signInStudent(data: StudentSignIn): UserProfile | null {
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  if (!isValidWallet(data.walletAddress)) {
    throw new Error("Invalid wallet address format");
  }

  const user = findUserByEmailAndWallet(data.email, data.walletAddress);

  if (!user || user.role !== "student") {
    return null;
  }

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    walletAddress: user.walletAddress,
    role: user.role,
    organization: user.organization,
    institution: user.institution,
    createdAt: user.createdAt,
  };

  saveUserProfile(profile);
  return profile;
}

/**
 * Sign in a staff member (requires only email)
 */
export function signInStaff(data: StaffSignIn): UserProfile | null {
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  const user = findUserByEmail(data.email);

  if (!user || user.role !== "staff") {
    return null;
  }

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    walletAddress: user.walletAddress,
    role: user.role,
    organization: user.organization,
    institution: user.institution,
    createdAt: user.createdAt,
  };

  saveUserProfile(profile);
  return profile;
}

/**
 * Sign in an issuer (requires only email)
 */
export function signInIssuer(data: IssuerSignIn): UserProfile | null {
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  const user = findUserByEmail(data.email);

  if (!user || user.role !== "issuer") {
    return null;
  }

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    walletAddress: user.walletAddress,
    role: user.role,
    organization: user.organization,
    institution: user.institution,
    createdAt: user.createdAt,
  };

  saveUserProfile(profile);
  return profile;
}

/**
 * Register a new student
 */
export function registerStudent(data: StudentRegistration): UserProfile {
  // Check if user already exists
  const existingUser = findUserByEmail(data.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const profile: UserProfile = {
    id: generateUserId(),
    name: data.name,
    email: data.email,
    walletAddress: data.walletAddress,
    role: "student",
    createdAt: new Date().toISOString(),
  };

  // Save to registered users list for future sign-ins
  const storedUser: StoredUser = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    walletAddress: profile.walletAddress,
    role: profile.role,
    createdAt: profile.createdAt,
  };
  saveToRegisteredUsers(storedUser);

  // Don't automatically login - user should sign in separately
  return profile;
}

/**
 * Register a new staff member
 */
export function registerStaff(data: StaffRegistration): UserProfile {
  // Check if user already exists
  const existingUser = findUserByEmail(data.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const profile: UserProfile = {
    id: generateUserId(),
    name: data.name,
    email: data.email,
    walletAddress: data.walletAddress,
    role: "staff",
    organization: data.organization,
    createdAt: new Date().toISOString(),
  };

  // Save to registered users list for future sign-ins
  const storedUser: StoredUser = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    walletAddress: profile.walletAddress,
    role: profile.role,
    organization: profile.organization,
    createdAt: profile.createdAt,
  };
  saveToRegisteredUsers(storedUser);

  // Don't automatically login - user should sign in separately
  return profile;
}

/**
 * Register a new issuer
 */
export function registerIssuer(data: IssuerRegistration): UserProfile {
  // Check if user already exists
  const existingUser = findUserByEmail(data.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const profile: UserProfile = {
    id: generateUserId(),
    name: data.name,
    email: data.email,
    walletAddress: data.walletAddress,
    role: "issuer",
    institution: data.institution,
    createdAt: new Date().toISOString(),
  };

  // Save to registered users list for future sign-ins
  const storedUser: StoredUser = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    walletAddress: profile.walletAddress,
    role: profile.role,
    institution: profile.institution,
    createdAt: profile.createdAt,
  };
  saveToRegisteredUsers(storedUser);

  // Don't automatically login - user should sign in separately
  return profile;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Get role-specific dashboard path
 */
export function getRoleDashboardPath(role: string): string {
  switch (role) {
    case "student":
      return "/student";
    case "staff":
      return "/staff";
    case "issuer":
      return "/issuer";
    default:
      return "/";
  }
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate wallet address format
 */
export function isValidWallet(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }

  const trimmed = address.trim();

  // Hex address validation
  if (trimmed.startsWith("0x")) {
    return /^0x[a-fA-F0-9]{1,64}$/.test(trimmed);
  }

  // Named address validation (like username.apt)
  if (trimmed.includes(".apt")) {
    return /^[a-zA-Z0-9_-]+\.apt$/.test(trimmed);
  }

  // For demo purposes, accept any reasonable format
  return trimmed.length >= 6 && trimmed.length <= 100;
}

/**
 * Mock issued credentials storage
 */
export interface IssuedCredential {
  id: string;
  title: string;
  description: string;
  studentWalletAddress: string;
  issuerWalletAddress: string;
  issuerName: string;
  issuerInstitution: string;
  issuedDate: string;
  status: "issued" | "pending" | "revoked";
}

/**
 * Credential request interface
 */
export interface CredentialRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  studentWalletAddress: string;
  issuerWalletAddress: string;
  issuerName: string;
  issuerInstitution: string;
  credentialTitle: string;
  description: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
  rejectionNote?: string;
}

/**
 * Save issued credential
 */
export function saveIssuedCredential(
  credential: Omit<IssuedCredential, "id" | "issuedDate" | "status">,
): IssuedCredential {
  const issuedCredential: IssuedCredential = {
    ...credential,
    id: `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    issuedDate: new Date().toISOString(),
    status: "issued",
  };

  const existing = getIssuedCredentials();
  existing.push(issuedCredential);
  localStorage.setItem(ISSUED_CREDENTIALS_KEY, JSON.stringify(existing));

  return issuedCredential;
}

/**
 * Get all issued credentials
 */
export function getIssuedCredentials(): IssuedCredential[] {
  try {
    const stored = localStorage.getItem(ISSUED_CREDENTIALS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading issued credentials:", error);
    return [];
  }
}

/**
 * Get credentials issued by a specific issuer
 */
export function getCredentialsByIssuer(
  issuerWalletAddress: string,
): IssuedCredential[] {
  return getIssuedCredentials().filter(
    (cred) => cred.issuerWalletAddress === issuerWalletAddress,
  );
}

/**
 * Get credentials for a specific student
 */
export function getCredentialsForStudent(
  studentWalletAddress: string,
): IssuedCredential[] {
  return getIssuedCredentials().filter(
    (cred) => cred.studentWalletAddress === studentWalletAddress,
  );
}

/**
 * Submit a credential request
 */
export function submitCredentialRequest(
  request: Omit<CredentialRequest, "id" | "requestDate" | "status">,
): CredentialRequest {
  const newRequest: CredentialRequest = {
    ...request,
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    requestDate: new Date().toISOString(),
    status: "pending",
  };

  const existing = getCredentialRequests();
  existing.push(newRequest);
  localStorage.setItem(CREDENTIAL_REQUESTS_KEY, JSON.stringify(existing));

  return newRequest;
}

/**
 * Get all credential requests
 */
export function getCredentialRequests(): CredentialRequest[] {
  try {
    const stored = localStorage.getItem(CREDENTIAL_REQUESTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading credential requests:", error);
    return [];
  }
}

/**
 * Get pending requests for a specific issuer
 */
export function getPendingRequestsForIssuer(
  issuerWalletAddress: string,
): CredentialRequest[] {
  return getCredentialRequests().filter(
    (req) =>
      req.issuerWalletAddress === issuerWalletAddress &&
      req.status === "pending",
  );
}

/**
 * Approve a credential request and issue the credential
 */
export function approveCredentialRequest(
  requestId: string,
  metadata: {
    credentialType?: string;
    eventLink?: string;
    issueDate?: string;
    additionalMetadata?: string;
  },
): { request: CredentialRequest; credential: IssuedCredential } {
  const requests = getCredentialRequests();
  const requestIndex = requests.findIndex((req) => req.id === requestId);

  if (requestIndex === -1) {
    throw new Error("Request not found");
  }

  const request = requests[requestIndex];
  if (request.status !== "pending") {
    throw new Error("Request is not pending");
  }

  // Update request status
  requests[requestIndex] = { ...request, status: "approved" };
  localStorage.setItem(CREDENTIAL_REQUESTS_KEY, JSON.stringify(requests));

  // Issue the credential
  const credential = saveIssuedCredential({
    title: request.credentialTitle,
    description: request.description,
    studentWalletAddress: request.studentWalletAddress,
    issuerWalletAddress: request.issuerWalletAddress,
    issuerName: request.issuerName,
    issuerInstitution: request.issuerInstitution,
  });

  return { request: requests[requestIndex], credential };
}

/**
 * Reject a credential request
 */
export function rejectCredentialRequest(
  requestId: string,
  rejectionNote?: string,
): CredentialRequest {
  const requests = getCredentialRequests();
  const requestIndex = requests.findIndex((req) => req.id === requestId);

  if (requestIndex === -1) {
    throw new Error("Request not found");
  }

  const request = requests[requestIndex];
  if (request.status !== "pending") {
    throw new Error("Request is not pending");
  }

  // Update request status
  requests[requestIndex] = {
    ...request,
    status: "rejected",
    rejectionNote: rejectionNote || "Request was rejected",
  };
  localStorage.setItem(CREDENTIAL_REQUESTS_KEY, JSON.stringify(requests));

  return requests[requestIndex];
}
