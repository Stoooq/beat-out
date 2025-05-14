"server only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AuthTokens } from "./getGoogleOAuthTokens";

const encodedKey = new TextEncoder().encode(process.env.SECRET);

export type SessionPayload = {
	userId: string;
	userName: string;
	expiresAt: Date;
	googleTokens?: AuthTokens;
};

export async function encrypt(payload: SessionPayload) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("8h")
		.sign(encodedKey);
}

export async function decrypt(
	session: string | undefined = ""
): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(session, encodedKey, {
			algorithms: ["HS256"],
		});

		if (payload.expiresAt && typeof payload.expiresAt === 'string') {
            payload.expiresAt = new Date(payload.expiresAt);
        }

		return payload as SessionPayload;
	} catch (error) {
		console.log("Failed to verify session", error);
		return null;
	}
}

export async function getSession(): Promise<SessionPayload | null> {
	const session = (await cookies()).get("session")?.value;
	const payload = await decrypt(session);
	if (!payload) {
		return null;
	}
	return payload;
}

// export async function createSession(userId: string, userName: string) {
// 	const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
// 	const session = await encrypt({ userId, userName, expiresAt });

// 	(await cookies()).set("session", session, {
// 		httpOnly: true,
// 		secure: true,
// 		expires: expiresAt,
// 	});
// }

// export async function verifySession(): Promise<SessionPayload | null> {
// 	const cookieStore = await cookies();
// 	const sessionToken = cookieStore.get("session")?.value;
// 	const payload = await decrypt(sessionToken);

// 	if (!payload || payload.expiresAt.getTime() < Date.now()) {
// 		await deleteSession();
// 		return null;
// 	}
// 	return payload;
// }

export async function updateSession(newUserName: string) {
	const current = await getSession();
	if (!current) return null;

	const updatedPayload: SessionPayload = {
		userId: current.userId,
		userName: newUserName,
		expiresAt: current.expiresAt,
	};
	const newToken = await encrypt(updatedPayload);

	(await cookies()).set("session", newToken, {
		httpOnly: true,
		secure: true,
		expires: current.expiresAt,
	});
}

export async function deleteSession() {
	(await cookies()).delete({ name: "session", path: "/" });
}

export async function updateSessionWithGoogleAuth(
	googleAuthTokens: AuthTokens
) {
	const session = await getSession();
	if (!session) return null;

	const updatedPayload: SessionPayload = {
		...session,
		googleTokens: googleAuthTokens,
	};

	const updatedSession = await encrypt(updatedPayload);

	(await cookies()).set("session", updatedSession, {
		httpOnly: true,
		secure: true,
		expires: session.expiresAt,
	});
}
