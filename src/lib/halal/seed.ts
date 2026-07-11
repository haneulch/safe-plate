/**
 * Muslim-friendly restaurants in Gyeonggi-do.
 * Source: 경기관광공사_경기도 무슬림 친화 음식점 (data.go.kr 15099378, 2024-05-31 file data).
 * Static seed — matched against TourAPI results by normalized name + region.
 */
export interface HalalSeedEntry {
  name: string;
  region: string;
  cuisine: string;
  address: string;
  tel: string;
}

export const HALAL_SEED: HalalSeedEntry[] = [
  { name: "뉴델리", region: "고양시", cuisine: "인도식", address: "고양시 덕양구 화신로272번길 29", tel: "070-4105-1010" },
  { name: "아시아아시아", region: "고양시", cuisine: "인도식", address: "고양시 일산동구 장항동 868 웨스턴돔 2층", tel: "031-901-0086" },
  { name: "KB케밥&닭강정", region: "김포시", cuisine: "방글라데시식", address: "김포시 통진읍 조강로 40", tel: "031-981-3293" },
  { name: "FORTUNE(파르투네)", region: "김포시", cuisine: "우즈베키스탄식", address: "김포시 통진읍 조강로44번길 4 2층", tel: "031-997-2776" },
  { name: "말리오보로", region: "김포시", cuisine: "인도네시아식", address: "김포시 통진읍 서암로 94-30", tel: "031-984-4805" },
  { name: "할랄 인디안 레스토랑", region: "김포시", cuisine: "인도네시아식", address: "김포시 통진읍 조강로 43", tel: "031-997-2334" },
  { name: "하스케밥", region: "동두천시", cuisine: "터키식", address: "동두천시 평화로 2553", tel: "031-862-3869" },
  { name: "마살라인디안레스토랑", region: "부천시", cuisine: "인도식", address: "부천시 석천로 169번길 30", tel: "032-326-2244" },
  { name: "안나푸르나 레스토랑", region: "부천시", cuisine: "인도식", address: "부천시 부흥로 402번길 45", tel: "032-662-5075" },
  { name: "디왈리", region: "성남시", cuisine: "인도식", address: "성남시 수정구 성남대로 1334", tel: "031-722-0782" },
  { name: "인디안 커리", region: "성남시", cuisine: "인도식", address: "성남시 분당구 황새울로360번길 21", tel: "031-781-2177" },
  { name: "인디테이블", region: "성남시", cuisine: "인도식", address: "성남시 분당구 동판교로177번길 25", tel: "031-708-7022" },
  { name: "그레이트 히말라야", region: "수원시", cuisine: "네팔인도식", address: "수원시 팔달구 매산로 7-1", tel: "031-243-1187" },
  { name: "난", region: "수원시", cuisine: "인도식", address: "수원시 팔달구 인계로166번길 45 2층", tel: "031-237-1090" },
  { name: "델리다바", region: "수원시", cuisine: "인도식", address: "수원시 팔달구 매산로 6-2", tel: "031-248-1090" },
  { name: "벨라튀니지", region: "수원시", cuisine: "지중해식", address: "수원시 장안구 서부로2106번길 21", tel: "031-296-8327" },
  { name: "수엠부 인도요리", region: "수원시", cuisine: "인도식", address: "수원시 팔달구 매산로20번길 9", tel: "031-258-3305" },
  { name: "아그라 스타필드 수원점", region: "수원시", cuisine: "인도식", address: "수원시 장안구 수성로 175 스타필드 수원점 7층", tel: "0507-1413-1704" },
  { name: "히말라야 정원", region: "수원시", cuisine: "네팔인도식", address: "수원시 팔달구 권광로180번길 19", tel: "031-254-0977" },
  { name: "New bakso garuda", region: "안산시", cuisine: "인도네시아식", address: "경기도 안산시 단원구 원곡동 787-17", tel: "031-493-0605" },
  { name: "긴자인도레스토랑", region: "안산시", cuisine: "인도식", address: "안산시 단원구 광덕대로151 304호", tel: "031-405-3368" },
  { name: "뉴타지마할", region: "안산시", cuisine: "인도식", address: "안산시 단원구 다문화1길 49", tel: "031-492-7861" },
  { name: "아시아믹스", region: "안산시", cuisine: "파키스탄식", address: "안산시 단원구 다문화2길 22", tel: "031-494-7447" },
  { name: "린두알람", region: "안산시", cuisine: "인도네시아식", address: "안산시 단원구 다문화길 18 2층", tel: "031-894-7778" },
  { name: "레아 인도네시아", region: "안산시", cuisine: "인도네시아식", address: "안산시 단원구 중앙대로 453 2층", tel: "031-508-6685" },
  { name: "로얄레스토랑", region: "안산시", cuisine: "인도네시아식", address: "안산시 단원구 원곡로23 2층", tel: "031-5127-3674" },
  { name: "바타비아", region: "안산시", cuisine: "인도네시아식", address: "안산시 단원구 다문화길 4", tel: "031-493-6626" },
  { name: "후르셰다사마르칸트", region: "안산시", cuisine: "우즈베키스탄식", address: "안산시 단원구 다문화2길 3", tel: "031-492-6984" },
  { name: "임페리아", region: "안산시", cuisine: "인도네시아식", address: "안산시 단원구 다문화2길 12", tel: "031-494-5734" },
  { name: "솔티 인도네팔 레스토랑", region: "안산시", cuisine: "네팔인도식", address: "안산시 단원구 중앙대로 453", tel: "031-492-7723" },
  { name: "아시아나 레스토랑", region: "안산시", cuisine: "인도식", address: "안산시 단원구 다문화2길 51", tel: "031-494-6167" },
  { name: "RAYHON", region: "안산시", cuisine: "우즈베키스탄식", address: "안산시 상록구 학사1길 2", tel: "031-406-1914" },
  { name: "와룽키타", region: "안산시", cuisine: "인도네시아식", address: "안산시 원곡본동 원본로 3", tel: "031-508-1103" },
  { name: "칸티푸르", region: "안산시", cuisine: "네팔인도식", address: "안산시 단원구 다문화2길 28", tel: "031-493-9563" },
  { name: "카르티니", region: "안산시", cuisine: "인도네시아식", address: "안산시 단원구 다문화1길 1 2층", tel: "031-493-4471" },
  { name: "아그라 스타필드안성점", region: "안성시", cuisine: "인도식", address: "안성시 공도읍 서동대로 3930-39 1층 1337호", tel: "0507-1361-1695" },
  { name: "긴자인도레스토랑", region: "안양시", cuisine: "인도식", address: "안양시 동안구 평촌대로217번길 19", tel: "031-383-2223" },
  { name: "이타지마할 인디안레스토랑", region: "오산시", cuisine: "인도식", address: "오산시 대원로 8-8", tel: "031-374-0195" },
  { name: "갠지스(보정점)", region: "용인시", cuisine: "인도식", address: "용인시 기흥구 죽전로15번길 7-15", tel: "031-889-3434" },
  { name: "두르가(의정부점)", region: "의정부시", cuisine: "네팔인도식", address: "의정부시 태평로73번길 50", tel: "031-848-4785" },
  { name: "인도레스토랑 그레이", region: "파주시", cuisine: "인도식", address: "파주시 경의로 1114 10층", tel: "031-949-9135" },
  { name: "더 히말라얀", region: "파주시", cuisine: "네팔인도식", address: "파주시 새꽃로 194", tel: "031-943-2256" },
  { name: "니자르케밥(평택점)", region: "평택시", cuisine: "터키식", address: "평택시 팽성읍 안정쇼핑로2 2층", tel: "031-651-9951" },
  { name: "모티마할험프리점", region: "평택시", cuisine: "인도식", address: "평택시 평택1로9번길 8", tel: "031-616-3358" },
  { name: "스파이스빌리지", region: "평택시", cuisine: "인도식", address: "평택시 쇼핑로 17-1", tel: "031-668-4444" },
  { name: "에베레스트(스타필드 하남점)", region: "하남시", cuisine: "인도식", address: "하남시 미사대로 750", tel: "031-8072-8289" },
  { name: "갠지스(1동탄점)", region: "화성시", cuisine: "인도식", address: "화성시 동탄공원로2길 33-11", tel: "031-613-9575" },
  { name: "ZAMZAM", region: "화성시", cuisine: "우즈베키스탄식", address: "화성시 향남읍 3.1만세로 1130", tel: "070-4255-1786" },
  { name: "발안 인도네시아", region: "화성시", cuisine: "인도네시아식", address: "화성시 향남읍 3.1만세로 1133", tel: "070-8844-0340" },
  { name: "수엠부(동탄점)", region: "화성시", cuisine: "네팔인도식", address: "화성시 노작로4길 18-15", tel: "031-8015-2494" },
  { name: "파르투내레스토랑", region: "화성시", cuisine: "우즈베키스탄식", address: "화성시 남양읍 남양시장로 88", tel: "031-356-9777" },
];
