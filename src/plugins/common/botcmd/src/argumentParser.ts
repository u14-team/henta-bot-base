import loadDefaultTypes from './defaultTypes';
import BotcmdPlugin from './index';

export default class ArgumentParser {
  botcmdPlugin: BotcmdPlugin;
  types = new Map<string, any>();

  constructor(botcmdPlugin) {
    this.botcmdPlugin = botcmdPlugin;
  }

  init() {
    loadDefaultTypes(this);
  }

  add(slug: string, options: Object) {
    if (this.types[slug]) {
      throw Error(`Type '${slug}' already exists.`);
    }

    if (typeof options === 'function') {
      this.botcmdPlugin.henta.warning(`Use botcmdPlugin.addType(slug, options);`);
      options = { handler: options };
    }

    this.types[slug] = options;
    return this;
  }

  // Шайтан-машина требует рефакторинга.
  async parse (ctx, commandLine: string, argList: Object, offset: number, commandName: string) {
    let index = 0;
    const params = new Map();
    for (const [name, argument] of Object.entries(argList)) {
      const argumentType = this.types[argument.type];
      if (ctx.args.length - 1 - offset <= index && !argumentType.allowNull) {
        if (argument.optional) {
          break;
        }

        return [true, [
          '⚪ Используйте:',
          `>> ${commandName} ${Object.values(argList).map(v => (v.optional ? `[${v.name}]` : `<${v.name}>`)).join(' ')}`
        ]];
      }

      const [error, result] = await argumentType.handler({
        ctx,
        commandLine,
        index,
        argument,
        offset,
        word: ctx.args[index + 1 + offset],
        setIndex: newIndex => { index = newIndex }
      });
      
      if (error) {
        if (argument.optional) {
          continue;
        }

        return [error, result];
      }

      index++;
      params.set(name, result);
    }

    return [false, Object.fromEntries(params)];
  }
}
