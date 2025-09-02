/**
 * URL utilities for credential verification and QR code generation
 */

export interface CredentialParams {
  address?: string;
  credentialId?: string;
  type?: string;
  issuer?: string;
}

export interface VerificationUrlData {
  url: string;
  data: {
    credentialId: string;
    walletAddress: string;
    issuer: string;
    title: string;
    type: string;
    issuedDate: string;
    timestamp: number;
  };
}

/**
 * Generate a verification URL for a credential
 */
export function generateVerificationUrl(
  walletAddress: string,
  credentialId: string,
  baseUrl?: string,
): string {
  if (!walletAddress || !credentialId) {
    throw new Error("Wallet address and credential ID are required");
  }

  // Clean and validate inputs
  const cleanAddress = walletAddress.trim();
  const cleanCredentialId = credentialId.trim();

  if (!isValidWalletAddress(cleanAddress)) {
    throw new Error("Invalid wallet address format");
  }

  // Use provided baseUrl or current origin
  const origin = baseUrl || window.location.origin;

  // Encode parameters properly
  const params = new URLSearchParams({
    address: cleanAddress,
    credentialId: cleanCredentialId,
  });

  return `${origin}/verify?${params.toString()}`;
}

/**
 * Generate a profile verification URL
 */
export function generateProfileUrl(
  walletAddress: string,
  baseUrl?: string,
): string {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const cleanAddress = walletAddress.trim();

  if (!isValidWalletAddress(cleanAddress)) {
    throw new Error("Invalid wallet address format");
  }

  const origin = baseUrl || window.location.origin;
  const params = new URLSearchParams({
    address: cleanAddress,
  });

  return `${origin}/verify?${params.toString()}`;
}

/**
 * Parse URL parameters from current location
 */
export function parseUrlParams(): CredentialParams {
  if (typeof window === "undefined") {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);

  return {
    address: urlParams.get("address") || undefined,
    credentialId: urlParams.get("credentialId") || undefined,
    type: urlParams.get("type") || undefined,
    issuer: urlParams.get("issuer") || undefined,
  };
}

/**
 * Generate comprehensive verification data for QR codes
 */
export function generateQRVerificationData(
  credential: {
    id: string;
    title: string;
    issuer: string;
    type: string;
    date: string;
  },
  walletAddress: string,
  baseUrl?: string,
): VerificationUrlData {
  const url = generateVerificationUrl(walletAddress, credential.id, baseUrl);

  return {
    url,
    data: {
      credentialId: credential.id,
      walletAddress: walletAddress,
      issuer: credential.issuer,
      title: credential.title,
      type: credential.type,
      issuedDate: credential.date,
      timestamp: Date.now(),
    },
  };
}

/**
 * Basic wallet address validation
 */
export function isValidWalletAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }

  const trimmed = address.trim();

  // Basic validation - should start with 0x for Aptos or be a valid format
  // This is a simple check - in real app you'd use proper Aptos address validation
  if (trimmed.startsWith("0x")) {
    // Hex address validation
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
 * Validate credential ID format
 */
export function isValidCredentialId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }

  const trimmed = id.trim();
  // Should be non-empty and reasonable length
  return trimmed.length > 0 && trimmed.length <= 100;
}

/**
 * Create a shareable URL with metadata
 */
export function createShareableUrl(
  credential: {
    id: string;
    title: string;
    issuer: string;
    type: string;
  },
  walletAddress: string,
): { url: string; title: string; text: string } {
  const url = generateVerificationUrl(walletAddress, credential.id);

  return {
    url,
    title: `${credential.title} - CredVault`,
    text: `Verify this ${credential.type.toLowerCase()}: "${credential.title}" issued by ${credential.issuer}`,
  };
}

/**
 * Handle URL errors gracefully
 */
export function handleUrlError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("Invalid wallet address")) {
      return "Invalid wallet address format. Please check the address and try again.";
    }
    if (error.message.includes("required")) {
      return "Missing required information for verification URL.";
    }
    return error.message;
  }

  return "Unable to generate verification URL. Please try again.";
}

/**
 * Sanitize URL for display
 */
export function sanitizeUrlForDisplay(
  url: string,
  maxLength: number = 60,
): string {
  if (url.length <= maxLength) {
    return url;
  }

  const start = url.substring(0, maxLength / 2);
  const end = url.substring(url.length - maxLength / 2);
  return `${start}...${end}`;
}
