const STORAGE_KEY = "secure_auth_data";
const ENCRYPTION_KEY = "expense-tracker-encryption-key-v1"; // In production, use env variable

interface TokenData {
  token: string;
  expiresAt?: number;
  createdAt: number;
}

function encrypt(text: string): string {
  try {
    const encrypted = Array.from(text)
      .map((char, i) =>
        String.fromCodePoint(
          (char.codePointAt(0) ?? 0) ^ (ENCRYPTION_KEY.codePointAt(i % ENCRYPTION_KEY.length) ?? 0)
        )
      )
      .join("");

    return btoa(encrypted); // Base64 encode
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt token");
  }
}

function decrypt(encrypted: string): string {
  try {
    const decoded = atob(encrypted); // Base64 decode
    return Array.from(decoded)
      .map((char, i) =>
        String.fromCodePoint(
          (char.codePointAt(0) ?? 0) ^ (ENCRYPTION_KEY.codePointAt(i % ENCRYPTION_KEY.length) ?? 0)
        )
      )
      .join("");
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt token");
  }
}

/**
 * Validates JWT token format and extracts expiration
 */
function validateAndParseToken(token: string): { valid: boolean; expiresAt?: number } {
  try {
    // Basic JWT format validation (header.payload.signature)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false };
    }

    // Try to parse the payload
    const payload = JSON.parse(atob(parts[1]));

    // Check expiration if present
    if (payload.exp) {
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      if (expiresAt <= now) {
        console.warn("Token has expired");
        return { valid: false };
      }

      return { valid: true, expiresAt };
    }

    return { valid: true };
  } catch (error) {
    console.error("Token validation failed:", error);
    return { valid: false };
  }
}

/**
 * Securely store authentication token with encryption
 */
export function setSecureToken(token: string): void {
  const validation = validateAndParseToken(token);

  if (!validation.valid) {
    localStorage.removeItem(STORAGE_KEY);
    throw new Error("Invalid token format or expired token");
  }

  try {
    const tokenData: TokenData = {
      token,
      expiresAt: validation.expiresAt,
      createdAt: Date.now(),
    };

    const encrypted = encrypt(JSON.stringify(tokenData));
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error("Failed to store token securely:", error);
    // Clean up any partial data
    localStorage.removeItem(STORAGE_KEY);
    throw error;
  }
}

/**
 * Retrieve and validate stored token
 * Returns null if token is missing, invalid, or expired
 */
export function getSecureToken(): string | null {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);

    if (!encrypted) {
      return null;
    }

    const decrypted = decrypt(encrypted);
    const tokenData: TokenData = JSON.parse(decrypted);

    // Validate token hasn't expired
    if (tokenData.expiresAt && tokenData.expiresAt <= Date.now()) {
      console.warn("Stored token has expired");
      removeSecureToken();
      return null;
    }

    // Re-validate token format
    const validation = validateAndParseToken(tokenData.token);
    if (!validation.valid) {
      console.warn("Stored token is invalid");
      removeSecureToken();
      return null;
    }

    return tokenData.token;
  } catch (error) {
    console.error("Failed to retrieve token:", error);
    // Clean up corrupted data
    removeSecureToken();
    return null;
  }
}

/**
 * Check if valid token exists without retrieving it
 */
export function hasValidToken(): boolean {
  return getSecureToken() !== null;
}

/**
 * Remove stored token and clean up all related data
 */
export function removeSecureToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    // Also remove legacy storage if exists
    localStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Failed to remove token:", error);
  }
}

/**
 * Get token expiration time (if available)
 */
export function getTokenExpiration(): number | null {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;

    const decrypted = decrypt(encrypted);
    const tokenData: TokenData = JSON.parse(decrypted);

    return tokenData.expiresAt || null;
  } catch {
    return null;
  }
}

/**
 * Migrate from legacy plain text storage to encrypted storage
 */
export function migrateLegacyToken(): boolean {
  try {
    const legacyToken = localStorage.getItem("auth_token");

    if (legacyToken && !localStorage.getItem(STORAGE_KEY)) {
      console.log("Migrating legacy token to secure storage");
      setSecureToken(legacyToken);
      localStorage.removeItem("auth_token");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to migrate legacy token:", error);
    return false;
  }
}