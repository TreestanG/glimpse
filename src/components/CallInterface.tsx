import React, { useEffect, useRef } from "react";
import { LiveKitRoom, VideoTrack, useParticipants, useLocalParticipant, useTracks, useVoiceAssistant, useRoomContext } from "@livekit/components-react";
import { Track, Participant, TrackPublication, LocalTrack } from "livekit-client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CallInterfaceProps {
	token: string;
	serverUrl: string;
	onDisconnect?: () => void;
}

interface ParticipantVideoProps {
	participant: Participant;
	isSpeaking: boolean;
	isLocal?: boolean;
}

function ParticipantVideo({ participant, isSpeaking, isLocal = false }: ParticipantVideoProps) {
	const videoTrack = participant.videoTrackPublications.values().next().value as TrackPublication;

	return (
		<div
			className={cn(
				"relative w-full h-full rounded-xl overflow-hidden backdrop-blur-md bg-white/5 border-2 transition-all duration-200",
				isSpeaking ? "border-green-400 shadow-lg shadow-green-400/30" : "border-white/20"
			)}>
			{videoTrack && !videoTrack.isMuted ? (
				<VideoTrack
					trackRef={{
						participant,
						publication: videoTrack,
						source: Track.Source.Camera,
					}}
					className="w-full h-full object-cover"
				/>
			) : (
				<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
					<div className="text-center">
						<div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl text-white font-bold">{participant.name?.[0] || (isLocal ? "Y" : "V")}</span>
						</div>
						<p className="text-white text-sm">{isLocal ? "You" : participant.name || "VC Persona"}</p>
					</div>
				</div>
			)}

			<div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-sm">
				{isLocal ? "You" : participant.name || "VC Persona"}
			</div>
		</div>
	);
}

interface RemoteAudioProps {
	track: Track | null | undefined;
	participant: Participant;
}

function RemoteAudio({ track, participant }: RemoteAudioProps) {
	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		if (!track || !audioRef.current) return;

		const element = track.attach();
		audioRef.current.srcObject = element.srcObject;

		audioRef.current.play().catch((err) => console.warn("Audio playback failed", err));

		return () => {
			if (audioRef.current) {
				track.detach(audioRef.current);
			}
		};
	}, [track]);

	return (
		<audio
			key={participant.identity}
			ref={audioRef}
			autoPlay
		/>
	);
}

function RemoteAudioRenderer() {
	const tracks = useTracks([Track.Source.Microphone, Track.Source.Unknown], { updateOnlyOn: [] });
	const { localParticipant } = useLocalParticipant();

	const remoteAudioTracks = tracks.filter(
		({ participant, publication }) => participant.identity !== localParticipant.identity && publication.kind === "audio"
	);

	return (
		<>
			{remoteAudioTracks.map(({ publication, participant }) => (
				<RemoteAudio
					key={participant.identity}
					track={publication.track}
					participant={participant}
				/>
			))}
		</>
	);
}

function MuteButton() {
	const { localParticipant } = useLocalParticipant();
	const [isLoading, setIsLoading] = React.useState(false);
	const microphonePublication = localParticipant?.getTrackPublication(Track.Source.Microphone);
	const isMuted = microphonePublication?.isMuted ?? false;

	const toggleMute = async () => {
		if (!microphonePublication) return;

		setIsLoading(true);
		try {
			if (microphonePublication.track instanceof LocalTrack) {
				if (isMuted) {
					await microphonePublication.track.unmute();
				} else {
					await microphonePublication.track.mute();
				}
			}
		} catch (error) {
			console.error("Failed to toggle microphone:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={toggleMute}
			disabled={isLoading}
			className={cn(
				"hover:cursor-pointer px-6 py-3 rounded-full transition-all duration-200 backdrop-blur-md border flex items-center gap-3 mr-4",
				isLoading && "opacity-70 cursor-not-allowed",
				isMuted
					? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-500"
					: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20 text-green-500"
			)}>
			<span className="text-sm font-medium relative flex items-center gap-2">
				{isLoading ? (
					<>
						<svg
							className="animate-spin h-4 w-4"
							viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
								fill="none"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						{isMuted ? "Unmuting..." : "Muting..."}
					</>
				) : (
					<>
						{isMuted ? (
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4 4l16 16"
								/>
							</svg>
						) : (
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
								/>
							</svg>
						)}
						{isMuted ? "Unmute" : "Mute"}
					</>
				)}
			</span>
			<div className={cn("w-2 h-2 rounded-full", isMuted ? "bg-red-500" : "bg-green-500")} />
		</button>
	);
}

function CallRoom() {
	const participants = useParticipants();
	const { localParticipant } = useLocalParticipant();
	const { state } = useVoiceAssistant();
	const router = useRouter();

	const agentParticipant = participants.find((p) => p.identity !== localParticipant.identity);
	const isLocalSpeaking = localParticipant.isSpeaking;
	const isAgentSpeaking = agentParticipant?.isSpeaking || state === "speaking";

	const handleEndCall = () => {
		router.push("/home");
	};

	return (
		<div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
			<div className="max-w-7xl mx-auto h-full flex flex-col">
				<div className="mb-6">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-white">VC Practice Session</h1>
						<div className="flex items-center space-x-4">
							<div className="text-sm text-gray-300">
								Status: <span className="text-green-400 capitalize">{state || "connected"}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					<div className="relative">
						<h3 className="text-white mb-2 text-sm font-medium">You</h3>
						<div className="aspect-video">
							<ParticipantVideo
								participant={localParticipant}
								isSpeaking={isLocalSpeaking}
								isLocal
							/>
						</div>
					</div>

					<div className="relative">
						<h3 className="text-white mb-2 text-sm font-medium">VC Persona</h3>
						<div className="aspect-video">
							{agentParticipant ? (
								<ParticipantVideo
									participant={agentParticipant}
									isSpeaking={isAgentSpeaking}
								/>
							) : (
								<div className="w-full h-full rounded-xl backdrop-blur-md bg-white/5 border-2 border-white/20 flex items-center justify-center">
									<div className="text-center">
										<div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
											<span className="text-2xl text-white font-bold">V</span>
										</div>
										<p className="text-white text-sm">Waiting for VC to join...</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="flex justify-center items-center gap-4 mb-8">
					<MuteButton />
					<button
						onClick={handleEndCall}
						className="hover:cursor-pointer px-6 py-3 rounded-full transition-all duration-200 backdrop-blur-md bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 flex items-center gap-3">
						<span className="text-sm font-medium">End Call</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round">
							<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
							<line
								x1="23"
								y1="1"
								x2="1"
								y2="23"
							/>
						</svg>
					</button>
				</div>

				<RemoteAudioRenderer />
			</div>
		</div>
	);
}

export default function CallInterface({ token, serverUrl, onDisconnect }: CallInterfaceProps) {
	return (
		<LiveKitRoom
			video
			audio
			token={token}
			serverUrl={serverUrl}
			data-lk-theme="default"
			onDisconnected={(reason) => {
				console.log("LiveKit disconnected, reason:", reason);
				if (onDisconnect) onDisconnect();
			}}
			onConnected={() => console.log("LiveKit connected successfully")}
			onError={(error) => console.error("LiveKit connection error:", error)}
			style={{ height: "100vh" }}
			options={{
				audioCaptureDefaults: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
				},
				adaptiveStream: true,
				dynacast: true,
			}}>
			<CallRoom />
		</LiveKitRoom>
	);
}
