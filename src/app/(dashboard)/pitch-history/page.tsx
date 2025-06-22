"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Transcript {
	id: string;
	call_id: string;
	timestamp: string;
}

const formatDate = (timestamp: string) => {
	const date = new Date(timestamp);
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	}).format(date);
};

export default function AnalysisPage() {
	const [transcripts, setTranscripts] = useState<Transcript[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>("");

	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

	useEffect(() => {
		const fetchTranscripts = async () => {
			if (!backendUrl) {
				setError("Backend URL is not configured. Please check your environment variables.");
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(`${backendUrl}/transcripts`, {
					method: "GET",
					headers: {
						"ngrok-skip-browser-warning": "true",
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch transcripts: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				const sortedTranscripts = data.sort((a: Transcript, b: Transcript) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
				setTranscripts(sortedTranscripts);
			} catch (error) {
				console.error("Error fetching transcripts:", error);
				setError(error instanceof Error ? error.message : "Failed to load transcripts. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchTranscripts();
	}, [backendUrl]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
				<div className="max-w-6xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<Skeleton className="h-8 w-48 bg-white/10" />
						<Skeleton className="h-12 w-32 bg-white/10" />
					</div>

					<div className="grid gap-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
								<div className="flex items-center justify-between">
									<div>
										<Skeleton className="h-4 w-32 bg-white/10 mb-2" />
										<Skeleton className="h-4 w-48 bg-white/10" />
									</div>
									<Skeleton className="h-6 w-6 bg-white/10" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 max-w-md">
					<h2 className="text-xl font-bold text-white mb-4">Error</h2>
					<p className="text-gray-300 mb-6">{error}</p>
					<div className="space-y-4">
						<button
							onClick={() => window.location.reload()}
							className="hover:cursor-pointer bg-white text-black px-6 py-3 rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300 font-medium w-full">
							Try Again
						</button>
						<Link
							href="/dashboard"
							className="hover:cursor-pointer backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 block text-center">
							Back to Dashboard
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (transcripts.length === 0) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 max-w-md">
					<h2 className="text-xl font-bold text-white mb-4">No Transcripts Found</h2>
					<p className="text-gray-300 mb-6">You haven't completed any practice sessions yet.</p>
					<Link
						href="/call"
						className="hover:cursor-pointer bg-white text-black px-6 py-3 rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300 font-medium inline-block">
						Start Practice
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl text-white tracking-tight">Practice History</h1>
					<Link
						href="/call"
						className="hover:cursor-pointer bg-white text-black px-6 py-3 rounded-full hover:opacity-90 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300 font-medium">
						New Practice
					</Link>
				</div>

				<div className="grid gap-4">
					{transcripts.map((transcript) => (
						<Link
							key={transcript.id}
							href={`/pitch/${transcript.call_id}`}
							className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm mb-2">{formatDate(transcript.timestamp)}</p>
									<p className="text-white font-mono text-sm">{transcript.call_id}</p>
								</div>
								<div className="text-gray-400 hover:text-white transition-colors duration-200">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round">
										<path d="M9 18l6-6-6-6" />
									</svg>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
