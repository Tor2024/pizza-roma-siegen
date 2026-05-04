import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// POST - verify admin password and return hashed token
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      console.error('ADMIN_SECRET not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // Constant-time comparison to prevent timing attacks
    const passwordBuffer = Buffer.from(password, 'utf-8');
    const secretBuffer = Buffer.from(adminSecret, 'utf-8');
    
    if (passwordBuffer.length !== secretBuffer.length) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    let mismatch = 0;
    for (let i = 0; i < passwordBuffer.length; i++) {
      mismatch |= passwordBuffer[i] ^ secretBuffer[i];
    }
    
    if (mismatch !== 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate a hash of the password to use as token (not the raw password)
    const tokenHash = createHash('sha256')
      .update(password + (process.env.ADMIN_SALT || 'pizza-roma-2024'))
      .digest('hex');

    return NextResponse.json({ 
      success: true, 
      token: tokenHash 
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// GET - verify if token is valid
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Compute expected hash from ADMIN_SECRET
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const expectedHash = createHash('sha256')
      .update(adminSecret + (process.env.ADMIN_SALT || 'pizza-roma-2024'))
      .digest('hex');

    // Constant-time comparison
    const tokenBuf = Buffer.from(token, 'utf-8');
    const expectedBuf = Buffer.from(expectedHash, 'utf-8');
    
    if (tokenBuf.length !== expectedBuf.length) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
    
    let mismatch = 0;
    for (let i = 0; i < tokenBuf.length; i++) {
      mismatch |= tokenBuf[i] ^ expectedBuf[i];
    }

    if (mismatch !== 0) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
