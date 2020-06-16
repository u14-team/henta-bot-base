const Sequelize = require('sequelize');

class PexPlugin {
  constructor(henta) {
    this.henta = henta;
  }

  async init(henta) {
    [this.roles, this.fromSlug] = await henta.util.loadEnts('config/pex.json');

    const usersPlugin = henta.getPlugin('common/users');
    usersPlugin.field('role', {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: 'user'
    });

    usersPlugin.group('pex')
      .method('is', ({ role }, right) => this.isAllow(role, right))
      .method('value', ({ role }, slug, defaultValue = false) => this.getValue(role, slug, defaultValue))
      .method('get', ({ role }) => this.fromSlug[role])
      .end();

    henta.cmd.addCommand({
      slug: 'pex-set',
      description: 'установить роль',
      usage: '<user> <role-slug>',
      // eslint-disable-next-line no-unused-vars
      handler: async ([_, userStr, roleSlug]) => {
        const user = await usersPlugin.resolve(userStr);
        const newRole = henta.getPlugin('common/pex').get(roleSlug);
        if (!newRole) {
          throw Error('Такой роли не существует.');
        }

        const oldRoleName = user.pex.get().title;
        user.role = roleSlug;
        user.save();

        user.send([
          '🎫 Ваша роль изменена:',
          `⬛ ${oldRoleName} » ${newRole.title}.`
        ]);

        henta.log(`Установлена новая роль для ${user.getFullName()}: ${oldRoleName} » ${newRole.title}.`);
      }
    });
  }

  get(slug) {
    return this.fromSlug[slug];
  }

  isAllow(roleSlug, right) {
    return this.isRoleAllow(this.fromSlug[roleSlug], right);
  }

  getValue(roleSlug, slug, defaultValue = false) {
    return this.getRoleValue(this.fromSlug[roleSlug], slug, defaultValue);
  }

  getRoleValue(role, slug, defaultValue = false) {
    if (role.data.values && role.data.values[slug]) {
      return role.data.values[slug];
    }

    if (role.includes) {
      return role.includes
        .map(v => this.getValue(v, slug, defaultValue))
        .find(v => v !== defaultValue);
    }

    return defaultValue;
  }

  isRoleAllow(role, right) {
    if (role.data.disallow && role.data.disallow.includes(right)) {
      return false;
    }

    // Allow all
    if (role.data.allow === true) {
      return true;
    }

    if (role.data.allow && role.data.allow.includes(right)) {
      return true;
    }

    if (role.includes) {
      return role.includes.find(v => this.isAllow(v, right));
    }

    return false;
  }
}

module.exports = { default: PexPlugin };