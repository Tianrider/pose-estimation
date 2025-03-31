"use client";
import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Award, Crown, Medal, Trophy} from "lucide-react";
import {getUserLeaderboardPosition} from "@/app/actions/leaderboard";
import {Skeleton} from "@/components/ui/skeleton";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {User} from "@/types/user-types";
import {getUserData} from "@/app/actions/user";

export function PointsCard() {
	const [userData, setUserData] = useState<User | null>(null);
	const [leaderboardInfo, setLeaderboardInfo] = useState<{
		position: number;
		totalUsers: number;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchLeaderboardPosition() {
			try {
				setIsLoading(true);
				const result = await getUserLeaderboardPosition();

				if (result.success) {
					setLeaderboardInfo({
						position: result.position || 0,
						totalUsers: result.totalUsers || 0,
					});
				}
			} catch (error) {
				console.error("Error fetching leaderboard position:", error);
			} finally {
				setIsLoading(false);
			}
		}

		async function fetchUserData() {
			try {
				const response = await getUserData();

				if (response.success && response.data) {
					setUserData(response.data);
				} else {
					console.error("Error fetching user data:", response.error);
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		}

		fetchUserData();
		fetchLeaderboardPosition();
	}, []);

	function getPositionIcon() {
		if (!leaderboardInfo) return null;

		switch (leaderboardInfo.position) {
			case 1:
				return <Crown className="h-6 w-6 text-yellow-500" />;
			case 2:
				return <Medal className="h-6 w-6 text-gray-400" />;
			case 3:
				return <Medal className="h-6 w-6 text-amber-700" />;
			default:
				return <Trophy className="h-6 w-6 text-blue-500" />;
		}
	}

	function getPositionText() {
		if (!leaderboardInfo) return "Loading...";

		const {position, totalUsers} = leaderboardInfo;

		if (position === 1) return "You're in 1st place! 👑";
		if (position === 2) return "You're in 2nd place! 🥈";
		if (position === 3) return "You're in 3rd place! 🥉";
		// For positions in the top 10%
		if (position <= Math.ceil(totalUsers * 0.1))
			return `You're in the top 10%! (#${position})`;

		// For positions in the top 25%
		if (position <= Math.ceil(totalUsers * 0.25))
			return `You're in the top 25%! (#${position})`;

		// For positions in the top 50%
		if (position <= Math.ceil(totalUsers * 0.5))
			return `You're in the top 50%! (#${position})`;

		// For everyone else
		return `Your rank: #${position} of ${totalUsers}`;
	}

	return (
		<>
			{!isLoading ? (
				<Card className="mb-6 h-62">
					<CardHeader>
						<CardTitle className="text-xl flex items-center gap-2">
							<Award className="h-5 w-5 text-yellow-500" />
							Your Points
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">
										Total Points:
									</span>
								</div>

								{isLoading ? (
									<Skeleton className="h-6 w-10" />
								) : (
									<span className="text-3xl font-bold">
										{userData?.total_points || 0}
									</span>
								)}
							</div>

							{isLoading ? (
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										Leaderboard:
									</span>
									<Skeleton className="h-6 w-32" />
								</div>
							) : (
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										Leaderboard:
									</span>
									<div className="flex items-center gap-2">
										{getPositionIcon()}
										<span className="font-medium">
											{getPositionText()}
										</span>
									</div>
								</div>
							)}

							<div className="mt-2">
								<Button
									asChild
									variant="outline"
									className="w-full"
								>
									<Link href="/leaderboard">
										View Full Leaderboard
									</Link>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			) : (
				<Card className="mb-6 h-62">
					<CardHeader>
						<Skeleton className="h-8 w-32" />
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-4">
							<div className="flex items-center justify-between">
								<Skeleton className="h-8 w-full" />
							</div>

							<div className="flex items-center justify-between">
								<Skeleton className="h-8 w-full" />
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}
