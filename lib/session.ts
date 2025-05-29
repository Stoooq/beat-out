"server only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AuthTokens } from "./getGoogleOAuthTokens";

const encodedKey = new TextEncoder().encode(process.env.SECRET);

export type User = {
	userId: string;
	userName: string;
};

export type SessionPayload = User & {
	expiresAt: number;
	googleTokens?: AuthTokens;
	lobbyId?: string;
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

		if (payload.expiresAt && typeof payload.expiresAt === "string") {
			payload.expiresAt = payload.expiresAt;
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
		expiresAt: Date.now() + googleAuthTokens.expires_in * 1000,
		googleTokens: {
			access_token: googleAuthTokens.access_token,
			expires_in: googleAuthTokens.expires_in,
			refresh_token: googleAuthTokens.refresh_token,
			scope: googleAuthTokens.scope,
			token_type: googleAuthTokens.token_type,
			id_token: googleAuthTokens.id_token,
			refresh_token_expires_in: googleAuthTokens.refresh_token_expires_in,
		},
	};

	console.log(
		"SESSION UPDATED WITH GOOGLE",
		updatedPayload,
		new Date(updatedPayload.googleTokens!.expires_in),
		new Date(updatedPayload.expiresAt),
	);

	const updatedSession = await encrypt(updatedPayload);

	(await cookies()).set("session", updatedSession, {
		httpOnly: true,
		secure: true,
		expires: updatedPayload.expiresAt,
	});
}

export async function refreshSessionWithGoogleAuth(
	googleAuthTokens: AuthTokens
) {
	const session = await getSession();
	if (!session || !session.googleTokens) return null;

	const updatedPayload: SessionPayload = {
		...session,
		expiresAt: Date.now() + googleAuthTokens.expires_in * 1000,
		googleTokens: {
			...session.googleTokens,
			access_token: googleAuthTokens.access_token,
			expires_in: googleAuthTokens.expires_in,
			refresh_token: googleAuthTokens.refresh_token ?? session.googleTokens.refresh_token,
		},
	};

	console.log(
		"SESSION REFRESED WITH GOOGLE",
		updatedPayload,
		new Date(updatedPayload.googleTokens!.expires_in),
		new Date(updatedPayload.expiresAt)
	);

	const updatedSession = await encrypt(updatedPayload);

	(await cookies()).set("session", updatedSession, {
		httpOnly: true,
		secure: true,
		expires: updatedPayload.expiresAt,
	});
}

export async function updateSessionWithLobbyId(lobbyId: string) {
	const session = await getSession();
	if (!session) return null;

	const updatedPayload: SessionPayload = {
		...session,
		lobbyId,
	};

	const updatedSession = await encrypt(updatedPayload);

	(await cookies()).set("session", updatedSession, {
		httpOnly: true,
		secure: true,
		expires: session.expiresAt,
	});
}
