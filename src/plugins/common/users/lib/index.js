"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const emittery_1 = __importDefault(require("emittery"));
const defaultMethods_1 = __importDefault(require("./defaultMethods"));
const bot_1 = __importDefault(require("./bridges/bot"));
const botcmd_1 = __importDefault(require("./bridges/botcmd"));
class User extends sequelize_1.default.Model {
}
;
class UsersPlugin {
    constructor(henta) {
        this.usersPrototype = {};
        this.userGroups = new Set();
        this.cache = new Map();
        this.User = User;
        this.userModel = {
            vkId: sequelize_1.default.INTEGER,
            firstName: sequelize_1.default.STRING,
            lastName: sequelize_1.default.STRING
        };
        this.emitter = new emittery_1.default();
        this.on = this.emitter.on.bind(this.emitter);
        this.emit = this.emitter.emit.bind(this.emitter);
        this.henta = henta;
        this.bridges = henta.pluginManager.useBridges([
            { plugin: 'common/bot', class: bot_1.default },
            { plugin: 'common/botcmd', class: botcmd_1.default }
        ]);
    }
    init(henta) {
        defaultMethods_1.default(henta);
    }
    async preStart(henta) {
        const dbPlugin = henta.getPlugin('common/db');
        // TODO: dbPlugin.init
        this.User = dbPlugin.define('user', this.userModel, { timestamps: false });
        dbPlugin.applySaveCenter(this.User.prototype);
        await dbPlugin.safeSync(this.User);
        Object.assign(this.User.prototype, this.usersPrototype);
    }
    /**
      Получить пользователя по VkId.
  
      @param vkId - ID пользователя ВКонтакте.
      @return Экземпляр пользователя.
    */
    async get(vkId) {
        const cachedUser = this.cache.get(vkId);
        const user = cachedUser
            || await this.User.findOne({ where: { vkId } });
        if (user && !cachedUser) {
            this.applyMethodGroups(user);
            this.cache.set(vkId, user);
        }
        return user;
    }
    /**
      Получить пользователя или создать нового по VkId.
  
      @param vkId - ID пользователя ВКонтакте.
      @return Экземпляр пользователя.
    */
    async getOrCreate(vkId) {
        return await this.get(vkId) || this.create(vkId);
    }
    /**
      Создать нового пользователя.
  
      @param vkId - ID пользователя ВКонтакте.
      @return Экземпляр пользователя.
    */
    async create(vkId) {
        const [vkUser] = await this.henta.vk.api.users.get({ user_ids: vkId.toString() });
        const user = new this.User({ vkId, firstName: vkUser.first_name, lastName: vkUser.last_name });
        this.applyMethodGroups(user);
        this.cache.set(vkId, user);
        this.emit('create', user);
        this.henta['log'](`Новый пользователь: ${user.firstName} ${user.lastName} (${user.getUrl()})`);
        return user;
    }
    /**
      Применить группы методов к экземпляру.
  
      @param user - Экземпляр пользователя.
    */
    applyMethodGroups(user) {
        for (const group of this.userGroups) {
            const groupMethods = {};
            for (const [name, fn] of group.methods) {
                groupMethods[name] = function (...args) {
                    return fn(user, ...args);
                };
            }
            user[group.name] = groupMethods;
        }
    }
    /**
      Получить пользователя по строке.
  
      @param str - Строка (ссылка, пуш, ИД).
      @return Экземпляр пользователя.
    */
    async resolve(str) {
        return this.get(await this.resolveVkId(str));
    }
    /**
      Получить VkId по строке.
  
      @param str - Строка (ссылка, пуш, ИД).
      @return VkId пользователя.
    */
    async resolveVkId(str) {
        const res = await this.henta.vk.snippets.resolveResource(str);
        return res.type === 'user' && res.id;
    }
    /**
      Добавить метод пользователя.
  
      @param name - Имя метода.
      @param fn - Функция метода.
    */
    method(name, fn) {
        // eslint-disable-next-line func-names
        this.usersPrototype[name] = function (...args) {
            return fn(this, ...args);
        };
    }
    /**
      Создать группу методов.
  
      @param groupName - Имя группы.
      @return Группа.
    */
    group(groupName) {
        const { userGroups } = this;
        const GroupClass = class {
            constructor(name) {
                this.methods = new Map();
                this.name = name;
            }
            method(name, func) {
                this.methods.set(name, func);
                return this;
            }
            end() {
                userGroups.add(this);
            }
        };
        return new GroupClass(groupName);
    }
    /**
      Добавить поле в ДБ модель User.
  
      @param name - Имя поля.
      @param data Данные поля.
    */
    field(name, data) {
        if (this.userModel[name]) {
            throw Error(`Поле ${name} уже занято`);
        }
        this.userModel[name] = data;
    }
}
exports.default = UsersPlugin;
