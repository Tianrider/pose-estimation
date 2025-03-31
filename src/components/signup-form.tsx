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
import {signUp} from "@/app/actions/auth";
import Link from "next/link";
import {toast} from "sonner";
import {Eye, EyeOff} from "lucide-react";
import {useRouter} from "next/navigation";
import {useUser} from "@/contexts/user-context";

export function SignupForm({className, ...props}: React.ComponentProps<"div">) {
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordsMatch, setPasswordsMatch] = useState(true);
	const router = useRouter();
	const {refreshUser} = useUser();

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword(!showConfirmPassword);
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newPassword = e.target.value;
		setPassword(newPassword);
		setPasswordsMatch(
			newPassword === confirmPassword || confirmPassword === ""
		);
	};

	const handleConfirmPasswordChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const newConfirmPassword = e.target.value;
		setConfirmPassword(newConfirmPassword);
		setPasswordsMatch(password === newConfirmPassword);
	};

	async function handleSubmit(formData: FormData) {
		// Check if passwords match before submission
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setIsLoading(true);

		try {
			const result = await signUp(formData);
			if (result?.error) {
				toast.error(result.error);
				setIsLoading(false);
			}

			if (result?.success) {
				toast.success(result.success);
				await refreshUser();
				router.push("/auth/login");
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
					<CardTitle>Create your account</CardTitle>
					<CardDescription>
						Enter your details below to create a new account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={handleSubmit}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-3">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									name="username"
									type="text"
									placeholder="johndoe"
									required
									disabled={isLoading}
								/>
							</div>
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
								<div className="relative">
									<Input
										id="password"
										name="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="********"
										required
										disabled={isLoading}
										value={password}
										onChange={handlePasswordChange}
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2"
										onClick={togglePasswordVisibility}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4 text-gray-500" />
										) : (
											<Eye className="h-4 w-4 text-gray-500" />
										)}
									</button>
								</div>
							</div>
							<div className="grid gap-3">
								<div className="flex items-center">
									<Label htmlFor="confirmPassword">
										Confirm Password
									</Label>
								</div>
								<div className="relative">
									<Input
										id="confirmPassword"
										name="confirmPassword"
										type={
											showConfirmPassword
												? "text"
												: "password"
										}
										placeholder="********"
										required
										disabled={isLoading}
										value={confirmPassword}
										onChange={handleConfirmPasswordChange}
										className={
											!passwordsMatch
												? "border-red-500"
												: ""
										}
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2"
										onClick={
											toggleConfirmPasswordVisibility
										}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4 text-gray-500" />
										) : (
											<Eye className="h-4 w-4 text-gray-500" />
										)}
									</button>
								</div>
								{!passwordsMatch && (
									<p className="text-sm text-red-500">
										Passwords do not match
									</p>
								)}
							</div>
							<div className="flex flex-col gap-3">
								<Button
									type="submit"
									className="w-full"
									disabled={isLoading || !passwordsMatch}
								>
									{isLoading ? "Signing up..." : "Sign up"}
								</Button>
							</div>
						</div>
						<div className="mt-4 text-center text-sm">
							Already have an account?{" "}
							<Link
								href="/auth/login"
								className="underline underline-offset-4"
							>
								Login
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
