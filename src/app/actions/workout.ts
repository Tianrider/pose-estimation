"use server";
import {createClient} from "@/utils/supabase/server";
import {revalidatePath} from "next/cache";

// Helper function to convert "MM:SS" format to seconds
function timeStringToSeconds(timeString: string): number {
	const [minutes, seconds] = timeString.split(":").map(Number);
	return minutes * 60 + seconds;
}

export async function logWorkoutAndAddPoints(
	exercise: string,
	reps: number,
	duration: string
) {
	try {
		// Calculate points based on reps (1 rep = 10 points)
		const points = reps;

		// Convert duration from "MM:SS" format to seconds
		const durationInSeconds = timeStringToSeconds(duration);

		// Initialize Supabase client
		const supabase = createClient();

		// Get the current user
		const {
			data: {user},
		} = await (await supabase).auth.getUser();

		if (!user) {
			return {success: false, error: "User not authenticated"};
		}

		// Call the RPC function
		const {data, error} = await (
			await supabase
		).rpc("log_workout_and_add_points", {
			_user_id: user.id,
			_exercise: exercise,
			_points: points,
			_duration: durationInSeconds,
		});

		console.log("RPC Response:", data, error);

		if (error) {
			console.error("Error logging workout:", error);
			return {success: false, error: error.message};
		}

		revalidatePath("/exercise/[type]");
		revalidatePath("/profile");

		return {success: true, points};
	} catch (error) {
		console.error("Error in server action:", error);
		return {success: false, error: "An unexpected error occurred"};
	}
}
