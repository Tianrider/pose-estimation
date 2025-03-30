"use client";

import {useUser} from "@/contexts/user-context";
import BentoOptions from "./bento-options";

function Dashboard() {
	const currenUser = useUser();
	return (
		<div className="flex flex-col p-4 gap-4 lg:p-8">
			<span>
				<h4 className="text-lg">
					Welcome back, {currenUser.user?.username}
				</h4>
				<h3 className="text-3xl font-bold">
					What exercises do you want to do today?
				</h3>
			</span>
			<BentoOptions />
		</div>
	);
}

export {Dashboard};
