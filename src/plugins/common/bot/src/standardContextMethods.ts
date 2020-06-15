import createMessageBuilder from './messageBuilder/creator';

async function bad(response) {
  this.isBad = true;
  this.answer(response);
}

async function answer(response) {
  if (this.answered) {
    throw Error('На это сообщение бот уже вернул ответ.');
  }

  this.answered = true;
  const messageBuilder = createMessageBuilder(response);
  messageBuilder.setContext({
    peerId: this.peerId,
    vk: this.henta.vk,
    henta: this.henta
  });

  await this.bot.emit('answer', [this, messageBuilder]);
  return messageBuilder.send();
}

function send(response) {
  const messageBuilder = createMessageBuilder(response);
  messageBuilder.setContext({
    peerId: this.peerId,
    vk: this.henta.vk,
    henta: this.henta
  });

  return messageBuilder.send();
}

function builder(response) {
  const messageBuilder = createMessageBuilder(response);
  messageBuilder.setContext({
    peerId: this.peerId,
    vk: this.henta.vk,
    henta: this.henta,
    clientInfo: this.clientInfo
  });

  messageBuilder['answer'] = () => {
    this.answer(messageBuilder);
  };

  messageBuilder['bad'] = () => {
    this.bad(messageBuilder);
  };

  return messageBuilder;
}

function getPayloadValue(field) {
  return this.messagePayload && this.messagePayload[field];
}

export default function addStandardContextMethods(contextService, botPlugin) {
  const henta = botPlugin.henta;
  // Methods
  contextService.set('bad', bad);
  contextService.set('answer', answer);
  contextService.set('send', send);
  contextService.set('builder', builder);
  contextService.set('getPlugin', henta.getPlugin);
  contextService.set('getPayloadValue', getPayloadValue);
  // Fields
  contextService.set('bot', botPlugin);
  contextService.set('vk', henta.vk);
  contextService.set('api', henta.vk.api);
  contextService.set('henta', henta);
}
