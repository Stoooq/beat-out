"server only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const encodedKey = new TextEncoder().encode(process.env.SECRET);

type SessionPayload = {
	userId: string;
	userName: string;
	expiresAt: Date;
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
		return payload as SessionPayload;
	} catch (error) {
		console.log("Failed to verify session", error);
		return null;
	}
}

export async function createSession(userId: string, userName: string) {
	const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
	const session = await encrypt({ userId, userName, expiresAt });

	(await cookies()).set("session", session, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
	});
}

export async function verifySession(): Promise<SessionPayload | null> {
	const cookieStore = await cookies();
	const sessionToken = cookieStore.get("session")?.value;
	const payload = await decrypt(sessionToken);

	if (!payload || payload.expiresAt.getTime() < Date.now()) {
		await deleteSession();
		return null;
	}
	return payload;
}

export async function updateSession(newUserName: string) {
	const current = await verifySession();
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
