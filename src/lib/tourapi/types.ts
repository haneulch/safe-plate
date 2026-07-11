/** Raw TourAPI 4.0 response shapes (subset we consume). */

export interface TourApiListBody<T> {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: T[] } | '';
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
}

/** locationBasedList2 item (contentTypeId=39 food). */
export interface TourApiListItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1?: string;
  addr2?: string;
  dist?: string; // meters as string
  firstimage?: string;
  firstimage2?: string;
  mapx: string; // lng
  mapy: string; // lat
  tel?: string;
  cat3?: string;
}

/** detailCommon2 item. */
export interface TourApiCommonItem {
  contentid: string;
  title: string;
  overview?: string;
  addr1?: string;
  tel?: string;
  firstimage?: string;
  mapx?: string;
  mapy?: string;
  cat3?: string;
}

/** detailIntro2 item for contentTypeId=39. */
export interface TourApiFoodIntroItem {
  contentid: string;
  firstmenu?: string;
  treatmenu?: string;
  opentimefood?: string;
  restdatefood?: string;
  packing?: string;
  parkingfood?: string;
}
