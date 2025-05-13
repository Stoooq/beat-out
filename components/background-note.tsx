"use client";

import { Music4 } from "lucide-react";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";

export default function BackgroundNote({ position }: { position: { x: number, y: number } }) {
	const [scope, animate] = useAnimate();

	const animateNotes = async () => {
		await animate(
			scope.current,
			{
				y: [0, 500, 0],
			},
			{ duration: 15, repeat: Infinity }
		);
	};

	useEffect(() => {
		animateNotes();
	}, []);

	return (
		<div className="absolute inset-0">
			<motion.div
				ref={scope}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 2 }}
				className={`absolute top-[${position.y}%] left-[${position.x}%] text-muted-foreground -z-10`}
			>
				<Music4 width={160} height={160} />
			</motion.div>
		</div>
	);
}
