import { Configuration, OpenAIApi } from "openai";
import config from "config";
import { createReadStream } from "fs";

class ChatGPT {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });

    this.gpt = new OpenAIApi(configuration);
  }
  chat() {}

  async transcription(filepath) {
    try {
      const response = await this.gpt.createTranscription(
        createReadStream(filepath),
        "whisper-1"
      );
      return response.data.text;
    } catch (error) {
      console.log("Error while transcription", error.message);
    }
  }
}

export const openAi = new ChatGPT(config.get("OPEN_AI_KEY"));
