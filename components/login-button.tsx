"use client";

import getGoogleOAuthURL from "@/lib/getGoogleAuthUrl";

export function LoginButton() {
	return (
		<a href={getGoogleOAuthURL()} className="btn">
			Zaloguj przez Google
		</a>
	);
}
