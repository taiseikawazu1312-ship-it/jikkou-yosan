// 勾配伸び率テーブル
export const SLOPE_RATES: Record<number, number> = {
  2: 1.020, 2.5: 1.031, 3: 1.044, 3.5: 1.058,
  4: 1.077, 4.5: 1.098, 5: 1.118, 5.5: 1.139, 6: 1.166,
};

// 固定数量項目
export const FIXED_QUANTITIES = {
  electrical: {
    singleOutlet: 2,
    earthedOutlet: 3, // 冷蔵庫+1F/2Fトイレ
    aircon200v: 1, // LDKのみ
    ventFan: 3,
    phone: 1,
    distributionBoard: 1,
  },
  materials: {
    pipeFan100: 2, // 1F/2Fトイレ
    deepPipeHood100: 4,
    deepPipeHood150: 1, // キッチン
  },
  equipment: {
    kitchen: 1,
    unitBath: 1,
    vanity: 1,
  },
  other: {
    crane: 1,
    temporaryExternal: 1,
    groundSurvey: 1,
  },
};

// 端数処理ルール
export type RoundingMethod = 'floor' | 'ceil' | 'round';
export interface RoundingRule {
  method: RoundingMethod;
  digits: number; // 小数点以下の桁数
  specialRule?: string;
}

export const ROUNDING_RULES: Record<string, RoundingRule> = {
  scaffold: { method: 'floor', digits: 2 },
  foundation: { method: 'round', digits: 2 },
  concrete: { method: 'round', digits: 2 },
  soilDisposal: { method: 'round', digits: 2 },
  structural: { method: 'floor', digits: 2 },
  balconyBase: { method: 'ceil', digits: 0 },
  floorProtection: { method: 'ceil', digits: 0 },
  insulation: { method: 'ceil', digits: 0, specialRule: '0.99_plus_2' },
  carpenter: { method: 'floor', digits: 2 },
  roof: { method: 'floor', digits: 2 },
  interior: { method: 'floor', digits: 2 },
  ceilingLGS: { method: 'floor', digits: 2 },
};

// デフォルト単価マスタ（デモ用）
export const DEFAULT_UNIT_PRICES: Record<string, { price: number; unit: string; vendor: string }> = {
  'scaffold': { price: 1200, unit: '㎡', vendor: '○○仮設' },
  'scaffold_removal': { price: 0, unit: '式', vendor: '○○仮設' },
  'cleaning': { price: 350, unit: '㎡', vendor: '○○クリーニング' },
  'waste_disposal': { price: 450, unit: '㎡', vendor: '○○産廃' },
  'temporary_materials': { price: 50000, unit: '式', vendor: '自社' },
  'foundation_beta': { price: 5500, unit: '㎡', vendor: '○○基礎工業' },
  'foundation_beta_improved': { price: 6800, unit: '㎡', vendor: '○○基礎工業' },
  'foundation_perf': { price: 7200, unit: '㎡', vendor: '○○基礎工業' },
  'concrete_increase': { price: 8500, unit: '坪', vendor: '○○生コン' },
  'unit_rebar': { price: 12000, unit: '坪', vendor: '○○鉄筋' },
  'soil_disposal': { price: 6500, unit: '㎥', vendor: '○○運送' },
  'structural_material': { price: 85000, unit: '坪', vendor: '○○プレカット' },
  'supplement_material': { price: 3500, unit: '枚', vendor: '○○建材' },
  'topping_hardware': { price: 150000, unit: '式', vendor: '○○金物' },
  'ceiling_lgs': { price: 2800, unit: '坪', vendor: '○○内装' },
  'floor_protection': { price: 850, unit: '枚', vendor: '○○建材' },
  'closet_shelf': { price: 4500, unit: '枚', vendor: '○○建材' },
  'movable_shelf': { price: 8500, unit: 'セット', vendor: '○○建材' },
  'pipe_hanger': { price: 2200, unit: '本', vendor: '○○建材' },
  'insulation_floor': { price: 12000, unit: '梱', vendor: '○○断熱' },
  'insulation_ceiling': { price: 9500, unit: '梱', vendor: '○○断熱' },
  'insulation_kanelite': { price: 25000, unit: '式', vendor: '○○断熱' },
  'gypsumboard_ceiling': { price: 550, unit: '枚', vendor: '○○建材' },
  'gypsumboard_wall': { price: 620, unit: '枚', vendor: '○○建材' },
  'wall_insulation': { price: 8500, unit: '梱', vendor: '○○断熱' },
  'carpenter_labor': { price: 48000, unit: '坪', vendor: '○○大工' },
  'carpenter_small_area': { price: 15000, unit: '坪', vendor: '○○大工' },
  'counter_install': { price: 5000, unit: 'ケ所', vendor: '○○大工' },
  'movable_shelf_install': { price: 3500, unit: 'ケ所', vendor: '○○大工' },
  'builtin_storage_install': { price: 8000, unit: 'ケ所', vendor: '○○大工' },
  'handrail_install': { price: 6000, unit: 'ケ所', vendor: '○○大工' },
  'antiseptic': { price: 1800, unit: '㎡', vendor: '○○防蟻' },
  'roof_area': { price: 4200, unit: '㎡', vendor: '○○屋根' },
  'ridge_cover': { price: 3500, unit: 'm', vendor: '○○屋根' },
  'valley_metal': { price: 4000, unit: 'm', vendor: '○○屋根' },
  'ventilation_ridge': { price: 12000, unit: '個', vendor: '○○屋根' },
  'exterior_wall': { price: 0, unit: '式', vendor: '外壁業者' },
  'gutter_eave': { price: 2800, unit: 'm', vendor: '○○板金' },
  'gutter_downspout': { price: 5500, unit: 'ケ所', vendor: '○○板金' },
  'gutter_collector': { price: 3200, unit: '個', vendor: '○○板金' },
  'balcony_waterproof': { price: 8500, unit: '㎡', vendor: '○○防水' },
  'plastering': { price: 2200, unit: 'm', vendor: '○○左官' },
  'entrance_tile': { price: 6500, unit: '㎡', vendor: '○○タイル' },
  'interior_work': { price: 28000, unit: '坪', vendor: '○○内装' },
  'accent_cloth': { price: 5000, unit: 'ケ所', vendor: '○○内装' },
  'electrical_light': { price: 2800, unit: 'ケ所', vendor: '○○電気' },
  'electrical_outlet': { price: 2200, unit: 'ケ所', vendor: '○○電気' },
  'electrical_earthed': { price: 2800, unit: 'ケ所', vendor: '○○電気' },
  'electrical_aircon100': { price: 5500, unit: 'ケ所', vendor: '○○電気' },
  'electrical_aircon200': { price: 7000, unit: 'ケ所', vendor: '○○電気' },
  'electrical_ventfan': { price: 3500, unit: 'ケ所', vendor: '○○電気' },
  'electrical_24h_supply': { price: 3000, unit: 'ケ所', vendor: '○○電気' },
  'electrical_24h_exhaust': { price: 3000, unit: 'ケ所', vendor: '○○電気' },
  'electrical_phone': { price: 2500, unit: 'ケ所', vendor: '○○電気' },
  'electrical_tv': { price: 3000, unit: 'ケ所', vendor: '○○電気' },
  'electrical_switch': { price: 1800, unit: 'ケ所', vendor: '○○電気' },
  'electrical_3way': { price: 2500, unit: 'ケ所', vendor: '○○電気' },
  'electrical_intercom': { price: 15000, unit: '式', vendor: '○○電気' },
  'electrical_panel': { price: 45000, unit: '式', vendor: '○○電気' },
  'pipe_fan_100': { price: 8500, unit: '台', vendor: '○○電材' },
  'deep_pipe_hood_100': { price: 3200, unit: '個', vendor: '○○電材' },
  'deep_pipe_hood_150': { price: 4500, unit: '個', vendor: '○○電材' },
  'smoke_alarm': { price: 2800, unit: '個', vendor: '○○電材' },
  'kitchen': { price: 450000, unit: '式', vendor: '○○住設' },
  'unit_bath': { price: 380000, unit: '式', vendor: '○○住設' },
  'vanity': { price: 85000, unit: '台', vendor: '○○住設' },
  'toilet': { price: 55000, unit: '台', vendor: '○○住設' },
  'water_heater': { price: 180000, unit: '台', vendor: '○○設備' },
  'plumbing': { price: 550000, unit: '式', vendor: '○○設備' },
  'septic_tank': { price: 450000, unit: '基', vendor: '○○設備' },
  'crane': { price: 85000, unit: '式', vendor: '○○重機' },
  'application_fee': { price: 250000, unit: '式', vendor: '自社' },
  'defect_insurance': { price: 65000, unit: '式', vendor: '○○保険' },
  'temporary_external': { price: 120000, unit: '式', vendor: '○○仮設' },
  'exterior_work': { price: 0, unit: '式', vendor: '外構業者' },
  'ground_survey': { price: 55000, unit: '式', vendor: '○○地盤' },
};
