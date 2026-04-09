
export interface UniversityData {
  school_id: string;
  school_name: string;
  partner_company: string;
  region: string;
  address: string;
  lat: number;
  lng: number;
  amount_sum: number;
  status: 'NEW' | 'EXISTING';
  proposal_range: string;
  industry: string;
  proposal_types: ('교육LMS' | '세미나')[];
  contact_info?: string; // 비고 및 담당자 연락처 추가
}

export enum Region {
  SEOUL = '서울',
  GYEONGGI_INCHEON = '경기/인천',
  DAEGYEONG = '대경권',
  DONGNAM = '동남권',
  CHUNGCHEONG = '충청권',
  HONAM = '호남권',
  GANGWON_JEONBUK_JEJU = '강원/전북/제주',
  ETC = '기타/미정'
}
