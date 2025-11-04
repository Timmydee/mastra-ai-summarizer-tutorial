import { Mastra } from "@mastra/core";
import { summarizerAgent } from "./agents/summarizer";

export const mastra = new Mastra({
  agents: { summarizerAgent },
});