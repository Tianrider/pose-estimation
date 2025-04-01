"use server";

import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";

export async function signUp(formData: FormData) {
	const supabase = await createClient();
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const username = formData.get("username") as string;

	const {error} = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				username,
			},
		},
	});

	if (error) {
		return {error: error.message};
	}

	return {
		success: "Account created successfully!.",
	};
}

export async function signIn(formData: FormData) {
	const supabase = await createClient();
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	console.log(email, password);
	const {error} = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return {error: error.message};
	}

	redirect("/");
}

export async function signOut() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/auth/login");
}

export async function getCurrentUser() {
	const supabase = await createClient();
	const {data, error} = await supabase.auth.getUser();

	if (error || !data.user) {
		return {error: error?.message || "User not found", user: null};
	}
	console.log("User data:", data);
	return {
		user: {
			id: data.user.id,
			email: data.user.email,
			username: data.user.user_metadata?.username,
		},
		error: null,
	};
}
