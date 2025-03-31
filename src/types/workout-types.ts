export interface WorkoutSession {
	id: string;
	user_id: string;
	exercise_type: string;
	reps: number;
	points_earned: number;
	duration: number;
	created_at: string;
}

export interface WorkoutHistoryItem {
	id: string;
	exercise: string;
	created_at: string;
	duration: number;
	reps: number;
	formattedDate: string;
	formattedTime: string;
}

export interface WorkoutTypes {
	squat: string;
	"jumping-jack": string;
}
