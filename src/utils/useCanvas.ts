import {drawKeypoints, drawSkeleton} from "./useHelper";
import * as posenet from "@tensorflow-models/posenet";
import {multiPoseDetection} from "./usePosenet";

export const videoWidth = 700;
export const videoHeight = 500;

export const average = (array: number[]) => {
	if (array.length === 0) {
		return 0;
	}

	return array.reduce((a, b) => a + b) / array.length;
};

export function predict(poses: posenet.Pose[], exerciseType: string) {
	const maxPose: posenet.Pose = poses.reduce(
		(a, b) => (a.score > b.score ? a : b),
		{
			score: 0,
		} as posenet.Pose
	);

	if (maxPose.score === 0) {
		return {message: "-", probability: 1};
	} else {
		const rightShoulder = maxPose.keypoints.filter(
			(k) => k.part === "rightShoulder"
		)[0];
		const rightElbow = maxPose.keypoints.filter(
			(k) => k.part === "rightElbow"
		)[0];
		// const rightWrist = maxPose.keypoints.filter(
		// 	(k) => k.part === "rightWrist"
		// )[0];

		const leftKnee = maxPose.keypoints.filter(
			(k) => k.part === "leftKnee"
		)[0];
		const rightKnee = maxPose.keypoints.filter(
			(k) => k.part === "rightKnee"
		)[0];

		const leftHip = maxPose.keypoints.filter(
			(k) => k.part === "leftHip"
		)[0];
		const rightHip = maxPose.keypoints.filter(
			(k) => k.part === "rightHip"
		)[0];

		if (exerciseType === "squat") {
			if (
				leftKnee.score < 0.2 ||
				leftHip.score < 0.2 ||
				rightKnee.score < 0.2 ||
				rightHip.score < 0.2
			) {
				return {
					message: "All hips and knees need to be visible",
					probability: average([
						leftKnee.score,
						leftHip.score,
						rightKnee.score,
						rightHip.score,
					]),
				};
			}

			const yDistanceHipsToShoulders = Math.abs(
				rightHip.position.y.valueOf() -
					rightShoulder.position.y.valueOf()
			);

			const isSquatting =
				rightKnee.position.y.valueOf() > rightHip.position.y.valueOf();

			const isStanding =
				rightKnee.position.y.valueOf() <
				rightHip.position.y.valueOf() + yDistanceHipsToShoulders * 0.2;

			if (isSquatting) {
				return {
					message: "squatting",
					probability: average([
						leftKnee.score,
						leftHip.score,
						rightKnee.score,
						rightHip.score,
					]),
				};
			} else if (isStanding) {
				return {
					message: "standing",
					probability: average([
						leftKnee.score,
						leftHip.score,
						rightKnee.score,
						rightHip.score,
					]),
				};
			}
		}

		if (exerciseType === "jumping-jack") {
			const rightEye = maxPose.keypoints.filter(
				(k) => k.part === "rightEye"
			)[0];

			const rightEar = maxPose.keypoints.filter(
				(k) => k.part === "rightEar"
			)[0];

			if (
				rightEar.score < 0.15 ||
				rightEye.score < 0.15 ||
				rightElbow.score < 0.15 ||
				rightShoulder.score < 0.15
			) {
				return {
					message: "Head, hands, and shoulders should be visible",
					probability: average([
						rightEar.score,
						rightEye.score,
						rightElbow.score,
						rightShoulder.score,
					]),
				};
			}

			const isHandsUp =
				rightElbow.position.y.valueOf() >
					rightShoulder.position.y.valueOf() &&
				rightElbow.position.y.valueOf() > rightEye.position.y.valueOf();

			const isHandsDown =
				rightElbow.position.y.valueOf() <
				rightShoulder.position.y.valueOf();

			if (isHandsUp) {
				return {
					message: "hands-up",
					probability: average([
						rightElbow.score,
						rightShoulder.score,
						rightEye.score,
					]),
				};
			}

			if (isHandsDown) {
				return {
					message: "hands-down",
					probability: average([
						rightElbow.score,
						rightShoulder.score,
					]),
				};
			}
		}

		return {message: "-", probability: rightShoulder.score};
	}
}

export function draw(
	canvas: HTMLCanvasElement | null,
	video: HTMLVideoElement | null,
	poses: posenet.Pose[]
) {
	if (canvas === null || video === null) {
		return;
	}
	const ctx = canvas.getContext("2d");
	if (ctx === null) {
		return;
	}
	ctx.save();
	ctx.scale(-1, 1);
	ctx.translate(-videoWidth, 0);
	ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
	ctx.restore();

	poses.forEach(({score, keypoints}) => {
		if (score >= multiPoseDetection.minPoseConfidence) {
			drawKeypoints(keypoints, multiPoseDetection.minPartConfidence, ctx);
			drawSkeleton(keypoints, multiPoseDetection.minPartConfidence, ctx);
			//drawBoundingBox(keypoints, ctx);
		}
	});
}

export function getFormattedDuration(startTime: Date, finishTime: Date) {
	const timeDifference = finishTime.getTime() - startTime.getTime();

	const minutes = Math.floor(timeDifference / 60000); // 1 minute = 60000 milliseconds
	const seconds = Math.floor((timeDifference % 60000) / 1000); // 1 second = 1000 milliseconds

	// Format the result as MM:ss
	const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
		seconds
	).padStart(2, "0")}`;

	return formattedTime;
}

export function getDuration(startTime: Date, finishTime: Date) {
	if (!startTime || !finishTime) {
		return 0;
	}
	const timeDifference = finishTime.getTime() - startTime.getTime();

	return timeDifference / 1000;
}
