import { Keyboard } from 'vk-io';
import makeMsg from './dataToMsg';

function getRandomId() {
  return `${Math.floor(Math.random() * 1e4)}${Date.now()}`;
}

export default class MessageBuilder {
  msg: any;
  context: any;

  constructor(data, defaultValues) {
    this.msg = defaultValues || {};
    if (data) {
      Object.assign(this.msg, makeMsg(data));
    }

    this.msg.disable_mentions = this.msg.disable_mentions || 1;
  }

  setContext(context) {
    this.context = context;
    this.context.vk = this.context.vk || context.henta.vk;
    return this;
  }

  async send(peerId: number | Array<number> = null) {
    if (Array.isArray(peerId)) {
      return this.multiSend(peerId);
    }

    this.msg.peer_id = peerId || this.context.peerId;
    await this.run();
    return this.context.vk.api.messages.send(this.msg);
  }

  async multiSend(peerIds) {
    await this.run();
    const userIds = peerIds.filter(v => v < 2e9);
    const chatIds = peerIds.filter(v => v > 2e9);

    const userIdsChunks = this.context.henta.util.chunk(userIds, 100);
    const userMessages = userIdsChunks.map(v => ({
      user_ids: v,
      random_id: getRandomId(),
      ...this.msg
    }));

    const chatMessages = chatIds.map(v => ({
      chat_id: v - 2e9,
      random_id: getRandomId(),
      ...this.msg
    }));

    return this.context.vk.collect.executes('messages.send', [
      ...userMessages,
      ...chatMessages
    ]);
  }

  async uploadAttachments() {
    if (!this.msg.attachment) {
      return;
    }

    if (typeof this.msg.attachment !== 'object' || !Array.isArray(this.msg.attachment)) {
      this.msg.attachment = [this.msg.attachment];
    }

    this.msg.attachment = await Promise.all(this.msg.attachment);
  }

  async run() {
    await Promise.all([this.uploadAttachments()]);
  }

  line(text) {
    if (!text) {
      return this;
    }

    return this.manageText(str => (str ? `${str}\n${text}` : text));
  }

  lines(lines) {
    lines.forEach(item => this.line(item));
    return this;
  }

  text(text) {
    return this.manageText(str => (str ? `${str}${text}` : text));
  }

  manageText(func) {
    this.msg.message = func(this.msg.message);
    return this;
  }

  keyboard(keyboard) {
    this.msg.keyboard = keyboard;
    return this;
  }

  kebord(rawButtons, rawOptions = {}) {
    const buttons = rawButtons.filter(v => !!v);
    const options = { chunk: 3, mode: 'inline', ...rawOptions };
    if (buttons.length === 0 && options.mode === 'inline') {
      return this;
    }

    const keyboard = Keyboard.builder();
    buttons.forEach((v, i) => {
      keyboard[`${v.type || 'text'}Button`](v);
      if ((i + 1) % options.chunk === 0) {
        keyboard.row();
      }
    });

    keyboard.inline(options.mode === 'inline' && (!this.context.clientInfo || this.context.clientInfo.inline_keyboard === true));
    keyboard.oneTime(options.mode === 'onetime');

    return this.keyboard(keyboard);
  }

  attach(attachment) {
    if (!this.msg.attachment) {
      this.msg.attachment = [];
    }

    if (typeof this.msg.attachment !== 'object') {
      this.msg.attachment = [this.msg.attachment];
    }

    this.msg.attachment.push(attachment);
    return this;
  }

  audioMessage(source) {
    return this.attach(
      this.context.vk.upload.audioMessage({
        ['peer_id']: this.context.peerId,
        source
      })
    );
  }

  photo(source) {
    if (!source) {
      return this;
    }

    return this.attach((async () => this.context.vk.upload.messagePhoto({
      // ['peer_id']: this.context.peerId,
      source: await source
    })
    )());
  }

  cachedPhoto(slug, generator) {
    if (!slug) {
      return this;
    }

    const imageCachePlugin = this.context.henta.getPlugin('common/imageCache');
    return this.attach(imageCachePlugin.get(slug, generator));
  }

  getKeyboard() {
    return this.msg.keyboard;
  }
}
