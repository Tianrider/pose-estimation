"use server";
import {createClient} from "@/utils/supabase/server";

export async function getUserLeaderboardPosition() {
	try {
		const supabase = createClient();

		const {data: userData, error: userError} = await (
			await supabase
		).auth.getUser();

		if (userError) {
			console.error("Error fetching user:", userError);
			return {success: false, error: userError.message};
		}

		// Fetch all users ordered by total_points
		const {data, error} = await (await supabase)
			.from("users")
			.select("id, total_points")
			.order("total_points", {ascending: false});

		if (error) {
			console.error("Error fetching leaderboard position:", error);
			return {success: false, error: error.message};
		}

		// Find the user's position (index + 1)
		const position =
			data.findIndex((user) => user.id === userData.user.id) + 1;
		const totalUsers = data.length;

		return {
			success: true,
			position,
			totalUsers,
		};
	} catch (error) {
		console.error("Error in getUserLeaderboardPosition:", error);
		return {success: false, error: "An unexpected error occurred"};
	}
}

export async function getLeaderboardData() {
	try {
		const supabase = createClient();

		// Fetch top users sorted by total_points
		const {data, error} = await (await supabase)
			.from("users")
			.select("id, username, avatar_url, total_points")
			.order("total_points", {ascending: false})
			.limit(10); // Limiting to top 10

		if (error) {
			console.error("Error fetching leaderboard data:", error);
			return {success: false, error: error.message};
		}

		return {
			success: true,
			data: data,
		};
	} catch (error) {
		console.error("Error in getLeaderboardData:", error);
		return {success: false, error: "An unexpected error occurred"};
	}
}
