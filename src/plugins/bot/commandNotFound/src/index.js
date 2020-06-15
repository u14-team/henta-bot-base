export default class CommandNotFoundPlugin {
  init(henta) {
    const botPlugin = henta.getPlugin('common/bot');
    botPlugin.setHandler('fallback', this.handler.bind(this));
  }

  async handler(ctx, next) {
    if (ctx.answered || ctx.isChat) {
      return next();
    }

    ctx.builder()
      .lines([
        '🤷‍♂️ Я не знаю, что Вы хотели этим сказать.',
        '💡 Вы можете узнать, что я могу с помощью команды `помощь`.'
      ])
      .kebord([
        { label: 'Что ты умеешь', payload: { command: 'помощь' } }
      ])
      .bad();

    return next();
  }
}
