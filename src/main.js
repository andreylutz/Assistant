import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import { ogg } from "./ogg.js";
import { openAi } from "./openai.js";
import { code } from "telegraf/format";

const INITIAL_SESSION = {
  messages: [],
};

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.use(session());

bot.command("start", async (context) => {
  context.session = INITIAL_SESSION;
  await context.reply("Команда /new для смены контекста разговора");
  await context.reply("Жду вашего голосового или текстового сообщения");
});

bot.command("new", async (context) => {
  context.session = INITIAL_SESSION;
  await context.reply("Жду вашего голосового или текстового сообщения");
});

bot.on(message("voice"), async (context) => {
  context.session ??= INITIAL_SESSION;
  try {
    const systemMessage = await context.reply(
      code("Сообщение принял, жду ответ от сервера...")
    );

    const link = await context.telegram.getFileLink(
      context.message.voice.file_id
    );
    const userId = String(context.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    await context.telegram.deleteMessage(
      context.chat.id,
      systemMessage.message_id
    );
    const text = await openAi.transcription(mp3Path);

    context.session.messages.push({ role: openAi.roles.USER, content: text });
    const response = await openAi.chat(context.session.messages);

    await context.reply(code(`Вот ответ на ваш запрос: \n ${text}`));
    context.session.messages.push({
      role: openAi.roles.ASSISTANT,
      content: response.content,
    });

    await context.reply(response.content);
  } catch (error) {
    console.log("Error while voice message", error.message);
  }
});

bot.on(message("text"), async (context) => {
  context.session ??= INITIAL_SESSION;
  try {
    const systemMessage = await context.reply(
      code("Сообщение принял, жду ответ от сервера...")
    );

    context.session.messages.push({
      role: openAi.roles.USER,
      content: context.message.text,
    });

    const response = await openAi.chat(context.session.messages);

    await context.telegram.deleteMessage(
      context.chat.id,
      systemMessage.message_id
    );

    await context.reply(
      code(`Вот ответ на ваш запрос: \n ${context.message.text}`)
    );

    context.session.messages.push({
      role: openAi.roles.ASSISTANT,
      content: response.content,
    });

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
