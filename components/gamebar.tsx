"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginButton } from "./login-button";
import { motion } from "motion/react";
import { SessionPayload } from "@/lib/session";
import { createLobby } from "@/actions/create-lobby";
import { useLobbyStore } from "@/state/lobbyStore";
import { joinLobby } from "@/actions/join-lobby";

export default function Gamebar({ session }: { session: SessionPayload }) {
	const { setLobby } = useLobbyStore();

	const [lobbyInput, setLobbyInput] = useState("");
	const [isJoinRoomChosen, setIsJoinRoomChosen] = useState(true);
	const router = useRouter();

	const handleJoinLobby = (lobbyId: string) => {
		if (lobbyId) {
			joinLobby(lobbyId);
			setLobby({
				lobbyId: lobbyId,
			});
			router.push(`/lobby/${lobbyId}`);
		}
	};

	const handleCreateLobby = (lobbyId: string) => {
		if (lobbyId) {
			createLobby(lobbyId);
			setLobby({
				lobbyId: lobbyId,
			});
			router.push(`/lobby/${lobbyId}`);
		}
	};

	return (
		<motion.div
			initial={{ y: "100%" }}
			animate={{ y: 0 }}
			transition={{ delay: 2 }}
			className="flex flex-col w-full text-background"
		>
			<div className="flex justify-between relative text-[1rem] md:text-[1.5rem]">
				<div
					className={`absolute w-[50%] h-[50%] bg-foreground left-0 transition-transform duration-[0.3s] ease-out rounded-t-full ${
						isJoinRoomChosen ? "translate-x-0" : "translate-x-full"
					}`}
				/>
				<div className="absolute w-[50%] h-[50%] bg-foreground left-0 top-[50%] transition-transform duration-[0.3s] ease-out" />
				{/* <div className="flex justify-center absolute w-full h-[50%] bg-blue-200 top-[50%] transition-transform duration-[0.3s] ease-out">
					<div className="w-[20%] h-full bg-green-200" />
				</div> */}
				<div className="w-full p-4 relative z-10">
					<button
						className={`cursor-pointer w-full h-full text-center transition-colors duration-[0.2s] ${
							isJoinRoomChosen ? "text-background" : "text-foreground"
						}`}
						onClick={() => setIsJoinRoomChosen(true)}
					>
						Join room
					</button>
				</div>
				<div className="w-full p-4 relative z-10">
					<button
						className={`cursor-pointer w-full h-full text-center transition-colors duration-[0.2s] ${
							isJoinRoomChosen ? "text-foreground" : "text-background"
						}`}
						onClick={() => setIsJoinRoomChosen(false)}
					>
						Create room
					</button>
				</div>
			</div>

			<div className="w-full h-full bg-foreground p-4 text-[1.5rem] md:text-[2rem]">
				{isJoinRoomChosen ? (
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex gap-4 relative h-[60px] md:h-[80px] bg-background text-foreground rounded-full">
							<div className="text-2xl my-auto ml-8">#</div>
							<input
								className="w-full bg-transparent outline-none border-0 uppercase"
								maxLength={6}
								onChange={(e) => {
									const { value } = e.target;
									e.target.value = value.toUpperCase();
									setLobbyInput(value);
								}}
							/>
						</div>
						<div className="flex justify-center items-center w-full h-[60px] md:h-[80px] p-[6px] bg-primary rounded-[40px]">
							<button
								className="flex justify-center items-center w-full h-full bg-secondary text-foreground rounded-[34px]"
								onClick={() => handleJoinLobby(lobbyInput)}
							>
								Join room
							</button>
						</div>
					</div>
				) : (
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex gap-4 relative h-[60px] md:h-[80px] bg-background text-foreground rounded-full">
							<div className="text-2xl my-auto ml-8">#</div>
							<input
								className="w-full bg-transparent outline-none border-0 uppercase"
								maxLength={6}
								onChange={(e) => {
									const { value } = e.target;
									e.target.value = value.toUpperCase();
									setLobbyInput(value);
								}}
							/>
						</div>
						<div className="flex justify-center items-center w-full h-[60px] md:h-[80px] p-[6px] bg-primary rounded-[40px]">
							<button
								className="flex justify-center items-center w-full h-full bg-secondary text-foreground rounded-[34px]"
								onClick={() => handleCreateLobby(lobbyInput)}
							>
								{session.googleTokens ? (
									<div>Create room</div>
								) : (
									<LoginButton />
								)}
							</button>
						</div>
					</div>
				)}
			</div>
		</motion.div>
	);
}
