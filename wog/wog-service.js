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
    const {body} = await this._request(`https://api.wog.ua/fuel_stations/${id}`)
    const {data} = await body.json()

    return data
  }
}

module.exports = {
  WogService
}

