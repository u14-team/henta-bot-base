"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const defaultTypes_1 = __importDefault(require("./defaultTypes"));
class ArgumentParser {
    constructor(botcmdPlugin) {
        this.types = new Map();
        this.botcmdPlugin = botcmdPlugin;
    }
    init() {
        defaultTypes_1.default(this);
    }
    add(slug, options) {
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
    async parse(ctx, commandLine, argList, offset, commandName) {
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
                setIndex: newIndex => { index = newIndex; }
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
exports.default = ArgumentParser;
