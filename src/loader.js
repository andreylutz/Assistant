export class Loader {
  icons = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  message = null;
  interval = null;

  constructor(context) {
    this.context = context;
  }

  async show() {
    let index = 0;
    this.message = await this.context.reply(this.icons[index]);
    this.interval = setInterval(() => {
      index = index < this.icons.length - 1 ? index + 1 : 0;

      this.context.telegram.editMessageText(
        this.context.chat.id,
        this.message.message_id,
        null,
        this.icons[index]
      );
    }, 500);
  }

  hide() {
    clearInterval(this.interval);
    this.context.telegram.deleteMessage(
      this.context.chat.id,
      this.message.message_id
    );
  }
}
