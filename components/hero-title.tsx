"use client";

import {
	motion,
	useMotionValueEvent,
	useScroll,
	useTransform,
} from "motion/react";
import { useRef } from "react";

export default function HeroTitle() {
	const scrollRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: scrollRef,
		offset: ["100px", "end end"],
	});

	const move = useTransform(scrollYProgress, [0, 1], ["0deg", "180deg"]);

	// useMotionValueEvent(scrollYProgress, "change", (latest) => {
	// 	console.log("Page scroll: ", latest);
	// });

	return (
		<div
			ref={scrollRef}
			className="h-[75%] flex flex-col justify-center items-center text-[3rem] sm:[5rem] md:[7rem] lg:text-[10rem] font-bold uppercase"
		>
			<div className="flex">
				<motion.div
					initial={{ x: "-100vw", scaleY: 0.4 }}
					animate={{ x: 0, scaleY: 1 }}
					transition={{
						duration: 0.3,
						delay: 1,
						type: "spring",
					}}
					className="mr-12"
				>
					Who
				</motion.div>
				<motion.div
					initial={{ x: "100vw", scaleY: 0.4 }}
					animate={{ x: 0, scaleY: 1 }}
					transition={{
						duration: 0.3,
						delay: 1.1,
						type: "spring",
					}}
				>
					is
				</motion.div>
			</div>
			<div className="flex">
				<motion.div
					initial={{ x: "-100vw", scaleY: 0.4 }}
					animate={{ x: 0, scaleY: 1 }}
					transition={{
						duration: 0.3,
						delay: 1.2,
						type: "spring",
					}}
					className="mr-12"
				>
					off
				</motion.div>
				<motion.div
					initial={{ x: "100vw", scaleY: 0.4 }}
					animate={{ x: 0, scaleY: 1 }}
					transition={{
						duration: 0.3,
						delay: 1.3,
						type: "spring",
					}}
				>
					the
				</motion.div>
			</div>
			<div className="flex">
				<motion.div
					initial={{ x: "-100vw", scaleY: 0.4 }}
					animate={{ x: 0, scaleY: 1 }}
					transition={{
						duration: 0.3,
						delay: 1.4,
						type: "spring",
					}}
					className="mr-12"
				>
					beat
				</motion.div>
				<motion.div
					initial={{ x: "100vw", scaleY: 0.4 }}
					animate={{ x: 0, scaleY: 1 }}
					transition={{
						duration: 0.3,
						delay: 1.5,
						type: "spring",
					}}
				>
					?
				</motion.div>
			</div>
		</div>
	);
}
