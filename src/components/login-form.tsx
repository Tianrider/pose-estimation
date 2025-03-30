"use client";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useState} from "react";
import {signIn} from "@/app/actions/auth";
import Link from "next/link";
import {toast} from "sonner";

export function LoginForm({className, ...props}: React.ComponentProps<"div">) {
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);

		try {
			const result = await signIn(formData);
			if (result?.error) {
				toast.error(result.error);
				setIsLoading(false);
			}
			return;
		} catch (e) {
			console.error(e);
			setIsLoading(false);
		}
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={handleSubmit}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-3">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
									disabled={isLoading}
								/>
							</div>
							<div className="grid gap-3">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
								</div>
								<Input
									id="password"
									name="password"
									type="password"
									required
									disabled={isLoading}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<Button
									type="submit"
									className="w-full"
									disabled={isLoading}
								>
									{isLoading ? "Logging in..." : "Login"}
								</Button>
							</div>
						</div>
						<div className="mt-4 text-center text-sm">
							Don&apos;t have an account?{" "}
							<Link
								href="/auth/signup"
								className="underline underline-offset-4"
							>
								Sign up
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
