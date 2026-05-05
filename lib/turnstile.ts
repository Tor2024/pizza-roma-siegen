// Cloudflare Turnstile verification - free, invisible captcha
// Get your sitekey and secretkey at https://dash.cloudflare.com/?to=/:account/turnstile

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    // If not configured, skip verification (for development)
    console.log('Turnstile not configured, skipping verification');
    return true;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    // Fail open - don't block orders if Turnstile service is down
    return true;
  }
}
