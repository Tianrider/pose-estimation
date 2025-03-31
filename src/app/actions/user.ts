"use server";

import {createClient} from "@/utils/supabase/server";

export async function getUserData() {
	try {
		const supabase = createClient();

		const {
			data: {user},
		} = await (await supabase).auth.getUser();

		if (!user) {
			return {success: false, error: "User not authenticated"};
		}

		const {data, error} = await (await supabase)
			.from("users")
			.select("*")
			.eq("id", user.id)
			.single();

		if (error) {
			console.error("Error fetching user data:", error);
			return {success: false, error: error.message};
		}

		return {success: true, data};
	} catch (error) {
		console.error("Error in server action:", error);
		return {success: false, error: "An unexpected error occurred"};
	}
}

export async function getLeaderboardData() {
	try {
		const supabase = createClient();

		const {data, error} = await (await supabase)
			.from("users")
			.select("*")
			.order("total_points", {ascending: false});

		if (error) {
			console.error("Error fetching leaderboard data:", error);
			return {success: false, error: error.message};
		}

		return {success: true, data};
	} catch (error) {
		console.error("Error in server action:", error);
		return {success: false, error: "An unexpected error occurred"};
	}
}
