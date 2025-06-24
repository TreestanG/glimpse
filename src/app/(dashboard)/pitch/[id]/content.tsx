'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AnalysisResult {
  _id: string;
  call_id: string;
  timestamp: string;
  user_avg_words_per_turn: number;
  agent_avg_words_per_turn: number;
  summary: string;
  agent_interest_score: number;
  improvements: string[];
}

interface ContentProps {
  id: string;
}

export default function Content({ id }: ContentProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchAnalysisResult = async () => {
      if (!id) {
        setError('No analysis ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${backendUrl}/analysis-result?room=${id}`,
          {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analysis result');
        }

        const result = await response.json();
        setAnalysisResult(result);
      } catch (error) {
        setError('Failed to fetch analysis results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisResult();
  }, [id, backendUrl]);

  const getInterestLevel = (score: number) => {
    if (score >= 0.9)
      return {
        level: 'Very High',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
      };
    if (score >= 0.7)
      return {
        level: 'High',
        color: 'text-green-300',
        bgColor: 'bg-green-500/15',
      };
    if (score >= 0.5)
      return {
        level: 'Moderate',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
      };
    if (score >= 0.3)
      return {
        level: 'Low',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
      };
    return {
      level: 'Very Low',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-white border-b-2" />
          <p className="text-white">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-md rounded-xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-md">
          <h2 className="mb-2 font-bold text-white text-xl">Error</h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <Link className="" href="/pitch-history">
            <button
              type="button"
              className="rounded-full bg-white px-6 py-3 font-medium text-black transition-all duration-300 hover:cursor-pointer hover:opacity-90 hover:shadow-amber-400/50 hover:shadow-lg"
            >
              Back to History
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-md rounded-xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-md">
          <h2 className="mb-4 font-bold text-white text-xl">
            No Results Found
          </h2>
          <p className="mb-6 text-gray-300">
            Could not find analysis results for this session.
          </p>
          <Link
            className="rounded-lg bg-white px-6 py-3 font-medium text-black transition-all duration-300 hover:cursor-pointer hover:opacity-90 hover:shadow-amber-400/50 hover:shadow-lg"
            href="/pitch-history"
          >
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            className="flex items-center gap-2 text-white transition-colors duration-200 hover:text-gray-300"
            href="/pitch-history"
          >
            <svg
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to History
          </Link>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
          <div className="mb-8 text-center">
            <h2 className="mb-2 font-bold text-3xl text-white">
              Pitch Analysis Results
            </h2>
            <p className="text-gray-400 text-sm">
              Session analyzed on {timestamp}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <h3 className="mb-4 font-semibold text-white text-xl">
                VC Interest Score
              </h3>
              <div className="text-center">
                <div
                  className={`inline-flex h-24 w-24 items-center justify-center rounded-full ${interestLevel.bgColor} mb-4`}
                >
                  <span className={`font-bold text-2xl ${interestLevel.color}`}>
                    {Math.round(analysisResult.agent_interest_score * 100)}
                  </span>
                </div>
                <p
                  className={`font-medium text-lg ${interestLevel.color} mb-2`}
                >
                  {interestLevel.level}
                </p>
                <div className="h-2 w-full rounded-full bg-gray-700">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      analysisResult.agent_interest_score >= 0.9
                        ? 'bg-green-400'
                        : analysisResult.agent_interest_score >= 0.7
                          ? 'bg-green-300'
                          : analysisResult.agent_interest_score >= 0.5
                            ? 'bg-yellow-400'
                            : analysisResult.agent_interest_score >= 0.3
                              ? 'bg-orange-400'
                              : 'bg-red-400'
                    }`}
                    style={{
                      width: `${analysisResult.agent_interest_score * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <h3 className="mb-4 font-semibold text-white text-xl">
                Session Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Your Avg Words/Turn:</span>
                  <span className="font-medium text-white">
                    {analysisResult.user_avg_words_per_turn}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">VC Avg Words/Turn:</span>
                  <span className="font-medium text-white">
                    {analysisResult.agent_avg_words_per_turn}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Call ID:</span>
                  <span className="font-mono text-gray-400 text-sm">
                    {analysisResult.call_id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h3 className="mb-4 font-semibold text-white text-xl">
              Session Summary
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {analysisResult.summary}
            </p>
          </div>

          <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h3 className="mb-4 font-semibold text-white text-xl">
              Suggested Improvements
            </h3>
            <ul className="list-inside list-disc text-gray-300 leading-relaxed">
              {analysisResult.improvements.map((improvement, index) => (
                <li className="text-gray-300 leading-relaxed" key={index}>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <Link
              className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-md transition-all duration-300 hover:cursor-pointer hover:bg-white/20"
              href="/call"
            >
              Practice Again
            </Link>
            <Link
              className="rounded-lg bg-white px-6 py-3 font-medium text-black transition-all duration-300 hover:cursor-pointer hover:opacity-90 hover:shadow-amber-400/50 hover:shadow-lg"
              href="/pitch-history"
            >
              Back to History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
