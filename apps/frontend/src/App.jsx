import { Loader } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Leva } from "leva"
import { Scenario } from "./components/Scenario"
import { ChatInput } from "./components/ChatInput"
import { RightSidebar } from "./components/RightSidebar"
import { WebcamFeed } from "./components/WebcamFeed"
import { VoiceAccentSelector } from "./components/VoiceAccentSelector" // Import the new component

function App() {
  return (
    <>
      <Loader />
      <Leva collapsed hidden />
      <div className="flex h-screen w-screen">
        <div className="flex-1 relative">
          <ChatInput />
          <Canvas shadows camera={{ position: [0, 0, 0], fov: 10 }}>
            <Scenario />
          </Canvas>
        </div>
        <RightSidebar />
        <WebcamFeed />
        <VoiceAccentSelector /> {/* Render the new component */}
      </div>
    </>
  )
}

export default App
