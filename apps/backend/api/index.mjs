import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { invokeOpenAIChain } from "../modules/openAI.mjs";
import { lipSync } from "../modules/lip-sync.mjs";
import { sendDefaultMessages, defaultResponse } from "../modules/defaultMessages.mjs";
import { convertAudioToText } from "../modules/whisper.mjs";
import { voicesApiInstance as voice } from "../modules/elevenLabs.mjs";

dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- START LESS RESTRICTIVE CORS CONFIGURATION ---
// WARNING: Allowing all origins is generally NOT recommended for production environments due to security risks.
// Use this only for development or if you fully understand the implications.
app.use(cors({
  origin: "*", // Allows all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"], // Allows all common HTTP methods
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Allows common headers
  credentials: true, // If your frontend sends cookies or authorization headers
}));
// --- END LESS RESTRICTIVE CORS CONFIGURATION ---

// The 'port' variable is only relevant for local development, Vercel assigns its own.
const port = 3000;

const chatHistory = [];

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

app.post("/tts", async (req, res) => {
  const userMessageText = req.body.message;
  const userEmotion = req.body.emotion;
  const selectedVoiceId = req.body.voiceId;
  console.log("Server /tts received voiceId:", selectedVoiceId);

  const defaultMessages = await sendDefaultMessages({ userMessage: userMessageText });
  if (defaultMessages) {
    res.send({ messages: defaultMessages });
    return;
  }

  let openAImessages;
  let analysisResult = null;
  try {
    const aiResponse = await invokeOpenAIChain({
      question: userMessageText,
      emotion: userEmotion,
    });
    openAImessages = aiResponse.messages;
    analysisResult = aiResponse.analysis;

    chatHistory.push({
      type: "user",
      text: userMessageText,
      analysis: analysisResult,
      emotion: userEmotion,
    });
    chatHistory.push({
      type: "ai",
      messages: openAImessages,
    });
  } catch (error) {
    console.error("Error invoking OpenAI chain:", error);
    openAImessages = defaultResponse;
    chatHistory.push({
      type: "user",
      text: userMessageText,
      analysis: null,
      emotion: userEmotion,
    });
    chatHistory.push({
      type: "ai",
      messages: defaultResponse,
    });
  }

  const lipSyncedMessages = await lipSync({ messages: openAImessages, voiceId: selectedVoiceId });
  res.send({ messages: lipSyncedMessages, analysis: analysisResult });
});

app.post("/sts", async (req, res) => {
  const base64Audio = req.body.audio;
  const userEmotion = req.body.emotion;
  const selectedVoiceId = req.body.voiceId;
  console.log("Server /sts received voiceId:", selectedVoiceId);

  const audioData = Buffer.from(base64Audio, "base64");
  const userMessageText = await convertAudioToText({ audioData });

  let openAImessages;
  let analysisResult = null;
  try {
    const aiResponse = await invokeOpenAIChain({
      question: userMessageText,
      emotion: userEmotion,
    });
    openAImessages = aiResponse.messages;
    analysisResult = aiResponse.analysis;

    chatHistory.push({
      type: "user",
      text: userMessageText,
      analysis: analysisResult,
      emotion: userEmotion,
    });
    chatHistory.push({
      type: "ai",
      messages: openAImessages,
    });
  } catch (error) {
    console.error("Error invoking OpenAI chain:", error);
    openAImessages = defaultResponse;
    chatHistory.push({
      type: "user",
      text: userMessageText,
      analysis: null,
      emotion: userEmotion,
    });
    chatHistory.push({
      type: "ai",
      messages: defaultResponse,
    });
  }

  const lipSyncedMessages = await lipSync({ messages: openAImessages, voiceId: selectedVoiceId });
  res.send({ messages: lipSyncedMessages, analysis: analysisResult, userMessageText: userMessageText });
});

app.get("/chat-history", (req, res) => {
  res.send({ history: chatHistory });
});

// For Vercel, export the app directly
export default app;

// For local development, you might still want to listen
// if (process.env.NODE_ENV !== 'production') {
//   app.listen(port, () => {
//     console.log(`Jack are listening on port ${port}`);
//   });
// }
