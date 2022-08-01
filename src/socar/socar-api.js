const axios = require('axios')

class SocarAPI {
  async getStationList() {
    const {data: {data}} = await axios('https://socar.ua/api/map/stations')

    return data
  }
}

module.exports = {
  SocarAPI
}


