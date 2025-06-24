import {
  LiveKitRoom,
  useLocalParticipant,
  useParticipants,
  useTracks,
  useVoiceAssistant,
  VideoTrack,
} from '@livekit/components-react';
import {
  LocalTrack,
  type Participant,
  Track,
  type TrackPublication,
} from 'livekit-client';
import { PhoneOff } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CallInterfaceProps {
  token: string;
  serverUrl: string;
  onDisconnect?: () => void;
  onEndCall: () => void;
}

interface ParticipantVideoProps {
  participant: Participant;
  isSpeaking: boolean;
  isLocal?: boolean;
}

function ParticipantVideo({
  participant,
  isSpeaking,
  isLocal = false,
}: ParticipantVideoProps) {
  const videoTrack = participant.videoTrackPublications.values().next()
    .value as TrackPublication;

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-xl border-2 bg-white/5 backdrop-blur-md transition-all duration-200',
        isSpeaking
          ? 'border-green-400 shadow-green-400/30 shadow-lg'
          : 'border-white/20'
      )}
    >
      {videoTrack && !videoTrack.isMuted ? (
        <VideoTrack
          className="h-full w-full object-cover"
          trackRef={{
            participant,
            publication: videoTrack,
            source: Track.Source.Camera,
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-600">
              <span className="font-bold text-2xl text-white">
                {participant.name?.[0] || (isLocal ? 'Y' : 'V')}
              </span>
            </div>
            <p className="text-sm text-white">
              {isLocal ? 'You' : participant.name || 'VC Persona'}
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-sm text-white">
        {isLocal ? 'You' : participant.name || 'VC Persona'}
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
    if (!(track && audioRef.current)) return;

    const element = track.attach();
    const audioElement = audioRef.current;
    audioElement.srcObject = element.srcObject;

    audioElement
      .play()
      .catch((err) => console.warn('Audio playback failed', err));

    return () => {
      track.detach(audioElement);
    };
  }, [track]);

  return <audio autoPlay key={participant.identity} ref={audioRef} />;
}

function RemoteAudioRenderer() {
  const tracks = useTracks([Track.Source.Microphone, Track.Source.Unknown], {
    updateOnlyOn: [],
  });
  const { localParticipant } = useLocalParticipant();

  const remoteAudioTracks = tracks.filter(
    ({ participant, publication }) =>
      participant.identity !== localParticipant.identity &&
      publication.kind === 'audio'
  );

  return (
    <>
      {remoteAudioTracks.map(({ publication, participant }) => (
        <RemoteAudio
          key={participant.identity}
          participant={participant}
          track={publication.track}
        />
      ))}
    </>
  );
}

function MuteButton() {
  const { localParticipant } = useLocalParticipant();
  const [isLoading, setIsLoading] = React.useState(false);
  const microphonePublication = localParticipant?.getTrackPublication(
    Track.Source.Microphone
  );
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
      console.error('Failed to toggle microphone:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={cn(
        'mr-4 flex items-center gap-3 rounded-full border p-3 backdrop-blur-md transition-all duration-200 hover:cursor-pointer',
        isLoading && 'cursor-not-allowed opacity-70',
        isMuted
          ? 'border-gray-500/20 bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
          : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
      )}
      disabled={isLoading}
      onClick={toggleMute}
    >
      <span className="relative flex items-center gap-2 font-medium text-sm">
        {isLoading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                fill="none"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
            {isMuted ? 'Unmuting...' : 'Muting...'}
          </>
        ) : (
          <>
            {isMuted ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 4l16 16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </>
        )}
      </span>
    </button>
  );
}

function CallRoom({ onEndCall }: { onEndCall: () => void }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { state } = useVoiceAssistant();

  const agentParticipant = participants.find(
    (p) => p.identity !== localParticipant.identity
  );
  const isLocalSpeaking = localParticipant.isSpeaking;
  const isAgentSpeaking = agentParticipant?.isSpeaking || state === 'speaking';

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col items-center">
        <div className="mb-6 w-full">
          <div className="flex w-full items-center justify-between">
            <h1 className="font-bold text-2xl text-white">
              VC Practice Session
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-gray-300 text-sm">
                Status:{' '}
                <span className="text-green-400 capitalize">
                  {state || 'connected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="relative">
            <h3 className="mb-2 font-medium text-sm text-white">You</h3>
            <div className="aspect-video">
              <ParticipantVideo
                isLocal
                isSpeaking={isLocalSpeaking}
                participant={localParticipant}
              />
            </div>
          </div>

          <div className="relative">
            <h3 className="mb-2 font-medium text-sm text-white">VC Persona</h3>
            <div className="aspect-video">
              {agentParticipant ? (
                <ParticipantVideo
                  isSpeaking={isAgentSpeaking}
                  participant={agentParticipant}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-md">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-600">
                      <span className="font-bold text-2xl text-white">V</span>
                    </div>
                    <p className="text-sm text-white">
                      Waiting for VC to join...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 flex w-full max-w-2xl items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 p-2">
          <MuteButton />
          <button
            className="flex items-center gap-3 rounded-full border border-red-500/20 bg-red-500/10 p-3 text-red-500 backdrop-blur-md transition-all duration-200 hover:cursor-pointer hover:bg-red-500/20"
            onClick={onEndCall}
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>

        <RemoteAudioRenderer />
      </div>
    </div>
  );
}

export default function CallInterface({
  token,
  serverUrl,
  onDisconnect,
  onEndCall,
}: CallInterfaceProps) {
  return (
    <LiveKitRoom
      audio
      data-lk-theme="default"
      onConnected={() => console.log('LiveKit connected successfully')}
      onDisconnected={(reason) => {
        console.log('LiveKit disconnected, reason:', reason);
        if (onDisconnect) onDisconnect();
      }}
      onError={(error) => console.error('LiveKit connection error:', error)}
      options={{
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        adaptiveStream: true,
        dynacast: true,
      }}
      serverUrl={serverUrl}
      style={{ height: '100vh' }}
      token={token}
      video
    >
      <CallRoom onEndCall={onEndCall} />
    </LiveKitRoom>
  );
}
