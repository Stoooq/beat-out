export interface AuthTokens {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	token_type: string;
	id_token: string;
	refresh_token_expires_in: number;
}

export async function getGoogleOAuthTokens({
	code,
}: {
	code: string;
}): Promise<AuthTokens | null> {
	try {
		const tokenParams = new URLSearchParams({
			code,
			client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT!,
			client_secret: process.env.GOOGLE_CLIENT_SECRET!,
			redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
			grant_type: "authorization_code",
		});

		const res = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: tokenParams.toString(),
		});

		if (!res.ok) {
			const err = await res.text();
			console.error("Token exchange failed:", err);
			return null;
		}

		return res.json();
	} catch (error) {
		console.error("Something went wrong:", error);
		return null;
	}
}
