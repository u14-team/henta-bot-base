export default class TestCommand {
  name = 'тест';

  handler(ctx) {
    ctx.answer(`✔ Бот работает на *hentavk(HENTA) ${ctx.henta.version}.`);
  }
}
