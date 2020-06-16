const asyncRedis = require('async-redis');
const RedisSerializer = require('./serializer');

class RedisPlugin {
  constructor(henta) {
    this.henta = henta;
    this.serializer = new RedisSerializer(this);
    this.redisCache = new Map();
  }

  async preInit(henta) {
    this.tag = henta.config.public.redisTag;
    this.client = asyncRedis.createClient();
  }

  async get(key, defaultValue) {
    const data = this.redisCache.get(key) || await this.client.get(`${this.tag}::${key}`);
    this.redisCache.set(key, data);

    return data || defaultValue;
  }

  set(key, value) {
    this.redisCache.set(key, value);
    return this.client.set(`${this.tag}::${key}`, value);
  }

  del(key) {
    this.redisCache.delete(key);
    return this.client.del(`${this.tag}::${key}`);
  }

  async getObject(key) {
    const raw = await this.get(key);
    return raw && JSON.parse(raw);
  }

  setObject(key, value) {
    return this.set(key, JSON.stringify(value));
  }
}

module.exports = { default: RedisPlugin };
