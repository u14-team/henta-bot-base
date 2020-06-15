"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AttachmentParser {
    constructor(botcmdPlugin) {
        this.convertTypes = new Map();
        this.botcmdPlugin = botcmdPlugin;
    }
    add(slug, func) {
        if (this.convertTypes[slug]) {
            throw Error(`Type '${slug}' already exists.`);
        }
        this.convertTypes[slug] = func;
        return this;
    }
    get(slug) {
        const func = this.convertTypes[slug];
        if (!func) {
            throw Error(`Type ${slug} not found.`);
        }
        return func;
    }
    // Шайтан-машина требует рефакторинга.
    async parse(ctx, attList, returnPromise = false) {
        if (!attList) {
            return;
        }
        const msgAttachs = [...ctx.attachments];
        if (ctx.hasReplyMessage) {
            msgAttachs.push(...ctx.replyMessage.attachments);
        }
        if (ctx.hasForwards) {
            ctx.forwards.forEach(v => msgAttachs.push(...v.attachments));
        }
        const params = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of Object.entries(attList)) {
            const attachment = msgAttachs.find(v => v.type === value.type);
            if (!attachment) {
                const atts = Object.values(attList);
                const names = {
                    photo: 'Фотография'
                };
                return [true, [
                        '📎 Эту команду нужно использовать с вложениями:',
                        ...atts.map((v, i) => `${i + 1}) ${names[v.type]}.`)
                    ].join('\n')];
            }
            msgAttachs.splice(msgAttachs.indexOf(attachment), 1);
            params[key] = value.to ? () => this.get(value.to)(attachment) : attachment;
            if (!returnPromise) {
                params[key] = await params[key];
            }
        }
        return [false, params];
    }
}
exports.default = AttachmentParser;
