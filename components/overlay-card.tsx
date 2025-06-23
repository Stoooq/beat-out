import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function OverlayCard({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn(
				"relative w-full h-[calc(100vh-2rem)] p-[32px] md:p-[64px] rounded-[96px] bg-white/15 border-[3px] border-white/30 backdrop-blur-sm inset-shadow-sm inset-shadow-white/50",
				className
			)}
		>
			{children}
		</div>
	);
}
