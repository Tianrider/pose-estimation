import type {Metadata} from "next";
import "@/app/globals.css";
import SidebarComponent from "@/components/sidebar";

export const metadata: Metadata = {
	title: "Pose Estimation",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<>
			<SidebarComponent>
				<div className="bg-white w-full h-full overflow-auto">
					{children}
				</div>
			</SidebarComponent>
		</>
	);
}
