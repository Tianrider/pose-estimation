"use client";

import {Sidebar, SidebarBody, SidebarLink} from "@/components/ui/sidebar";
import {
	LayoutDashboard,
	UserCog,
	Settings,
	LogOut,
	User,
	Dumbbell,
	Trophy,
	History,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {motion} from "framer-motion";
import {useState} from "react";
import Link from "next/link";
import {useUser} from "@/contexts/user-context";

export default function SidebarComponent({
	children,
}: {
	children: React.ReactNode;
}) {
	const links = [
		{
			label: "Dashboard",
			href: "/",
			icon: (
				<LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: "Exercise",
			href: "/exercise",
			icon: (
				<Dumbbell className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: "History",
			href: "/history",
			icon: (
				<History className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: "Leaderboard",
			href: "/leaderboard",
			icon: (
				<Trophy className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},

		{
			label: "Profile",
			href: "/profile",
			icon: (
				<UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: "Settings",
			href: "/settings",
			icon: (
				<Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: "Logout",
			href: "/logout",
			icon: (
				<LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
	];

	const [open, setOpen] = useState(false);
	const currentUser = useUser();
	return (
		<div
			className={cn(
				"rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
				"h-screen"
			)}
		>
			<Sidebar open={open} setOpen={setOpen} animate={true}>
				<SidebarBody className="justify-between gap-10">
					<div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
						<Logo open={open} />
						<div className="mt-8 flex flex-col gap-2">
							{links.map((link, idx) => (
								<SidebarLink key={idx} link={link} />
							))}
						</div>
					</div>
					<div>
						<SidebarLink
							link={{
								label: `${currentUser.user?.email}`,
								href: "#",
								icon: (
									<User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
								),
							}}
						/>
					</div>
				</SidebarBody>
			</Sidebar>
			{/* <VideoCanvas /> */}
			{children}
		</div>
	);
}

export const Logo = ({open}: {open: boolean}) => {
	return (
		<Link
			href="#"
			className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
		>
			<div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
			<motion.span
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				className={cn(
					"font-medium text-black dark:text-white whitespace-pre",
					open ? "block" : "hidden"
				)}
			>
				Pose Estimation
			</motion.span>
		</Link>
	);
};
