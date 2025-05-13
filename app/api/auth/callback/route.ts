import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // 1. Exchange code for tokens
    const tokenParams = new URLSearchParams({
      code,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Token exchange failed:', err);
      return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 });
    }

    const tokens = await tokenRes.json();
    console.log(tokens)
    // const { access_token, refresh_token, id_token, expires_in } = tokens;

    // // 2. Encrypt and set session cookie
    // const expiresAt = Date.now() + expires_in * 1000;
    // const sessionToken = await encrypt({
    //   userId: id_token, // or derive userId from id_token
    //   userName: '',      // optional, set later
    //   expiresAt,
    // });

    // const response = NextResponse.redirect(new URL('/', request.url));
    // response.cookies.set({
    //   name: 'session',
    //   value: sessionToken,
    //   httpOnly: true,
    //   secure: true,
    //   path: '/',
    //   maxAge: expires_in,
    // });

    return NextResponse.json({ tokens }, { status: 200 });
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
