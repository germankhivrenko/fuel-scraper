const FUELS = {
  ds: 'ds',
  dsp: 'dsp',
  a92: 'a92',
  a95: 'a95',
  a95p: 'a95p',
  gs: 'gs'
}

const getFuelName = (fuel) => {
  return {
    [FUELS.ds]: 'Дизель',
    [FUELS.dsp]: 'Дизель Преміум',
    [FUELS.a92]: 'A92',
    [FUELS.a95]: 'A95',
    [FUELS.a95p]: 'A95 Преміум',
    [FUELS.gs]: 'Газ',
  }[fuel]
}

const MEANS = {
  cash: 'cash',
  brand_wallet: 'brand_wallet',
  coupon: 'coupon',
  fuel_card: 'fuel_card',
  special_transport: 'special_transport' 
}

const BRANDS = {
  wog: 'wog',
  okko: 'okko'
}

const getBrandName = (brand) => {
  return {
    [BRANDS.wog]: 'WOG',
    [BRANDS.wog]: 'OKKO'
  }[brand]
}

module.exports = {
  FUELS,
  getFuelName,
  MEANS,
  BRANDS,
  getBrandName
}

