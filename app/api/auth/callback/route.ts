import { getGoogleOAuthTokens } from "@/lib/getGoogleOAuthTokens";
import { getYouTubeVideos } from "@/lib/getYouTubeVideos";
import { updateSessionWithGoogleAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	if (!code) {
		return NextResponse.json({ error: "No code provided" }, { status: 400 });
	}

	const tokens = await getGoogleOAuthTokens({ code });
	if (!tokens) {
		return NextResponse.json({ error: "No tokens" }, { status: 400 });
	}

	await updateSessionWithGoogleAuth(tokens);

	// const videos = await getYouTubeVideos({ access_token: tokens!.access_token });
	//?my playlist id PLV2DHXu7oypSzzClzc6MuhKgGJBz-5w3Y

	redirect("/");
}
