// プロジェクト
export interface Project {
  id: string;
  code: string; // 工事コード
  name: string; // 工事名
  buildingType: 'value' | 'toku_value' | 'premium'; // 建物タイプ
  floorArea1F: number; // 1F床面積(㎡)
  floorArea2F: number; // 2F床面積(㎡)
  totalFloorArea: number; // 延床面積(㎡)
  floorAreaTsubo1F: number; // 1F坪数
  floorAreaTsubo2F: number; // 2F坪数
  totalFloorAreaTsubo: number; // 延床坪数
  buildingArea: number; // 建築面積(㎡)
  siteArea: number; // 敷地面積(㎡)
  hasGroundImprovement: boolean; // 地盤改良有無
  improvementMethod?: 'surface' | 'column' | 'steel_pipe'; // 改良工法
  hasSepticTank: boolean; // 浄化槽要否
  gasType: 'city' | 'propane'; // ガス種別
  hasPerformanceEval: boolean; // 性能評価有無
  exteriorWallQuote?: number; // 外壁業者見積額
  status: 'draft' | 'uploaded' | 'analyzed' | 'calculated' | 'approved';
  createdAt: string;
  updatedAt: string;
}

// 図面から抽出したデータ
export interface ExtractedData {
  projectId: string;
  // A-1: 計画概要書
  buildingName?: string;
  structure?: string;
  // A-2: 求積図
  roomAreas1F: RoomArea[];
  roomAreas2F: RoomArea[];
  balconyArea: number;
  porchArea: number;
  // A-3: 平面図
  threeWallEnclosedArea: number; // 三方囲み壁内面積
  wingWallArea: number; // 袖壁基礎面積
  closetShelfCount: number; // 枕棚数
  movableShelfCount: number; // 可動棚数
  counterCount: number; // カウンター数
  builtInStorageCount: number; // 埋込収納数
  handrailCount: number; // 手すり数
  // A-4: 立面図
  roofShape: 'gable' | 'hip' | 'other'; // 切妻・寄棟
  roofSlope: number; // 勾配(寸)
  eaveOverhang: number; // 軒先出(mm)
  gabledOverhang: number; // ケラバ出(mm)
  buildingWidth: number; // 間口(mm)
  buildingDepth: number; // 奥行(mm)
  gutterLength: number; // 軒樋長さ(m)
  downspoutCount: number; // 集水器数
  balconyPerimeter: number; // バルコニー外周(mm)
  balconyWallPerimeter: number; // 腰壁外周(mm)
  balconyNonWallPerimeter: number; // 腰壁以外外周(mm)
  slidingDoorWidth: number; // 掃き出し窓幅合計(mm)
  // A-6: 建具
  exteriorFittings: Fitting[];
  interiorFittings: Fitting[];
  // E-1: 電気設備
  lightingCount: number;
  outlet2Count: number; // 一般コンセント2口
  earthedOutletCount: number;
  aircon100vCount: number;
  aircon200vCount: number;
  ventFanCount: number;
  airSupply24hCount: number; // 24H換気給気
  airExhaust24hCount: number; // 24H換気排気
  phoneCount: number;
  tvCount: number;
  switchCount: number;
  threeWaySwitchCount: number;
  intercomCount: number;
  // 色合わせ
  kitchenModel?: string;
  bathModel?: string;
  vanityModel?: string;
  toilet1FModel?: string;
  toilet2FModel?: string;
  waterHeaterModel?: string;
  roofMaterial?: string;
  wallMaterial?: string;
  tileMaterial?: string;
  wallpaperModel?: string;
  lightingFixtures: LightingFixture[];
  // 断熱計算用
  entranceArea: number; // 玄関面積
  soilStorageArea: number; // 土間収納面積
  bathArea: number; // 浴室面積
  roofInsulationArea: number; // 屋根断熱部分面積
  outerAir2FArea: number; // 外気接触2F床面積
  bedroomCount: number; // 居室数(警報器用)
  accentWallCount: number; // アクセントクロス箇所数
  // 住友林業基本数量表対応フィールド
  floorArea3F?: number; // 3階床面積
  constructionArea?: number; // 施工面積
  staircaseArea?: number; // 階段室面積
  tatamiFaceArea?: number; // 畳面積
  japaneseRoomCount?: number; // 和室箇所数
  japaneseRoomArea?: number; // 和室床面積
  storageArea?: number; // 収納・床面積
  atticArea?: number; // 小屋裏面積
  voidFloorArea?: number; // 吹抜床面積
  innerWallLength?: number; // 内壁長
  totalWallLength?: number; // 全壁長
  wallIntersectionCount?: number; // 壁交点数
  roomInsideCornerCount?: number; // 部屋入隅箇所数
  storageInsideCornerCount?: number; // 収納入隅箇所数
  exteriorWallPerimeter?: number; // 外壁外周長(m)
  exteriorWallArea?: number; // 外壁面積(㎡)
  exteriorWallNetArea?: number; // 外壁実面積(㎡)
  exteriorWallGrossArea?: number; // 外壁外周長×外壁高の面積
  exteriorWallOutCornerCount?: number; // 外壁出隅数
  exteriorWallOutCornerLength?: number; // 外壁出隅長(m)
  exteriorWallInCornerCount?: number; // 外壁入隅数
  exteriorWallInCornerLength?: number; // 外壁入隅長(m)
  exteriorWallInnerArea?: number; // 外壁内面積(㎡)
  openingPerimeter?: number; // 開口部周長(m)
  openingWidth?: number; // 開口部長(m) = 幅合計
  openingArea?: number; // 開口部面積(㎡)
  floorHeight1F?: number; // 1階階高(m)
  floorHeight2F?: number; // 2階階高(m)
  eaveHeight?: number; // 軒高(m)
  roofArea?: number; // 屋根面積(㎡)
  roofOutCornerCount?: number; // 屋根出隅数
  roofInCornerCount?: number; // 屋根入隅数
  ridgeCount?: number; // 棟箇所数
  ridgeLength?: number; // 棟長(m)
  eaveCount?: number; // 軒箇所数
  eaveLength?: number; // 軒先長(m)
  soffitArea?: number; // 軒裏面積(㎡)
  gabledCount?: number; // ケラバ箇所数
  gabledLength?: number; // ケラバ長(m)
  gableWallArea?: number; // 矢切壁面積(㎡)
  flatRoofArea?: number; // フラットルーフ面積(㎡)
  wingWallCount?: number; // 袖壁箇所数
  wingWallOutCornerCount?: number; // 袖壁出隅箇所数
  wingWallOutCornerLength?: number; // 袖壁出隅長(m)
  wingWallInCornerCount?: number; // 袖壁入隅箇所数
  wingWallInCornerLength?: number; // 袖壁入隅部分長(m)
  wingWallFoundationLength?: number; // 袖壁基礎長(m)
  foundationPerimeter?: number; // 基礎外周長(m)
  foundationRiseArea?: number; // 基礎立上り面積(㎡)
  totalRidgeLength?: number; // 総棟長(棟+稜+谷)(m)
  concreteSlabArea?: number; // 土間コンクリート面積(㎡)
  exteriorWallRoofOverlapArea?: number; // 外壁・屋根重り面積(㎡)
  bayWindowCount?: number; // 出窓箇所数
  bayWindowOpeningLength?: number; // 出窓開口長(m)
  bayWindowDepth?: number; // 出窓奥行(m)
}

export interface RoomArea {
  name: string;
  area: number; // ㎡
}

export interface Fitting {
  symbol: string;
  model: string;
  width: number;
  height: number;
  quantity: number;
}

export interface LightingFixture {
  model: string;
  name: string;
  quantity: number;
}

// 予算書の1行
export interface BudgetItem {
  id: string;
  workCategory: string; // 工事種別
  detailName: string; // 細目工種名
  vendor: string; // 業者名
  spec: string; // 部材/仕様
  unitPrice: number; // 単価
  quantity: number; // 数量
  unit: string; // 単位
  detailAmount: number; // 実行予算明細金額
  categoryAmount?: number; // 実行予算金額(カテゴリ小計)
  remarks: string; // 備考
  orderType: string; // 発注区分
  isManual: boolean; // 手動入力フラグ
  calculationLog?: string; // 計算過程ログ
}

// 外壁面積算出用
export interface WallRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: 'wall' | 'opening';
}

export interface ElevationFace {
  id: string;
  name: string; // 正面/背面/左側面/右側面
  imageDataUrl?: string;
  scale: number; // px per mm
  wallRects: WallRect[];
  openingRects: WallRect[];
  wallAreaM2: number;
  openingAreaM2: number;
  netAreaM2: number;
  confirmed: boolean;
}

export interface ExteriorWallData {
  projectId: string;
  faces: ElevationFace[];
  totalWallArea: number;
  totalOpeningArea: number;
  totalNetArea: number;
  confirmedAt?: string;
}

// 住友林業 基本数量表
export interface BasicQuantity {
  id: string;
  name: string;        // 項目名
  unit: string;        // 数量単位
  value1F?: number;    // 1階数量
  value2F?: number;    // 2階数量
  value3F?: number;    // 3階数量
  total?: number;      // 合計数量
  memo?: string;       // めも
  source: 'plan' | 'elevation' | 'combined' | 'roof_plan' | 'foundation' | 'na'; // 取得元
}

// 基本数量表全体
export interface BasicQuantitySheet {
  projectId: string;
  items: BasicQuantity[];
  calculatedAt: string;
}

// 概算見積もり — 簡易入力（図面なし）
export interface QuickEstimateInput {
  customerName: string;
  totalFloorAreaTsubo: number;
  buildingType: '2階建て' | '3階建て' | '平屋';
  structure: '木造' | '鉄骨造' | 'RC造';
  grade: 'standard' | 'high' | 'premium';
  region: string;
  hasBasement: boolean;
  memo: string;
}

// 概算見積もり — 工種別の1行
export interface QuickEstimateItem {
  category: string;       // 大分類（本体工事/付帯工事/諸費用）
  workType: string;       // 工事種別
  quantity: number;       // 数量
  unit: string;           // 単位
  unitPriceLow: number;   // 単価（下限）
  unitPriceHigh: number;  // 単価（上限）
  unitPriceMid: number;   // 単価（推奨＝中央値）
  amountLow: number;      // 金額（下限）
  amountHigh: number;     // 金額（上限）
  amountMid: number;      // 金額（推奨）
  ratio: string;          // 費用比率
  source: string;         // 根拠（「過去12件の実績」等）
  quantityBasis: string;  // 数量根拠（「基本数量表: 屋根面積=86.32㎡」等）
}

// 概算見積もり結果
export interface QuickEstimateResult {
  projectId: string;
  items: QuickEstimateItem[];
  totalLow: number;
  totalMid: number;
  totalHigh: number;
  tsuboUnitPriceLow: number;
  tsuboUnitPriceMid: number;
  tsuboUnitPriceHigh: number;
  similarProjectCount: number; // 参照した類似案件数
  calculatedAt: string;
}

// 計算結果
export interface CalculationResult {
  projectId: string;
  items: BudgetItem[];
  totalAmount: number;
  tsuboUnitPrice: number; // 坪単価
  sqmUnitPrice: number; // ㎡単価
  calculatedAt: string;
}
