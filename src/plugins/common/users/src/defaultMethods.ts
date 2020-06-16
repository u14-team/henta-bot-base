import Henta from 'henta';

export default function initDefaultMethods(henta: Henta) {
  const usersPlugin = henta.getPlugin('common/users');
  const botPlugin = henta.getPlugin('common/bot');

  usersPlugin.method('getFullName', (self) => `${self.firstName} ${self.lastName}`);
  usersPlugin.method('getUrl', (self) => `vk.com/id${self.vkId}`);
  usersPlugin.method('toString', (self) => `[id${self.vkId}|${self.nickName || self.firstName}]`);
  usersPlugin.method('send', (self, data) => self.sendBuilder(data).send());
  usersPlugin.method('sendBuilder', (self, data) =>
    botPlugin.createBuilder(data, { peerId: self.vkId, henta })
  );
}