"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gamedig_1 = __importDefault(require("gamedig"));
class SourceProtocol {
    async getRaw(host, port) {
        try {
            const info = await gamedig_1.default.query({ type: 'hl2dm', host, port });
            console.log(info);
            return [true, info];
        }
        catch (error) {
            console.log(error.stack);
            return [false];
        }
    }
    clearCodes(str) {
        return str.replace(/\^./g, '');
    }
    async run(host, rawPort) {
        const port = rawPort || 27015;
        const [isOnline, rawInfo] = await this.getRaw(host, port);
        return {
            title: rawInfo ? rawInfo.raw.game : 'Source game server',
            server: { host, port, online: isOnline },
            info: rawInfo && {
                name: this.clearCodes(rawInfo.name),
                players: { online: rawInfo.raw.numplayers, max: rawInfo.maxplayers },
                other: [
                    ['Пинг', rawInfo.ping],
                    ['Карта', rawInfo.map],
                    rawInfo.listentype === 'd' && ['Выделенный'],
                    ['Система', rawInfo.listentype === 'l' ? 'Linux' : 'Windows']
                ]
            }
        };
    }
}
exports.default = SourceProtocol;
