import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, encrypt, refreshSessionWithGoogleAuth } from "./lib/session";
import { customAlphabet } from "nanoid";
import { refreshGoogleAccessToken } from "./lib/refreshGoogleAccessToken";

const nano = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

export async function middleware(request: NextRequest) {
	const cookie = request.cookies.get("session")?.value;
	const payload = cookie ? await decrypt(cookie) : null;
	const response = NextResponse.next();

	// console.log("cookie", cookie, "response", response, "payload", payload);

	if (!cookie) {
		const userId = crypto.randomUUID();
		const userName = "#" + nano();
		const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

		const session = await encrypt({ userId, userName, expiresAt });

		response.cookies.set("session", session, {
			httpOnly: true,
			secure: true,
			expires: expiresAt,
		});
	}

	console.log("GOOGLE TOKENS", payload?.googleTokens);
	const now = Date.now();
	if (
		payload?.googleTokens &&
		payload.googleTokens?.expires_in - now < 60 * 1000
	) {
			const newTokens = await refreshGoogleAccessToken(
				payload.googleTokens.refresh_token
			);
			console.log("NEW TOKENS", newTokens);
			await refreshSessionWithGoogleAuth(newTokens);
	}

	return response;
}

export const config = { matcher: ["/", "/api/((?!auth).*)"] };
