import type {Metadata} from "next";
import "./globals.css";
import {UserProvider} from "@/contexts/user-context";
import {Toaster} from "sonner";

export const metadata: Metadata = {
	title: "Pose Estimation",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<body>
				<UserProvider>
					{children}
					<Toaster />
				</UserProvider>
			</body>
		</html>
	);
}
