import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import { ogg } from "./ogg.js";
import { openAi } from "./openai.js";
import { code } from "telegraf/format";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.on(message("voice"), async (context) => {
  try {
    await context.reply(code("Формирую ответ..."));

    const link = await context.telegram.getFileLink(
      context.message.voice.file_id
    );
    const userId = String(context.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);
    const text = await openAi.transcription(mp3Path);

    await context.reply(code(`Ваш запрос: ${text}`));

    const messages = [{ role: openAi.roles.USER, content: text }];
    const response = await openAi.chat(messages);

    await context.reply(response.content);
  } catch (error) {
    console.log("Error while voice message", error.message);
  }
});

bot.command("start", async (context) => {
  await context.reply(JSON.stringify(context.message, null, 2));
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
