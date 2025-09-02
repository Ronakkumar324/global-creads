/**
 * Seed data utility for testing CredVault authentication
 * This creates sample users for testing sign-in functionality
 */

import type { StoredUser } from "./auth";

const REGISTERED_USERS_KEY = "credvault_registered_users";

export const TEST_CREDENTIALS = {
  student: {
    email: "student@test.com",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    password: "Not needed - just use email + wallet",
  },
  staff: {
    email: "staff@university.edu",
    password: "Not needed - just use email",
  },
  issuer: {
    email: "issuer@techacademy.edu",
    password: "Not needed - just use email",
  },
};

/**
 * Seed test users into localStorage for testing
 */
export function seedTestUsers(): void {
  const testUsers: StoredUser[] = [
    {
      id: "test_student_001",
      name: "Alex Student",
      email: "student@test.com",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      role: "student",
      createdAt: new Date().toISOString(),
    },
    {
      id: "test_staff_001",
      name: "Sarah Verifier",
      email: "staff@university.edu",
      walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      role: "staff",
      organization: "Tech University",
      createdAt: new Date().toISOString(),
    },
    {
      id: "test_issuer_001",
      name: "Dr. Michael Issuer",
      email: "issuer@techacademy.edu",
      walletAddress: "0x9876543210fedcba9876543210fedcba98765432",
      role: "issuer",
      institution: "TechAcademy Institute",
      createdAt: new Date().toISOString(),
    },
  ];

  // Get existing users
  const existing = getRegisteredUsers();

  // Add test users if they don't already exist
  testUsers.forEach((testUser) => {
    const existingUser = existing.find((u) => u.email === testUser.email);
    if (!existingUser) {
      existing.push(testUser);
    }
  });

  // Save updated users list
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(existing));

  console.log("✅ Test users seeded successfully!");
  console.log("Test credentials:", TEST_CREDENTIALS);
}

/**
 * Get all registered users from localStorage
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
 * Clear all test data (useful for testing)
 */
export function clearTestData(): void {
  localStorage.removeItem(REGISTERED_USERS_KEY);
  localStorage.removeItem("credvault_user_profile");
  localStorage.removeItem("credvault_issued_credentials");
  console.log("🧹 Test data cleared!");
}

/**
 * Check if test users exist
 */
export function testUsersExist(): boolean {
  const users = getRegisteredUsers();
  return (
    users.some((u) => u.email === "student@test.com") &&
    users.some((u) => u.email === "staff@university.edu") &&
    users.some((u) => u.email === "issuer@techacademy.edu")
  );
}
