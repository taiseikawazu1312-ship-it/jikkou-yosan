import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const drawingType = formData.get('drawingType') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'ファイルが指定されていません' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // APIキーが未設定の場合はデモデータを返す
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'ANTHROPIC_API_KEY未設定のためデモデータを返します',
        data: getDemoData(drawingType || 'plan'),
      });
    }

    // PDFをbase64に変換
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mediaType = file.type === 'application/pdf' ? 'application/pdf' : 'image/png';

    // Claude Vision APIで解析
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: getAnalysisPrompt(drawingType || 'plan'),
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'AI解析に失敗しました', details: errorData }, { status: 500 });
    }

    const result = await response.json();
    const textContent = result.content.find((c: any) => c.type === 'text');

    // JSONを抽出
    let parsedData;
    try {
      const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/);
      parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      parsedData = { rawText: textContent?.text };
    }

    return NextResponse.json({
      success: true,
      demo: false,
      data: parsedData,
      drawingType,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: '解析中にエラーが発生しました' }, { status: 500 });
  }
}

function getAnalysisPrompt(drawingType: string): string {
  const prompts: Record<string, string> = {
    overview: `この建築図面（計画概要書・案内図）から以下の情報をJSON形式で抽出してください:
{
  "buildingName": "工事名/物件名",
  "buildingType": "建物タイプ",
  "structure": "構造",
  "floors": "階数",
  "siteArea": 敷地面積(㎡の数値),
  "buildingArea": 建築面積(㎡の数値),
  "floorArea1F": 1階床面積(㎡の数値),
  "floorArea2F": 2階床面積(㎡の数値),
  "totalFloorArea": 延床面積(㎡の数値),
  "fireZone": "防火地域",
  "useDistrict": "用途地域"
}
数値は単位なしの数値のみ記入してください。読み取れない項目はnullとしてください。`,

    plan: `この建築図面（平面図）から以下の情報をJSON形式で抽出してください:
{
  "floor": "階数(1Fまたは2F)",
  "rooms": [{"name": "室名", "area": 面積(㎡の数値)}],
  "closetShelfCount": 枕棚の数,
  "movableShelfCount": 可動棚の数,
  "counterCount": カウンターの数,
  "builtInStorageCount": 埋込収納の数,
  "handrailCount": 手すりの数,
  "entranceArea": 玄関面積(㎡),
  "bathArea": 浴室面積(㎡),
  "threeWallEnclosedArea": 三方囲み壁内面積(㎡),
  "wingWallLength": 袖壁長さ(mm)
}`,

    elevation: `この建築図面（立面図）から以下の情報をJSON形式で抽出してください:
{
  "roofShape": "屋根形状(gable/hip/other)",
  "roofSlope": 屋根勾配(寸の数値),
  "eaveOverhang": 軒先出寸法(mmの数値),
  "gabledOverhang": ケラバ出寸法(mmの数値),
  "buildingWidth": 建物間口(mmの数値),
  "buildingDepth": 建物奥行(mmの数値),
  "gutterLength": 軒樋概算長さ(mの数値),
  "downspoutCount": 集水器の数,
  "wallMaterial": "外壁材名"
}`,

    fitting: `この建築図面（建具表）から以下の情報をJSON形式で抽出してください:
{
  "exteriorFittings": [{"symbol": "記号", "model": "品番", "width": 幅(mm), "height": 高さ(mm), "quantity": 数量}],
  "interiorFittings": [{"symbol": "記号", "model": "品番", "width": 幅(mm), "height": 高さ(mm), "quantity": 数量}]
}`,

    electrical: `この建築図面（電気設備位置図）から以下の情報をJSON形式で抽出してください:
{
  "floor": "階数(1Fまたは2F)",
  "lightingCount": 照明器具の数,
  "outlet2Count": 一般コンセント2口の数,
  "aircon100vCount": エアコン100Vの数,
  "aircon200vCount": エアコン200Vの数,
  "tvCount": TVコンセントの数,
  "switchCount": スイッチの数,
  "threeWaySwitchCount": 3路スイッチの数,
  "airSupply24hCount": 24H換気給気の数,
  "airExhaust24hCount": 24H換気排気の数
}`,

    color: `この色合わせ表から以下の情報をJSON形式で抽出してください:
{
  "kitchenModel": "キッチン品番",
  "bathModel": "UB品番",
  "vanityModel": "洗面台品番",
  "toilet1FModel": "1階トイレ品番",
  "toilet2FModel": "2階トイレ品番",
  "waterHeaterModel": "給湯器品番",
  "roofMaterial": "屋根材",
  "wallMaterial": "外壁材",
  "tileMaterial": "タイル品番",
  "wallpaperModel": "クロス品番",
  "lightingFixtures": [{"model": "品番", "name": "名称", "quantity": 数量}]
}`,
  };

  return prompts[drawingType] || prompts.plan;
}

function getDemoData(drawingType: string): Record<string, any> {
  const demoData: Record<string, any> = {
    overview: {
      buildingName: 'モデルプランA — 木造2階建て',
      buildingType: 'プレミアム',
      structure: '木造軸組工法',
      floors: 2,
      siteArea: 198.35,
      buildingArea: 64.59,
      floorArea1F: 62.93,
      floorArea2F: 57.96,
      totalFloorArea: 120.89,
      constructionArea: 131.65,
    },
    plan: {
      floor: '1F',
      rooms: [
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
      closetShelfCount: 5,
      movableShelfCount: 3,
      counterCount: 2,
      entranceArea: 3.31,
      bathArea: 3.31,
      staircaseArea: 3.31,
      japaneseRoomCount: 1,
      japaneseRoomArea: 6.62,
      storageArea: 12.44,
    },
    elevation: {
      roofShape: 'gable',
      roofSlope: 4.5,
      eaveOverhang: 600,
      gabledOverhang: 450,
      buildingWidth: 10010,
      buildingDepth: 7280,
      gutterLength: 24.8,
      downspoutCount: 4,
      // 基本数量表対応
      exteriorWallPerimeter: 36.58,
      exteriorWallArea: 175.58,
      exteriorWallNetArea: 148.92,
      openingArea: 26.66,
      eaveHeight: 6490,
      roofArea: 86.32,
      ridgeLength: 4.28,
      eaveLength: 21.78,
      gabledLength: 16.36,
      soffitArea: 13.07,
      gableWallArea: 8.12,
    },
    electrical: {
      floor: '1F',
      lightingCount: 12,
      outlet2Count: 14,
      aircon100vCount: 2,
      aircon200vCount: 1,
      tvCount: 3,
      switchCount: 12,
      threeWaySwitchCount: 4,
      airSupply24hCount: 3,
      airExhaust24hCount: 2,
    },
    fitting: {
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
    },
    color: {
      kitchenModel: 'トレーシア I型2700',
      bathModel: 'SYNLA Gタイプ 1620',
      vanityModel: 'オクターブ 900',
      toilet1FModel: 'ネオレスト AH1',
      toilet2FModel: 'ネオレスト RS1',
      waterHeaterModel: 'エコキュート BHP-FV46TD',
      roofMaterial: 'コロニアルグラッサ',
      wallMaterial: 'シーサンドコート',
    },
  };
  return demoData[drawingType] || demoData.plan;
}
