"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
function createMessageBuilder(data, defaultValues = {}) {
    if (data instanceof index_1.default) {
        return data;
    }
    return new index_1.default(data, defaultValues);
}
exports.default = createMessageBuilder;
