function getGoogleOAuthURL() {
	const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

	const options = {
		redirect_uri:
			`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` as string,
		client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT as string,
		access_type: "offline",
		response_type: "code",
		prompt: "consent",
		scope: [
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/youtube.readonly",
		].join(" "),
	};

	const qs = new URLSearchParams(options);

	console.log(options, qs);

	return `${rootUrl}?${qs.toString()}`;
}

export default getGoogleOAuthURL;
