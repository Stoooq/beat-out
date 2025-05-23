"use client";

import { SessionPayload, User } from "@/lib/session";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ScrollArea } from "./ui/scroll-area";
import { Videos } from "@/lib/getYouTubeVideos";
import Image from "next/image";

const socket = io("http://localhost:3001");

export function LobbyCard({
	lobbyId,
	session,
	users,
	videos,
}: {
	lobbyId: string;
	session: SessionPayload;
	users: User[];
	videos: Videos | null;
}) {
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [players, setPlayers] = useState<User[]>(users);
	const pathname = usePathname();

	useEffect(() => {
		if (!players.find((player) => player.userId === session.userId)) {
			socket.emit("join-lobby", {
				lobbyId: lobbyId,
				userId: session.userId,
				userName: session.userName,
			});
		}

		socket.on(
			"lobby-updated",
			({ lobbyId, players }: { lobbyId: string; players: User[] }) => {
				setPlayers(players);
				console.log(`${lobbyId} User connected: ${Array(players)}`);
			}
		);

		if (pathname !== `/lobby/${lobbyId}`) {
			socket.emit("leave-lobby", {
				lobbyId: lobbyId,
				userId: session.userId,
				userName: session.userName,
			});
		}

		return () => {
			socket.off("lobby-updated");
		};
	}, [lobbyId, session.userId, session.userName, players, pathname]);

	return (
		<>
			{!isGameStarted ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full h-[1200px] md:h-[600px] p-[24px] bg-secondary-foreground rounded-[32px]">
					<div className="w-full bg-background rounded-[12px] p-[12px]">
						<ScrollArea className="h-[528px] w-full">
							<div className="flex flex-col gap-[12px]">
								{players.map((player) => (
									<div
										key={player.userId}
										className="text-2xl p-[12px] rounded-[6px] bg-secondary-foreground"
									>
										{player.userName}
									</div>
								))}
								{Array(10 - players.length)
									.fill(null)
									.map((_, index) => (
										<div
											key={`empty-${index}`}
											className="text-2xl p-[12px] rounded-[6px] bg-secondary-foreground/30 text-muted-foreground"
										>
											Available slot
										</div>
									))}
							</div>
						</ScrollArea>
					</div>
					<div className="w-full bg-background rounded-[12px] p-[12px]">
						<div className="flex flex-col gap-[12px] h-[528px]">
							{videos &&
								videos.items.map((video) => (
									<div key={video.id}>
										<Image
											alt="music thumbnail"
											width={64}
											height={64}
											src={video.snippet.thumbnails.default.url}
										/>
										{video.snippet.title}
									</div>
								))}
						</div>
					</div>
				</div>
			) : (
				<div>Game started</div>
			)}
		</>
	);
}
