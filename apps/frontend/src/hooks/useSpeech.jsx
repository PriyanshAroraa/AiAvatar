"use client"

import { createContext, useContext, useEffect, useState } from "react"

const backendUrl = "backend/api"

const SpeechContext = createContext()

// Default voice IDs
const DEFAULT_AMERICAN_ENGLISH_VOICE_ID = "6xPz2opT0y5qtoRh1U1Y"

export const SpeechProvider = ({ children }) => {
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [conversation, setConversation] = useState([]) // Stores all messages
  const [currentMessage, setCurrentMessage] = useState(null) // The message currently being played
  const [loading, setLoading] = useState(false)
  const [currentSentiment, setCurrentSentiment] = useState(null) // State for sentiment
  const [currentPsychometric, setCurrentPsychometric] = useState(null) // State for psychometric analysis
  const [currentEmotion, setCurrentEmotion] = useState(null) // State for detected facial emotion
  const [currentVoiceId, setCurrentVoiceId] = useState(DEFAULT_AMERICAN_ENGLISH_VOICE_ID) // New state for voice accent

  // LOG: See if currentVoiceId updates in the provider
  useEffect(() => {
    console.log("SpeechProvider: currentVoiceId updated to", currentVoiceId)
  }, [currentVoiceId])

  let chunks = []

  const initiateRecording = () => {
    chunks = []
  }

  const onDataAvailable = (e) => {
    chunks.push(e.data)
  }

  const sendAudioData = async (audioBlob) => {
    const reader = new FileReader()
    reader.readAsDataURL(audioBlob)
    reader.onloadend = async () => {
      const base64Audio = reader.result.split(",")[1]
      setLoading(true)
      // Immediately add user message to conversation history with a pending state
      setConversation((prev) => [
        ...prev,
        { type: "user", text: "Transcribing audio...", analysis: null, emotion: currentEmotion, isPending: true },
      ])
      try {
        // LOG: What voiceId is being sent in STS request
        console.log("STS Request: Sending voiceId", currentVoiceId)
        const data = await fetch(`/api/sts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio: base64Audio, emotion: currentEmotion, voiceId: currentVoiceId }), // Pass voiceId
        })
        const response = await data.json()

        // Update the last user message with actual transcribed text and analysis
        setConversation((prev) => {
          const updatedConversation = [...prev]
          const lastUserMessageIndex = updatedConversation.findLastIndex((msg) => msg.type === "user" && msg.isPending)
          if (lastUserMessageIndex !== -1) {
            updatedConversation[lastUserMessageIndex] = {
              type: "user",
              text: response.userMessageText,
              analysis: response.analysis,
              emotion: currentEmotion,
            }
          }
          return [...updatedConversation, ...response.messages.map((msg) => ({ type: "ai", text: msg.text }))]
        })

        setCurrentMessage(response.messages[0])
        setCurrentSentiment(response.analysis?.sentiment || null)
        setCurrentPsychometric(response.analysis?.psychometricAnalysis || null)
      } catch (error) {
        console.error(error)
        // On error, update the pending message to show an error state or remove it
        setConversation((prev) => {
          const updatedConversation = [...prev]
          const lastUserMessageIndex = updatedConversation.findLastIndex((msg) => msg.type === "user" && msg.isPending)
          if (lastUserMessageIndex !== -1) {
            updatedConversation[lastUserMessageIndex] = {
              type: "user",
              text: "Error transcribing audio. Please try again.",
              analysis: null,
              emotion: currentEmotion,
              isError: true,
            }
          } else {
            // If for some reason no pending message was found, add a new error message
            updatedConversation.push({
              type: "user",
              text: "Error processing audio. Please try again.",
              analysis: null,
              emotion: currentEmotion,
              isError: true,
            })
          }
          return updatedConversation
        })
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const newMediaRecorder = new MediaRecorder(stream)
          newMediaRecorder.onstart = initiateRecording
          newMediaRecorder.ondataavailable = onDataAvailable
          newMediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: "audio/webm" })
            try {
              await sendAudioData(audioBlob)
            } catch (error) {
              console.error(error)
              alert(error.message)
            }
          }
          setMediaRecorder(newMediaRecorder)
        })
        .catch((err) => console.error("Error accessing microphone:", err))
    }
  }, [])

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start()
      setRecording(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setRecording(false)
    }
  }

  const tts = async (userText) => {
    setLoading(true)
    // Immediately add user message to conversation history
    setConversation((prev) => [...prev, { type: "user", text: userText, emotion: currentEmotion }])
    try {
      // LOG: What voiceId is being sent in TTS request
      console.log("TTS Request: Sending voiceId", currentVoiceId)
      const data = await fetch(`/api/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText, emotion: currentEmotion, voiceId: currentVoiceId }), // Pass voiceId
      })
      const response = await data.json()

      setCurrentMessage(response.messages[0])
      setCurrentSentiment(response.analysis?.sentiment || null)
      setCurrentPsychometric(response.analysis?.psychometricAnalysis || null)

      // Add AI's response messages. The user message is already added.
      setConversation((prev) => [...prev, ...response.messages.map((msg) => ({ type: "ai", text: msg.text }))])
    } catch (error) {
      console.error(error)
      // On error, add an AI error message
      setConversation((prev) => [
        ...prev,
        { type: "ai", text: "I'm sorry, I encountered an error. Please try again.", isError: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onMessagePlayed = () => {
    setCurrentMessage(null)
  }

  useEffect(() => {
    if (currentMessage && currentMessage.audio) {
      const audio = new Audio("data:audio/mp3;base64," + currentMessage.audio)
      audio.play()
      audio.onended = onMessagePlayed
    }
  }, [currentMessage])

  return (
    <SpeechContext.Provider
      value={{
        startRecording,
        stopRecording,
        recording,
        tts,
        message: currentMessage,
        onMessagePlayed,
        loading,
        conversation,
        currentSentiment,
        currentPsychometric,
        setCurrentEmotion,
        currentEmotion,
        currentVoiceId, // Export currentVoiceId
        setCurrentVoiceId, // Export setCurrentVoiceId
      }}
    >
      {children}
    </SpeechContext.Provider>
  )
}

export const useSpeech = () => {
  const context = useContext(SpeechContext)
  if (!context) {
    throw new Error("useSpeech must be used within a SpeechProvider")
  }
  return context
}
