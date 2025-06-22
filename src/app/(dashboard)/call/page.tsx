"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import CallInterface from "@/components/CallInterface";
import { Skeleton } from "@/components/ui/skeleton";

export default function CallPage() {
	const { user, isLoaded } = useUser();
	const [token, setToken] = useState<string>("");
	const [isConnecting, setIsConnecting] = useState(true);
	const [error, setError] = useState<string>("");
	const [serverUrl, setServerUrl] = useState<string>("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisResult, setAnalysisResult] = useState<any>(null);
	const [room, setRoom] = useState<string>("");

	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

	useEffect(() => {
		if (!isLoaded || !user) return;

		const generateToken = async () => {
			const date = new Date();
			const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
			const room = `room-${user.id}-${dateStr}`;
			try {
				const params = new URLSearchParams({
					identity: `user-${user.id}`,
					room: room,
				});

				const response = await fetch(`${backendUrl}/get-token?${params.toString()}`, {
					method: "GET",
					headers: {
						"ngrok-skip-browser-warning": "true",
					},
				});

				if (!response.ok) {
					throw new Error("Failed to generate token");
				}

				const data = await response.json();
				setToken(data.token);
				setIsConnecting(false);
				setServerUrl(data.url);
				setRoom(room);
			} catch (error: any) {
				console.error("Error generating token:", error);
				setError("Failed to connect to the call. Please try again.");
				setIsConnecting(false);
			}
		};

		generateToken();
	}, [user, isLoaded]);

	const pollAnalysisResult = async () => {
		const maxAttempts = 24;
		let attempts = 0;

		const poll = async () => {
			try {
				const response = await fetch(`${backendUrl}/analysis-result?room=${room}`, {
					method: "GET",
					headers: {
						"ngrok-skip-browser-warning": "true",
					},
				});

				if (response.ok) {
					const result = await response.json();
					if (
						result &&
						result._id &&
						result.call_id &&
						result.timestamp &&
						result.user_avg_words_per_turn &&
						result.agent_avg_words_per_turn &&
						result.summary &&
						result.agent_interest_score !== undefined
					) {
						window.location.href = `/analysis-result?room=${room}`;
						return;
					}
				}

				attempts++;
				if (attempts < maxAttempts) {
					setTimeout(poll, 5000); // Poll every 5 seconds
				} else {
					setError("Analysis timed out. Please try again.");
					setIsAnalyzing(false);
				}
			} catch (error) {
				console.error("Error polling analysis result:", error);
				attempts++;
				if (attempts < maxAttempts) {
					setTimeout(poll, 5000);
				} else {
					setError("Failed to get analysis results. Please try again.");
					setIsAnalyzing(false);
				}
			}
		};

		poll();
	};

	const handleDisconnect = () => {
		window.location.href = "/call";
	};

	const handleEndCall = async () => {
		try {
			setIsAnalyzing(true);
			pollAnalysisResult();
		} catch (error) {
			console.error("Error starting analysis:", error);
			setError("Failed to start analysis. Please try again.");
			setIsAnalyzing(false);
		}
	};

	if (analysisResult) {
		const interestScore = analysisResult.agent_interest_score || 0;
		const summary = analysisResult.summary || "No summary available";
		const timestamp = analysisResult.timestamp ? new Date(analysisResult.timestamp).toLocaleString() : "Unknown";

		// Determine interest level and color
		const getInterestLevel = (score: number) => {
			if (score >= 0.8) return { level: "Very High", color: "text-green-400", bgColor: "bg-green-500/20" };
			if (score >= 0.6) return { level: "High", color: "text-green-300", bgColor: "bg-green-500/15" };
			if (score >= 0.4) return { level: "Moderate", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
			if (score >= 0.2) return { level: "Low", color: "text-orange-400", bgColor: "bg-orange-500/20" };
			return { level: "Very Low", color: "text-red-400", bgColor: "bg-red-500/20" };
		};

		const interestLevel = getInterestLevel(interestScore);

		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
				<div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 max-w-4xl w-full">
					<div className="text-center mb-8">
						<h2 className="text-3xl font-bold text-white mb-2">Pitch Analysis Complete!</h2>
						<p className="text-gray-400 text-sm">Session analyzed on {timestamp}</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
						{/* Interest Score Card */}
						<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
							<h3 className="text-xl font-semibold text-white mb-4">VC Interest Level</h3>
							<div className="text-center">
								<div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${interestLevel.bgColor} mb-4`}>
									<span className={`text-2xl font-bold ${interestLevel.color}`}>{Math.round(interestScore * 100)}%</span>
								</div>
								<p className={`text-lg font-medium ${interestLevel.color} mb-2`}>{interestLevel.level}</p>
								<div className="w-full bg-gray-700 rounded-full h-2">
									<div
										className={`h-2 rounded-full transition-all duration-500 ${
											interestScore >= 0.8
												? "bg-green-400"
												: interestScore >= 0.6
												? "bg-green-300"
												: interestScore >= 0.4
												? "bg-yellow-400"
												: interestScore >= 0.2
												? "bg-orange-400"
												: "bg-red-400"
										}`}
										style={{ width: `${interestScore * 100}%` }}></div>
								</div>
							</div>
						</div>

						{/* Additional Stats */}
						<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
							<h3 className="text-xl font-semibold text-white mb-4">Session Stats</h3>
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-gray-300">Your Avg Words/Turn:</span>
									<span className="text-white font-medium">{analysisResult.user_avg_words_per_turn || "N/A"}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-300">VC Avg Words/Turn:</span>
									<span className="text-white font-medium">{analysisResult.agent_avg_words_per_turn || "N/A"}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-300">Call ID:</span>
									<span className="text-gray-400 text-sm font-mono">{analysisResult.call_id || "N/A"}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Summary Section */}
					<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
						<h3 className="text-xl font-semibold text-white mb-4">Session Summary</h3>
						<p className="text-gray-300 leading-relaxed">{summary}</p>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-center gap-4">
						<button
							onClick={() => (window.location.href = "/call")}
							className="hover:cursor-pointer backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
							Practice Again
						</button>
						<button
							onClick={() => (window.location.href = "/dashboard")}
							className="hover:cursor-pointer bg-white text-black px-6 py-3 rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300 font-medium">
							Back to Dashboard
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (isAnalyzing) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
				<div className="max-w-7xl mx-auto h-full flex flex-col items-center">
					<div className="mb-6 w-full">
						<div className="flex items-center justify-between w-full">
							<Skeleton className="h-8 w-64 bg-white/10" />
							<Skeleton className="h-6 w-32 bg-white/10" />
						</div>
					</div>

					<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 w-full">
						<div className="relative">
							<Skeleton className="h-6 w-16 mb-2 bg-white/10" />
							<div className="aspect-video">
								<Skeleton className="w-full h-full rounded-xl bg-white/5 border-2 border-white/20" />
							</div>
						</div>

						<div className="relative">
							<Skeleton className="h-6 w-24 mb-2 bg-white/10" />
							<div className="aspect-video">
								<Skeleton className="w-full h-full rounded-xl bg-white/5 border-2 border-white/20" />
							</div>
						</div>
					</div>

					<div className="flex justify-center items-center gap-2 mb-8 bg-white/10 border border-white/20 rounded-full p-2 max-w-2xl w-full">
						<Skeleton className="h-12 w-32 rounded-full bg-white/10" />
						<Skeleton className="h-12 w-12 rounded-full bg-red-500/10" />
					</div>

					<div className="text-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 max-w-md">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
						<h3 className="text-xl font-bold text-white mb-2">Analyzing Your Performance</h3>
						<p className="text-gray-300">Please wait while we process your VC session...</p>
						<p className="text-gray-400 text-sm mt-2">This may take a few minutes</p>
					</div>
				</div>
			</div>
		);
	}

	if (!isLoaded) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
					<p className="text-white">Loading...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<p className="text-white mb-4">Please sign in to join the call</p>
					<button
						onClick={() => (window.location.href = "/")}
						className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
						Go Home
					</button>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 max-w-md">
					<h2 className="text-xl font-bold text-white mb-4">Connection Error</h2>
					<p className="text-gray-300 mb-6">{error}</p>
					<div className="space-y-4">
						<button
							onClick={() => window.location.reload()}
							className="hover:cursor-pointer w-full bg-white text-black px-4 py-2 rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-amber-400/50 transition-all duration-300">
							Try Again
						</button>
						<button
							onClick={() => (window.location.href = "/dashboard")}
							className="hover:cursor-pointer w-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
							Back to Dashboard
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (isConnecting || !token) {
		return (
			<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<h2 className="text-xl font-bold text-white mb-2">Connecting to Call</h2>
					<p className="text-gray-300">Please wait while we set up your session...</p>
				</div>
			</div>
		);
	}

	return (
		<CallInterface
			token={token}
			serverUrl={serverUrl}
			onDisconnect={handleDisconnect}
			onEndCall={handleEndCall}
		/>
	);
}
