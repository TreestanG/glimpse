"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import CallInterface from '@/components/CallInterface';

export default function CallPage() {
  const { user, isLoaded } = useUser();
  const [token, setToken] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('');

  const backendUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://glimpse-livekit.livekit.cloud';
  
  useEffect(() => {
    if (!isLoaded || !user) return;

    const generateToken = async () => {
      try {
        const params = new URLSearchParams({
          identity: `user-${user.id}`,
          room: 'room-vc-practice',
        });
        
        const response = await fetch(`${backendUrl}/get-token?${params.toString()}`, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to generate token');
        }
        
        const data = await response.json();
        setToken(data.token);
        setIsConnecting(false);
        setServerUrl(data.url);
      } catch (error: any) {
        console.error('Error generating token:', error);
        setError('Failed to connect to the call. Please try again.');
        setIsConnecting(false);
      }
    };

    generateToken();
  }, [user, isLoaded]);

  const handleDisconnect = () => {
    window.location.href = '/call';
  };

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
            onClick={() => window.location.href = '/'}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
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
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
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
    />
  );
} 