interface Videos {
	videos: {
		kind: string;
		etag: string;
		nextPageToken?: string;
		items: Array<{
			kind: string;
			etag: string;
			id: string;
			snippet: {
				publishedAt: string;
				channelId: string;
				title: string;
				description: string;
				thumbnails: {
					default: { url: string; width: number; height: number };
					medium: { url: string; width: number; height: number };
					high: { url: string; width: number; height: number };
					standard?: { url: string; width: number; height: number };
					maxres?: { url: string; width: number; height: number };
				};
				channelTitle: string;
				playlistId: string;
				position: number;
				resourceId: {
					kind: string;
					videoId: string;
				};
				videoOwnerChannelTitle: string;
				videoOwnerChannelId: string;
			};
			contentDetails: {
				videoId: string;
				videoPublishedAt: string;
			};
		}>;
		pageInfo: {
			totalResults: number;
			resultsPerPage: number;
		};
	};
}

export async function getYouTubeVideos({
	access_token,
}: {
	access_token: string;
}): Promise<Videos | null> {
	try {
		const res = await fetch(
			`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=PLV2DHXu7oypSzzClzc6MuhKgGJBz-5w3Y&maxResults=10`,
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
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
