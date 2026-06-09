import type { Language } from "../types/calculator"

type Dictionary = Record<string, { readonly ko: string; readonly zh: string }>

const dictionary: Dictionary = {
  title: { ko: "링크랜드 성수 연무장길 BEP", zh: "Linkland 圣水练武场路 BEP" },
  subtitle: { ko: "임차 투자 계산기", zh: "租赁投资计算器" },
  save: { ko: "저장", zh: "保存" },
  overwrite: { ko: "덮어쓰기 저장", zh: "覆盖保存" },
  saveAs: { ko: "다른이름 저장", zh: "另存为" },
  currentSave: { ko: "현재 입력값 저장", zh: "保存当前输入" },
  dashboard: { ko: "대시보드", zh: "仪表盘" },
  inputPanel: { ko: "입력값", zh: "输入值" },
  scenarioQuick: { ko: "시나리오 빠른 비교", zh: "方案快速比较" },
  scenarioTable: { ko: "시나리오 비교", zh: "方案对比" },
  market: { ko: "주변 매장 분석", zh: "周边门店分析" },
  offline: { ko: "오프라인 손익", zh: "线下损益" },
  online: { ko: "온라인 손익", zh: "线上损益" },
  combined: { ko: "합산/투자", zh: "合计/投资" },
  initialCash: { ko: "초기 필요 현금", zh: "初始所需现金" },
  payback: { ko: "순투자 회수기간", zh: "净投资回收期" },
  bep: { ko: "오프라인 BEP", zh: "线下 BEP" },
  risk: { ko: "위험도", zh: "风险等级" },
  memo: { ko: "판단 메모", zh: "判断备忘" },
  addItem: { ko: "항목 추가", zh: "添加项目" },
  delete: { ko: "삭제", zh: "删除" },
  edit: { ko: "수정", zh: "编辑" },
  syncLocal: { ko: "로컬 캐시 모드", zh: "本地缓存模式" },
  sheetsSync: { ko: "Sheets 동기화", zh: "Sheets 同步" },
  exchangeRate: { ko: "환율", zh: "汇率" },
  appsScriptUrl: { ko: "Apps Script URL", zh: "Apps Script URL" },
  writeKey: { ko: "writeKey", zh: "writeKey" },
}

export const t = (key: keyof typeof dictionary, language: Language): string =>
  dictionary[key]?.[language] ?? key

export const localized = (
  ko: string,
  zh: string,
  language: Language,
): string => (language === "zh" ? zh : ko)
