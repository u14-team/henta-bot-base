"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gamedig_1 = __importDefault(require("gamedig"));
const valve_1 = __importDefault(require("gamedig/protocols/valve"));
const dgram_1 = __importDefault(require("dgram"));
class Xash3DProtocol {
    constructor() {
        // XashFix
        valve_1.default.prototype.run = async function (state) {
            if (!this.options.port)
                this.options.port = 27015;
            await this.queryInfo(state);
            await this.queryChallenge();
            await this.queryRules(state);
            await this.cleanup(state);
        };
        valve_1.default.prototype.cleanup = async function (state) {
            // Battalion 1944 puts its info into rules fields for some reason
            if ('bat_name_s' in state.raw.rules) {
                state.name = state.raw.rules.bat_name_s;
                delete state.raw.rules.bat_name_s;
                if ('bat_player_count_s' in state.raw.rules) {
                    state.raw.numplayers = parseInt(state.raw.rules.bat_player_count_s);
                    delete state.raw.rules.bat_player_count_s;
                }
                if ('bat_max_players_i' in state.raw.rules) {
                    state.maxplayers = parseInt(state.raw.rules.bat_max_players_i);
                    delete state.raw.rules.bat_max_players_i;
                }
                if ('bat_has_password_s' in state.raw.rules) {
                    state.password = state.raw.rules.bat_has_password_s === 'Y';
                    delete state.raw.rules.bat_has_password_s;
                }
                // apparently map is already right, and this var is often wrong
                delete state.raw.rules.bat_map_s;
            }
        };
    }
    async query(options) {
        const core = gamedig_1.default.getInstance().queryRunner.protocolResolver.create('valve');
        core.options = options;
        core.udpSocket = gamedig_1.default.getInstance().queryRunner.udpSocket;
        return await core.runOnceSafe();
    }
    async getRaw(host, port) {
        try {
            const info = await this.query({ type: 'hldm', host, port,
                socketTimeout: 2000,
                attemptTimeout: 10000,
                maxAttempts: 1
            });
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
            title: rawInfo ? `${rawInfo.raw.game} (Xash3D)` : 'Xash3D engine server',
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
    sendRconCommand(command, password, host, port) {
        return new Promise((resolve, reject) => {
            const connection = dgram_1.default.createSocket('udp4');
            const buffer = Buffer.alloc(11 + password.length + command.length); // 4 + 5 + 1 + 1
            // fill the buffer
            buffer.writeUInt32LE(0xFFFFFFFF, 0); // magic code
            buffer.write('rcon ', 4);
            buffer.write(password, 9, password.length);
            buffer.write(' ', 9 + password.length, 1);
            buffer.write(command, 10 + password.length, command.length);
            buffer.write('\n', 10 + password.length + command.length, 1);
            connection.send(buffer, 0, buffer.length, port, host, (error) => {
                connection.once('message', (msg) => {
                    connection.close();
                    resolve(msg.toString());
                });
                if (error) {
                    connection.close();
                    reject(error);
                }
            });
        });
    }
    async openRcon(host, port, password) {
        try {
            const rcon = {
                send: async (command) => this.clearCodes(await this.sendRconCommand(command, password, host, port)),
                close: () => { },
                socket: true
            };
            return [false, rcon];
        }
        catch (error) {
            console.log(error.stack);
            return [true, 'offline'];
        }
    }
}
exports.default = Xash3DProtocol;
