/**
 * Generate and retrieve a persistent user identifier for reactions
 * This uses localStorage to prevent spam reactions from the same user/device
 */

const USER_IDENTIFIER_KEY = "docs_publisher_user_id";

/**
 * Get or create a user identifier for reactions
 * This identifier is stored in localStorage and persists across sessions
 */
export function getUserIdentifier(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let identifier = localStorage.getItem(USER_IDENTIFIER_KEY);

  if (!identifier) {
    // Generate a new identifier using crypto API
    identifier = crypto.randomUUID();
    localStorage.setItem(USER_IDENTIFIER_KEY, identifier);
  }

  return identifier;
}

/**
 * Reset the user identifier (for testing purposes)
 */
export function resetUserIdentifier(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(USER_IDENTIFIER_KEY);
}
