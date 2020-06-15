import Henta from 'henta';
import { compose, Middleware } from 'middleware-io';
import Emittery from 'emittery';
import ContextService from './contextService';
import createMessageBuilder from './messageBuilder/creator';

export default class BotPlugin {
  henta: Henta;
  settings: any;
  middleware: Middleware<any>;
  handlers = new Map();
  contextService: ContextService;

  emitter = new Emittery();
  on = this.emitter.on.bind(this.emitter);
  emit = this.emitter.emit.bind(this.emitter);

  constructor(henta: Henta) {
    this.henta = henta;
    this.contextService = new ContextService(this);
  }

  async init(henta) {
    this.settings = await henta.util.loadConfig('bot.json');
    henta.vk.updates.on('message', this.process.bind(this));
  }

  start(henta) {
    this.middleware = compose(this.settings.handlers.map(v => {
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
      await this.middleware(ctx, async () => {});
    } catch (error) {
      this.henta['error'](error.stack);
      this.emit('processError', [ctx, error]);
    }

    return next();
  }

  createBuilder(data, context = {}) {
    const messageBuilder = createMessageBuilder(data);
    messageBuilder.setContext(context);

    return messageBuilder;
  }
}