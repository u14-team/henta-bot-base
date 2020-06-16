"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BotBridge {
    constructor(henta) {
        this.henta = henta;
    }
    init(henta) {
        const botPlugin = henta.getPlugin('common/bot');
        botPlugin.setHandler('connect-user', this.handler.bind(this));
    }
    async handler(ctx, next) {
        const usersPlugin = ctx.getPlugin('common/users');
        ctx.user = await usersPlugin.get(ctx.senderId);
        if (!ctx.user) {
            ctx.user = await usersPlugin.create(ctx.senderId);
            ctx.isFirst = true;
        }
        await next();
        if (ctx.answered && !ctx.notSaveUser) {
            ctx.user.save();
        }
    }
}
exports.default = BotBridge;
