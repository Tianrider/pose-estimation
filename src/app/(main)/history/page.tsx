"use client";
import {useEffect, useState} from "react";
import {getWorkoutHistory} from "@/app/actions/history";
import {toast} from "sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Activity, Award, Calendar, Clock, Trophy} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {WorkoutHistoryItem} from "@/types/workout-types";
import {User} from "@/types/user-types";
import {getUserData} from "@/app/actions/user";
import {Skeleton} from "@/components/ui/skeleton";
import Link from "next/link";

export default function HistoryPage() {
	const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userData, setUserData] = useState<User | null>(null);

	useEffect(() => {
		async function loadWorkoutHistory() {
			try {
				setIsLoading(true);
				const response = await getWorkoutHistory();

				if (response.success) {
					setWorkouts(response.data || []);
				} else {
					toast.error(
						`Error loading workout history: ${response.error}`
					);
				}
			} catch (error) {
				console.error("Error loading workout history:", error);
				toast.error("Failed to load workout history");
			} finally {
				setIsLoading(false);
			}
		}

		async function loadUserData() {
			try {
				const data = await getUserData();
				if (data) {
					setUserData(data.data);
				} else {
					toast.error("Failed to load user data");
				}
			} catch (error) {
				console.error("Error loading user data:", error);
				toast.error("Failed to load user data");
			}
		}

		loadUserData();

		loadWorkoutHistory();
	}, []);

	function getExerciseDisplayName(exercise: string) {
		return exercise
			.replace(/-/g, " ")
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	return (
		<div className="container mx-auto py-10 h-full flex flex-col gap-6">
			<Card className="flex-shrink-0">
				<CardHeader>
					<CardTitle className="text-2xl flex items-center gap-2">
						<Trophy className="h-6 w-6 text-yellow-500" />
						Your Progress
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center gap-4">
							<div className="flex flex-col">
								<span className="text-muted-foreground text-sm">
									Total Points
								</span>
								<Skeleton className="h-10 w-20" />
							</div>
							<div className="flex flex-col">
								<span className="text-muted-foreground text-sm">
									Workouts
								</span>
								<Skeleton className="h-10 w-20" />
							</div>
						</div>
					) : (
						<div className="flex items-center gap-4">
							<div className="flex flex-col">
								<span className="text-muted-foreground text-sm">
									Total Points
								</span>
								<span className="text-3xl font-bold">
									{userData?.total_points || 0}
								</span>
							</div>
							<div className="flex flex-col">
								<span className="text-muted-foreground text-sm">
									Workouts
								</span>
								<span className="text-3xl font-bold">
									{workouts.length}
								</span>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="flex-grow h-full">
				<CardHeader>
					<CardTitle className="text-2xl flex items-center gap-2">
						<Activity className="h-6 w-6" />
						Workout History
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div>
							<Table className="border-separate border-spacing-0">
								<TableHeader className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
									<TableRow className="hover:bg-transparent">
										<TableHead>Exercise Type</TableHead>
										<TableHead>Reps</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Time</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Array(5)
										.fill(0)
										.map((_, index) => (
											<TableRow key={index}>
												<TableCell>
													<Skeleton className="h-8 w-24" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-6 w-12" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-6 w-20" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-6 w-16" />
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</div>
					) : workouts.length > 0 ? (
						<Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr:not(:last-child)_td]:border-b [&_tr]:border-none">
							<TableHeader className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
								<TableRow className="hover:bg-transparent">
									<TableHead>Exercise Type</TableHead>
									<TableHead>Reps</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Duration</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{workouts.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-lg">
											<Badge
												variant="outline"
												className="font-xl"
											>
												{getExerciseDisplayName(
													item.exercise
												)}
											</Badge>
										</TableCell>
										<TableCell>
											<span className="flex items-center gap-2">
												<Award className="h-4 w-4 text-yellow-500" />
												{item.reps}
											</span>
										</TableCell>
										<TableCell>
											<span className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												{item.formattedDate}
												{", "}
												{new Date(
													item.created_at
												).toLocaleString("id-ID", {
													timeZone: "Asia/Jakarta",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</TableCell>
										<TableCell>
											<span className="flex items-center gap-2">
												<Clock className="h-4 w-4 text-muted-foreground" />
												{item.formattedTime}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-10">
							<Activity className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
							<h3 className="text-lg font-medium mb-2">
								No workout history yet
							</h3>
							<p className="text-muted-foreground mb-4">
								Start exercising to see your workout history
								here.
							</p>
							<Button asChild>
								<Link href="/exercise">Start a Workout</Link>
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
