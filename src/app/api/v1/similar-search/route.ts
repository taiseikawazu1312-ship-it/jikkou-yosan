import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

interface SimilarSearchParams {
  totalFloorAreaTsubo: number;
  buildingType: string;
  structure: string;
  region: string;
  limit?: number;
}

interface ScoredEstimate {
  id: string;
  projectName: string;
  buildingType: string;
  structure: string;
  region: string;
  totalFloorAreaTsubo: number;
  totalAmount: number;
  tsuboUnitPrice: number;
  grade: string | null;
  completedAt: string;
  similarityScore: number;
}

function calculateSimilarity(
  estimate: any,
  params: SimilarSearchParams
): number {
  // 面積差 (30%) — 差が0なら1.0、差が20坪以上なら0
  const areaDiff = Math.abs(estimate.totalFloorAreaTsubo - params.totalFloorAreaTsubo);
  const areaScore = Math.max(0, 1 - areaDiff / 20);

  // タイプ一致 (25%)
  const typeScore = estimate.buildingType === params.buildingType ? 1.0 : 0.2;

  // 構造一致 (20%)
  const structureScore = estimate.structure === params.structure ? 1.0 : 0.1;

  // 地域一致 (15%)
  const regionScore = estimate.region === params.region ? 1.0 : 0.4;

  // 時期の近さ (10%) — 1年以内なら1.0、3年以上前なら0.3
  const now = new Date();
  const completed = new Date(estimate.completedAt);
  const monthsDiff = (now.getTime() - completed.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const timeScore = Math.max(0.3, 1 - monthsDiff / 36);

  return (
    areaScore * 0.30 +
    typeScore * 0.25 +
    structureScore * 0.20 +
    regionScore * 0.15 +
    timeScore * 0.10
  );
}

export async function POST(request: NextRequest) {
  try {
    const params: SimilarSearchParams = await request.json();
    const limit = params.limit || 10;

    const prisma = await getPrisma();
    const allEstimates = await prisma.historicalEstimate.findMany({
      orderBy: { completedAt: 'desc' },
    });

    // スコア計算 & ソート
    const scored: ScoredEstimate[] = allEstimates
      .map((e: any) => ({
        id: e.id,
        projectName: e.projectName,
        buildingType: e.buildingType,
        structure: e.structure,
        region: e.region,
        totalFloorAreaTsubo: e.totalFloorAreaTsubo,
        totalAmount: e.totalAmount,
        tsuboUnitPrice: e.tsuboUnitPrice,
        grade: e.grade,
        completedAt: e.completedAt.toISOString(),
        similarityScore: calculateSimilarity(e, params),
      }))
      .sort((a: ScoredEstimate, b: ScoredEstimate) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    // 推奨単価算出（IQR法で外れ値除外）
    const prices = scored.map((e: ScoredEstimate) => e.tsuboUnitPrice).sort((a: number, b: number) => a - b);
    const q1 = prices[Math.floor(prices.length * 0.25)] || 0;
    const q3 = prices[Math.floor(prices.length * 0.75)] || 0;
    const iqr = q3 - q1;
    const filtered = prices.filter((p: number) => p >= q1 - iqr * 1.5 && p <= q3 + iqr * 1.5);

    const recommended = {
      tsuboUnitPriceLow: filtered[0] || 0,
      tsuboUnitPriceMid: filtered[Math.floor(filtered.length / 2)] || 0,
      tsuboUnitPriceHigh: filtered[filtered.length - 1] || 0,
      sampleCount: scored.length,
      avgTsuboUnitPrice: filtered.length > 0 ? Math.round(filtered.reduce((s: number, p: number) => s + p, 0) / filtered.length) : 0,
    };

    return NextResponse.json({
      success: true,
      similarEstimates: scored,
      recommended,
    });
  } catch (error) {
    console.error('Similar search error:', error);
    return NextResponse.json({ success: false, error: '類似検索に失敗しました' }, { status: 500 });
  }
}
