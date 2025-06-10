import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, encrypt, updateSession } from "./lib/session";
import { customAlphabet } from "nanoid";
import { refreshGoogleAccessToken } from "./lib/refreshGoogleAccessToken";

const nano = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

export async function middleware(request: NextRequest) {
	const cookie = request.cookies.get("session")?.value;
	const session = cookie ? await decrypt(cookie) : null;
	const response = NextResponse.next();

	if (!cookie) {
		const userId = crypto.randomUUID();
		const userName = "#" + nano();
		const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
		const session = await encrypt({ userId, userName, expiresAt });

		response.cookies.set("session", session, {
			httpOnly: true,
			secure: true,
			expires: new Date(expiresAt),
			sameSite: "lax",
		});
	}

	const now = Date.now();
	console.log("SESSION",session)
	if (
		session?.googleTokens &&
		session.expiresAt - now < 60 * 1000
	) {
		const newTokens = await refreshGoogleAccessToken(
			session.googleTokens.refresh_token
		);
		console.log("NEW GOOGLE TOKENS", newTokens);
		// await updateSession({
		// 	expiresAt: now + newTokens.expires_in * 1000,
		// 	googleTokens: {
		// 		...session.googleTokens,
		// 		access_token: newTokens.access_token,
		// 		expires_in: newTokens.expires_in,
		// 		refresh_token:
		// 			newTokens.refresh_token ?? session.googleTokens.refresh_token,
		// 	},
		// });
	}

	return response;
}

export const config = {
	matcher: ["/", "/api/((?!auth).*)", "/lobby", "/(.*googleapis.*)"],
};
