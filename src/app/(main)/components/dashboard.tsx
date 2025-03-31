"use client";

import {useUser} from "@/contexts/user-context";
import BentoOptions from "./bento-options";
import {PointsCard} from "./points-card";
import {Skeleton} from "@/components/ui/skeleton";

function Dashboard() {
	const currenUser = useUser();
	return (
		<div className="flex flex-col p-4 gap-4 lg:p-8">
			<span>
				{currenUser.user?.username ? (
					<h4 className="text-lg">
						Welcome back, {currenUser.user?.username}
					</h4>
				) : (
					<Skeleton className="h-6 w-32" />
				)}
			</span>

			{/* Add the points card component */}
			<PointsCard />

			<h3 className="text-3xl font-bold">
				What exercises do you want to do today?
			</h3>
			<BentoOptions />
		</div>
	);
}

export {Dashboard};
