"use client";

import { SessionPayload, User } from "@/lib/session";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import { useLobbyStore } from "@/state/lobbyStore";
import { getSocket } from "@/lib/socket";
import { Slider } from "./ui/slider";
import CrownIcon from "./icons/crown-icon";
import { Playlists } from "@/lib/getYouTubePlaylists";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import OverlayCard from "./overlay-card";

export function LobbyCard({
	lobbyId,
	ownerId,
	session,
	users,
	playlists,
}: {
	lobbyId: string;
	ownerId: string;
	session: SessionPayload;
	users: User[];
	playlists: Playlists | null;
}) {
	const socket = getSocket();
	const { setLobby, gameOptions } = useLobbyStore();

	const [players, setPlayers] = useState<User[]>(users);
	const pathname = usePathname();
	const router = useRouter();

	const [rounds, setRounds] = useState(gameOptions.rounds);
	const [roundTime, setRoundTime] = useState(gameOptions.roundTime);
	const [playlist, setPlaylist] = useState(gameOptions.playlistId);

	const handleRoundsChange = (value: number) => {
		setRounds(value);
		setLobby({
			gameOptions: {
				...gameOptions,
				rounds: value,
			},
		});
	};

	const handleRoundTimeChange = (value: number) => {
		setRoundTime(value);
		setLobby({
			gameOptions: {
				...gameOptions,
				roundTime: value,
			},
		});
	};

	const handlePlaylistChange = (value: string) => {
		console.log(value);
		setPlaylist(value);
		setLobby({
			gameOptions: {
				...gameOptions,
				playlistId: value,
			},
		});
	};

	useEffect(() => {
		socket.on(
			"lobby-updated",
			({ lobbyId, players }: { lobbyId: string; players: User[] }) => {
				setPlayers(players);
				console.log(`${lobbyId} User connected: ${Array(players)}`);
				//todo when player joins play sound
			}
		);

		socket.on("round-initialized", () => {
			console.log("cos")
			router.push("/game")	
		})

		// socket.on(
		// 	"game-started",
		// 	({
		// 		currentRound,
		// 		impostor,
		// 		commonTrack,
		// 	}: {
		// 		currentRound: number;
		// 		impostor: { playerId: string; track: string };
		// 		commonTrack: string;
		// 	}) => {
		// 		setLobby({
		// 			currentRound: currentRound,
		// 			impostor: impostor,
		// 			commonTrack: commonTrack,
		// 		});
		// 		router.push("/game");
		// 	}
		// );

		return () => {
			socket.off("lobby-updated");
			socket.off("round-initialized");
		};
	}, [lobbyId]);

	useEffect(() => {
		if (!players.find((player) => player.userId === session.userId)) {
			socket.emit("join-lobby", {
				lobbyId: lobbyId,
				userId: session.userId,
				userName: session.userName,
			});
		}
	}, [lobbyId]);

	useEffect(() => {
		return () => {
			if (pathname !== "/lobby" && lobbyId) {
				socket.emit("leave-lobby", {
					lobbyId: lobbyId,
					userId: session.userId,
					userName: session.userName,
				});
			}
		};
	}, [pathname]);

	const handleStartGame = () => {
		socket.emit("initialize-round", {
			lobbyId: lobbyId,
		});
		// socket.emit("start-game", {
		// 	lobbyId: lobbyId,
		// 	access_token: session.googleTokens?.access_token,
		// 	gameOptions: gameOptions,
		// });
	};

	return (
		<OverlayCard className="relative grid grid-cols-1 md:grid-cols-2 gap-[32px]">
			<div className="w-full rounded-[72px]">
				<ScrollArea className="h-[472px] w-full">
					<div className="flex flex-col gap-[32px]">
						{players.map((player) => (
							<div key={player.userId} className="flex gap-2">
								<div className="h-16 min-w-16 rounded-full bg-[var(--bg-light)]"></div>
								<div className="flex justify-between items-center h-16 w-full px-6 rounded-full text-2xl bg-[var(--bg-light)]">
									{player.userName}
									{player.userId === ownerId && (
										<CrownIcon className="w-8 h-8 fill-current text-white" />
									)}
								</div>
							</div>
						))}
						{/* {Array(10 - players.length)
							.fill(null)
							.map((_, index) => (
								<div
									key={`empty-${index}`}
									className="flex justify-between items-center relative text-2xl h-16 px-4 rounded-full bg-secondary-foreground/50"
								>
									Available slot
								</div>
							))} */}
					</div>
				</ScrollArea>
			</div>
			<div className="w-full rounded-[72px]">
				<div className="flex flex-col gap-[32px]">
					<div className="flex flex-col justify-between items-center h-16">
						<div className="flex items-center gap-6">
							<div>Number of rounds</div>
							<div className="text-3xl">{rounds}</div>
						</div>
						<Slider
							defaultValue={[rounds]}
							max={10}
							min={1}
							step={1}
							onValueChange={(value) => handleRoundsChange(value[0])}
						/>
					</div>
					<div className="flex flex-col justify-between items-center h-16">
						<div className="flex items-center gap-6">
							<div>Time each of round</div>
							<div className="text-3xl">{roundTime}</div>
						</div>
						<Slider
							defaultValue={[roundTime]}
							max={60}
							min={10}
							step={1}
							onValueChange={(value) => handleRoundTimeChange(value[0])}
						/>
					</div>
					<Dialog>
						<DialogTrigger>
							{playlist && playlists ? (
								(() => {
									const selectedPlaylist = playlists.items.find(
										(item) => item.id === playlist
									);
									return selectedPlaylist ? (
										<div
											className="flex items-center gap-4 p-4 hover:bg-[var(--bg-light)]/50 cursor-pointer rounded-full"
											onClick={() => handlePlaylistChange(selectedPlaylist.id)}
										>
											<div className="relative min-w-16 h-16 rounded-full overflow-hidden">
												<Image
													alt="music thumbnail"
													src={selectedPlaylist.snippet.thumbnails.default.url}
													fill
													className="object-cover"
												/>
											</div>
											<div className="flex justify-between items-center h-16 w-full px-6 rounded-full text-xl bg-[var(--bg-light)]">
												<div>{selectedPlaylist.snippet.title}</div>
											</div>
										</div>
									) : (
										<div>Playlist not found</div>
									);
								})()
							) : (
								<div>Select your playlist</div>
							)}
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>Your latest playlists</DialogTitle>
							{playlists &&
								playlists.items.map((playlist) => (
									<div
										key={playlist.id}
										className="flex items-center gap-4 p-4 hover:bg-[var(--bg-light)]/50 cursor-pointer rounded-full"
										onClick={() => handlePlaylistChange(playlist.id)}
									>
										<div className="relative min-w-16 h-16 rounded-full overflow-hidden">
											<Image
												alt="music thumbnail"
												src={playlist.snippet.thumbnails.default.url}
												fill
												className="object-cover"
											/>
										</div>
										<div className="flex justify-between items-center h-16 w-full px-6 rounded-full text-xl bg-[var(--bg-light)]">
											<div>{playlist.snippet.title}</div>
										</div>
									</div>
								))}
						</DialogContent>
					</Dialog>
				</div>
			</div>
			<button className="p-4 cursor-pointer" onClick={handleStartGame}>
				Start game
			</button>
		</OverlayCard>
	);
}
