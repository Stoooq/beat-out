import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encrypt } from "./lib/session";
import { customAlphabet } from "nanoid";

const nano = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

export async function middleware(request: NextRequest) {
	const cookie = request.cookies.get("session")?.value;
	const response = NextResponse.next();

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

	return response;
}

export const config = { matcher: "/" };
