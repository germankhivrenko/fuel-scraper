const _ = require('lodash')
const {request} = require('undici')

const collectData = async () => {
  console.log('Starting fetching data...\n')

  const {body} = await request('https://api.wog.ua/fuel_stations')
  const {data} = await body.json()
  const stations = _.chain(data).get('stations', []).take(5).value()
  
  for (const station of stations) {
    const id = _.chain(stations).first().get('id').value()
    await fetchStationInfo(id)
  }
} 

const fetchStationInfo = async (id) => {
  const {body} = await request(`https://api.wog.ua/fuel_stations/${id}`)
  const {data} = await body.json()
  console.dir(data, {depth: 3})
}

collectData()
// const timeout = setInterval(collectData, 10 * 1000)

