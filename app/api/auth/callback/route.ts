import { getGoogleOAuthTokens } from "@/lib/getGoogleOAuthTokens";
import { getYouTubeVideos } from "@/lib/getYouTubeVideos";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	if (!code) {
		return NextResponse.json({ error: "No code provided" }, { status: 400 });
	}

	try {
		const tokens = await getGoogleOAuthTokens({ code });

    //?my playlist id PLV2DHXu7oypSzzClzc6MuhKgGJBz-5w3Y

    const videos = await getYouTubeVideos({ access_token: tokens!.access_token})

		// const playlists = await getYoutubePlaylists({
		// 	id_token: tokens!.id_token,
		// 	access_token: tokens!.access_token,
		// });

		// console.log(playlists);

		// const user = await getGoogleUser({ id_token, access_token });

		// const channel = await getYoutubeChannel({ id_token, access_token });

		// console.log(channel);
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
		redirect("/");
		return NextResponse.json({ videos }, { status: 200 });
	} catch (error) {
		console.error("Error in OAuth callback:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
