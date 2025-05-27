"use client";

import { useEffect, useRef } from "react";

interface YouTubeAudioProps {
	videoId: string;
	autoPlay?: boolean;
}

export function AudioPlayer({ videoId, autoPlay = true }: YouTubeAudioProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const params = new URLSearchParams({
			autoplay: autoPlay ? "1" : "0",
			controls: "0",
			disablekb: "1",
			modestbranding: "1",
			loop: "1",
			playlist: videoId,
		});

		if (iframeRef.current) {
			iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?${params}`;
		}
	}, [videoId, autoPlay]);

	return (
		<div>
			audio player
			<iframe
				ref={iframeRef}
				width="1000"
				height="1000"
				allow="autoplay"
				allowFullScreen={false}
				style={{ border: "none" }}
			/>
		</div>
	);
}
