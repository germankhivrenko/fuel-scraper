const FUELS = {
  ds: 'ds',
  dsp: 'dsp',
  a92: 'a92',
  a95: 'a95',
  a95p: 'a95p',
  gs: 'gs'
}

const FUEL_NAMES = {
  [FUELS.ds]: 'Дизель',
  [FUELS.dsp]: 'Дизель Преміум',
  [FUELS.a92]: 'A92',
  [FUELS.a95]: 'A95',
  [FUELS.a95p]: 'A95 Преміум',
  [FUELS.gs]: 'Газ',
}

const getFuelName = (fuel) => {
  return FUEL_NAMES[fuel]
}

const MEANS = {
  cash: 'cash',
  brand_wallet: 'brand_wallet',
  coupon: 'coupon',
  fuel_card: 'fuel_card',
  special_transport: 'special_transport' 
}

const MEAN_NAMES = {
  [MEANS.cash]: 'Банк. карта/готівка',
  [MEANS.brand_wallet]: 'Гаманець АЗС',
  [MEANS.coupon]: 'Паливні талони',
  [MEANS.fuel_card]: 'Паливна карта',
  [MEANS.special_transport]: 'Спецтранспорт'
}

const BRANDS = {
  wog: 'wog',
  okko: 'okko',
  upg: 'upg'
}

const BRAND_NAMES = {
  [BRANDS.wog]: 'WOG',
  [BRANDS.okko]: 'OKKO',
  [BRANDS.upg]: 'UPG'
}

const getBrandName = (brand) => {
  return BRAND_NAMES[brand]
}

module.exports = {
  FUELS,
  FUEL_NAMES,
  getFuelName,
  MEANS,
  MEAN_NAMES,
  BRANDS,
  BRAND_NAMES,
  getBrandName
}

