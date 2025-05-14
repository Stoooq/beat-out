interface YouTubeChannel {
	channel: {
		kind: string;
		etag: string;
		pageInfo: {
			totalResults: number;
			resultsPerPage: number;
		};
		items: Array<{
			kind: string;
			etag: string;
			id: string;
			snippet: {
				title: string;
				description: string;
				customUrl: string;
				publishedAt: string;
				thumbnails: {
					default: {
						url: string;
						width: number;
						height: number;
					};
					medium: {
						url: string;
						width: number;
						height: number;
					};
					high: {
						url: string;
						width: number;
						height: number;
					};
				};
				localized: {
					title: string;
					description: string;
				};
			};
		}>;
	};
}

export async function getYouTubeChannel({
	access_token,
}: {
	access_token: string;
}): Promise<YouTubeChannel | null> {
	try {
		const res = await fetch(
			`https://www.googleapis.com/youtube/v3/channels?access_token=${access_token}&part=snippet&mine=true`,
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!res.ok) {
			const err = await res.text();
			console.error("Fetch channel failed:", err);
			return null;
		}

		return res.json();
	} catch (error) {
		console.error("Something went wrong:", error);
		return null;
	}
}
