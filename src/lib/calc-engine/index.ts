import { Project, ExtractedData, BudgetItem, CalculationResult, BasicQuantity, BasicQuantitySheet, QuickEstimateItem, QuickEstimateResult } from '../types';
import { SLOPE_RATES, FIXED_QUANTITIES, ROUNDING_RULES, DEFAULT_UNIT_PRICES } from '../data/constants';

// 端数処理ユーティリティ
function applyRounding(value: number, rule: { method: 'floor' | 'ceil' | 'round'; digits: number }): number {
  const factor = Math.pow(10, rule.digits);
  switch (rule.method) {
    case 'floor': return Math.floor(value * factor) / factor;
    case 'ceil': return Math.ceil(value * factor) / factor;
    case 'round': return Math.round(value * factor) / factor;
  }
}

function getPrice(key: string): { price: number; unit: string; vendor: string } {
  return DEFAULT_UNIT_PRICES[key] || { price: 0, unit: '式', vendor: '未設定' };
}

function createItem(params: { workCategory: string; detailName: string; priceKey: string; quantity: number; spec?: string; remarks?: string; orderType?: string; calculationLog?: string; unitOverride?: string; priceOverride?: number; vendorOverride?: string }): BudgetItem {
  const p = getPrice(params.priceKey);
  const unitPrice = params.priceOverride ?? p.price;
  const quantity = params.quantity;
  return {
    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    workCategory: params.workCategory,
    detailName: params.detailName,
    vendor: params.vendorOverride ?? p.vendor,
    spec: params.spec || params.detailName,
    unitPrice,
    quantity,
    unit: params.unitOverride ?? p.unit,
    detailAmount: Math.round(unitPrice * quantity),
    remarks: params.remarks || '',
    orderType: params.orderType || '外注',
    isManual: false,
    calculationLog: params.calculationLog,
  };
}

// メイン計算関数
export function calculateBudget(project: Project, extracted: ExtractedData): CalculationResult {
  const items: BudgetItem[] = [];

  // ==================== 3.1 仮設工事 ====================
  // 足場
  const scaffoldRule = ROUNDING_RULES.scaffold;
  if (project.totalFloorArea >= 100) {
    const qty = applyRounding(project.totalFloorArea, scaffoldRule);
    items.push(createItem({
      workCategory: '仮設工事', detailName: '足場工事', priceKey: 'scaffold',
      quantity: qty, spec: '足場組立',
      calculationLog: `延床面積${project.totalFloorArea}㎡ ≧ 100㎡ → 数量=${qty}㎡ (小数第二位切捨)`,
    }));
  } else {
    items.push(createItem({
      workCategory: '仮設工事', detailName: '足場工事', priceKey: 'scaffold',
      quantity: 1, priceOverride: 100000, unitOverride: '式',
      calculationLog: `延床面積${project.totalFloorArea}㎡ < 100㎡ → 1式100,000円`,
    }));
  }

  // 足場解体 (足場工事原価 ÷ 2)
  const scaffoldCost = items.filter(i => i.detailName === '足場工事').reduce((s, i) => s + i.detailAmount, 0);
  items.push(createItem({
    workCategory: '仮設工事', detailName: '足場解体', priceKey: 'scaffold_removal',
    quantity: 1, priceOverride: Math.round(scaffoldCost / 2), unitOverride: '式',
    calculationLog: `足場工事原価(${scaffoldCost}円) ÷ 2 = ${Math.round(scaffoldCost / 2)}円`,
  }));

  // クリーニング
  const cleanQty = applyRounding(project.totalFloorArea, scaffoldRule);
  items.push(createItem({
    workCategory: '仮設工事', detailName: 'クリーニング', priceKey: 'cleaning',
    quantity: cleanQty, calculationLog: `延床面積 → ${cleanQty}㎡`,
  }));

  // 廃材処理
  items.push(createItem({
    workCategory: '仮設工事', detailName: '廃材処理', priceKey: 'waste_disposal',
    quantity: cleanQty, calculationLog: `延床面積 → ${cleanQty}㎡`,
  }));

  // 仮設資材
  items.push(createItem({
    workCategory: '仮設工事', detailName: '仮設資材', priceKey: 'temporary_materials',
    quantity: 1,
  }));

  // ==================== 3.2 基礎工事 ====================
  const foundationRule = ROUNDING_RULES.foundation;
  const betaFoundationArea = applyRounding(
    project.floorArea1F + extracted.threeWallEnclosedArea + extracted.wingWallArea,
    foundationRule
  );

  let foundationPriceKey = 'foundation_beta';
  let foundationRemarks = '';
  if (project.hasPerformanceEval) {
    foundationPriceKey = 'foundation_perf';
    foundationRemarks = '性能評価あり';
  } else if (project.hasGroundImprovement) {
    foundationPriceKey = 'foundation_beta_improved';
    foundationRemarks = `改良あり(${project.improvementMethod || ''})`;
  }

  items.push(createItem({
    workCategory: '基礎工事', detailName: 'ベタ基礎', priceKey: foundationPriceKey,
    quantity: betaFoundationArea, remarks: foundationRemarks,
    calculationLog: `1F床面積(${project.floorArea1F}) + 三方囲み(${extracted.threeWallEnclosedArea}) + 袖壁(${extracted.wingWallArea}) = ${betaFoundationArea}㎡`,
  }));

  // ==================== 3.3 コンクリート・鉄筋・残土 ====================
  const concreteRule = ROUNDING_RULES.concrete;
  const concreteQty = applyRounding(betaFoundationArea / 3.3124, concreteRule);
  items.push(createItem({
    workCategory: '躯体工事', detailName: 'コンクリート増額', priceKey: 'concrete_increase',
    quantity: concreteQty,
    calculationLog: `ベタ基礎面積(${betaFoundationArea}) ÷ 3.3124 = ${concreteQty}坪`,
  }));

  items.push(createItem({
    workCategory: '躯体工事', detailName: 'ユニット鉄筋', priceKey: 'unit_rebar',
    quantity: concreteQty,
    calculationLog: `ベタ基礎面積(${betaFoundationArea}) ÷ 3.3124 = ${concreteQty}坪`,
  }));

  const soilQty = applyRounding(betaFoundationArea * 0.3, ROUNDING_RULES.soilDisposal);
  items.push(createItem({
    workCategory: '躯体工事', detailName: '残土処分', priceKey: 'soil_disposal',
    quantity: soilQty,
    calculationLog: `ベタ基礎面積(${betaFoundationArea}) × 0.3 = ${soilQty}㎥`,
  }));

  // ==================== 3.4 構造材・補足材 ====================
  const structuralRule = ROUNDING_RULES.structural;
  const structuralQty = applyRounding(project.totalFloorAreaTsubo, structuralRule);
  items.push(createItem({
    workCategory: '木工事', detailName: '構造材', priceKey: 'structural_material',
    quantity: structuralQty,
    calculationLog: `延床坪数(${project.totalFloorAreaTsubo}) → 切捨 → ${structuralQty}坪`,
  }));

  // 補足材(バルコニー下地) - バルコニーがある場合
  if (extracted.balconyArea > 0) {
    const part1 = (extracted.balconyArea * 2 + (extracted.balconyPerimeter / 1000) * 0.3) / 1.6562;
    const part2 = (extracted.balconyWallPerimeter / 1000) / 1.82;
    const part3 = ((extracted.balconyNonWallPerimeter / 1000) - (extracted.slidingDoorWidth / 1000)) / 3.64;
    const balconySheets = Math.ceil(part1 + part2 + part3);
    items.push(createItem({
      workCategory: '木工事', detailName: '補足材(バルコニー下地)', priceKey: 'supplement_material',
      quantity: balconySheets,
      calculationLog: `①(${extracted.balconyArea}×2+外周×0.3)÷1.6562=${part1.toFixed(2)} ②腰壁÷1.82=${part2.toFixed(2)} ③(腰壁以外-窓)÷3.64=${part3.toFixed(2)} → 合計切上=${balconySheets}枚`,
    }));
  }

  // ==================== 3.5 上棟金物・天井LGS ====================
  items.push(createItem({
    workCategory: '木工事', detailName: '上棟金物', priceKey: 'topping_hardware',
    quantity: 1,
  }));

  const lgsQty = applyRounding(project.totalFloorAreaTsubo, ROUNDING_RULES.ceilingLGS);
  items.push(createItem({
    workCategory: '木工事', detailName: '天井LGS', priceKey: 'ceiling_lgs',
    quantity: lgsQty,
    calculationLog: `延床坪数 → ${lgsQty}坪`,
  }));

  // ==================== 3.6 建材 ====================
  const floorProtQty = Math.ceil(project.floorArea1F / 3.3124 / 8.25);
  items.push(createItem({
    workCategory: '建材工事', detailName: '床養生材(ヌレイン)', priceKey: 'floor_protection',
    quantity: floorProtQty,
    calculationLog: `1F面積(${project.floorArea1F}) ÷ 3.3124 ÷ 8.25 = ${(project.floorArea1F / 3.3124 / 8.25).toFixed(2)} → 切上 → ${floorProtQty}枚`,
  }));

  if (extracted.closetShelfCount > 0) {
    items.push(createItem({
      workCategory: '建材工事', detailName: '枕棚', priceKey: 'closet_shelf',
      quantity: extracted.closetShelfCount,
      calculationLog: `平面図から拾い: ${extracted.closetShelfCount}枚`,
    }));
  }

  if (extracted.movableShelfCount > 0) {
    items.push(createItem({
      workCategory: '建材工事', detailName: '可動棚', priceKey: 'movable_shelf',
      quantity: extracted.movableShelfCount,
      calculationLog: `平面図から拾い: ${extracted.movableShelfCount}セット`,
    }));
  }

  // ==================== 3.7 断熱材 ====================
  // 階床断熱材
  const insulArea = project.floorArea1F - extracted.entranceArea - extracted.soilStorageArea - extracted.bathArea + extracted.roofInsulationArea + extracted.outerAir2FArea * 2;
  let insulPacks = Math.ceil(insulArea / 3.3124 / 1.5);
  const insulFraction = (insulArea / 3.3124 / 1.5) % 1;
  if (Math.abs(insulFraction - 0.99) < 0.005) insulPacks += 2;
  items.push(createItem({
    workCategory: '断熱工事', detailName: '階床断熱材', priceKey: 'insulation_floor',
    quantity: insulPacks,
    calculationLog: `(1F${project.floorArea1F}-玄関${extracted.entranceArea}-土間${extracted.soilStorageArea}-浴室${extracted.bathArea}+屋根断熱${extracted.roofInsulationArea}+外気2F${extracted.outerAir2FArea}×2)÷3.3124÷1.5 → ${insulPacks}梱`,
  }));

  // カネライト(基礎断熱)
  items.push(createItem({
    workCategory: '断熱工事', detailName: 'カネライト(基礎断熱)', priceKey: 'insulation_kanelite',
    quantity: 1,
  }));

  // 天井断熱材
  const ceilingInsulPacks = Math.ceil(project.floorArea2F / 3.3124 / 1.5);
  items.push(createItem({
    workCategory: '断熱工事', detailName: '天井断熱材', priceKey: 'insulation_ceiling',
    quantity: ceilingInsulPacks,
    calculationLog: `2F面積(${project.floorArea2F})÷3.3124÷1.5 → ${ceilingInsulPacks}梱`,
  }));

  // ==================== 3.8 石膏ボード ====================
  const ceilingBoardQty = Math.ceil((project.floorArea1F + project.floorArea2F) / (0.91 * 1.82));
  items.push(createItem({
    workCategory: '内装下地', detailName: '天井石膏ボード(9.5mm)', priceKey: 'gypsumboard_ceiling',
    quantity: ceilingBoardQty,
    calculationLog: `(1F${project.floorArea1F}+2F${project.floorArea2F})÷(0.91×1.82) → ${ceilingBoardQty}枚`,
  }));

  // 壁石膏ボード (概算: 延床面積 × 2.5 ÷ 板面積)
  const wallBoardQty = Math.ceil(project.totalFloorArea * 2.5 / (0.91 * 1.82));
  items.push(createItem({
    workCategory: '内装下地', detailName: '壁石膏ボード(12.5mm)', priceKey: 'gypsumboard_wall',
    quantity: wallBoardQty,
    calculationLog: `延床${project.totalFloorArea}×2.5÷(0.91×1.82) → ${wallBoardQty}枚(概算)`,
  }));

  // 壁断熱材 — 基本数量表の外壁面積を優先使用
  const wallInsulBaseArea = extracted.exteriorWallNetArea || project.totalFloorArea * 1.2;
  const wallInsulPacks = Math.ceil(wallInsulBaseArea / 3.3124 / 2.0);
  items.push(createItem({
    workCategory: '内装下地', detailName: '壁断熱材(グラスウール)', priceKey: 'wall_insulation',
    quantity: wallInsulPacks,
    calculationLog: extracted.exteriorWallNetArea
      ? `基本数量表: 外壁実面積${extracted.exteriorWallNetArea}㎡÷3.3124÷2.0 → ${wallInsulPacks}梱`
      : `外壁面積概算÷梱包面積 → ${wallInsulPacks}梱`,
  }));

  // ==================== 3.9 大工手間 ====================
  const carpenterQty = applyRounding(project.totalFloorAreaTsubo, ROUNDING_RULES.carpenter);
  items.push(createItem({
    workCategory: '大工工事', detailName: '大工技術料', priceKey: 'carpenter_labor',
    quantity: carpenterQty,
    calculationLog: `延床坪数 → ${carpenterQty}坪`,
  }));

  if (project.totalFloorAreaTsubo <= 28) {
    const smallAreaQty = applyRounding(28 - project.totalFloorAreaTsubo, ROUNDING_RULES.carpenter);
    items.push(createItem({
      workCategory: '大工工事', detailName: '小面積割増', priceKey: 'carpenter_small_area',
      quantity: smallAreaQty,
      calculationLog: `28 - ${project.totalFloorAreaTsubo} = ${smallAreaQty}坪`,
    }));
  }

  // 各種取付手間
  if (extracted.counterCount > 0) {
    items.push(createItem({
      workCategory: '大工工事', detailName: 'カウンター取付', priceKey: 'counter_install',
      quantity: extracted.counterCount,
    }));
  }
  if (extracted.movableShelfCount > 0) {
    items.push(createItem({
      workCategory: '大工工事', detailName: '可動棚取付', priceKey: 'movable_shelf_install',
      quantity: extracted.movableShelfCount,
    }));
  }
  if (extracted.builtInStorageCount > 0) {
    items.push(createItem({
      workCategory: '大工工事', detailName: '埋込収納取付', priceKey: 'builtin_storage_install',
      quantity: extracted.builtInStorageCount,
    }));
  }
  if (extracted.handrailCount > 0) {
    items.push(createItem({
      workCategory: '大工工事', detailName: '手すり取付', priceKey: 'handrail_install',
      quantity: extracted.handrailCount,
    }));
  }

  // ==================== 3.10 防腐防蟻 ====================
  items.push(createItem({
    workCategory: '防腐防蟻', detailName: '防腐防蟻処理', priceKey: 'antiseptic',
    quantity: applyRounding(project.totalFloorArea, scaffoldRule),
  }));

  // ==================== 3.11 屋根工事 ====================
  // 基本数量表の屋根面積を優先使用、なければ従来の計算
  let roofArea: number;
  let roofCalcLog: string;
  if (extracted.roofArea && extracted.roofArea > 0) {
    roofArea = applyRounding(extracted.roofArea, ROUNDING_RULES.roof);
    roofCalcLog = `基本数量表: 屋根面積=${roofArea}㎡`;
  } else {
    const eaveMm = extracted.eaveOverhang || 600;
    const gabledMm = extracted.gabledOverhang || 450;
    const widthM = (extracted.buildingWidth / 1000) + (eaveMm / 1000) * 2;
    const depthM = (extracted.buildingDepth / 1000) + (gabledMm / 1000) * 2;
    const horizontalArea = widthM * depthM;
    const slopeRate = SLOPE_RATES[extracted.roofSlope] || SLOPE_RATES[3.5] || 1.058;
    roofArea = applyRounding(horizontalArea * slopeRate, ROUNDING_RULES.roof);
    roofCalcLog = `水平投影(${widthM.toFixed(2)}×${depthM.toFixed(2)}=${horizontalArea.toFixed(2)})×勾配${slopeRate}=${roofArea}㎡`;
  }
  items.push(createItem({
    workCategory: '屋根工事', detailName: '屋根葺き', priceKey: 'roof_area',
    quantity: roofArea,
    calculationLog: roofCalcLog,
  }));

  // 棟包み — 基本数量表の棟長を優先
  const ridgeLength = extracted.ridgeLength && extracted.ridgeLength > 0
    ? applyRounding(extracted.ridgeLength, ROUNDING_RULES.roof)
    : applyRounding(extracted.buildingDepth / 1000 + 1, ROUNDING_RULES.roof);
  items.push(createItem({
    workCategory: '屋根工事', detailName: '棟包み', priceKey: 'ridge_cover',
    quantity: ridgeLength,
    calculationLog: extracted.ridgeLength ? `基本数量表: 棟長=${ridgeLength}m` : `概算: 奥行+1m`,
  }));

  // 換気棟
  items.push(createItem({
    workCategory: '屋根工事', detailName: '換気棟', priceKey: 'ventilation_ridge',
    quantity: 2, remarks: '標準2箇所',
  }));

  // ケラバ — 基本数量表にケラバ長がある場合
  if (extracted.gabledLength && extracted.gabledLength > 0) {
    items.push(createItem({
      workCategory: '屋根工事', detailName: 'ケラバ水切', priceKey: 'ridge_cover',
      quantity: applyRounding(extracted.gabledLength, ROUNDING_RULES.roof),
      calculationLog: `基本数量表: ケラバ長=${extracted.gabledLength}m`,
    }));
  }

  // 軒先水切 — 基本数量表の軒先長
  if (extracted.eaveLength && extracted.eaveLength > 0) {
    items.push(createItem({
      workCategory: '屋根工事', detailName: '軒先水切', priceKey: 'ridge_cover',
      quantity: applyRounding(extracted.eaveLength, ROUNDING_RULES.roof),
      calculationLog: `基本数量表: 軒先長=${extracted.eaveLength}m`,
    }));
  }

  // 軒裏面積 — 基本数量表
  if (extracted.soffitArea && extracted.soffitArea > 0) {
    items.push(createItem({
      workCategory: '屋根工事', detailName: '軒天井', priceKey: 'roof_area',
      quantity: applyRounding(extracted.soffitArea, ROUNDING_RULES.roof),
      priceOverride: 3000,
      calculationLog: `基本数量表: 軒裏面積=${extracted.soffitArea}㎡`,
    }));
  }

  // 矢切壁（妻壁）— 基本数量表
  if (extracted.gableWallArea && extracted.gableWallArea > 0) {
    items.push(createItem({
      workCategory: '屋根工事', detailName: '矢切壁(妻壁)', priceKey: 'exterior_wall',
      quantity: applyRounding(extracted.gableWallArea, ROUNDING_RULES.roof),
      priceOverride: 4500, unitOverride: '㎡', vendorOverride: '○○屋根',
      calculationLog: `基本数量表: 矢切壁面積=${extracted.gableWallArea}㎡`,
    }));
  }

  // ==================== 3.12 外壁工事 ====================
  // 基本数量表の外壁実面積を使用
  const extWallNetArea = extracted.exteriorWallNetArea || 0;
  if (project.exteriorWallQuote && project.exteriorWallQuote > 0) {
    items.push(createItem({
      workCategory: '外壁工事', detailName: '外壁工事', priceKey: 'exterior_wall',
      quantity: 1, priceOverride: project.exteriorWallQuote,
      remarks: `外壁実面積=${extWallNetArea}㎡`,
      calculationLog: `業者見積額 / 基本数量表: 外壁実面積${extWallNetArea}㎡, 外壁面積${extracted.exteriorWallArea || 0}㎡, 開口部面積${extracted.openingArea || 0}㎡`,
    }));
  } else {
    // 業者見積なし → 基本数量表の外壁実面積から概算
    items.push(createItem({
      workCategory: '外壁工事', detailName: '外壁工事(概算)', priceKey: 'exterior_wall',
      quantity: extWallNetArea > 0 ? extWallNetArea : 1,
      priceOverride: extWallNetArea > 0 ? 8500 : 0,
      unitOverride: extWallNetArea > 0 ? '㎡' : '式',
      vendorOverride: '外壁業者',
      remarks: extWallNetArea > 0 ? '基本数量表から概算' : '業者見積未入力',
      calculationLog: extWallNetArea > 0
        ? `基本数量表: 外壁実面積${extWallNetArea}㎡ (外壁面積${extracted.exteriorWallArea || 0}㎡ - 開口部${extracted.openingArea || 0}㎡) × @8,500円`
        : undefined,
    }));
  }
  // 外壁出隅・入隅のコーキング
  if (extracted.exteriorWallOutCornerCount && extracted.exteriorWallOutCornerCount > 0) {
    items.push(createItem({
      workCategory: '外壁工事', detailName: '出隅コーキング', priceKey: 'plastering',
      quantity: extracted.exteriorWallOutCornerLength || 0,
      calculationLog: `基本数量表: 出隅${extracted.exteriorWallOutCornerCount}ヶ所, 長さ${extracted.exteriorWallOutCornerLength}m`,
    }));
  }
  if (extracted.exteriorWallInCornerCount && extracted.exteriorWallInCornerCount > 0) {
    items.push(createItem({
      workCategory: '外壁工事', detailName: '入隅コーキング', priceKey: 'plastering',
      quantity: extracted.exteriorWallInCornerLength || 0,
      calculationLog: `基本数量表: 入隅${extracted.exteriorWallInCornerCount}ヶ所, 長さ${extracted.exteriorWallInCornerLength}m`,
    }));
  }

  // ==================== 3.13 雨樋板金 ====================
  const gutterLen = extracted.gutterLength || extracted.eaveLength || 0;
  items.push(createItem({
    workCategory: '雨樋板金工事', detailName: '軒樋', priceKey: 'gutter_eave',
    quantity: gutterLen,
    calculationLog: extracted.eaveLength ? `基本数量表: 軒先長=${extracted.eaveLength}m` : undefined,
  }));
  items.push(createItem({
    workCategory: '雨樋板金工事', detailName: 'たて樋', priceKey: 'gutter_downspout',
    quantity: extracted.downspoutCount || 0,
  }));

  // ==================== 3.14 バルコニー防水・左官 ====================
  if (extracted.balconyArea > 0) {
    items.push(createItem({
      workCategory: '防水工事', detailName: 'バルコニー防水', priceKey: 'balcony_waterproof',
      quantity: extracted.balconyArea,
    }));
  }
  // 左官(基礎巾木) — 基本数量表の基礎外周長を優先
  const foundationPerimeter = extracted.foundationPerimeter || ((extracted.buildingWidth + extracted.buildingDepth) * 2) / 1000;
  items.push(createItem({
    workCategory: '防水工事', detailName: '左官仕上(基礎巾木)', priceKey: 'plastering',
    quantity: applyRounding(foundationPerimeter, { method: 'round', digits: 1 }),
    calculationLog: extracted.foundationPerimeter
      ? `基本数量表: 基礎外周長=${extracted.foundationPerimeter}m`
      : `概算: (間口+奥行)×2`,
  }));

  // ==================== 3.15 建具 ====================
  // 外部サッシ・内部建具は建具表から転記(ここでは概算)
  extracted.exteriorFittings.forEach((f) => {
    items.push(createItem({
      workCategory: '建具工事', detailName: `外部サッシ(${f.symbol})`, priceKey: 'electrical_outlet',
      quantity: f.quantity, spec: f.model, priceOverride: 25000,
      unitOverride: '本', vendorOverride: '○○サッシ',
    }));
  });
  extracted.interiorFittings.forEach((f) => {
    items.push(createItem({
      workCategory: '建具工事', detailName: `内部建具(${f.symbol})`, priceKey: 'electrical_outlet',
      quantity: f.quantity, spec: f.model, priceOverride: 35000,
      unitOverride: '本', vendorOverride: '○○建具',
    }));
  });

  // ==================== 3.16 タイル ====================
  if (extracted.porchArea > 0) {
    items.push(createItem({
      workCategory: 'タイル工事', detailName: '玄関タイル', priceKey: 'entrance_tile',
      quantity: extracted.porchArea,
    }));
  }

  // ==================== 3.17 内装 ====================
  const interiorQty = applyRounding(project.totalFloorAreaTsubo, ROUNDING_RULES.interior);
  items.push(createItem({
    workCategory: '内装工事', detailName: '内装工事(クロス)', priceKey: 'interior_work',
    quantity: interiorQty,
    calculationLog: `延床坪数 → ${interiorQty}坪`,
  }));

  // アクセントクロス(3ケ所目から)
  const accentExtra = Math.max(0, extracted.accentWallCount - 2);
  if (accentExtra > 0) {
    items.push(createItem({
      workCategory: '内装工事', detailName: 'アクセントクロス追加', priceKey: 'accent_cloth',
      quantity: accentExtra,
      calculationLog: `${extracted.accentWallCount}ケ所 - 標準2ケ所 = ${accentExtra}ケ所追加`,
    }));
  }

  // ==================== 3.18 電気配線 ====================
  const ubFixed = 1;
  items.push(createItem({ workCategory: '電気工事', detailName: '電灯配線', priceKey: 'electrical_light', quantity: extracted.lightingCount + ubFixed, calculationLog: `照明${extracted.lightingCount}+UB${ubFixed}=${extracted.lightingCount + ubFixed}` }));
  items.push(createItem({ workCategory: '電気工事', detailName: '一口電源', priceKey: 'electrical_outlet', quantity: FIXED_QUANTITIES.electrical.singleOutlet, remarks: '固定' }));
  items.push(createItem({ workCategory: '電気工事', detailName: '一般コンセント2口', priceKey: 'electrical_outlet', quantity: extracted.outlet2Count }));
  items.push(createItem({ workCategory: '電気工事', detailName: 'アース付コンセント', priceKey: 'electrical_earthed', quantity: FIXED_QUANTITIES.electrical.earthedOutlet, remarks: '固定(冷蔵庫+1F/2Fトイレ)' }));
  items.push(createItem({ workCategory: '電気工事', detailName: 'エアコン100V', priceKey: 'electrical_aircon100', quantity: extracted.aircon100vCount }));
  items.push(createItem({ workCategory: '電気工事', detailName: 'エアコン200V', priceKey: 'electrical_aircon200', quantity: FIXED_QUANTITIES.electrical.aircon200v, remarks: '固定(LDKのみ)' }));
  items.push(createItem({ workCategory: '電気工事', detailName: '換気扇', priceKey: 'electrical_ventfan', quantity: FIXED_QUANTITIES.electrical.ventFan, remarks: '固定' }));
  items.push(createItem({ workCategory: '電気工事', detailName: '24H換気(給気)', priceKey: 'electrical_24h_supply', quantity: extracted.airSupply24hCount }));
  items.push(createItem({ workCategory: '電気工事', detailName: '24H換気(排気)', priceKey: 'electrical_24h_exhaust', quantity: extracted.airExhaust24hCount }));
  items.push(createItem({ workCategory: '電気工事', detailName: '電話配線', priceKey: 'electrical_phone', quantity: FIXED_QUANTITIES.electrical.phone, remarks: '固定' }));
  items.push(createItem({ workCategory: '電気工事', detailName: 'TV配線', priceKey: 'electrical_tv', quantity: extracted.tvCount }));
  items.push(createItem({ workCategory: '電気工事', detailName: 'スイッチ', priceKey: 'electrical_switch', quantity: extracted.switchCount + 2, calculationLog: `図面${extracted.switchCount}+浴室2=${extracted.switchCount + 2}` }));

  // 3路スイッチ(偶数チェック)
  const threeWayQty = extracted.threeWaySwitchCount;
  const threeWayRemarks = threeWayQty % 2 !== 0 ? '⚠ 奇数検出(要確認)' : '';
  items.push(createItem({ workCategory: '電気工事', detailName: '3路スイッチ', priceKey: 'electrical_3way', quantity: threeWayQty, remarks: threeWayRemarks }));
  items.push(createItem({ workCategory: '電気工事', detailName: 'インターホン', priceKey: 'electrical_intercom', quantity: extracted.intercomCount || 1 }));
  items.push(createItem({ workCategory: '電気工事', detailName: '分電盤', priceKey: 'electrical_panel', quantity: FIXED_QUANTITIES.electrical.distributionBoard, remarks: '固定' }));

  // ==================== 3.19 電材 ====================
  items.push(createItem({ workCategory: '電材', detailName: 'パイプファン100φ', priceKey: 'pipe_fan_100', quantity: FIXED_QUANTITIES.materials.pipeFan100, remarks: '固定(1F/2Fトイレ)' }));
  items.push(createItem({ workCategory: '電材', detailName: '深形パイプフード100φ', priceKey: 'deep_pipe_hood_100', quantity: FIXED_QUANTITIES.materials.deepPipeHood100, remarks: '固定' }));
  items.push(createItem({ workCategory: '電材', detailName: '深形パイプフード150φ', priceKey: 'deep_pipe_hood_150', quantity: FIXED_QUANTITIES.materials.deepPipeHood150, remarks: '固定(キッチン)' }));

  // 煙式警報機
  const smokeAlarmQty = extracted.bedroomCount + 1; // 居室数 + 2階階段
  items.push(createItem({ workCategory: '電材', detailName: '煙式警報機', priceKey: 'smoke_alarm', quantity: smokeAlarmQty, calculationLog: `居室${extracted.bedroomCount}+階段1=${smokeAlarmQty}` }));

  // 照明器具
  extracted.lightingFixtures.forEach(lf => {
    items.push(createItem({
      workCategory: '電材', detailName: `照明器具(${lf.name})`, priceKey: 'smoke_alarm',
      quantity: lf.quantity, spec: lf.model, priceOverride: 5000,
      vendorOverride: '○○電材',
    }));
  });

  // ==================== 3.20 住設 ====================
  items.push(createItem({
    workCategory: '住設機器', detailName: 'システムキッチン', priceKey: 'kitchen',
    quantity: 1, spec: extracted.kitchenModel || 'I型2550',
    remarks: project.gasType === 'propane' ? 'プロパンガス' : '',
  }));
  items.push(createItem({
    workCategory: '住設機器', detailName: 'ユニットバス', priceKey: 'unit_bath',
    quantity: 1, spec: extracted.bathModel || '1616サイズ',
  }));
  items.push(createItem({
    workCategory: '住設機器', detailName: '洗面化粧台', priceKey: 'vanity',
    quantity: 1, spec: extracted.vanityModel || '標準品',
  }));
  items.push(createItem({
    workCategory: '住設機器', detailName: '1階便器', priceKey: 'toilet',
    quantity: 1, spec: extracted.toilet1FModel || '標準品',
  }));
  items.push(createItem({
    workCategory: '住設機器', detailName: '2階便器', priceKey: 'toilet',
    quantity: 1, spec: extracted.toilet2FModel || '標準品',
  }));

  // ==================== 3.21 給湯器・給排水 ====================
  items.push(createItem({
    workCategory: '給湯・設備', detailName: '給湯器', priceKey: 'water_heater',
    quantity: 1, spec: extracted.waterHeaterModel || '標準品',
  }));
  items.push(createItem({
    workCategory: '給湯・設備', detailName: '給排水設備工事', priceKey: 'plumbing',
    quantity: 1, remarks: '業者見積',
  }));
  if (project.hasSepticTank) {
    items.push(createItem({
      workCategory: '給湯・設備', detailName: '浄化槽', priceKey: 'septic_tank',
      quantity: 1,
    }));
  }

  // ==================== その他 ====================
  items.push(createItem({ workCategory: 'その他', detailName: 'クレーン工事', priceKey: 'crane', quantity: 1 }));
  items.push(createItem({ workCategory: 'その他', detailName: '申請関係', priceKey: 'application_fee', quantity: 1, orderType: '自社' }));
  items.push(createItem({ workCategory: 'その他', detailName: '瑕疵保険', priceKey: 'defect_insurance', quantity: 1 }));
  items.push(createItem({ workCategory: 'その他', detailName: '外部仮設', priceKey: 'temporary_external', quantity: 1 }));
  items.push(createItem({ workCategory: 'その他', detailName: '外構工事', priceKey: 'exterior_work', quantity: 1, priceOverride: 0, remarks: '業者見積' }));
  items.push(createItem({ workCategory: 'その他', detailName: '地盤調査', priceKey: 'ground_survey', quantity: 1 }));

  // ==================== 集計 ====================
  const totalAmount = items.reduce((sum, item) => sum + item.detailAmount, 0);
  const tsuboUnitPrice = project.totalFloorAreaTsubo > 0 ? Math.round(totalAmount / project.totalFloorAreaTsubo) : 0;
  const sqmUnitPrice = project.totalFloorArea > 0 ? Math.round(totalAmount / project.totalFloorArea) : 0;

  // カテゴリ小計を設定
  const categories = [...new Set(items.map(i => i.workCategory))];
  categories.forEach(cat => {
    const catItems = items.filter(i => i.workCategory === cat);
    const catTotal = catItems.reduce((sum, i) => sum + i.detailAmount, 0);
    if (catItems.length > 0) {
      catItems[catItems.length - 1].categoryAmount = catTotal;
    }
  });

  return {
    projectId: project.id,
    items,
    totalAmount,
    tsuboUnitPrice,
    sqmUnitPrice,
    calculatedAt: new Date().toISOString(),
  };
}

// デフォルトの抽出データ(空データ)
export function createDefaultExtractedData(projectId: string): ExtractedData {
  return {
    projectId,
    roomAreas1F: [],
    roomAreas2F: [],
    balconyArea: 0,
    porchArea: 0,
    threeWallEnclosedArea: 0,
    wingWallArea: 0,
    closetShelfCount: 0,
    movableShelfCount: 0,
    counterCount: 0,
    builtInStorageCount: 0,
    handrailCount: 0,
    roofShape: 'gable',
    roofSlope: 3.5,
    eaveOverhang: 600,
    gabledOverhang: 450,
    buildingWidth: 9100,
    buildingDepth: 6370,
    gutterLength: 0,
    downspoutCount: 0,
    balconyPerimeter: 0,
    balconyWallPerimeter: 0,
    balconyNonWallPerimeter: 0,
    slidingDoorWidth: 0,
    exteriorFittings: [],
    interiorFittings: [],
    lightingCount: 0,
    outlet2Count: 0,
    earthedOutletCount: 0,
    aircon100vCount: 0,
    aircon200vCount: 0,
    ventFanCount: 0,
    airSupply24hCount: 0,
    airExhaust24hCount: 0,
    phoneCount: 0,
    tvCount: 0,
    switchCount: 0,
    threeWaySwitchCount: 0,
    intercomCount: 1,
    lightingFixtures: [],
    entranceArea: 0,
    soilStorageArea: 0,
    bathArea: 0,
    roofInsulationArea: 0,
    outerAir2FArea: 0,
    bedroomCount: 4,
    accentWallCount: 2,
    // 住友林業基本数量表対応フィールド（デフォルト空）
    floorArea3F: 0,
    constructionArea: 0,
    staircaseArea: 0,
    tatamiFaceArea: 0,
    japaneseRoomCount: 0,
    japaneseRoomArea: 0,
    storageArea: 0,
    innerWallLength: 0,
    totalWallLength: 0,
    wallIntersectionCount: 0,
    roomInsideCornerCount: 0,
    storageInsideCornerCount: 0,
    exteriorWallPerimeter: 0,
    exteriorWallArea: 0,
    exteriorWallNetArea: 0,
    exteriorWallGrossArea: 0,
    exteriorWallOutCornerCount: 0,
    exteriorWallOutCornerLength: 0,
    exteriorWallInCornerCount: 0,
    exteriorWallInCornerLength: 0,
    exteriorWallInnerArea: 0,
    openingPerimeter: 0,
    openingWidth: 0,
    openingArea: 0,
    floorHeight1F: 0,
    floorHeight2F: 0,
    eaveHeight: 0,
    roofArea: 0,
    roofOutCornerCount: 0,
    roofInCornerCount: 0,
    ridgeCount: 0,
    ridgeLength: 0,
    eaveCount: 0,
    eaveLength: 0,
    soffitArea: 0,
    gabledCount: 0,
    gabledLength: 0,
    gableWallArea: 0,
    flatRoofArea: 0,
    wingWallCount: 0,
    wingWallOutCornerCount: 0,
    wingWallOutCornerLength: 0,
    wingWallInCornerCount: 0,
    wingWallInCornerLength: 0,
    wingWallFoundationLength: 0,
    foundationPerimeter: 0,
    foundationRiseArea: 0,
    totalRidgeLength: 0,
    concreteSlabArea: 0,
    exteriorWallRoofOverlapArea: 0,
    bayWindowCount: 0,
    bayWindowOpeningLength: 0,
    bayWindowDepth: 0,
  };
}

// サンプルプロジェクト（住友林業デモ — 木造2階建て住宅）
export function createSampleProject(): Project {
  return {
    id: 'sample-001',
    code: 'SFC-2026-001',
    name: '住友林業 モデルプランA — 木造2階建て',
    buildingType: 'premium',
    floorArea1F: 62.93,    // 1階床面積 ㎡
    floorArea2F: 57.96,    // 2階床面積 ㎡
    totalFloorArea: 120.89, // 延床面積 ㎡
    floorAreaTsubo1F: 19.01,
    floorAreaTsubo2F: 17.51,
    totalFloorAreaTsubo: 36.52,
    buildingArea: 64.59,   // 建築面積 ㎡
    siteArea: 198.35,      // 敷地面積 ㎡
    hasGroundImprovement: false,
    hasSepticTank: false,
    gasType: 'city',
    hasPerformanceEval: true,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createSampleExtractedData(): ExtractedData {
  return {
    projectId: 'sample-001',
    // === 平面図（A分類）から取得 ===
    roomAreas1F: [
      { name: 'LDK', area: 30.27 },
      { name: '玄関', area: 3.31 },
      { name: 'ホール', area: 5.79 },
      { name: '浴室', area: 3.31 },
      { name: '洗面脱衣', area: 3.31 },
      { name: 'トイレ', area: 1.66 },
      { name: '和室', area: 6.62 },
      { name: 'シューズクローク', area: 1.66 },
      { name: 'パントリー', area: 2.49 },
    ],
    roomAreas2F: [
      { name: '主寝室', area: 13.25 },
      { name: '洋室1', area: 9.93 },
      { name: '洋室2', area: 8.29 },
      { name: '子ども室', area: 8.29 },
      { name: 'トイレ', area: 1.66 },
      { name: 'ホール', area: 5.52 },
      { name: 'WIC', area: 4.97 },
      { name: 'クローゼット1', area: 1.66 },
      { name: 'クローゼット2', area: 1.66 },
    ],
    balconyArea: 6.62,
    porchArea: 4.14,
    threeWallEnclosedArea: 3.0,
    wingWallArea: 0.6,
    closetShelfCount: 5,
    movableShelfCount: 3,
    counterCount: 2,
    builtInStorageCount: 1,
    handrailCount: 2,
    // === 立面図（B分類）から取得 ===
    roofShape: 'gable',
    roofSlope: 4.5,
    eaveOverhang: 600,
    gabledOverhang: 450,
    buildingWidth: 10010,   // 間口 mm
    buildingDepth: 7280,    // 奥行 mm
    gutterLength: 24.8,
    downspoutCount: 4,
    balconyPerimeter: 7800,
    balconyWallPerimeter: 5200,
    balconyNonWallPerimeter: 2600,
    slidingDoorWidth: 3380,
    // === 建具 ===
    exteriorFittings: [
      { symbol: 'AW-1', model: 'サーモスX 16520', width: 1650, height: 2000, quantity: 2 },
      { symbol: 'AW-2', model: 'サーモスX 16513', width: 1650, height: 1300, quantity: 3 },
      { symbol: 'AW-3', model: 'サーモスX 07411', width: 740, height: 1100, quantity: 4 },
      { symbol: 'AW-4', model: 'サーモスX 06005', width: 600, height: 500, quantity: 2 },
      { symbol: 'AD-1', model: '玄関ドア ジエスタ2', width: 870, height: 2330, quantity: 1 },
    ],
    interiorFittings: [
      { symbol: 'WD-1', model: 'ラシッサD 0720', width: 700, height: 2000, quantity: 6 },
      { symbol: 'WD-2', model: 'ラシッサD 0820', width: 800, height: 2000, quantity: 3 },
      { symbol: 'FD-1', model: 'クローゼットドア', width: 1200, height: 2000, quantity: 4 },
      { symbol: 'FD-2', model: 'WICドア', width: 800, height: 2000, quantity: 1 },
    ],
    // === 電気設備 ===
    lightingCount: 20,
    outlet2Count: 22,
    earthedOutletCount: 4,
    aircon100vCount: 4,
    aircon200vCount: 1,
    ventFanCount: 3,
    airSupply24hCount: 5,
    airExhaust24hCount: 3,
    phoneCount: 1,
    tvCount: 4,
    switchCount: 18,
    threeWaySwitchCount: 6,
    intercomCount: 1,
    // === 色合わせ・仕様 ===
    kitchenModel: 'トレーシア I型2700',
    bathModel: 'SYNLA Gタイプ 1620',
    vanityModel: 'オクターブ 900',
    toilet1FModel: 'ネオレスト AH1',
    toilet2FModel: 'ネオレスト RS1',
    waterHeaterModel: 'エコキュート BHP-FV46TD',
    roofMaterial: 'コロニアルグラッサ',
    wallMaterial: 'シーサンドコート',
    tileMaterial: 'LIXILニューベルニナ 300角',
    wallpaperModel: 'SG-5101',
    lightingFixtures: [
      { model: 'LSEB1072K', name: 'LEDシーリング(LDK)', quantity: 1 },
      { model: 'LSEB1068K', name: 'LEDシーリング(主寝室)', quantity: 1 },
      { model: 'LSEB1068K', name: 'LEDシーリング(洋室)', quantity: 3 },
      { model: 'LGB73530', name: 'LEDダウンライト', quantity: 10 },
      { model: 'LGWC85044', name: 'LED玄関灯', quantity: 1 },
      { model: 'LSEB4120', name: 'LED和室シーリング', quantity: 1 },
    ],
    // === 断熱計算用 ===
    entranceArea: 3.31,
    soilStorageArea: 1.66,
    bathArea: 3.31,
    roofInsulationArea: 0,
    outerAir2FArea: 0,
    bedroomCount: 5,
    accentWallCount: 4,
    // === 住友林業基本数量表対応フィールド（B・C・D・E分類） ===
    floorArea3F: 0,
    constructionArea: 131.65,     // 延床120.89 + バルコニー6.62 + ポーチ4.14
    staircaseArea: 3.31,
    tatamiFaceArea: 6.62,
    japaneseRoomCount: 1,
    japaneseRoomArea: 6.62,
    storageArea: 12.44,           // WIC4.97 + CL1.66×2 + SC1.66 + パントリー2.49
    innerWallLength: 68.5,
    totalWallLength: 105.3,       // 内壁68.5 + 外壁外周36.8
    wallIntersectionCount: 24,
    roomInsideCornerCount: 32,
    storageInsideCornerCount: 12,
    // 外壁（立面図B分類）
    exteriorWallPerimeter: 36.58,  // 外壁外周長 m
    exteriorWallArea: 175.58,      // 外壁面積 ㎡ (外周36.58 × 軒高4.8)
    exteriorWallNetArea: 148.92,   // 外壁実面積 ㎡ (開口部差引後)
    exteriorWallGrossArea: 175.58, // 外壁外周長×外壁高
    exteriorWallOutCornerCount: 4,
    exteriorWallOutCornerLength: 19.2, // 4箇所 × 4.8m
    exteriorWallInCornerCount: 2,
    exteriorWallInCornerLength: 9.6,   // 2箇所 × 4.8m
    exteriorWallInnerArea: 158.43,
    openingPerimeter: 68.2,        // 全開口部周長
    openingWidth: 19.74,           // 全開口部幅合計
    openingArea: 26.66,            // 全開口部面積
    floorHeight1F: 2.72,
    floorHeight2F: 2.72,
    eaveHeight: 6.49,
    // 屋根（B・D分類）
    roofArea: 86.32,               // 水平投影 × 勾配伸び率(4.5寸=1.098)
    roofOutCornerCount: 0,
    roofInCornerCount: 0,
    ridgeCount: 1,
    ridgeLength: 4.28,
    eaveCount: 2,
    eaveLength: 21.78,             // 南北2面の軒先
    soffitArea: 13.07,             // 軒先長 × 軒出0.6m
    gabledCount: 2,
    gabledLength: 16.36,           // 東西2面のケラバ
    gableWallArea: 8.12,           // 矢切壁面積
    flatRoofArea: 0,
    // 袖壁
    wingWallCount: 2,
    wingWallOutCornerCount: 2,
    wingWallOutCornerLength: 3.6,
    wingWallInCornerCount: 0,
    wingWallInCornerLength: 0,
    wingWallFoundationLength: 2.4,
    // 基礎（E分類 — 概算値）
    foundationPerimeter: 36.58,
    foundationRiseArea: 14.63,     // 基礎外周36.58 × 立上り高さ0.4m
    // その他
    totalRidgeLength: 20.64,       // 棟4.28 + ケラバ16.36
    concreteSlabArea: 4.97,        // 玄関3.31 + SC1.66
    exteriorWallRoofOverlapArea: 5.48,
    bayWindowCount: 0,
    bayWindowOpeningLength: 0,
    bayWindowDepth: 0,
  };
}

// 基本数量表データ生成（住友林業フォーマット）
export function createBasicQuantitySheet(project: Project, extracted: ExtractedData): BasicQuantitySheet {
  const items: BasicQuantity[] = [
    // 面積系（A分類: 平面図）
    { id: 'bq-01', name: '１階床面積', unit: '㎡', value1F: project.floorArea1F, total: project.floorArea1F, source: 'plan' },
    { id: 'bq-02', name: '１階床面積（基本数量）', unit: '㎡', value1F: project.floorArea1F, total: project.floorArea1F, source: 'plan' },
    { id: 'bq-03', name: '２．５階床面積', unit: '㎡', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-04', name: '２階床面積', unit: '㎡', value2F: project.floorArea2F, total: project.floorArea2F, source: 'plan' },
    { id: 'bq-05', name: '３階床面積', unit: '㎡', total: extracted.floorArea3F || 0, memo: '該当なし', source: 'plan' },
    { id: 'bq-06', name: '延床面積', unit: '㎡', total: project.totalFloorArea, source: 'plan' },
    { id: 'bq-07', name: '屋根面積', unit: '㎡', total: extracted.roofArea || 0, source: 'elevation' },
    { id: 'bq-08', name: 'アルコ－ブ面積', unit: '㎡', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-09', name: 'ケラバ箇所数', unit: 'ヶ所', total: extracted.gabledCount || 0, source: 'elevation' },
    { id: 'bq-10', name: 'ケラバ出長', unit: 'mm', total: extracted.gabledOverhang || 450, source: 'elevation' },
    { id: 'bq-11', name: 'ケラバ長', unit: 'Ｍ', total: extracted.gabledLength || 0, source: 'elevation' },
    { id: 'bq-12', name: 'バルコニー袖壁箇所数', unit: 'ヶ所', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-13', name: 'バルコニー袖壁出隅箇所数', unit: 'ヶ所', total: 0, source: 'na' },
    { id: 'bq-14', name: 'バルコニー袖壁出隅長', unit: 'Ｍ', total: 0, source: 'na' },
    { id: 'bq-15', name: 'バルコ袖壁入隅箇所数', unit: 'ヶ所', total: 0, source: 'na' },
    { id: 'bq-16', name: 'バルコ袖壁入隅長', unit: 'Ｍ', total: 0, source: 'na' },
    { id: 'bq-17', name: 'フラットルーフ面積', unit: '㎡', total: extracted.flatRoofArea || 0, source: 'combined' },
    { id: 'bq-18', name: 'ベランダ床面積（天端面）', unit: '㎡', total: extracted.balconyArea, source: 'plan' },
    { id: 'bq-19', name: '屋根（勾配）', unit: '寸', total: extracted.roofSlope, source: 'elevation' },
    { id: 'bq-20', name: '屋根下ビルトインガレージ面積', unit: '㎡', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-21', name: '屋根出隅数', unit: 'ヶ所', total: extracted.roofOutCornerCount || 0, source: 'elevation' },
    { id: 'bq-22', name: '屋根入隅数', unit: 'ヶ所', total: extracted.roofInCornerCount || 0, source: 'elevation' },
    { id: 'bq-23', name: '開口部周長', unit: 'Ｍ', total: extracted.openingPerimeter || 0, source: 'elevation' },
    { id: 'bq-24', name: '開口部長', unit: 'Ｍ', total: extracted.openingWidth || 0, memo: '幅合計', source: 'elevation' },
    { id: 'bq-25', name: '開口部面積（戸袋除）', unit: '㎡', total: extracted.openingArea || 0, source: 'elevation' },
    { id: 'bq-26', name: '階高', unit: 'Ｍ', value1F: extracted.floorHeight1F || 2.72, value2F: extracted.floorHeight2F || 2.72, source: 'elevation' },
    { id: 'bq-27', name: '階段室面積', unit: '㎡', total: extracted.staircaseArea || 0, source: 'plan' },
    { id: 'bq-28', name: '外周基礎外土間コン面積', unit: '㎡', total: 0, memo: '基礎伏図が必要', source: 'foundation' },
    { id: 'bq-29', name: '外周基礎内土間コン面積', unit: '㎡', total: 0, memo: '基礎伏図が必要', source: 'foundation' },
    { id: 'bq-30', name: '外周基礎内防湿部面積', unit: '㎡', total: 0, memo: '基礎伏図が必要', source: 'foundation' },
    { id: 'bq-31', name: '外周基礎内面積', unit: '㎡', total: 0, memo: '基礎伏図が必要', source: 'foundation' },
    { id: 'bq-32', name: '外部天井面積補正', unit: '㎡', total: 0, memo: '補正項目', source: 'combined' },
    { id: 'bq-33', name: '外壁・屋根重り面積', unit: '㎡', total: extracted.exteriorWallRoofOverlapArea || 0, source: 'combined' },
    { id: 'bq-34', name: '外壁外周長', unit: 'Ｍ', total: extracted.exteriorWallPerimeter || 0, source: 'elevation' },
    { id: 'bq-35', name: '外壁外周長＊外壁高の面積', unit: '㎡', total: extracted.exteriorWallGrossArea || 0, source: 'elevation' },
    { id: 'bq-36', name: '外壁実面積', unit: '㎡', total: extracted.exteriorWallNetArea || 0, memo: '開口部・出入隅補正後', source: 'elevation' },
    { id: 'bq-37', name: '外壁出隅数', unit: 'ヶ所', total: extracted.exteriorWallOutCornerCount || 0, source: 'elevation' },
    { id: 'bq-38', name: '外壁出隅数（アルコーブ含）', unit: 'ヶ所', total: extracted.exteriorWallOutCornerCount || 0, source: 'elevation' },
    { id: 'bq-39', name: '外壁出隅長', unit: 'Ｍ', total: extracted.exteriorWallOutCornerLength || 0, source: 'elevation' },
    { id: 'bq-40', name: '外壁内面積', unit: '㎡', total: extracted.exteriorWallInnerArea || 0, source: 'elevation' },
    { id: 'bq-41', name: '外壁入隅箇所数', unit: 'ヶ所', total: extracted.exteriorWallInCornerCount || 0, source: 'elevation' },
    { id: 'bq-42', name: '外壁入隅数', unit: 'ヶ所', total: extracted.exteriorWallInCornerCount || 0, source: 'elevation' },
    { id: 'bq-43', name: '外壁入隅長', unit: 'Ｍ', total: extracted.exteriorWallInCornerLength || 0, source: 'elevation' },
    { id: 'bq-44', name: '外壁面積', unit: '㎡', total: extracted.exteriorWallArea || 0, source: 'elevation' },
    { id: 'bq-45', name: '間仕切基礎長', unit: 'Ｍ', total: 0, memo: '基礎伏図が必要', source: 'foundation' },
    { id: 'bq-46', name: '基礎外周長', unit: 'Ｍ', total: extracted.foundationPerimeter || 0, memo: '≒外壁外周長で概算', source: 'foundation' },
    { id: 'bq-47', name: '基礎立上り面積', unit: '㎡', total: extracted.foundationRiseArea || 0, source: 'foundation' },
    { id: 'bq-48', name: '隅木・谷木長', unit: 'Ｍ', total: 0, memo: '屋根伏図が必要', source: 'roof_plan' },
    { id: 'bq-49', name: '建築面積', unit: '㎡', total: project.buildingArea, source: 'plan' },
    { id: 'bq-50', name: '軒箇所数', unit: 'ヶ所', total: extracted.eaveCount || 0, source: 'elevation' },
    { id: 'bq-51', name: '軒高', unit: 'Ｍ', total: extracted.eaveHeight || 0, source: 'elevation' },
    { id: 'bq-52', name: '軒出長', unit: 'mm', total: extracted.eaveOverhang, source: 'elevation' },
    { id: 'bq-53', name: '軒先長', unit: 'Ｍ', total: extracted.eaveLength || 0, source: 'elevation' },
    { id: 'bq-54', name: '軒裏面積', unit: '㎡', total: extracted.soffitArea || 0, source: 'elevation' },
    { id: 'bq-55', name: '施工面積', unit: '㎡', total: extracted.constructionArea || 0, source: 'plan' },
    { id: 'bq-56', name: '収納・床面積', unit: '㎡', total: extracted.storageArea || 0, source: 'plan' },
    { id: 'bq-57', name: '収納入隅箇所数（大壁）', unit: 'ヶ所', total: extracted.storageInsideCornerCount || 0, source: 'plan' },
    { id: 'bq-58', name: '出窓奥行', unit: 'Ｍ', total: extracted.bayWindowDepth || 0, source: 'elevation' },
    { id: 'bq-59', name: '出窓箇所数', unit: 'ヶ所', total: extracted.bayWindowCount || 0, source: 'elevation' },
    { id: 'bq-60', name: '出窓開口長', unit: 'Ｍ', total: extracted.bayWindowOpeningLength || 0, source: 'elevation' },
    { id: 'bq-61', name: '小屋裏収納部屋面積', unit: '㎡', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-62', name: '小屋裏部屋面積', unit: '㎡', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-63', name: '小屋裏面積', unit: '㎡', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-64', name: '畳面積', unit: '㎡', total: extracted.tatamiFaceArea || 0, source: 'plan' },
    { id: 'bq-65', name: '吹抜床面積', unit: '㎡', total: extracted.voidFloorArea || 0, source: 'combined' },
    { id: 'bq-66', name: '吹抜面積', unit: '㎡', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-67', name: '全壁長', unit: 'Ｍ', total: extracted.totalWallLength || 0, source: 'plan' },
    { id: 'bq-68', name: '総棟長（棟＋稜＋谷）', unit: 'Ｍ', total: extracted.totalRidgeLength || 0, source: 'roof_plan' },
    { id: 'bq-69', name: '袖壁箇所数', unit: 'ヶ所', total: extracted.wingWallCount || 0, source: 'elevation' },
    { id: 'bq-70', name: '袖壁基礎長', unit: 'Ｍ', total: extracted.wingWallFoundationLength || 0, source: 'elevation' },
    { id: 'bq-71', name: '袖壁出隅箇所数', unit: 'ヶ所', total: extracted.wingWallOutCornerCount || 0, source: 'elevation' },
    { id: 'bq-72', name: '袖壁出隅長', unit: 'Ｍ', total: extracted.wingWallOutCornerLength || 0, source: 'elevation' },
    { id: 'bq-73', name: '袖壁入隅箇所数', unit: 'ヶ所', total: extracted.wingWallInCornerCount || 0, source: 'elevation' },
    { id: 'bq-74', name: '袖壁入隅部分長', unit: 'Ｍ', total: extracted.wingWallInCornerLength || 0, source: 'elevation' },
    { id: 'bq-75', name: '谷箇所数', unit: 'ヶ所', total: 0, memo: '屋根伏図が必要', source: 'roof_plan' },
    { id: 'bq-76', name: '谷長', unit: 'Ｍ', total: 0, memo: '屋根伏図が必要', source: 'roof_plan' },
    { id: 'bq-77', name: '土間コンクリ－ト面積', unit: '㎡', total: extracted.concreteSlabArea || 0, source: 'combined' },
    { id: 'bq-78', name: '棟箇所数', unit: 'ヶ所', total: extracted.ridgeCount || 0, source: 'elevation' },
    { id: 'bq-79', name: '棟長', unit: 'Ｍ', total: extracted.ridgeLength || 0, source: 'elevation' },
    { id: 'bq-80', name: '内壁長', unit: 'Ｍ', total: extracted.innerWallLength || 0, source: 'plan' },
    { id: 'bq-81', name: '入母屋妻壁箇所', unit: 'ヶ所', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-82', name: '入母屋妻壁長', unit: 'Ｍ', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-83', name: '部屋入隅箇所数（大壁）', unit: 'ヶ所', total: extracted.roomInsideCornerCount || 0, source: 'plan' },
    { id: 'bq-84', name: '壁交点数（外壁出入隅除）', unit: 'ヶ所', total: extracted.wallIntersectionCount || 0, source: 'plan' },
    { id: 'bq-85', name: '矢切壁面積（妻壁）', unit: '㎡', total: extracted.gableWallArea || 0, source: 'elevation' },
    { id: 'bq-86', name: '浴室床面積', unit: '㎡', total: extracted.bathArea, source: 'plan' },
    { id: 'bq-87', name: '陸屋根（ＦＲＰ）面積', unit: '㎡', total: 0, memo: '該当なし', source: 'na' },
    { id: 'bq-88', name: '稜箇所数', unit: 'ヶ所', total: 0, memo: '屋根伏図が必要', source: 'roof_plan' },
    { id: 'bq-89', name: '稜長', unit: 'Ｍ', total: 0, memo: '屋根伏図が必要', source: 'roof_plan' },
    { id: 'bq-90', name: '和室箇所数', unit: 'ヶ所', total: extracted.japaneseRoomCount || 0, source: 'plan' },
    { id: 'bq-91', name: '和室床面積', unit: '㎡', total: extracted.japaneseRoomArea || 0, source: 'plan' },
    { id: 'bq-92', name: '和室床面積合計', unit: '㎡', total: extracted.japaneseRoomArea || 0, source: 'plan' },
  ];
  return {
    projectId: project.id,
    items,
    calculatedAt: new Date().toISOString(),
  };
}

// ============================================================
// 概算見積もり（Quick Estimate）
// ============================================================

// 過去実績ベースの単価レンジ（デモ用）
// 実際にはHistoricalEstimate DBから類似案件を検索して算出
const DEMO_UNIT_PRICE_RANGES: Record<string, { low: number; mid: number; high: number; unit: string; source: string }> = {
  '仮設工事':       { low: 28000, mid: 35000, high: 42000, unit: '坪', source: '過去18件の実績' },
  '基礎工事':       { low: 55000, mid: 68000, high: 82000, unit: '坪', source: '過去15件の実績' },
  '躯体工事':       { low: 120000, mid: 145000, high: 175000, unit: '坪', source: '過去18件の実績' },
  '屋根工事':       { low: 4200, mid: 5500, high: 7200, unit: '㎡', source: '過去16件の実績' },
  '外壁工事':       { low: 7500, mid: 9200, high: 12000, unit: '㎡', source: '過去14件の実績' },
  '建具工事':       { low: 45000, mid: 58000, high: 75000, unit: '坪', source: '過去18件の実績' },
  '内装工事':       { low: 32000, mid: 42000, high: 55000, unit: '坪', source: '過去18件の実績' },
  '電気工事':       { low: 18000, mid: 24000, high: 30000, unit: '坪', source: '過去17件の実績' },
  '給排水設備工事': { low: 35000, mid: 45000, high: 58000, unit: '坪', source: '過去16件の実績' },
  '住設機器':       { low: 850000, mid: 1200000, high: 1650000, unit: '式', source: '過去18件の実績' },
  '断熱工事':       { low: 15000, mid: 22000, high: 30000, unit: '坪', source: '過去14件の実績' },
  '防水・板金工事': { low: 3500, mid: 4800, high: 6500, unit: '㎡', source: '過去15件の実績' },
  '左官・タイル工事': { low: 150000, mid: 220000, high: 320000, unit: '式', source: '過去16件の実績' },
  '塗装工事':       { low: 80000, mid: 120000, high: 180000, unit: '式', source: '過去14件の実績' },
  '雑工事':         { low: 50000, mid: 80000, high: 120000, unit: '式', source: '過去18件の実績' },
  '地盤調査・改良': { low: 55000, mid: 350000, high: 800000, unit: '式', source: '過去18件の実績' },
  '外構工事':       { low: 800000, mid: 1500000, high: 2500000, unit: '式', source: '過去12件の実績' },
  '諸費用・申請':   { low: 400000, mid: 550000, high: 750000, unit: '式', source: '過去18件の実績' },
};

export function generateQuickEstimate(project: Project, extracted: ExtractedData): QuickEstimateResult {
  const tsubo = project.totalFloorAreaTsubo;
  const roofArea = extracted.roofArea || 86;
  const wallNetArea = extracted.exteriorWallNetArea || 149;
  const balconyArea = extracted.balconyArea || 0;
  const soffitArea = extracted.soffitArea || 13;

  const items: QuickEstimateItem[] = [];

  const addItem = (
    category: string, workType: string, quantity: number, unit: string,
    priceKey: string, quantityBasis: string, ratio: string,
  ) => {
    const pr = DEMO_UNIT_PRICE_RANGES[priceKey];
    if (!pr) return;
    items.push({
      category, workType, quantity, unit: pr.unit === '式' ? '式' : unit,
      unitPriceLow: pr.low, unitPriceMid: pr.mid, unitPriceHigh: pr.high,
      amountLow: Math.round(quantity * pr.low),
      amountMid: Math.round(quantity * pr.mid),
      amountHigh: Math.round(quantity * pr.high),
      ratio, source: pr.source, quantityBasis,
    });
  };

  // 本体工事
  addItem('本体工事', '仮設工事', tsubo, '坪', '仮設工事',
    `延床面積 ${project.totalFloorArea}㎡ = ${tsubo}坪`, '3〜4%');
  addItem('本体工事', '基礎工事', tsubo, '坪', '基礎工事',
    `延床面積 ${tsubo}坪 (1F: ${project.floorArea1F}㎡)`, '6〜8%');
  addItem('本体工事', '躯体工事', tsubo, '坪', '躯体工事',
    `延床面積 ${tsubo}坪`, '25〜30%');
  addItem('本体工事', '屋根工事', roofArea, '㎡', '屋根工事',
    `屋根面積 ${roofArea}㎡ (勾配${extracted.roofSlope}寸)`, '5〜7%');
  addItem('本体工事', '外壁工事', wallNetArea, '㎡', '外壁工事',
    `外壁実面積 ${wallNetArea}㎡ (開口部${extracted.openingArea || 27}㎡控除)`, '8〜12%');
  addItem('本体工事', '建具工事', tsubo, '坪', '建具工事',
    `延床面積 ${tsubo}坪 (サッシ${extracted.exteriorFittings.length}種)`, '5〜7%');
  addItem('本体工事', '内装工事', tsubo, '坪', '内装工事',
    `延床面積 ${tsubo}坪 (和室${extracted.japaneseRoomCount || 0}室含)`, '7〜10%');
  addItem('本体工事', '電気工事', tsubo, '坪', '電気工事',
    `延床面積 ${tsubo}坪 (照明${extracted.lightingCount}箇所)`, '3〜5%');
  addItem('本体工事', '給排水設備工事', tsubo, '坪', '給排水設備工事',
    `延床面積 ${tsubo}坪`, '5〜7%');
  addItem('本体工事', '住設機器', 1, '式', '住設機器',
    `キッチン+UB+洗面+トイレ×2+給湯器`, '5〜8%');
  addItem('本体工事', '断熱工事', tsubo, '坪', '断熱工事',
    `延床面積 ${tsubo}坪 (省エネ等級6相当)`, '3〜5%');
  addItem('本体工事', '防水・板金工事', balconyArea + soffitArea, '㎡', '防水・板金工事',
    `バルコニー${balconyArea}㎡ + 軒裏${soffitArea}㎡`, '2〜3%');
  addItem('本体工事', '左官・タイル工事', 1, '式', '左官・タイル工事',
    `基礎巾木+玄関タイル`, '1〜2%');
  addItem('本体工事', '塗装工事', 1, '式', '塗装工事',
    `内外部塗装一式`, '1〜2%');
  addItem('本体工事', '雑工事', 1, '式', '雑工事',
    `クリーニング・美装・残材処分等`, '1%');

  // 付帯工事
  addItem('付帯工事', '地盤調査・改良', 1, '式', '地盤調査・改良',
    `地盤調査結果による（改良${project.hasGroundImprovement ? 'あり' : '未定'}）`, '1〜5%');
  addItem('付帯工事', '外構工事', 1, '式', '外構工事',
    `敷地面積 ${project.siteArea}㎡`, '5〜10%');

  // 諸費用
  addItem('諸費用', '諸費用・申請', 1, '式', '諸費用・申請',
    `確認申請+検査+保険+登記+ローン手数料`, '3〜5%');

  const totalLow = items.reduce((s, i) => s + i.amountLow, 0);
  const totalMid = items.reduce((s, i) => s + i.amountMid, 0);
  const totalHigh = items.reduce((s, i) => s + i.amountHigh, 0);

  return {
    projectId: project.id,
    items,
    totalLow, totalMid, totalHigh,
    tsuboUnitPriceLow: tsubo > 0 ? Math.round(totalLow / tsubo) : 0,
    tsuboUnitPriceMid: tsubo > 0 ? Math.round(totalMid / tsubo) : 0,
    tsuboUnitPriceHigh: tsubo > 0 ? Math.round(totalHigh / tsubo) : 0,
    similarProjectCount: 18,
    calculatedAt: new Date().toISOString(),
  };
}
