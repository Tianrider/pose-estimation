import type {NextConfig} from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "global-uploads.webflow.com",
				pathname: "**",
			},
		],
	},
};

export default nextConfig;
