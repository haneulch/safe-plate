import type { RestaurantDetail, RestaurantSummary, UiLang } from '../types';
import type { TourApiCommonItem, TourApiFoodIntroItem, TourApiListItem } from './types';
import { defaultInferrer } from '../inference/menuTags';
import { matchHalalSeed } from '../halal/match';
import { foodCatFromCat3, foodCatLocalized } from './foodCat';

function localized(value: string | undefined, lang: UiLang) {
  if (!value) return undefined;
  // Multilingual services return text in the requested language; store it
  // under both ko (required key) and the requested lang.
  return { ko: value, [lang]: value };
}

export function mapListItem(item: TourApiListItem, lang: UiLang): RestaurantSummary {
  const foodCat = foodCatFromCat3(item.cat3);
  return {
    id: item.contentid,
    name: { ko: item.title, [lang]: item.title },
    cat: foodCatLocalized(foodCat),
    foodCat,
    lat: parseFloat(item.mapy),
    lng: parseFloat(item.mapx),
    distanceM: item.dist ? Math.round(parseFloat(item.dist)) : undefined,
    imageUrl: item.firstimage2 || item.firstimage || undefined,
    source: 'tourapi',
    halalCert: !!matchHalalSeed(item.title, item.addr1),
  };
}

export async function mapDetail(
  lang: UiLang,
  contentId: string,
  common: TourApiCommonItem | undefined,
  intro: TourApiFoodIntroItem | undefined,
): Promise<RestaurantDetail> {
  const menuText = [intro?.firstmenu, intro?.treatmenu].filter(Boolean).join(', ');
  const menus = menuText ? await defaultInferrer.infer(menuText) : [];
  const halal = common?.title ? matchHalalSeed(common.title, common.addr1) : undefined;
  const foodCat = foodCatFromCat3(common?.cat3);
  return {
    id: contentId,
    name: { ko: common?.title ?? '', [lang]: common?.title ?? '' },
    cat: foodCatLocalized(foodCat),
    foodCat,
    lat: common?.mapy ? parseFloat(common.mapy) : 0,
    lng: common?.mapx ? parseFloat(common.mapx) : 0,
    imageUrl: common?.firstimage || undefined,
    address: localized(common?.addr1, lang),
    tel: common?.tel,
    overview: localized(common?.overview, lang),
    source: 'tourapi',
    halalCert: !!halal,
    menus,
  };
}
