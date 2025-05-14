"use client";

import getGoogleOAuthUrl from "@/lib/getGoogleOAuthUrl";

export function LoginButton() {
	return (
		<a href={getGoogleOAuthUrl()} className="btn">
			Zaloguj przez Google
		</a>
	);
}
