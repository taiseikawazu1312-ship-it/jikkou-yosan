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

// 計算結果
export interface CalculationResult {
  projectId: string;
  items: BudgetItem[];
  totalAmount: number;
  tsuboUnitPrice: number; // 坪単価
  sqmUnitPrice: number; // ㎡単価
  calculatedAt: string;
}
