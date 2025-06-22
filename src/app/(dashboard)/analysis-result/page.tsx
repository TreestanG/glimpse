"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Transcript {
	id: string;
	call_id: string;
	timestamp: string;
}

interface AnalysisResult {
	_id: string;
	call_id: string;
	timestamp: string;
	user_avg_words_per_turn: number;
	agent_avg_words_per_turn: number;
	summary: string;
	agent_interest_score: number;
}

// Function to format the date nicely
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

// Get interest level and styling
const getInterestLevel = (score: number) => {
	if (score >= 0.8) return { level: "Very High", color: "text-green-400", bgColor: "bg-green-500/20" };
	if (score >= 0.6) return { level: "High", color: "text-green-300", bgColor: "bg-green-500/15" };
	if (score >= 0.4) return { level: "Moderate", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
	if (score >= 0.2) return { level: "Low", color: "text-orange-400", bgColor: "bg-orange-500/20" };
	return { level: "Very Low", color: "text-red-400", bgColor: "bg-red-500/20" };
};

export default function AnalysisPage() {
	const searchParams = useSearchParams();
	const room = searchParams.get("room");

	// State for list view
	const [transcripts, setTranscripts] = useState<Transcript[]>([]);
	// State for detail view
	const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>("");

	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

	useEffect(() => {
		const fetchData = async () => {
			if (!backendUrl) {
				setError("Backend URL is not configured. Please check your environment variables.");
				setIsLoading(false);
				return;
			}

			try {
				if (room) {
					// Fetch single analysis result
					console.log("Fetching analysis:", `${backendUrl}/analysis-result?room=${room}`);
					const response = await fetch(`${backendUrl}/analysis-result?room=${room}`, {
						method: "GET",
						headers: {
							"ngrok-skip-browser-warning": "true",
							"Content-Type": "application/json",
						},
					});

					if (!response.ok) {
						throw new Error(`Failed to fetch analysis: ${response.status} ${response.statusText}`);
					}

					const result = await response.json();
					setAnalysisResult(result);
				} else {
					// Fetch list of transcripts
					console.log("Fetching transcripts:", `${backendUrl}/transcripts`);
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
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				setError(error instanceof Error ? error.message : "Failed to load data. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [backendUrl, room]);

	if (isLoading) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
					<p className="text-white">Loading...</p>
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

	// Show loading state for detail view
	if (isLoading && room) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
				<div className="max-w-4xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<Link
							href="/analysis-result"
							className="text-white hover:text-gray-300 transition-colors duration-200 flex items-center gap-2">
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
								<path d="M19 12H5M12 19l-7-7 7-7" />
							</svg>
							Back to History
						</Link>
					</div>

					<div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8">
						<div className="text-center mb-8">
							<Skeleton className="h-8 w-64 bg-white/10 mx-auto mb-2" />
							<Skeleton className="h-4 w-48 bg-white/10 mx-auto" />
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
							{/* Interest Score Card Loading State */}
							<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
								<Skeleton className="h-6 w-40 bg-white/10 mb-4" />
								<div className="text-center">
									<div className="mx-auto mb-4">
										<Skeleton className="h-24 w-24 rounded-full bg-white/10 mx-auto" />
									</div>
									<Skeleton className="h-6 w-32 bg-white/10 mx-auto mb-2" />
									<Skeleton className="h-2 w-full bg-white/10" />
								</div>
							</div>

							{/* Additional Stats Loading State */}
							<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
								<Skeleton className="h-6 w-40 bg-white/10 mb-4" />
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<Skeleton className="h-4 w-32 bg-white/10" />
										<Skeleton className="h-4 w-16 bg-white/10" />
									</div>
									<div className="flex justify-between items-center">
										<Skeleton className="h-4 w-32 bg-white/10" />
										<Skeleton className="h-4 w-16 bg-white/10" />
									</div>
									<div className="flex justify-between items-center">
										<Skeleton className="h-4 w-32 bg-white/10" />
										<Skeleton className="h-4 w-48 bg-white/10" />
									</div>
								</div>
							</div>
						</div>

						{/* Summary Section Loading State */}
						<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
							<Skeleton className="h-6 w-40 bg-white/10 mb-4" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-full bg-white/10" />
								<Skeleton className="h-4 w-full bg-white/10" />
								<Skeleton className="h-4 w-3/4 bg-white/10" />
							</div>
						</div>

						{/* Action Buttons Loading State */}
						<div className="flex justify-center gap-4">
							<Skeleton className="h-12 w-32 bg-white/10" />
							<Skeleton className="h-12 w-32 bg-white/10" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show loading state for list view
	if (isLoading && !room) {
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

	// Show detail view if room parameter is present and we have analysis result
	if (room && analysisResult) {
		const interestLevel = getInterestLevel(analysisResult.agent_interest_score);
		const timestamp = new Date(analysisResult.timestamp).toLocaleString();

		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
				<div className="max-w-4xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<Link
							href="/analysis-result"
							className="text-white hover:text-gray-300 transition-colors duration-200 flex items-center gap-2">
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
								<path d="M19 12H5M12 19l-7-7 7-7" />
							</svg>
							Back to History
						</Link>
					</div>

					<div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8">
						<div className="text-center mb-8">
							<h2 className="text-3xl font-bold text-white mb-2">Pitch Analysis Results</h2>
							<p className="text-gray-400 text-sm">Session analyzed on {timestamp}</p>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
							{/* Interest Score Card */}
							<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
								<h3 className="text-xl font-semibold text-white mb-4">VC Interest Level</h3>
								<div className="text-center">
									<div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${interestLevel.bgColor} mb-4`}>
										<span className={`text-2xl font-bold ${interestLevel.color}`}>
											{Math.round(analysisResult.agent_interest_score * 100)}%
										</span>
									</div>
									<p className={`text-lg font-medium ${interestLevel.color} mb-2`}>{interestLevel.level}</p>
									<div className="w-full bg-gray-700 rounded-full h-2">
										<div
											className={`h-2 rounded-full transition-all duration-500 ${
												analysisResult.agent_interest_score >= 0.8
													? "bg-green-400"
													: analysisResult.agent_interest_score >= 0.6
													? "bg-green-300"
													: analysisResult.agent_interest_score >= 0.4
													? "bg-yellow-400"
													: analysisResult.agent_interest_score >= 0.2
													? "bg-orange-400"
													: "bg-red-400"
											}`}
											style={{ width: `${analysisResult.agent_interest_score * 100}%` }}></div>
									</div>
								</div>
							</div>

							{/* Additional Stats */}
							<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
								<h3 className="text-xl font-semibold text-white mb-4">Session Stats</h3>
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<span className="text-gray-300">Your Avg Words/Turn:</span>
										<span className="text-white font-medium">{analysisResult.user_avg_words_per_turn}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-300">VC Avg Words/Turn:</span>
										<span className="text-white font-medium">{analysisResult.agent_avg_words_per_turn}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-300">Call ID:</span>
										<span className="text-gray-400 text-sm font-mono">{analysisResult.call_id}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Summary Section */}
						<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
							<h3 className="text-xl font-semibold text-white mb-4">Session Summary</h3>
							<p className="text-gray-300 leading-relaxed">{analysisResult.summary}</p>
						</div>

						{/* Action Buttons */}
						<div className="flex justify-center gap-4">
							<Link
								href="/call"
								className="hover:cursor-pointer backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
								Practice Again
							</Link>
							<Link
								href="/analysis-result"
								className="hover:cursor-pointer bg-white text-black px-6 py-3 rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300 font-medium">
								Back to History
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show list view if no room parameter or no analysis result
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
					<h1 className="text-3xl font-bold text-white">Practice History</h1>
					<Link
						href="/call"
						className="hover:cursor-pointer bg-white text-black px-6 py-3 rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300 font-medium">
						New Practice
					</Link>
				</div>

				<div className="grid gap-4">
					{transcripts.map((transcript) => (
						<Link
							key={transcript.id}
							href={`/analysis-result?room=${transcript.call_id}`}
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
