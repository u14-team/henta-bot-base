import Henta from 'henta';

export default class BotcmdBridge {
  henta: Henta;

  constructor(henta: Henta) {
    this.henta = henta;
  }

  init(henta: Henta) {
    const botcmdPlugin = henta.getPlugin('common/botcmd');
    botcmdPlugin.addType('user', {
      allowNull: true,
      handler: this.resolve.bind(this)
    });
  }

  async resolve(data) {
    const usersPlugin = this.henta.getPlugin('common/users');
    try {
      if (!data.argument.disallowReply && data.ctx.hasReplyMessage) {
        const reply = data.ctx.replyMessage;
        if (reply.senderId > 0) {
          const user = await usersPlugin.get(reply.senderId);
          if (user) {
            data.setIndex(data.index - 1);
            return [false, user];
          }
        }
      }

      const value = await usersPlugin.resolve(data.word)
      if (!value) {
        return [true, '🎎 Игрок не существует или не пользуется ботом.']
      }

      if (data.argument.notSelf && value === data.ctx.user) {
        return [true, '🎎 Нельзя указывать самого себя.']
      }

      return [false, value]
    } catch (err) {
      return [true, '🎎 Вы неправильно указали пользователя.']
    }
  }
}
