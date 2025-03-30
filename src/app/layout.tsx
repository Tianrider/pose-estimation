import type {Metadata} from "next";
import {UserProvider} from "@/contexts/user-context";
import {Toaster} from "sonner";
import "./globals.css";
import SidebarComponent from "@/components/sidebar";

export const metadata: Metadata = {
	title: "Pose Estimation",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<body>
				<UserProvider>
					<SidebarComponent>
						<div className="bg-white w-full h-full overflow-auto">
							{children}
						</div>
					</SidebarComponent>
					<Toaster />
				</UserProvider>
			</body>
		</html>
	);
}
