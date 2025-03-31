"use server";

import {WorkoutHistoryItem, WorkoutSession} from "@/types/workout-types";
import {createClient} from "@/utils/supabase/server";
import {format} from "date-fns";

function formatTimeFromSeconds(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
		.toString()
		.padStart(2, "0")}`;
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();

	// Check if it's today
	if (date.toDateString() === now.toDateString()) {
		return "Today";
	}

	// Check if it's yesterday
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (date.toDateString() === yesterday.toDateString()) {
		return "Yesterday";
	}

	// Otherwise, return the formatted date
	return format(date, "MMM d, yyyy");
}

export async function getWorkoutHistory() {
	try {
		const supabase = createClient();

		// Get the current user
		const {
			data: {user},
		} = await (await supabase).auth.getUser();

		if (!user) {
			return {success: false, error: "User not authenticated"};
		}

		// Query the workout_sessions table
		const {data, error} = await (await supabase)
			.from("workout_sessions")
			.select("*")
			.eq("user_id", user.id)
			.order("created_at", {ascending: false});

		if (error) {
			console.error("Error fetching workout history:", error);
			return {success: false, error: error.message};
		}

		const formattedData: WorkoutHistoryItem[] = data.map(
			(item: WorkoutSession) => ({
				id: item.id,
				exercise: item.exercise_type,
				created_at: item.created_at,
				formattedDate: formatDate(item.created_at),
				formattedTime: formatTimeFromSeconds(item.duration),
				duration: item.duration,
				reps: item.reps,
			})
		);

		return {success: true, data: formattedData};
	} catch (error) {
		console.error("Error in getWorkoutHistory:", error);
		return {success: false, error: "An unexpected error occurred"};
	}
}
