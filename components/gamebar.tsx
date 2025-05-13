"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginButton } from "./login-button";

export default function Gamebar() {
	const [isJoinRoomChosen, setIsJoinRoomChosen] = useState(true);
	const router = useRouter();
	console.log(isJoinRoomChosen);

	return (
		<div className="flex flex-col w-full h-[25%] text-background">
			<div className="flex justify-between relative">
				<div
					className={`absolute w-[50%] h-full bg-foreground left-0 transition-transform duration-[0.3s] ease-out ${
						isJoinRoomChosen ? "translate-x-0" : "translate-x-full"
					}`}
				/>
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

			<div className="w-full h-full bg-foreground p-4">
				{isJoinRoomChosen ? (
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex gap-4 relative h-[60px] md:h-[80px] text-sm md:text-xl bg-background text-foreground rounded-full">
							<div className="text-2xl my-auto ml-8">#</div>
							<input className="w-full bg-transparent outline-none border-0" />
						</div>
						<div className="flex justify-center items-center w-full h-[60px] md:h-[80px] text-sm md:text-xl p-[6px] bg-primary rounded-[40px]">
							<div className="flex justify-center items-center w-full h-full bg-secondary text-foreground rounded-[34px]">
								Join room
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex gap-4 relative h-[60px] md:h-[80px] text-sm md:text-xl bg-background text-foreground rounded-full">
							<div className="text-2xl my-auto ml-8">#</div>
							<input className="w-full bg-transparent outline-none border-0" />
						</div>
						<div className="flex justify-center items-center w-full h-[60px] md:h-[80px] text-sm md:text-xl p-[6px] bg-primary rounded-[40px]">
							<button
								className="flex justify-center items-center w-full h-full bg-secondary text-foreground rounded-[34px]"
								onClick={() => {
									router.push("/lobby/12343");
								}}
							>
								Create room
                                <LoginButton />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
