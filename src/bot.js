const _ = require('lodash')
const {Telegraf} = require('telegraf')
const {FUELS, FUEL_NAMES, MEANS, MEAN_NAMES, BRAND_NAMES} = require('./const')

const createBot = ({usersDAO, db, messageContentService}) => {
  const bot = new Telegraf(process.env.BOT_TOKEN)
  const requestLocation = (ctx) => {
    return ctx.reply(
      'Поділіться своєю локацією',
      {
        reply_markup: {
          resize_keyboard: true,
          one_time_keyboard: true,
          keyboard: [
            [{text: 'Поділитися локацією', request_location: true}]
          ]
        }
      })
  }
  const requestFuels = (ctx) => {
    return ctx.reply(
      'Виберіть пальне для стежки',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {text: FUEL_NAMES[FUELS.ds], callback_data: FUELS.ds},
              {text: FUEL_NAMES[FUELS.dsp], callback_data: FUELS.dsp}
            ],
            [
              {text: FUEL_NAMES[FUELS.a92], callback_data: FUELS.a92}, 
              {text: FUEL_NAMES[FUELS.a95], callback_data: FUELS.a95},
              {text: FUEL_NAMES[FUELS.a95p], callback_data: FUELS.a95p}
            ],
            [
              {text: FUEL_NAMES[FUELS.gs], callback_data: FUELS.gs}
            ],
            [
              {text: 'Очистити', callback_data: 'clear_fuels'}
            ]
          ] 
        }
      })
  }
  
  bot.start(async (ctx) => {
    const msg = messageContentService.getStartContent()
    await ctx.reply(msg)
    const user = {tgId: ctx.from.id}
    const foundUser = await usersDAO.findOne(user)
    const maxDistance = _.get(foundUser, 'maxDistance') || 10000
    await usersDAO.upsertOne(user, {...user, maxDistance, subscribed: true}) 
    // await requestLocation(ctx)
  })

  // commands
  bot.command('about', async (ctx) => {
    const msg = messageContentService.getAboutContent()
    await ctx.reply(msg)
  })

  bot.command('help', async (ctx) => {
    const msg = messageContentService.getHelpContent()
    await ctx.reply(msg)
  })

  bot.command('settings', async (ctx) => {
    const user = await usersDAO.findOne({tgId: ctx.from.id})
    const msg = messageContentService.getSearchSettings(user)
    await ctx.reply(msg)
  })

  bot.command('fuels', async (ctx) => {
    await requestFuels(ctx)
  })

  bot.command('location', async (ctx) => {
    await requestLocation(ctx)
  })

  bot.command('subscribe', async (ctx) => {
    await usersDAO.updateOne({tgId: ctx.from.id}, {subscribed: true}) 
    await ctx.reply('Ви підписались на повідомлення')
  })

  bot.command('unsubscribe', async (ctx) => {
    await usersDAO.updateOne({tgId: ctx.from.id}, {subscribed: false}) 
    await ctx.reply('Ви скасували підписку на повідомлення')
  })

  bot.command('search', async (ctx) => {
    const user = await usersDAO.findOne({tgId: ctx.from.id}) 
    
    if (_.isEmpty(user.fuels)) {
      await ctx.reply(`Ви не маєте жодного обраного пального`)
      await requestFuels(ctx)
      return
    }
    if (_.isEmpty(user.location)) {
      await ctx.reply('Для пошуку ви повинні поділитися своєю локацією')
      await requestLocation(ctx)
      return
    }

    const query = _.reduce(user.fuels, (acc, fuel) => {
      acc.$or.push({[`fuels.${fuel}.means.cash`]: {$exists: true}})
      return acc
    }, {$or: []})
    const stations = await db.collection('stations').aggregate(
      [
        {
          $geoNear: {
            near: user.location,
            distanceField: 'distance',
            maxDistance: user.maxDistance,
            spherical: true,
            query
          }
        }
      ])

    if (!(await stations.hasNext())) {
      const msg = messageContentService.getNothingFoundContent()
      await ctx.reply(msg)
      return
    }

    for await (const station of stations) {
      const {distance, location: {coordinates: [longitude, latitude]}} = station
      const fuels = user.getIntersectFuels(_.keys(station.fuels))
      try {
        const msg = messageContentService.getFuelOnStationContent(station, fuels, distance)
        await ctx.reply(msg)
        await bot.telegram.sendLocation(user.tgId, latitude, longitude)
      } catch(err) {
        console.error(err)
      }
    }
  })

  const toKm = (m) => m / 1000
  const DISTANCES = [5000, 10000, 15000, 20000, 30000]
  const DISTANCE_KEYBOARD = _.chain(DISTANCES)
    .map((distance) => ({text: `${toKm(distance)} км`, callback_data: distance.toString()}))
    .chunk(3)
    .value()

  bot.command('distance', async (ctx) => {
    await ctx.reply(
      'Оберіть радіус пошуку',
      {
        reply_markup: {
          inline_keyboard: DISTANCE_KEYBOARD 
        }
      })
  })

  _.each(DISTANCES, (distance) => {
    bot.action(distance.toString(), async (ctx) => {
      await usersDAO.updateOne({tgId: ctx.from.id}, {maxDistance: distance}) 
      const user = await usersDAO.findOne({tgId: ctx.from.id})
      const msg = messageContentService.getSearchSettings(user)
      await ctx.reply(msg)
    })
  })

  // actions 
  _.each(FUELS, (fuel) => {
    bot.action(fuel, async (ctx) => {
      await usersDAO.addFuel({tgId: ctx.from.id}, fuel) 
      const user = await usersDAO.findOne({tgId: ctx.from.id})
      const msg = messageContentService.getSearchSettings(user)
      await ctx.reply(msg)
    })
  })
  
  bot.action('clear_fuels', async (ctx) => {
    await usersDAO.updateOne({tgId: ctx.from.id}, {fuels: []}) 
    await ctx.reply('Усі види палива видалені з пошуку')
  })

  bot.on('message', async (ctx) => {
    const location = ctx.message.location
    if (location) {
      const {longitude, latitude} = location
      await usersDAO.updateOne({tgId: ctx.from.id}, {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      })
    
      const user = await usersDAO.findOne({tgId: ctx.from.id})
      const msg = messageContentService.getSearchSettings(user)
      await ctx.reply(msg)
    }
  })

  return bot
}

module.exports = {
  createBot
}


