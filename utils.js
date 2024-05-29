import bcrypt from 'bcrypt';
import PhoneNumberUtil from "google-libphonenumber";
import { categories } from './consts.js';

import { User } from "./Models/userModel.js";
import { Product } from "./Models/productModel.js";
import { Merchant } from './Models/merchantModel.js';
import { CountryPreferences } from './Models/countryModel.js';

export async function saveUser(userObj, isMerchant = false, canCollectData = false) {
    const hashedPassword = await bcrypt.hash(userObj.password, 10);
    userObj = {...userObj, password : hashedPassword, isMerchant, canCollectData};
    if(isMerchant){
        Merchant.create(userObj);
        return;
    }

    User.create( userObj );
}

export async function waitForOneSecond() {
  await new Promise(resolve => setTimeout(resolve, 500));
}

export function hasEmptyKeys(obj) {
    return Object.keys(obj).reduce(
        (acc, curr) => acc || obj[curr] === null || obj[curr] === "" 
    , false);
}

export function getSeason() {
      const currentMonth = new Date().getMonth() + 1; 
      switch (true) {
        case currentMonth >= 3 && currentMonth <= 5:
          return 'spring';
        case currentMonth >= 6 && currentMonth <= 8:
          return 'summer';
        case currentMonth >= 9 && currentMonth <= 11:
          return 'autumn';
        default:
          return 'winter';
      }
}

export const getRegionCode = (user) => {
  
  const phoneUtil = PhoneNumberUtil.PhoneNumberUtil.getInstance();
  const number =  phoneUtil.parse(user.phone);
  const regionCode = phoneUtil.getRegionCodeForNumber(number);
  return regionCode;
}

export const initCountryPreferences = async () => {

  const defaultCountryPreferencValuesMap = () => {
    const value = {};
    categories.forEach(category => value[category] = 0);
    return value;
  }
  const valuesInDb = await CountryPreferences.find({}).limit(1);
  if(valuesInDb.length === 0){   
    const phoneUtil = PhoneNumberUtil.PhoneNumberUtil.getInstance();
    phoneUtil.getSupportedRegions().forEach(
        (region) => { 
            const valueToCreate = {
                name: region, 
                preferences: defaultCountryPreferencValuesMap()
            }
            CountryPreferences.create(valueToCreate)
        }
    )
  }
}