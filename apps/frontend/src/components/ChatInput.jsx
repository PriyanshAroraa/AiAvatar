"use client"

import { useRef } from "react"
import { useSpeech } from "../hooks/useSpeech"

export const ChatInput = ({ hidden, ...props }) => {
  if (hidden) {
    return null
  }

  const input = useRef()
  const { tts, loading, message, startRecording, stopRecording, recording } = useSpeech()

  const sendMessage = () => {
    const text = input.current.value
    if (!loading && !message && text.trim() !== "") {
      tts(text)
      input.current.value = ""
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
      <div className="self-start backdrop-blur-md bg-white/50 p-4 rounded-lg shadow-lg">
        {" "}
        {/* Adjusted for lighter background */}
        <h1 className="font-black text-xl text-gray-700">Digital Human</h1> {/* Adjusted text color for contrast */}
        <p className="text-gray-600">
          {loading ? "Jack is thinking..." : "Type a message and press enter to chat with the AI."}
        </p>
      </div>
      <div className="w-full flex flex-col items-end justify-center gap-4"></div>
      <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`bg-gray-200/50 backdrop-blur-md text-gray-800 p-4 px-4 font-semibold uppercase rounded-xl shadow-md ${
            // Adjusted for lighter background
            recording ? "bg-red-500/50 hover:bg-red-600/50" : "hover:bg-gray-300/50"
          } ${loading || message ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={loading || message}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
            />
          </svg>
        </button>

        <input
          className="w-full placeholder:text-gray-500 p-4 rounded-xl bg-white/50 backdrop-blur-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400/50" // Adjusted for lighter background
          placeholder={loading ? "Please wait..." : "Type a message..."}
          ref={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage()
            }
          }}
          disabled={loading || message}
        />
        <button
          disabled={loading || message}
          onClick={sendMessage}
          className={`bg-blue-500 text-white p-4 px-10 font-semibold uppercase rounded-xl shadow-md ${
            // Adjusted to solid blue as per image
            loading || message ? "cursor-not-allowed opacity-50" : "hover:bg-blue-600"
          }`}
        >
          Send
        </button>
      </div>
    </div>
  )
}
