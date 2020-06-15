"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const standardContextMethods_1 = __importDefault(require("./standardContextMethods"));
class ContextService {
    constructor(botPlugin) {
        this.fields = {};
        this.botPlugin = botPlugin;
        standardContextMethods_1.default(this, botPlugin);
    }
    set(slug, value) {
        this.fields[slug] = value;
    }
    method(slug, func) {
        this.fields[slug] = function (...args) { return func(this, ...args); };
    }
    apply(ctx) {
        Object.assign(ctx, this.fields);
    }
}
exports.default = ContextService;
