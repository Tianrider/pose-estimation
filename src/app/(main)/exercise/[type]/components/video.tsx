"use client";
import {useEffect, useRef, useState} from "react";
import {usePoseNet} from "@/utils/usePosenet";
import {
	draw,
	videoWidth,
	videoHeight,
	predict,
	getFormattedDuration,
} from "@/utils/useCanvas";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
	Camera,
	CameraOff,
	Pause,
	Play,
	Clock,
	Award,
	CheckCircle,
	Save,
	Home,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {logWorkoutAndAddPoints} from "@/app/actions/workout";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export default function VideoCanvas({type}: {type: string}) {
	const [webcamEnabled, setWebcamEnabled] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [score, setScore] = useState(0);
	const [startTime, setStartTime] = useState<Date | null>(null);
	const [elapsedTime, setElapsedTime] = useState("00:00");
	const [showRecap, setShowRecap] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [earnedPoints, setEarnedPoints] = useState<number>(0);
	const router = useRouter();
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const lastMessageRef = useRef<string>("-");

	const poses = usePoseNet(
		webcamEnabled && !isPaused ? videoRef.current : null
	);
	const [prediction, setPrediction] = useState<{
		message: string;
		probability: number;
	}>({message: "-", probability: 0});

	// Initialize timer when camera is enabled
	useEffect(() => {
		if (webcamEnabled && !isPaused) {
			if (!startTime) {
				setStartTime(new Date());
			}

			// Start timer update
			timerRef.current = setInterval(() => {
				if (startTime) {
					const now = new Date();
					setElapsedTime(getFormattedDuration(startTime, now));
				}
			}, 1000);
		} else {
			// Clear timer when camera is off or paused
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [webcamEnabled, isPaused, startTime]);

	// Enable/disable webcam
	useEffect(() => {
		if (webcamEnabled) {
			setIsLoading(true);
			enableWebcam();
		} else {
			if (videoRef.current && videoRef.current.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;
				stream.getTracks().forEach((track) => track.stop());
				videoRef.current.srcObject = null;
			}
		}
	}, [webcamEnabled]);

	// Process poses and update predictions
	useEffect(() => {
		// Use the draw function from useCanvas utility
		draw(canvasRef.current, videoRef.current, poses);

		// Add prediction if we have poses
		if (poses && poses.length > 0) {
			const currentPrediction = predict(poses, type);
			setPrediction(currentPrediction);

			// Update score when pose changes
			if (
				currentPrediction.message !== "-" &&
				currentPrediction.message !== lastMessageRef.current &&
				currentPrediction.probability > 0.7
			) {
				// For squats, count when going from standing to squatting or vice versa
				if (type === "squat") {
					if (
						(lastMessageRef.current === "standing" &&
							currentPrediction.message === "squatting") ||
						(lastMessageRef.current === "squatting" &&
							currentPrediction.message === "standing")
					) {
						setScore((prevScore) => prevScore + 1);
					}
				}

				// For jumping jacks, count when going from hands-down to hands-up or vice versa
				else if (type === "jumping-jack") {
					if (
						(lastMessageRef.current === "hands-down" &&
							currentPrediction.message === "hands-up") ||
						(lastMessageRef.current === "hands-up" &&
							currentPrediction.message === "hands-down")
					) {
						setScore((prevScore) => prevScore + 1);
					}
				}

				lastMessageRef.current = currentPrediction.message;
			}

			if (isLoading) setIsLoading(false);
		}
	}, [poses, type, isLoading]);

	const enableWebcam = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false,
			});

			if (videoRef.current) {
				videoRef.current.srcObject = stream;

				// Add event listener for when video is ready
				videoRef.current.onloadeddata = () => {
					// Even after the video loads, we still need time for pose detection
					// The isLoading state will be turned off once we get our first prediction
				};
			}
		} catch (error) {
			console.error("Error accessing webcam:", error);
			setWebcamEnabled(false);
			setIsLoading(false);
		}
	};

	const togglePause = () => {
		setIsPaused(!isPaused);

		if (videoRef.current) {
			if (isPaused) {
				videoRef.current.play();
			} else {
				videoRef.current.pause();
			}
		}
	};

	const handleFinish = () => {
		// Pause the session
		if (!isPaused) {
			setIsPaused(true);
			if (videoRef.current) {
				videoRef.current.pause();
			}
		}
		setShowRecap(true);
	};

	const handleSaveTraining = async () => {
		setIsSaving(true);

		try {
			const response = await logWorkoutAndAddPoints(
				type,
				Math.floor(score / 2),
				elapsedTime
			);

			if (response.success) {
				console.log("Training session saved successfully:", response);
				toast.success("Training session saved successfully!");
				setEarnedPoints(Math.floor(score / 2));
				setShowRecap(false);
				setShowSuccess(true);

				// Turn off webcam when workout is saved successfully
				if (webcamEnabled) {
					if (videoRef.current && videoRef.current.srcObject) {
						const stream = videoRef.current
							.srcObject as MediaStream;
						stream.getTracks().forEach((track) => track.stop());
						videoRef.current.srcObject = null;
					}
					setWebcamEnabled(false);
				}
			} else {
				console.error("Error saving training session:", response.error);
				toast.error(`Error saving training session: ${response.error}`);
			}
		} catch (error) {
			toast.error(`An error occurred while saving the session: ${error}`);
		} finally {
			setIsSaving(false);
		}
	};

	const handleGoToDashboard = () => {
		router.push("/");
	};

	return (
		<div className="flex flex-col items-center p-8">
			<div className="relative">
				{/* Score and Timer Display - only show when camera is active and not loading */}
				{webcamEnabled && !isLoading && (
					<div className="absolute top-0 left-0 right-0 z-20 bg-black bg-opacity-70 text-white p-3 flex justify-between items-center rounded-t-lg">
						<div className="flex items-center">
							<Award className="h-5 w-5 mr-2 text-yellow-400" />
							<span className="text-lg font-bold">
								{Math.floor(score / 2)}
							</span>
							<span className="text-sm ml-2">reps</span>
						</div>
						<div className="flex items-center">
							<Clock className="h-5 w-5 mr-2 text-blue-400" />
							<span className="text-lg font-mono">
								{elapsedTime}
							</span>
						</div>
					</div>
				)}

				{!webcamEnabled ? (
					<div
						className="bg-gray-800 rounded-lg shadow-lg flex flex-col items-center justify-center"
						style={{width: videoWidth, height: videoHeight}}
					>
						<Camera className="h-16 w-16 text-gray-400 mb-4" />
						<p className="text-gray-300 text-lg">
							Camera is turned off
						</p>
						<p className="text-gray-400 text-sm mt-2">
							Click the button below to enable your webcam
						</p>
					</div>
				) : isLoading ? (
					<div
						className="bg-gray-800 rounded-lg shadow-lg flex flex-col items-center justify-center"
						style={{width: videoWidth, height: videoHeight}}
					>
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
						<p className="text-gray-300 text-lg">
							Initializing camera...
						</p>
						<p className="text-gray-400 text-sm mt-2">
							Setting up pose detection
						</p>
					</div>
				) : null}

				<video
					ref={videoRef}
					width={videoWidth}
					height={videoHeight}
					autoPlay
					playsInline
					style={{
						transform: "scaleX(-1)", // Mirror the video horizontally
					}}
					className={cn(
						"rounded-lg shadow-lg absolute z-[-100]",
						webcamEnabled ? "opacity-0" : "opacity-0"
					)}
				/>

				<canvas
					ref={canvasRef}
					width={videoWidth}
					height={videoHeight}
					style={{
						position: "relative",
						top: 0,
						left: 0,
						display: webcamEnabled && !isLoading ? "block" : "none",
					}}
				/>

				<div className="mt-4 flex justify-center gap-3">
					<Button
						onClick={() => setWebcamEnabled(!webcamEnabled)}
						className={cn(
							"px-6 h-14",
							isLoading ? "opacity-50" : ""
						)}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
								Loading...
							</>
						) : webcamEnabled ? (
							<>
								<CameraOff className="h-10 w-10 mr-1" /> Turn
								Off Camera
							</>
						) : (
							<>
								<Camera className="h-10 w-10 mr-1" /> Turn On
								Camera
							</>
						)}
					</Button>

					{webcamEnabled && !isLoading && (
						<>
							<Button
								onClick={togglePause}
								variant={isPaused ? "default" : "outline"}
								className="h-14 w-28"
							>
								{isPaused ? (
									<>
										<Play className="h-5 w-5 mr-2" /> Resume
									</>
								) : (
									<>
										<Pause className="h-5 w-5 mr-2" /> Pause
									</>
								)}
							</Button>
							<Button
								onClick={handleFinish}
								variant="secondary"
								className="h-14 w-28"
							>
								<CheckCircle className="h-5 w-5 mr-2" /> Finish
							</Button>
						</>
					)}
				</div>

				{webcamEnabled && !isLoading && (
					<div
						className={cn(
							"absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-opacity-70 text-white px-4 py-2 rounded-md text-center min-w-[200px]",
							isPaused ? "bg-red-900" : "bg-black "
						)}
						style={{zIndex: 10}}
					>
						{isPaused ? (
							<div className="text-lg font-bold">PAUSED</div>
						) : (
							<>
								<div className="text-lg font-bold">
									{prediction.message === "-"
										? "Waiting for pose..."
										: prediction.message}
								</div>
								<div className="text-sm">
									Confidence:{" "}
									{Math.round(prediction.probability * 100)}%
								</div>
							</>
						)}
					</div>
				)}
			</div>

			{/* Exercise instructions */}
			<div className="mt-6 p-4 bg-gray-800 text-white rounded-md max-w-md">
				<h2 className="text-xl font-bold mb-2">
					How to perform a {type.replace("-", " ")}:
				</h2>
				{type === "squat" ? (
					<ol className="list-decimal pl-5 space-y-2">
						<li>Stand with feet shoulder-width apart</li>
						<li>Keep your back straight and chest up</li>
						<li>Lower your body by bending your knees</li>
						<li>Go down until thighs are parallel to the floor</li>
						<li>
							Push through your heels to return to standing
							position
						</li>
					</ol>
				) : type === "jumping-jack" ? (
					<ol className="list-decimal pl-5 space-y-2">
						<li>
							Stand upright with your legs together, arms at your
							sides
						</li>
						<li>Bend your knees slightly, and jump into the air</li>
						<li>
							As you jump, spread your legs to about
							shoulder-width apart
						</li>
						<li>
							Simultaneously raise your arms out and over your
							head
						</li>
						<li>
							Jump back to starting position with arms at sides
						</li>
						<li>Repeat movement rapidly</li>
					</ol>
				) : (
					<p>
						Instructions for this exercise type will be added soon.
					</p>
				)}
			</div>

			{/* Training Recap Dialog */}
			<Dialog open={showRecap} onOpenChange={setShowRecap}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Training Recap</DialogTitle>
						<DialogDescription>
							Your {type.replace("-", " ")} session summary
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						<div className="flex items-center justify-between border-b pb-2">
							<div className="flex items-center">
								<Award className="h-6 w-6 text-yellow-500 mr-2" />
								<span className="text-sm font-medium">
									Total Repetitions:
								</span>
							</div>
							<span className="text-2xl font-bold">
								{Math.floor(score / 2)}
							</span>
						</div>
						<div className="flex items-center justify-between border-b pb-2">
							<div className="flex items-center">
								<Clock className="h-6 w-6 text-blue-500 mr-2" />
								<span className="text-sm font-medium">
									Workout Duration:
								</span>
							</div>
							<span className="text-2xl font-mono">
								{elapsedTime}
							</span>
						</div>
					</div>
					<DialogFooter className="flex justify-between sm:justify-between">
						<Button
							variant="outline"
							onClick={() => setShowRecap(false)}
						>
							Close
						</Button>
						<Button
							onClick={handleSaveTraining}
							className="gap-2"
							disabled={isSaving}
						>
							{isSaving ? (
								<>
									<div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
									Saving...
								</>
							) : (
								<>
									<Save className="h-4 w-4" />
									Save Session
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Success Dialog - Make it non-dismissible */}
			<Dialog
				open={showSuccess}
				onOpenChange={(open) => {
					// Prevent closing the dialog by clicking outside or escape key
					if (!open) {
						// Do nothing, keeps the dialog open
						// Or redirect to home directly
						router.push("/");
					}
				}}
				modal={true}
			>
				<DialogContent
					className="sm:max-w-md"
					onEscapeKeyDown={(e) => e.preventDefault()}
					onPointerDownOutside={(e) => e.preventDefault()}
				>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-green-600">
							<CheckCircle className="h-6 w-6" />
							Workout Saved Successfully!
						</DialogTitle>
						<DialogDescription>
							Your {type.replace("-", " ")} session has been
							recorded.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						<div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
							<p className="text-green-800 mb-2">You earned</p>
							<p className="text-3xl font-bold text-green-600 flex items-center justify-center">
								<Award className="h-6 w-6 mr-2 text-yellow-500" />
								{earnedPoints} points
							</p>
						</div>
						<p className="text-center text-gray-600">
							Keep up the good work! Regular exercise helps you
							stay healthy and earn more points.
						</p>
					</div>
					<DialogFooter className="flex justify-center">
						<Button
							onClick={handleGoToDashboard}
							className="gap-2 w-full"
						>
							<Home className="h-4 w-4" />
							Go to Home
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
