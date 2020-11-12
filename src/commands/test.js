import fetch from 'node-fetch';

export default class TestCommand {
  name = 'тест';

  async getDbPing(ctx) {
    const dbPlugin = ctx.getPlugin('common/db');
    if (!dbPlugin) {
      return false;
    }

    const startTime = Date.now();
    await dbPlugin.authenticate();
    return Date.now() - startTime;
  }

  async getApiPing() {
    const startTime = Date.now();
    await fetch('https://api.vk.com');
    return Date.now() - startTime;
  }

  async handler(ctx) {
    const packageInfo = await ctx.henta.util.load('package.json');
    const dbPing = await this.getDbPing(ctx);
    const apiPing = await this.getApiPing();

    ctx.answer([
      '✅ Бот работает:',
      packageInfo.description && `-- ${packageInfo.description} V${packageInfo.version}`,
      `-- *hentavk(HENTA) V${ctx.henta.version}`,
      `-- Node JS ${process.version}`,
      dbPing && `-- Запрос БД: ${dbPing}мс`,
      `-- Запрос api.vk.com: ${apiPing}мс`
    ]);
  }
}
