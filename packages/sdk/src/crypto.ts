// Cryptographic utilities for Aleo Privacy Suite

/**
 * Generate a secure random hex string
 */
export function generateRandomHex(length: number = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a string using SHA-256
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash an address for privacy
 */
export async function hashAddress(address: string): Promise<string> {
  return sha256(address);
}

/**
 * Generate a commitment hash
 */
export async function generateCommitment(
  address: string,
  secret: string
): Promise<string> {
  return sha256(address + secret);
}

/**
 * AES-256-GCM encryption (for backend use)
 */
export async function encrypt(
  plaintext: string,
  key: string
): Promise<{ ciphertext: string; iv: string; tag: string }> {
  const keyBuffer = await crypto.subtle.importKey(
    'raw',
    hexToBytes(key),
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyBuffer,
    encodedText
  );

  const encryptedBytes = new Uint8Array(encrypted);
  const ciphertext = encryptedBytes.slice(0, -16);
  const tag = encryptedBytes.slice(-16);

  return {
    ciphertext: bytesToHex(ciphertext),
    iv: bytesToHex(iv),
    tag: bytesToHex(tag),
  };
}

/**
 * AES-256-GCM decryption (for backend use)
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
  tag: string,
  key: string
): Promise<string> {
  const keyBuffer = await crypto.subtle.importKey(
    'raw',
    hexToBytes(key),
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const combined = new Uint8Array([
    ...hexToBytes(ciphertext),
    ...hexToBytes(tag),
  ]);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToBytes(iv) },
    keyBuffer,
    combined
  );

  return new TextDecoder().decode(decrypted);
}

// Helper functions
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
