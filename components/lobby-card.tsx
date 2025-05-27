"use client";

import { SessionPayload, User } from "@/lib/session";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ScrollArea } from "./ui/scroll-area";
import { Videos } from "@/lib/getYouTubeVideos";
import Image from "next/image";
import { useLobbyStore } from "@/state/lobbyStore";

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
	const { lobbyId: storedLobbyId, setLobby } = useLobbyStore();

	const [players, setPlayers] = useState<User[]>(users);
	const pathname = usePathname();
	const router = useRouter();

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

		socket.on(
			"game-started",
			({
				impostorTrack,
				commonTrack,
				impostorId,
			}: {
				impostorTrack: string;
				commonTrack: string;
				impostorId: string;
			}) => {
				console.log("Z LOBBY CARD", impostorTrack, commonTrack, impostorId);
				setLobby({
					impostor: {
						playerId: impostorId,
						track: impostorTrack,
					},
					commonTrack: commonTrack,
				});
				router.push("/game");
			}
		);

		return () => {
			socket.off("lobby-updated");
			socket.off("game-started");
		};
	}, [lobbyId, session.userId, session.userName, players]);

	useEffect(() => {
		return () => {
			if (lobbyId) {
				socket.emit("leave-lobby", {
					lobbyId: lobbyId,
					userId: session.userId,
					userName: session.userName,
				});
			}
		};
	}, [pathname]);

	const handleStartGame = () => {
		console.log("start game");
		socket.emit("start-game", {
			lobbyId: lobbyId,
			access_token: session.googleTokens?.access_token,
		});
	};

	return (
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
								{storedLobbyId}
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
			<button className="p-4 cursor-pointer" onClick={handleStartGame}>
				Start game
			</button>
		</div>
	);
}
