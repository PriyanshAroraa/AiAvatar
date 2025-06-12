"use client"

import { useEffect, useState } from "react"
import { useSpeech } from "../hooks/useSpeech"

export const RightSidebar = () => {
  const { conversation, currentSentiment, currentPsychometric, loading } = useSpeech()
  const [psychometricLabels, setPsychometricLabels] = useState({})

  useEffect(() => {
    const psychometricLabels = {
      openness: "Openness",
      conscientiousness: "Conscientiousness",
      extraversion: "Extraversion",
      agreeableness: "Agreeableness",
      neuroticism: "Neuroticism",
    }
    setPsychometricLabels(psychometricLabels)
  }, [])

  return (
    <div className="w-1/3 bg-white/50 backdrop-blur-lg text-gray-800 p-6 flex flex-col z-20 rounded-l-2xl shadow-2xl">
      {" "}
      {/* Adjusted for lighter background */}
      <h2 className="text-2xl font-bold mb-6 text-center">Dashboard & History</h2>
      {/* Sentiment Analysis */}
      <div className="mb-6 bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-md">
        {" "}
        {/* Adjusted for lighter background */}
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Sentiment Analysis</h3>
        <p
          className={`text-xl font-bold ${
            currentSentiment === "positive"
              ? "text-green-600"
              : currentSentiment === "negative"
                ? "text-red-600"
                : "text-yellow-600"
          }`}
        >
          {currentSentiment ? currentSentiment.charAt(0).toUpperCase() + currentSentiment.slice(1) : "N/A"}
        </p>
      </div>
      {/* Psychometric Analysis */}
      <div className="mb-6 bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-md">
        {" "}
        {/* Adjusted for lighter background */}
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Psychometric Analysis (Big Five)</h3>
        {currentPsychometric ? (
          <div className="grid grid-cols-1 gap-2 text-sm">
            {Object.entries(currentPsychometric).map(([trait, score]) => (
              <div key={trait} className="flex items-center text-gray-700">
                <span className="w-1/2">{psychometricLabels[trait] || trait}:</span>
                <div className="flex-1 bg-gray-300 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${(score * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                <span className="ml-2 w-1/6 text-right font-medium">{(score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Analysis pending...</p>
        )}
      </div>
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-md flex flex-col">
        {" "}
        {/* Adjusted for lighter background */}
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Chat History</h3>
        <div className="space-y-4 flex-1 flex flex-col justify-end">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-3 rounded-xl max-w-[80%] shadow-md ${
                  // Adjusted to solid colors as per image
                  msg.type === "user" ? "bg-blue-500 text-white" : "bg-gray-500 text-white"
                }`}
              >
                <p className="font-bold">{msg.type === "user" ? "You" : "Jack"}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mt-4">
              <div className="p-3 rounded-xl max-w-[80%] shadow-md bg-gray-500 text-white animate-pulse">
                <p className="font-bold">Jack</p>
                <p>Thinking...</p>
                <div className="h-2 bg-gray-400 rounded w-3/4 mt-2"></div>
                <div className="h-2 bg-gray-400 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
