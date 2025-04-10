import {redirect} from "next/navigation";
import VideoCanvas from "./components/video";

const VALID_EXERCISE_TYPES = ["squat", "jumping-jack"];

export default async function Page(props: {params: Promise<{type: string}>}) {
	const params = await props.params;
	const exerciseType = params.type;

	if (!VALID_EXERCISE_TYPES.includes(exerciseType)) {
		redirect("/exercise");
	}

	return (
		<div className="flex flex-col p-4 gap-4 lg:p-8">
			<h1 className="text-2xl font-bold capitalize">
				{exerciseType.replace("-", " ")}
			</h1>
			<VideoCanvas type={exerciseType} />
		</div>
	);
}
