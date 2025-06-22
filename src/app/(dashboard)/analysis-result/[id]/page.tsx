"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface AnalysisResult {
	_id: string;
	call_id: string;
	timestamp: string;
	user_avg_words_per_turn: number;
	agent_avg_words_per_turn: number;
	summary: string;
	agent_interest_score: number;
}

export default function AnalysisDetailPage() {
	const searchParams = useSearchParams();
	const room = searchParams.get("room");
	const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);

	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

	useEffect(() => {
		const fetchAnalysisResult = async () => {
			if (!room) {
				setError("No room ID provided");
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(`${backendUrl}/analysis-result?room=${room}`, {
					method: "GET",
					headers: {
						"ngrok-skip-browser-warning": "true",
					},
				});

				if (!response.ok) {
					throw new Error("Failed to fetch analysis result");
				}

				const result = await response.json();
				setAnalysisResult(result);
			} catch (error) {
				console.error("Error fetching analysis result:", error);
				setError("Failed to fetch analysis results. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchAnalysisResult();
	}, [room, backendUrl]);

	// Get interest level and styling
	const getInterestLevel = (score: number) => {
		if (score >= 0.8) return { level: "Very High", color: "text-green-400", bgColor: "bg-green-500/20" };
		if (score >= 0.6) return { level: "High", color: "text-green-300", bgColor: "bg-green-500/15" };
		if (score >= 0.4) return { level: "Moderate", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
		if (score >= 0.2) return { level: "Low", color: "text-orange-400", bgColor: "bg-orange-500/20" };
		return { level: "Very Low", color: "text-red-400", bgColor: "bg-red-500/20" };
	};

	if (isLoading) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
					<p className="text-white">Loading analysis results...</p>
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
					<Link
						href="/analysis-result"
						className="hover:cursor-pointer bg-white text-black px-6 py-3 rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300 font-medium">
						Back to History
					</Link>
				</div>
			</div>
		);
	}

	if (!analysisResult) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 max-w-md">
					<h2 className="text-xl font-bold text-white mb-4">No Results Found</h2>
					<p className="text-gray-300 mb-6">Could not find analysis results for this session.</p>
					<Link
						href="/analysis-result"
						className="hover:cursor-pointer bg-white text-black px-6 py-3 rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300 font-medium">
						Back to History
					</Link>
				</div>
			</div>
		);
	}

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
