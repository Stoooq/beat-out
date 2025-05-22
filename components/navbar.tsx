"use client";

import { SessionPayload } from "@/lib/session";
import { SquarePen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function Navbar({ session }: { session: SessionPayload }) {
	const [isOpen, setIsOpen] = useState(false);

	const [userName, setUserName] = useState(session.userName);

	return (
		<motion.div
			initial={{ y: "-100%" }}
			animate={{ y: 0 }}
			transition={{ delay: 2 }}
			className={`fixed left-0 right-0 w-6xl mx-auto p-4 font-(family-name:--font-climate-crisis) z-50 ${
				!isOpen && "backdrop-blur-md"
			}`}
		>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						key="expanding-circle-background"
						className="fixed top-0 left-0 w-1 h-1 bg-foreground rounded-full z-40"
						initial={{
							scale: 0,
						}}
						animate={{
							scale:
								window.innerHeight > window.innerWidth
									? window.innerHeight
									: window.innerWidth,
						}}
						exit={{
							scale: 0,
							transition: { duration: 0.7, ease: "circOut" },
						}}
						transition={{ duration: 0.7, ease: "circIn" }}
					/>
				)}
			</AnimatePresence>

			<AnimatePresence mode="popLayout">
				{!isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ delay: 0.2 }}
						className="flex justify-between items-center"
					>
						<motion.button
							onClick={() => setIsOpen((prev) => !prev)}
							className="cursor-pointer p-4 relative z-60 text-[1.5rem] md:text-[2rem]"
						>
							Menu
						</motion.button>
						<button className="flex gap-4 p-2 cursor-pointer">
							<input className="outline-none w-[120px]" defaultValue={session.userName} />
							<SquarePen />
						</button>
					</motion.div>
				)}
			</AnimatePresence>
			<AnimatePresence mode="popLayout">
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ delay: 0.2 }}
						className="text-background relative z-60 text-[1.5rem] md:text-[2rem]"
					>
						<button
							onClick={() => setIsOpen((prev) => !prev)}
							className="p-4 cursor-pointer"
						>
							Close
						</button>
						<div className="p-4 cursor-pointer">Sign in with Google</div>
						<div className="p-4 cursor-pointer">Terms of Service</div>
						<div className="p-4 cursor-pointer">Privacy Policy</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
