import Gamebar from "@/components/gamebar";
import HeroTitle from "@/components/hero-title";
import Navbar from "@/components/navbar";
import { getSession } from "@/lib/session";

export default async function Home() {
	const session = await getSession();

	if (!session) {
		return <>No session</>;
	}
	//bg-[url('/lalka_bg_blue.jpg')] bg-no-repeat bg-cover bg-blend-overlay
	return (
		<div className="min-h-screen">
			<Navbar session={session} />
			<div className="max-w-6xl mx-auto">
				<div className="h-screen flex flex-col justify-center items-center font-(family-name:--font-climate-crisis)">
					<HeroTitle />
					<Gamebar session={session} />
				</div>
			</div>
		</div>
	);
}
