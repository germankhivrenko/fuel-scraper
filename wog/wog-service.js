class WogService {
  constructor(request) {
    this._request = request
  }

  async fetchStationList() {
    const {body} = await this._request('https://api.wog.ua/fuel_stations')
    const {data} = await body.json()

    return data
  }

  async fetchStation(id) {
    console.log('Requesting wog station info with id: ' + id)
    const {body} = await this._request(`https://api.wog.ua/fuel_stations/${id}`)
    const {data} = await body.json()
    console.dir(data, {depth: 3})

    return data
  }
}

module.exports = {
  WogService
}

