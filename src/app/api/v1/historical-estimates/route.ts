import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = await getPrisma();
    const estimates = await prisma.historicalEstimate.findMany({
      orderBy: { completedAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, data: estimates });
  } catch (error) {
    console.error('Historical estimates error:', error);
    return NextResponse.json({ success: false, error: 'データ取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prisma = await getPrisma();

    // 一括インポート
    if (Array.isArray(body.items)) {
      const created = [];
      for (const item of body.items) {
        const record = await prisma.historicalEstimate.create({
          data: {
            companyId: item.companyId || 'company-demo-001',
            projectName: item.projectName,
            customerName: item.customerName || null,
            buildingType: item.buildingType,
            structure: item.structure,
            region: item.region,
            totalFloorAreaTsubo: item.totalFloorAreaTsubo,
            totalAmount: item.totalAmount,
            bodyAmount: item.bodyAmount || null,
            tsuboUnitPrice: item.tsuboUnitPrice,
            grade: item.grade || null,
            items: item.items ? JSON.stringify(item.items) : null,
            completedAt: new Date(item.completedAt),
          },
        });
        created.push(record);
      }
      return NextResponse.json({ success: true, count: created.length });
    }

    return NextResponse.json({ success: false, error: 'items配列が必要です' }, { status: 400 });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ success: false, error: 'インポートに失敗しました' }, { status: 500 });
  }
}
