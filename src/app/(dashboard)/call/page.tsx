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
	const [room, setRoom] = useState<string>("");

	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

	useEffect(() => {
		if (!isLoaded || !user) return;

		const generateToken = async () => {
			const date = new Date();
			const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
			const timeStr = `${date.getHours().toString().padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}`;
			const room = `room-${user.id}-${dateStr}-${timeStr}`;
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
						window.location.href = `/pitch/${result.call_id}`;
						return;
					}
				}

				attempts++;
				if (attempts < maxAttempts) {
					setTimeout(poll, 5000);
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
