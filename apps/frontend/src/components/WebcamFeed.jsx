"use client"

import { useRef, useEffect, useState } from "react"
import * as faceapi from "face-api.js"
import { useSpeech } from "../hooks/useSpeech"

export const WebcamFeed = () => {
  const videoRef = useRef()
  const canvasRef = useRef()
  const { setCurrentEmotion, currentEmotion } = useSpeech() // Get currentEmotion from context
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models/face-api-models" // Path to your models in public folder
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ])
      setModelsLoaded(true)
      console.log("Face-API models loaded!")
    }
    loadModels()
  }, [])

  useEffect(() => {
    if (modelsLoaded && videoRef.current && !cameraActive) {
      startVideo()
    }
  }, [modelsLoaded, cameraActive])

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setCameraActive(true)
          console.log("Webcam started.")
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err)
        alert("Could not access webcam. Please ensure it's connected and permissions are granted.")
      })
  }

  const handleVideoPlay = () => {
    if (!modelsLoaded || !videoRef.current || !canvasRef.current) return

    const displaySize = { width: videoRef.current.width, height: videoRef.current.height }
    faceapi.matchDimensions(canvasRef.current, displaySize)

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        clearInterval(interval)
        return
      }

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const context = canvasRef.current.getContext("2d")
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        // faceapi.draw.drawDetections(canvasRef.current, resizedDetections) // Optional: draw detection box
        // faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections) // Optional: draw expressions

        const expressions = resizedDetections.expressions
        if (expressions) {
          // Find the dominant emotion
          const dominantEmotion = Object.keys(expressions).reduce((a, b) => (expressions[a] > expressions[b] ? a : b))
          setCurrentEmotion(dominantEmotion) // Only update if an emotion is detected
        }
        // If detections exist but no expressions (e.g., face detected but not clear enough for expressions),
        // we retain the last emotion.
      } else {
        // If no face is detected, we do NOT set currentEmotion to null.
        // It will retain its last value, or remain null if no face was ever detected.
      }
    }, 100) // Run detection every 100ms

    return () => clearInterval(interval)
  }

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col items-end">
      <div className="relative w-[160px] h-[120px] bg-black rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="160"
          height="120"
          onPlay={handleVideoPlay}
          className="absolute top-0 left-0 w-full h-full object-cover transform scaleX(-1)" // Mirror effect
        />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 text-white text-xs">
            Loading camera...
          </div>
        )}
      </div>
      <p className="text-xs text-white mt-1 bg-gray-800 bg-opacity-50 px-2 py-1 rounded">
        {modelsLoaded ? (cameraActive ? "Camera Active" : "Starting Camera...") : "Loading Models..."}
      </p>
      {/* Display current emotion, or '--' if null */}
      <p className="text-sm text-white mt-1 bg-gray-800 bg-opacity-50 px-2 py-1 rounded">
        Emotion: {currentEmotion ? currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1) : "--"}
      </p>
    </div>
  )
}
