export interface BeforeAfterCase {
  id: string;
  title: string;
  carModel: string;
  tag: string;
  beforeImage: string;
  afterImage: string;
  summary: string;
  priceText: string;
  durationDays: string;
  microns: string;
}

export const WHATSAPP_PHONE_DEFAULT = '77776543210';
export const WHATSAPP_DISPLAY_PHONE = '+7 (777) 654-32-10';

// Coordinates provided by user: 50°44'33.9"N 78°32'27.2"E -> 50.74275, 78.540889
export const WORKSHOP_LOCATION = {
  city: 'г. Курчатов',
  region: 'Абайская область, Казахстан',
  streetAddress: 'ул. Иртышская',
  fullAddress: 'Казахстан, Абайская область, г. Курчатов, ул. Иртышская',
  dmsCoordinates: '50°44\'33.9"N 78°32\'27.2"E',
  coordinates: {
    lat: 50.74275,
    lng: 78.540889,
  },
};

export function getWhatsAppBookingUrl(customText?: string): string {
  const message =
    customText ||
    'Здравствуйте! Пишу с сайта Kurchatov Paint Studio (г. Курчатов, ул. Иртышская). Хочу записаться на покраску автомобиля под ключ (от 50 000 ₸).';
  return `https://wa.me/${WHATSAPP_PHONE_DEFAULT}?text=${encodeURIComponent(message)}`;
}

export const BEFORE_AFTER_CASES: BeforeAfterCase[] = [
  {
    id: 'case-sedan',
    title: 'Кузовной ремонт и покраска в камере с переходом',
    carModel: 'Седан · Темный графит металлик',
    tag: 'Восстановление геометрии и заводского лака',
    beforeImage: '/src/assets/images/car_sedan_before_1795007901244.jpg',
    afterImage: '/src/assets/images/car_sedan_after_1795007903383.jpg',
    summary:
      'Устранение глубоких задиров металла, вытяжка ребра жесткости, эпоксидный грунт и нанесение двух слоев немецкого HS-лака при 60 °C.',
    priceText: 'от 50 000 ₸',
    durationDays: '2–3 дня',
    microns: '130 мкм',
  },
  {
    id: 'case-suv',
    title: 'Полное обновление передней части кузова под ключ',
    carModel: 'Внедорожник · Черный обсидиан',
    tag: 'Удаление сколов и выгоревшего лака',
    beforeImage: '/src/assets/images/car_suv_before_1795007904542.jpg',
    afterImage: '/src/assets/images/car_suv_after_1795007905846.jpg',
    summary:
      'Снятие старого потрескавшегося покрытия, ремонт пластика бампера и окраска с глубоким зеркальным блеском без шагрени.',
    priceText: 'от 50 000 ₸',
    durationDays: '3 дня',
    microns: '125 мкм',
  },
  {
    id: 'case-booth',
    title: 'Покраска автомобиля под ключ в безпылевой камере',
    carModel: 'Кузовной цех · г. Курчатов, ул. Иртышская',
    tag: 'Компьютерный подбор эмали 100%',
    beforeImage: '/src/assets/images/car_sedan_before_1795007901244.jpg',
    afterImage: '/src/assets/images/spray_booth_studio_1795007906683.jpg',
    summary:
      'Полный цикл подготовки, антикоррозийная защита и окрашивание в герметичной камере с точным попаданием в заводской тон.',
    priceText: 'от 50 000 ₸',
    durationDays: 'от 2 дней',
    microns: '115–135 мкм',
  },
];
