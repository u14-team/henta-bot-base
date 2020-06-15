"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorPlugin {
    constructor(henta) {
        this.henta = henta;
    }
    async init(henta) {
        const botPlugin = henta.getPlugin('common/bot');
        const usersPlugin = henta.getPlugin('common/users');
        botPlugin.on('processError', async ([ctx, error]) => {
            ctx.builder()
                .lines([
                'Что-то пошло не так.'
            ])
                .photo('./assets/images/error.png')
                .bad();
            const admin = await usersPlugin.resolve(henta.config.public.sendErrorsTo);
            admin.send([
                `😶 ${ctx.user} вызвал ошибку:`,
                error.stack
            ]);
        });
    }
}
exports.default = ErrorPlugin;
