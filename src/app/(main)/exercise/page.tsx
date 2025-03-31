import BentoOptions from "../components/bento-options";

export default function Page() {
	return (
		<div className="flex flex-col p-4 gap-4 lg:p-8 items-center justify-center h-full">
			<h3 className="text-3xl font-bold">
				What exercises do you want to do today?
			</h3>
			<BentoOptions />
		</div>
	);
}
