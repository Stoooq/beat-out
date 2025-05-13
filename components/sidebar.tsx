"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function Sidebar() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<motion.div
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ delay: 2 }}
			className={`fixed left-0 right-0 w-6xl mx-auto p-4 font-(family-name:--font-climate-crisis) z-50 ${!isOpen && 'backdrop-blur-md'}`}
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
					<motion.button
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ delay: 0.2 }}
						onClick={() => setIsOpen((prev) => !prev)}
						className="cursor-pointer p-4 relative z-60 text-[2rem] md:text-[3rem]"
					>
						Menu
					</motion.button>
				)}
			</AnimatePresence>
			<AnimatePresence mode="popLayout">
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ delay: 0.2 }}
						className="text-background relative z-60 text-[2rem] md:text-[3rem]"
					>
						<button
							onClick={() => setIsOpen((prev) => !prev)}
							className="p-4 cursor-pointer"
						>
							Close
						</button>
						<div className="p-4 cursor-pointer">Create room</div>
						<div className="p-4 cursor-pointer">Join room</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
