"use client";

import {useEffect, useState} from "react";
import {getLeaderboardData, getUserData} from "@/app/actions/user";
import {User} from "@/types/user-types";
import {toast} from "sonner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Trophy, Medal, Award} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";

export default function LeaderboardPage() {
	const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			setIsLoading(true);
			try {
				// Fetch leaderboard data
				const leaderboardResponse = await getLeaderboardData();
				if (leaderboardResponse.success && leaderboardResponse.data) {
					setLeaderboardData(leaderboardResponse.data);
				} else {
					toast.error(
						`Error loading leaderboard: ${leaderboardResponse.error}`
					);
				}

				// Fetch current user data
				const userResponse = await getUserData();
				if (userResponse && userResponse.data) {
					setCurrentUser(userResponse.data);
				}
			} catch (error) {
				console.error("Error loading data:", error);
				toast.error("Failed to load leaderboard data");
			} finally {
				setIsLoading(false);
			}
		}

		loadData();
	}, []);

	const getUserRank = (userId: string) => {
		return leaderboardData.findIndex((user) => user.id === userId) + 1;
	};

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Trophy className="h-5 w-5 text-yellow-500" />;
			case 2:
				return <Medal className="h-5 w-5 text-gray-400" />;
			case 3:
				return <Medal className="h-5 w-5 text-amber-700" />;
			default:
				return <span className="text-sm font-bold">{rank}</span>;
		}
	};

	return (
		<div className="container mx-auto py-10">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl flex items-center gap-2">
						<Trophy className="h-6 w-6 text-yellow-500" />
						Leaderboard
					</CardTitle>
				</CardHeader>

				<CardContent>
					{isLoading ? (
						// Skeleton loading state
						<div className="space-y-4">
							{Array(5)
								.fill(0)
								.map((_, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-3 rounded-md"
									>
										<div className="flex items-center gap-4">
											<Skeleton className="h-8 w-8 rounded-full" />
											<Skeleton className="h-6 w-32" />
										</div>
										<Skeleton className="h-6 w-16" />
									</div>
								))}
						</div>
					) : (
						<div className="space-y-1">
							{/* Current user highlight */}
							{currentUser && (
								<div className="bg-muted p-3 rounded-md mb-4">
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<span className="font-bold text-sm">
												Your Rank:
											</span>
											<span className="font-semibold">
												#{getUserRank(currentUser.id)}
											</span>
										</div>
										<div className="font-semibold flex items-center gap-2">
											<Award className="h-5 w-5 text-yellow-500" />
											{currentUser.total_points || 0}{" "}
											points
										</div>
									</div>
								</div>
							)}

							{/* Leaderboard list */}
							{leaderboardData.map((user, index) => (
								<div
									key={user.id}
									className={cn(
										"flex items-center justify-between p-3 rounded-md",
										currentUser &&
											user.id === currentUser.id
											? "bg-primary/10 border border-primary/30"
											: index % 2 === 0
											? "bg-muted/50"
											: ""
									)}
								>
									<div className="flex items-center">
										<div className="w-8 flex justify-center mr-3">
											{getRankIcon(index + 1)}
										</div>

										<span className="font-medium">
											{user.username || "Anonymous User"}
										</span>
									</div>

									<div className="font-bold">
										{user.total_points || 0} pts
									</div>
								</div>
							))}

							{leaderboardData.length === 0 && (
								<div className="text-center py-8 text-muted-foreground">
									No users found in the leaderboard yet.
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
