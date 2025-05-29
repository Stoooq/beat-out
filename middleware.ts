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

	if (!cookie) {
		const userId = crypto.randomUUID();
		const userName = "#" + nano();
		const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
		const session = await encrypt({ userId, userName, expiresAt });

		response.cookies.set("session", session, {
			httpOnly: true,
			secure: true,
			expires: expiresAt,
		});
	}

	const now = Date.now();
	if (payload && payload.expiresAt - now < 60 * 1000) {
		if (payload.googleTokens) {
			const newTokens = await refreshGoogleAccessToken(
				payload.googleTokens.refresh_token
			);
			await refreshSessionWithGoogleAuth(newTokens);
		}

		const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
		const updatedSession = await encrypt({
			...payload,
			expiresAt,
		});

		response.cookies.set("session", updatedSession, {
			httpOnly: true,
			secure: true,
			expires: expiresAt,
		});
	}

	return response;
}

export const config = { matcher: ["/", "/api/((?!auth).*)"] };
