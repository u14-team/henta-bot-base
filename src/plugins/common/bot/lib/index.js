"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const middleware_io_1 = require("middleware-io");
const emittery_1 = __importDefault(require("emittery"));
const contextService_1 = __importDefault(require("./contextService"));
const creator_1 = __importDefault(require("./messageBuilder/creator"));
class BotPlugin {
    constructor(henta) {
        this.handlers = new Map();
        this.emitter = new emittery_1.default();
        this.on = this.emitter.on.bind(this.emitter);
        this.emit = this.emitter.emit.bind(this.emitter);
        this.henta = henta;
        this.contextService = new contextService_1.default(this);
    }
    async init(henta) {
        this.settings = await henta.util.loadConfig('bot.json');
        henta.vk.updates.on('message', this.process.bind(this));
    }
    start(henta) {
        this.middleware = middleware_io_1.compose(this.settings.handlers.map(v => {
            const handler = this.handlers.get(v);
            if (!handler) {
                throw Error(`Handler ${v} not found.`);
            }
            return handler;
        }));
        this.settings.handlers.map(v => {
            const handler = this.handlers.get(v);
            if (!handler) {
                throw Error(`Handler ${v} not found.`);
            }
            return handler;
        });
    }
    setHandler(slug, fn) {
        this.handlers.set(slug, fn);
    }
    async process(ctx, next) {
        try {
            if (this.settings.ignoreGroups && ctx.senderId < 0) {
                return next();
            }
            this.contextService.apply(ctx);
            await this.middleware(ctx, async () => { });
        }
        catch (error) {
            this.henta['error'](error.stack);
            this.emit('processError', [ctx, error]);
        }
        return next();
    }
    createBuilder(data, context = {}) {
        const messageBuilder = creator_1.default(data);
        messageBuilder.setContext(context);
        return messageBuilder;
    }
}
exports.default = BotPlugin;
