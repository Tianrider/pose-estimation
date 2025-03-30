import {PersonStanding} from "lucide-react";
import {BentoCard, BentoGrid} from "@/components/ui/bento-grid";
import Image from "next/image";

const features = [
	{
		Icon: PersonStanding,
		name: "Squats",
		description: "Squats are a great way to build strength in your legs.",
		href: "/exercise/squat",
		cta: "Go",
		background: (
			<Image
				src="https://images.unsplash.com/photo-1536922246289-88c42f957773?q=80&w=2104&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
				alt="Squats"
				className="absolute opacity-60 w-full h-full object-cover"
				width={500}
				height={500}
			/>
		),
		className: "lg:row-start-1 lg:row-end-3  lg:col-start-1 lg:col-end-2",
	},
	{
		Icon: PersonStanding,
		name: "Jumping Jacks",
		description: "Jumping jacks are a great way to get your heart rate up.",
		href: "/exercise/jumping-jack",
		cta: "Go",
		background: (
			<Image
				src="https://global-uploads.webflow.com/5ca5fe687e34be0992df1fbe/603de9a87c4eb85a0a148140_2018-09-12_CARDIO2_02_WOMEN900LILAS---2641-----Expires-on-09-10-2022-min-p-3200.jpeg"
				alt="Squats"
				className="absolute opacity-60 w-full h-full object-cover"
				width={500}
				height={500}
			/>
		),
		className: "lg:row-start-1 lg:row-end-3 lg:col-start-2 lg:col-end-3",
	},
];

export default function BentoOptions() {
	return (
		<BentoGrid className="lg:grid-rows-1">
			{features.map((feature) => (
				<BentoCard key={feature.name} {...feature} />
			))}
		</BentoGrid>
	);
}
