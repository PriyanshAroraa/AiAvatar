"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useSpeech } from "../hooks/useSpeech"
import { SpeakerIcon } from "lucide-react"

export const VoiceAccentSelector = () => {
  const { currentVoiceId, setCurrentVoiceId } = useSpeech()

  const voiceAccents = [
    { name: "American English", id: "6xPz2opT0y5qtoRh1U1Y" },
    { name: "Indian English", id: "GHKbgpqchXOxta6X2lSd" },
    { name: "British English", id: "8JVbfL6oEdmuxKn5DK2C" },
    { name: "French English", id: "2h7ex7B1yGrkcLFI8zUO" },
    { name: "Arab English", id: "uQPOhlzA94sogqmhGLCI" },
  ]

  const currentAccentName = voiceAccents.find((accent) => accent.id === currentVoiceId)?.name || "Select Accent"

  return (
    <div className="fixed bottom-4 left-4 z-30">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white/50 backdrop-blur-md text-gray-800 hover:bg-white/70 shadow-lg">
            <SpeakerIcon className="mr-2 h-4 w-4" />
            {currentAccentName}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/80 backdrop-blur-md text-gray-800 shadow-lg">
          <DropdownMenuLabel>Select Voice Accent</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {voiceAccents.map((accent) => (
            <DropdownMenuItem
              key={accent.id}
              onClick={() => {
                console.log("VoiceAccentSelector: Setting voice ID to", accent.id) // NEW LOG HERE
                setCurrentVoiceId(accent.id)
              }}
              className={currentVoiceId === accent.id ? "font-bold bg-gray-200/50" : ""}
            >
              {accent.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
