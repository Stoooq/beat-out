import { AuthTokens } from "./getGoogleOAuthTokens";

export async function refreshGoogleAccessToken(
  refreshToken: string
): Promise<AuthTokens> {
  const params = new URLSearchParams({
    client_id:     process.env.NEXT_PUBLIC_GOOGLE_CLIENT!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Failed to refresh token:', err);
    throw new Error('Could not refresh access token');
  }

  return (await res.json()) as AuthTokens;
}
