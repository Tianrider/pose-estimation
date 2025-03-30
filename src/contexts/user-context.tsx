"use client";

import {createContext, useContext, useEffect, useState, ReactNode} from "react";
import {getCurrentUser} from "@/app/actions/auth";

type User = {
	id: string;
	email: string | undefined;
	username?: string;
} | null;

interface UserContextType {
	user: User;
	loading: boolean;
	error: string | null;
	refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({children}: {children: ReactNode}) {
	// Initialize with proper type
	const [user, setUser] = useState<User>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchUser = async () => {
		try {
			setLoading(true);

			const response = await getCurrentUser();

			if (response.error) {
				setError(response.error);
				setUser(null);
			} else if (response.user) {
				setUser({
					id: response.user.id,
					email: response.user.email,
					username: response.user.username,
				});
				setError(null);
			} else {
				setUser(null);
				setError("Failed to fetch user data");
			}
		} catch (err) {
			console.error("Error fetching user:", err);
			setError(
				err instanceof Error ? err.message : "Unknown error occurred"
			);
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUser();
	}, []);

	return (
		<UserContext.Provider
			value={{user, loading, error, refreshUser: fetchUser}}
		>
			{children}
		</UserContext.Provider>
	);
}

// Custom hook for using the user context
export function useUser() {
	const context = useContext(UserContext);

	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}

	return context;
}
