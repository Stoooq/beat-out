interface GoogleUSer {
	id: string;
	email: string;
	verified_email: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	locale: string;
}

export async function getGoogleUser({
	id_token,
	access_token,
}: {
	id_token: string;
	access_token: string;
}): Promise<GoogleUSer | null> {
	try {
		const res = await fetch(
			`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
			{
				headers: {
					Authorization: `Bearer ${id_token}`,
					"Content-Type": "application/json",
				},
			}
		);

        if (!res.ok) {
			const err = await res.text();
			console.error("Fetch user failed:", err);
			return null
		}

		return res.json();
	} catch (error) {
		console.error("Something went wrong:", error);
		return null;
	}
}
