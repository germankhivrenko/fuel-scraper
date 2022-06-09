const _ = require('lodash')

class TgNotificationService {
  constructor(bot) {
    this._bot = bot
  }

  async notifyUser(user, {msg, location}) {
    const {coordinates: [latitude, longitude]} = location
    await this._bot.telegram.sendMessage(user.tgId, msg)
    await this._bot.telegram.sendLocation(user.tgId, latitude, longitude)
  }
}

module.exports = {
  TgNotificationService
}

