import { Configuration, OpenAIApi } from "openai";
import config from "config";
import { createReadStream } from "fs";

class ChatGPT {
  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system",
  };

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });

    this.gpt = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      const response = await this.gpt.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });

      return response.data.choices[0].message;
    } catch (error) {
      console.log("Error while gpt chat", error.message);
    }
  }

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
