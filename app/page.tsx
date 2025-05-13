import Gamebar from "@/components/gamebar";
import HeroTitle from "@/components/hero-title";
import Sidebar from "@/components/sidebar";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export default async function Home() {
	const session = (await cookies()).get("session")?.value;
	const payload = await decrypt(session);
//   console.log(payload)

	return (
		<div className="min-h-screen">
			<Sidebar />
			<div className="max-w-6xl mx-auto">
				<div className="h-screen flex flex-col justify-center items-center font-(family-name:--font-climate-crisis)">
					<HeroTitle />
					<Gamebar />
				</div>
			</div>
			{/* <div className="bg-foreground min-h-[400px] text-background">
				<div className="max-w-6xl mx-auto flex justify-between md:justify-around pt-12 text-foreground uppercase font-(family-name:--font-climate-crisis)">
					<div className="flex justify-center items-center h-[60px] md:h-[80px] w-[180px] md:w-[250px] text-xs md:text-lg p-[6px] bg-primary rounded-[40px]">
						<div className="flex justify-center items-center w-full h-full bg-secondary rounded-[34px]">
							Create room
						</div>
					</div>
					<div className="flex justify-center items-center h-[60px] md:h-[80px] w-[180px] md:w-[250px] text-xs md:text-lg p-[6px] bg-primary rounded-[40px]">
						<div className="flex justify-center items-center w-full h-full bg-secondary rounded-[34px]">
							Join room
						</div>
					</div>
				</div>
			</div> */}
		</div>
	);
}
