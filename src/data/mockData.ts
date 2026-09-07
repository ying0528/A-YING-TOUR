import type { Activity, Place, RouteStep, Ticket, Traveler } from '../types'

export const travelers: Traveler[] = [
  { id: 'U001', name: '大寶' },
  { id: 'U002', name: '小寶' },
]

export const activities: Activity[] = [
  { id: 'A0909-01', date: '2026-09-09', time: '16:40', type: '飛機', title: '桃機出發 IT606' },
  { id: 'A0909-02', date: '2026-09-09', time: '19:55', type: '其他', title: '抵達釜山' },
  { id: 'A0909-03', date: '2026-09-09', time: '20:45', duration: 30, type: '移動', title: '移動 機場-飯店', routeId: 'R001' },
  { id: 'A0909-04', date: '2026-09-09', duration: 30, type: '住宿', title: 'CHECK IN', placeId: 'P001' },
  { id: 'A0909-05', date: '2026-09-09', time: '21:30', duration: 120, type: '餐廳', title: '晚餐', placeId: 'P002' },
  { id: 'A0909-06', date: '2026-09-09', time: '23:30', type: '住宿', title: '回到飯店GEM STAY', placeId: 'P001' },

  { id: 'A0910-01', date: '2026-09-10', time: '08:30', duration: 60, type: '移動', title: '移動 飯店-Skyline Luge', routeId: 'R002' },
  { id: 'A0910-02', date: '2026-09-10', time: '09:30', duration: 90, type: '景點', title: 'Skyline Luge', placeId: 'P003', cost: 'VBP' },
  { id: 'A0910-03', date: '2026-09-10', time: '11:00', duration: 240, type: '景點', title: '樂天世界(午餐)、海東龍宮寺(彈性行程)', placeId: 'P004' },
  { id: 'A0910-04', date: '2026-09-10', time: '15:00', duration: 30, type: '移動', title: '移動 樂天世界-藍線公園松亭站', routeId: 'R003' },
  { id: 'A0910-05', date: '2026-09-10', time: '15:30', duration: 60, type: '景點', title: '海雲台藍線公園', placeId: 'P005', cost: 'VBP' },
  { id: 'A0910-06', date: '2026-09-10', type: '移動', title: '移動 尾埔-hillspa(步行可達)', routeId: 'R004' },
  { id: 'A0910-07', date: '2026-09-10', time: '17:00', duration: 120, type: '景點', title: 'hillspa', placeId: 'P006', cost: 'VBP', note: 'https://feitravel.tw/p-5070442397/' },
  { id: 'A0910-08', date: '2026-09-10', time: '19:00', duration: 20, type: '移動', title: '移動 HILLSPA-海雲台傳統市場', routeId: 'R005' },
  { id: 'A0910-09', date: '2026-09-10', time: '19:30', duration: 90, type: '餐廳', title: '晚餐-海雲台傳統市場', placeId: 'P007', cost: 'VBP' },
  { id: 'A0910-10', date: '2026-09-10', time: '21:30', type: '住宿', title: '回到飯店GEM STAY', placeId: 'P001' },

  { id: 'A0911-01', date: '2026-09-11', time: '08:20', type: '其他', title: '起床' },
  { id: 'A0911-02', date: '2026-09-11', time: '09:00', duration: 40, type: '移動', title: '移動 飯店-白淺灘', routeId: 'R006', note: '公車508 71 7' },
  { id: 'A0911-03', date: '2026-09-11', time: '10:00', duration: 60, type: '景點', title: '白淺灘文化村+海岸步道', placeId: 'P008' },
  { id: 'A0911-04', date: '2026-09-11', time: '11:00', duration: 20, type: '移動', title: '移動-白淺灘-札嘎其市場', routeId: 'R007' },
  { id: 'A0911-05', date: '2026-09-11', time: '11:30', duration: 180, type: '景點', title: '札嘎其市場(午餐)、BIFF廣場', placeId: 'P009', note: 'https://www.funliday.com/posts/busan-jagalchi-market/#aioseo-Jagalchi-Market-how' },
  { id: 'A0911-06', date: '2026-09-11', time: '14:30', duration: 50, type: '移動', title: '移動 BIFF廣場-新世界百貨', routeId: 'R008' },
  { id: 'A0911-07', date: '2026-09-11', time: '15:30', duration: 180, type: '景點', title: 'SPA LAND+新世界百貨', placeId: 'P010' },
  { id: 'A0911-08', date: '2026-09-11', time: '18:30', type: '移動', title: '移動 新世界百貨-廣安站', routeId: 'R009' },
  { id: 'A0911-09', date: '2026-09-11', duration: 180, type: '景點', title: '廣安海灘+公園+晚餐', placeId: 'P011' },
  { id: 'A0911-10', date: '2026-09-11', duration: 60, type: '其他', title: '樂天超市採買' },
  { id: 'A0911-11', date: '2026-09-11', type: '住宿', title: '回到飯店GEM STAY', placeId: 'P001' },

  { id: 'A0912-01', date: '2026-09-12', time: '10:30', type: '餐廳', title: '早午餐-田埔咖啡街(暫定)', placeId: 'P012' },
  { id: 'A0912-02', date: '2026-09-12', time: '12:00', duration: 240, type: '景點', title: '西面逛街、OLIVI YOUNG、樂天百貨', placeId: 'P013', note: 'https://www.funtime.com.tw/blog/funtime/seomyeon-jeonpo-guide' },
  { id: 'A0912-03', date: '2026-09-12', time: '16:00', type: '餐廳', title: '午晚餐-小寶想吃燒肉', placeId: 'P014' },
  { id: 'A0912-04', date: '2026-09-12', time: '19:00', type: '其他', title: '抵達機場' },
  { id: 'A0912-05', date: '2026-09-12', time: '20:45', type: '飛機', title: '機場出境' },
]

export const places: Place[] = [
  { id: 'P001', name: 'GEM STAY', type: '住宿' },
  { id: 'P002', name: '晚餐', type: '餐廳' },
  { id: 'P003', name: 'Skyline Luge', type: '景點' },
  { id: 'P004', name: '樂天世界(午餐)、海東龍宮寺(彈性行程)', type: '景點' },
  { id: 'P005', name: '海雲台藍線公園', type: '景點' },
  { id: 'P006', name: 'hillspa', type: '景點' },
  { id: 'P007', name: '海雲台傳統市場', type: '餐廳' },
  { id: 'P008', name: '白淺灘文化村+海岸步道', type: '景點' },
  { id: 'P009', name: '札嘎其市場、BIFF廣場', type: '景點' },
  { id: 'P010', name: 'SPA LAND+新世界百貨', type: '景點' },
  { id: 'P011', name: '廣安海灘+公園', type: '景點' },
  { id: 'P012', name: '田埔咖啡街', type: '餐廳', note: '暫定' },
  { id: 'P013', name: '西面逛街、OLIVI YOUNG、樂天百貨', type: '景點' },
  { id: 'P014', name: '燒肉', type: '餐廳', note: '小寶想吃；店家未定' },
]

export const routeSteps: RouteStep[] = [
  { routeId: 'R001', step: 1, mode: '其他', from: '機場', to: '沙上', direction: '往沙上', note: '機場 → 沙上' },
  { routeId: 'R001', step: 2, mode: '地鐵', from: '沙上', to: '西面', direction: '往江山', note: '沙上 → 西面' },
  { routeId: 'R002', step: 1, mode: '地鐵', from: '西面', to: '釜山教育大學', direction: '往 Nopo' },
  { routeId: 'R002', step: 2, mode: '火車', line: '東海線', from: '釜山教育大學', to: 'Osiria', direction: '往太和江' },
  { routeId: 'R002', step: 3, mode: '公車', line: '快線1001', from: 'Osiria', to: '龍宮寺站', note: '龍宮寺站下車' },
  { routeId: 'R003', step: 1, mode: '火車', line: '東海線', from: 'Osiria', to: '松亭', direction: '往釜田' },
  { routeId: 'R003', step: 2, mode: '步行', from: '松亭', to: '藍線公園松亭站', note: '約走路15分鐘' },
  { routeId: 'R004', step: 1, mode: '步行', from: '尾埔', to: 'Hill Spa', note: '步行可達' },
  { routeId: 'R005', step: 1, mode: '其他', from: 'Hill Spa', to: '海雲台傳統市場', note: '原行程未填詳細交通方式' },
  { routeId: 'R006', step: 1, mode: '地鐵', from: '西面', to: '南埔6號出口', direction: '往多大浦' },
  { routeId: 'R006', step: 2, mode: '公車', line: '508 / 71 / 7', from: '南埔', to: '白淺灘文化村站' },
  { routeId: 'R007', step: 1, mode: '公車', line: '6', from: '白淺灘文化村站', to: '札嘎其 / BIFF廣場站' },
  { routeId: 'R008', step: 1, mode: '地鐵', line: '6', from: '札嘎其', to: '西面' },
  { routeId: 'R008', step: 2, mode: '地鐵', from: '西面', to: 'Centum City' },
  { routeId: 'R009', step: 1, mode: '其他', from: '新世界百貨', to: '廣安站', note: '原行程未填詳細交通方式' },
]

export const tickets: Ticket[] = []
