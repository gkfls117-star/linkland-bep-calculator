import type { CalculatorInput, DynamicItem } from "../types/calculator"
import type { Scenario } from "../types/scenario"
import { defaultMarketStores } from "./marketDefaults"

export { defaultMarketStores }

export const DEFAULT_EXCHANGE_RATE = 217.19

export const newId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

export const createItem = (
  section: string,
  nameKo: string,
  nameZh: string,
  value: number,
  unit: string,
  type: DynamicItem["type"],
  recoverable = false,
): DynamicItem => ({
  id: newId(section),
  nameKo,
  nameZh,
  value,
  unit,
  type,
  recoverable,
  removable: true,
})

export const defaultInput: CalculatorInput = {
  offlineMonthlyRevenue: 60000000,
  offlineMarginRate: 62,
  onlineMonthlyRevenue: 22000000,
  onlineMarginRate: 55,
  monthlyVisitors: 150000,
  avgOrderValue: 50000,
  conversionRate: 0.8,
  transferPremiumYear2: 250000000,
  transferPremiumYear3: 320000000,
  transferPremiumYear4: 380000000,
  transferPremiumYear5: 450000000,
  judgmentMemo: "권리금 회수 가능성을 전제로 3년차 이후 회수 시나리오가 안정권입니다.",
  offlineFixed: [
    {
      id: "offline_rent",
      nameKo: "월 임대료",
      nameZh: "月租金",
      value: 30000000,
      unit: "월",
      type: "amount",
      recoverable: false,
      removable: false,
    },
    {
      id: "offline_labor",
      nameKo: "인건비",
      nameZh: "人工费",
      value: 12000000,
      unit: "월",
      type: "amount",
      recoverable: false,
      removable: false,
    },
    {
      id: "offline_admin",
      nameKo: "관리비/공과금",
      nameZh: "管理费/水电费",
      value: 4500000,
      unit: "월",
      type: "amount",
      recoverable: false,
      removable: false,
    },
    {
      id: "offline_local_marketing",
      nameKo: "현장 마케팅",
      nameZh: "现场营销",
      value: 2500000,
      unit: "월",
      type: "amount",
      recoverable: false,
      removable: true,
    },
  ],
  onlineCosts: [
    {
      id: "online_platform",
      nameKo: "플랫폼/PG 수수료",
      nameZh: "平台/支付手续费",
      value: 5.5,
      unit: "%",
      type: "rate",
      recoverable: false,
      removable: false,
    },
    {
      id: "online_ads",
      nameKo: "온라인 광고비",
      nameZh: "线上广告费",
      value: 8,
      unit: "%",
      type: "rate",
      recoverable: false,
      removable: true,
    },
    {
      id: "online_ops",
      nameKo: "배송/CS 운영비",
      nameZh: "配送/客服运营费",
      value: 1800000,
      unit: "월",
      type: "amount",
      recoverable: false,
      removable: true,
    },
  ],
  investment: [
    {
      id: "invest_deposit",
      nameKo: "임대 보증금",
      nameZh: "租赁保证金",
      value: 300000000,
      unit: "초기",
      type: "amount",
      recoverable: true,
      removable: false,
    },
    {
      id: "invest_premium",
      nameKo: "권리금",
      nameZh: "转让费",
      value: 200000000,
      unit: "초기",
      type: "amount",
      recoverable: true,
      removable: false,
    },
    {
      id: "invest_fitout",
      nameKo: "인테리어/설비",
      nameZh: "装修/设备",
      value: 180000000,
      unit: "초기",
      type: "amount",
      recoverable: false,
      removable: false,
    },
    {
      id: "invest_inventory",
      nameKo: "초도 재고/운영자금",
      nameZh: "初始库存/运营资金",
      value: 80000000,
      unit: "초기",
      type: "amount",
      recoverable: true,
      removable: true,
    },
  ],
}

export const defaultScenario = (): Scenario => ({
  id: "default_linkland",
  name: "링크랜드 현재 가정",
  data: defaultInput,
  updatedAt: new Date().toISOString(),
  updatedBy: "local",
  isDeleted: false,
})
