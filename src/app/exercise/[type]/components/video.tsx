"use client";
import {useEffect, useRef, useState} from "react";
import {usePoseNet} from "@/utils/usePosenet";
import {draw, videoWidth, videoHeight, predict} from "@/utils/useCanvas";
import {Button} from "@/components/ui/button";

export default function VideoCanvas({type}: {type: string}) {
	const [webcamEnabled, setWebcamEnabled] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const poses = usePoseNet(webcamEnabled ? videoRef.current : null);
	const [prediction, setPrediction] = useState<{
		message: string;
		probability: number;
	}>({message: "-", probability: 0});

	useEffect(() => {
		if (webcamEnabled) {
			enableWebcam();
		} else {
			if (videoRef.current && videoRef.current.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;
				stream.getTracks().forEach((track) => track.stop());
				videoRef.current.srcObject = null;
			}
		}
	}, [webcamEnabled]);

	useEffect(() => {
		// Use the draw function from useCanvas utility
		draw(canvasRef.current, videoRef.current, poses);

		// Add prediction if we have poses
		if (poses && poses.length > 0) {
			const currentPrediction = predict(poses, type);
			setPrediction(currentPrediction);
		}
	}, [poses]);

	const enableWebcam = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false,
			});

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
		} catch (error) {
			console.error("Error accessing webcam:", error);
			setWebcamEnabled(false);
		}
	};

	return (
		<div className="flex flex-col items-center p-8">
			<Button onClick={() => setWebcamEnabled(!webcamEnabled)}>
				{webcamEnabled ? "Turn Off Camera" : "Turn On Camera"}
			</Button>

			<div className="relative">
				<video
					ref={videoRef}
					width={videoWidth}
					height={videoHeight}
					autoPlay
					playsInline
					style={{
						display: webcamEnabled ? "block" : "none",
						transform: "scaleX(-1)", // Mirror the video horizontally
					}}
					className="rounded-md"
				/>

				<canvas
					ref={canvasRef}
					width={videoWidth}
					height={videoHeight}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						display: webcamEnabled ? "block" : "none",
					}}
				/>

				{webcamEnabled && (
					<div
						className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md text-center min-w-[200px]"
						style={{zIndex: 10}}
					>
						<div className="text-lg font-bold">
							{prediction.message}
						</div>
						<div className="text-sm">
							Confidence:{" "}
							{Math.round(prediction.probability * 100)}%
						</div>
					</div>
				)}
			</div>

			{webcamEnabled && (
				<div className="mt-6 p-4 bg-gray-800 text-white rounded-md max-w-md">
					<h2 className="text-xl font-bold mb-2">
						How to perform a squat:
					</h2>
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
				</div>
			)}
		</div>
	);
}
