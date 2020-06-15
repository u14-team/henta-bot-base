const EventEmitter = require('events');

const c = class  extends EventEmitter {
  constructor (henta) {
    super()
    this.regexp = new RegExp('\\[club' + henta.groupId + '\\|[^\\|\\[\\]]+\\]')
  }

  async init (henta) {
    this.mentions = henta.config.public.mentions;
    henta.log(`К вашему боту можно будет обращаться через: ${this.mentions}`)

    const botPlugin = henta.getPlugin('common/bot');
    botPlugin.setHandler('check-mentions', this.handler.bind(this));
  }

  handler (ctx, next) {
    if (ctx.text) {
      const [isMention, mentionLength] = this.checkMentions(ctx.text)
      if (isMention) {
        ctx.text = this.clear(ctx.text.substring(mentionLength))
        return next()
      }

      const [isPush, str] = this.checkPush(ctx.text)
      if (isPush) {
        ctx.text = this.clear(ctx.text.replace(str, ''))
        return next()
      }
    }

    if (!ctx.isChat || this.checkReply(ctx)) {
      return next()
    }

    this.emit('no-mention', ctx);
  }

  checkReply (ctx) {
    return ctx.replyMessage && ctx.replyMessage.senderId === -ctx.henta.groupId
  }

  checkPush (text) {
    const result = text.match(this.regexp)
    if (!result) {
      return [false]
    }

    return [true, result[0]]
  }

  checkMentions (text) {
    const str = text.toLowerCase()
    for (const mention of this.mentions) {
      if (str.startsWith(mention)) {
        return [true, mention.length]
      }
    }

    return [false]
  }

  clear (text) {
    return text.replace(/^[., ]+/, '')
  }
}

module.exports = { default: c };