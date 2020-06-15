"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
class RconConnection {
    async connect(options) { }
    ;
    async send(command) { return ''; }
    ;
    close() { this.socket.close(); }
    onMessage() {
    }
}
exports.RconConnection = RconConnection;
class RconManager {
    constructor(henta, root) {
        this.rconConnections = new Map();
        this.henta = henta;
        this.root = root;
    }
    async init(henta) {
        const botPlugin = henta.getPlugin('common/bot');
        const redisPlugin = henta.getPlugin('common/redis');
        const dbPlugin = henta.getPlugin('common/db');
        botPlugin.setHandler('interactive-rcon', (ctx, next) => this.handler(ctx, next));
        this.interactiveSessions = await redisPlugin.serializer.run({
            slug: 'interactive-rcon-sessions',
            defaultValue: new Map(),
            class: Map
        });
        console.log(this.interactiveSessions);
        this.RconServer = await dbPlugin.add('rconServer', {
            host: sequelize_1.default.STRING,
            port: sequelize_1.default.INTEGER,
            password: sequelize_1.default.STRING,
            protocol: sequelize_1.default.STRING,
            ownerVkId: sequelize_1.default.INTEGER
        });
    }
    async closeSession(session) {
        if (this.rconConnections.get(session)) {
            this.rconConnections.get(session).close();
            this.rconConnections.delete(session);
        }
        const rconServer = await this.RconServer.findOne({ where: { id: session.serverId } });
        this.interactiveSessions.delete(rconServer.ownerVkId);
    }
    async createNewConnection(session) {
        const rconServer = await this.RconServer.findOne({ where: { id: session.serverId } });
        const protocol = this.root.protocols.get(rconServer.protocol);
        const [isError, rcon] = await protocol.openRcon(rconServer.host, rconServer.port, rconServer.password);
        if (isError) {
            const errorDescriptions = {
                offline: 'Этот сервер не ответил на запрос',
                auth: 'Я не смог авторизоваться по Вашему паролю'
            };
            throw Error(errorDescriptions[rcon]);
        }
        this.rconConnections.set(session, rcon);
        return rcon;
    }
    async getRconConnection(session) {
        const connection = this.rconConnections.get(session);
        if (!connection || !connection.socket) {
            return await this.createNewConnection(session);
        }
        return connection;
    }
    async handler(ctx, next) {
        if (ctx.answered || ctx.isChat) {
            return next();
        }
        const session = this.interactiveSessions.get(ctx.user.vkId);
        if (!session) {
            return next();
        }
        if ((ctx.getPayloadValue('command') || ctx.text) === '$exit') {
            this.closeSession(session);
            ctx.builder()
                .lines([
                '📟 Ваша интерактивная сессия была завершена.'
            ])
                .kebord([], { mode: '!' })
                .answer();
            return next();
        }
        try {
            const rconConnection = await this.getRconConnection(session);
            const isNullOrWhiteSpace = str => (!str || str.length === 0 || /^[\u0000\s]*$/.test(str));
            const response = await rconConnection.send(ctx.text);
            ctx.answer(isNullOrWhiteSpace(response) ? '📟 Команда выполнена.' : response);
        }
        catch (error) {
            ctx.bad(`😒 ${error.message}`);
            this.closeSession(session);
        }
        return next();
    }
}
exports.default = RconManager;
