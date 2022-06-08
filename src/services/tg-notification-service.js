const _ = require('lodash')

class TgNotificationService {
  constructor(bot) {
    this._bot
  }

  async notifyUser(user, {msg, location}) {
    try {
      const {latitude, longitude} = location
      await this._bot.telegram.sendMessage(user.tgId, msg)
      await this._bot.telegram.sendLocation(user.tgId, latitude, longitude)
    } catch(err) {
      console.error(err)
    }
  }
}

module.exports = {
  TgNotificationService
}

