"use client";

import React from 'react';
import {
  LiveKitRoom,
  VideoTrack,
  useParticipants,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
  BarVisualizer,
} from '@livekit/components-react';
import { Track, Participant } from 'livekit-client';
import { cn } from '@/lib/utils';

interface CallInterfaceProps {
  token: string;
  serverUrl: string;
  onDisconnect?: () => void;
}

function ParticipantVideo({ 
  participant, 
  isSpeaking, 
  isLocal = false 
}: { 
  participant: Participant; 
  isSpeaking: boolean; 
  isLocal?: boolean;
}) {
  const videoTrack = participant.videoTrackPublications.values().next().value;
  
  return (
    <div 
      className={cn(
        "relative w-full h-full rounded-xl overflow-hidden backdrop-blur-md bg-white/5 border-2 transition-all duration-200",
        isSpeaking 
          ? "border-green-400 shadow-lg shadow-green-400/30" 
          : "border-white/20"
      )}
    >
      {videoTrack && !videoTrack.isMuted ? (
        <VideoTrack 
          trackRef={{ 
            participant, 
            publication: videoTrack, 
            source: Track.Source.Camera 
          }}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white font-bold">
                {participant.name?.[0] || (isLocal ? 'Y' : 'V')}
              </span>
            </div>
            <p className="text-white text-sm">
              {isLocal ? 'You' : participant.name || 'VC Persona'}
            </p>
          </div>
        </div>
      )}
      
      {isSpeaking && (
        <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          Speaking
        </div>
      )}
      
      <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {isLocal ? 'You' : participant.name || 'VC Persona'}
      </div>
    </div>
  );
}

function CallRoom() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { state, audioTrack } = useVoiceAssistant();
  
  const tracks = useTracks([Track.Source.Microphone], { updateOnlyOn: [] });
  
  const agentParticipant = participants.find(p => p.identity !== localParticipant.identity);
  
  const isLocalSpeaking = localParticipant.isSpeaking;
  const isAgentSpeaking = agentParticipant?.isSpeaking || state === 'speaking';

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              VC Practice Session
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Status: <span className="text-green-400 capitalize">{state || 'connected'}</span>
              </div>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => window.location.href = '/home'}
              >
                End Call
              </button>
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
                isLocal={true}
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

        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">Audio:</div>
              <div className="w-32 h-8">
                <BarVisualizer 
                  state={state} 
                  barCount={8} 
                  trackRef={audioTrack} 
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 3H8.414a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallInterface({ token, serverUrl, onDisconnect }: CallInterfaceProps) {
  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      onDisconnected={(reason) => {
        console.log('LiveKit disconnected, reason:', reason);
        if (onDisconnect) {
          onDisconnect();
        }
      }}
      onConnected={() => {
        console.log('LiveKit connected successfully');
      }}
      onError={(error) => {
        console.error('LiveKit connection error:', error);
      }}
      style={{ height: '100vh' }}
      options={{
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        adaptiveStream: true,
        dynacast: true,
      }}
    >
      <CallRoom />
    </LiveKitRoom>
  );
} 