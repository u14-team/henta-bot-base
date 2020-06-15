import Henta from 'henta';
import moment from 'moment';
moment.locale('ru');

export default class CooldownPlugin {
  /** @param {Henta} henta */
  constructor(henta) {
    this.henta = henta;
  }

  /** @param {Henta} henta */
  init(henta) {
    const botcmdPlugin = henta.getPlugin('common/botcmd');
    botcmdPlugin.on('check', this.checkCooldown.bind(this));
    botcmdPlugin.on('end', this.botcmdEnd.bind(this));
  }

  /** @param {Henta} henta */
  async start(henta) {
    const redisPlugin = henta.getPlugin('common/redis');
    this.cooldowns = await redisPlugin.serializer.run({
      slug: 'cooldowns',
      defaultValue: []
    });
  }

  /** @param {Henta} henta */
  checkCooldown(ctx) {
    if (!ctx.command.cooldown) {
      return;
    }

    // console.log(this.cooldowns)
    const commandStr = ctx.isSubcommand ? `${ctx.parentCommand.name} ${ctx.command.name}` : ctx.command.name;
    const data = this.cooldowns.find(v => v.userVkId === ctx.user.vkId && v.command === commandStr);
    if (!data || Date.now() - data.usedAt > ctx.command.cooldown) {
      if (data) {
        this.cooldowns.splice(this.cooldowns.indexOf(data), 1);
      }

      this.cooldowns.push({
        userVkId: ctx.user.vkId,
        command: commandStr,
        usedAt: Date.now()
      });
    } else {
      const fromNow = moment(data.usedAt + ctx.command.cooldown).fromNow();
      ctx.bad(`⌛ Эту команду можно будет использовать только ${fromNow}`);
      ctx.skipBotcmd = true;
    }
  }

  botcmdEnd(ctx) {
    if (!ctx.command.cooldown) {
      return;
    }

    const commandStr = ctx.isSubcommand ? `${ctx.parentCommand.name} ${ctx.command.name}` : ctx.command.name;
    const data = this.cooldowns.find(v => v.userVkId === ctx.user.vkId && v.command === commandStr);
    if (!data) {
      return;
    }

    if (ctx.isBad && !ctx.command.cooldownOnBad) {
      this.cooldowns.splice(this.cooldowns.indexOf(data), 1);
    }
  }
}
