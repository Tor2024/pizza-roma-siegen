import { createHash } from 'crypto';

// Verify admin token (hashed) or raw password (for backward compatibility)
// Returns true if the token is valid
export function verifyAdminToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;

  // Check if it's a hashed token (64 hex chars = SHA-256)
  if (token.length === 64 && /^[a-f0-9]+$/.test(token)) {
    const expectedHash = createHash('sha256')
      .update(adminSecret + (process.env.ADMIN_SALT || 'pizza-roma-2024'))
      .digest('hex');

    // Constant-time comparison
    const tokenBuf = Buffer.from(token, 'utf-8');
    const expectedBuf = Buffer.from(expectedHash, 'utf-8');
    
    if (tokenBuf.length !== expectedBuf.length) return false;
    
    let mismatch = 0;
    for (let i = 0; i < tokenBuf.length; i++) {
      mismatch |= tokenBuf[i] ^ expectedBuf[i];
    }
    return mismatch === 0;
  }

  // Backward compatibility: raw password comparison (constant-time)
  const tokenBuf = Buffer.from(token, 'utf-8');
  const secretBuf = Buffer.from(adminSecret, 'utf-8');
  
  if (tokenBuf.length !== secretBuf.length) return false;
  
  let mismatch = 0;
  for (let i = 0; i < tokenBuf.length; i++) {
    mismatch |= tokenBuf[i] ^ secretBuf[i];
  }
  return mismatch === 0;
}
