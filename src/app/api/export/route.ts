import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project, items, totalAmount, tsuboUnitPrice, sqmUnitPrice } = body;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('実行予算書', {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    });

    // ===== ヘッダー =====
    sheet.mergeCells('A1:K1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '拾い出し成果物';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // プロジェクト情報
    sheet.getCell('A3').value = '工事コード';
    sheet.getCell('B3').value = project.code;
    sheet.getCell('A4').value = '工事名';
    sheet.getCell('B4').value = project.name;
    sheet.getCell('A5').value = '建物タイプ';
    sheet.getCell('B5').value = project.buildingType === 'toku_value' ? 'とくバリュー' : project.buildingType === 'value' ? 'バリュー' : 'プレミアム';

    sheet.getCell('E3').value = '1F床面積';
    sheet.getCell('F3').value = `${project.floorArea1F}㎡ (${project.floorAreaTsubo1F}坪)`;
    sheet.getCell('E4').value = '2F床面積';
    sheet.getCell('F4').value = `${project.floorArea2F}㎡ (${project.floorAreaTsubo2F}坪)`;
    sheet.getCell('E5').value = '延床面積';
    sheet.getCell('F5').value = `${project.totalFloorArea}㎡ (${project.totalFloorAreaTsubo}坪)`;

    // スタイル適用
    for (let r = 3; r <= 5; r++) {
      ['A', 'E'].forEach(c => {
        const cell = sheet.getCell(`${c}${r}`);
        cell.font = { bold: true, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } };
      });
    }

    // ===== 明細ヘッダー =====
    const headerRow = 7;
    const headers = [
      { key: 'workCategory', header: '工事種別', width: 12 },
      { key: 'detailName', header: '細目工種名', width: 20 },
      { key: 'vendor', header: '業者名', width: 14 },
      { key: 'spec', header: '部材/仕様', width: 20 },
      { key: 'unitPrice', header: '単価', width: 10 },
      { key: 'quantity', header: '数量', width: 8 },
      { key: 'unit', header: '単位', width: 6 },
      { key: 'detailAmount', header: '明細金額', width: 12 },
      { key: 'categoryAmount', header: '工種小計', width: 12 },
      { key: 'remarks', header: '備考', width: 16 },
      { key: 'orderType', header: '発注区分', width: 8 },
    ];

    headers.forEach((h, i) => {
      const col = String.fromCharCode(65 + i);
      const cell = sheet.getCell(`${col}${headerRow}`);
      cell.value = h.header;
      cell.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      sheet.getColumn(i + 1).width = h.width;
    });

    // ===== 明細データ =====
    let currentRow = headerRow + 1;
    let prevCategory = '';

    items.forEach((item: any, index: number) => {
      const row = sheet.getRow(currentRow);

      // 工事種別が変わった場合のみ表示
      const showCategory = item.workCategory !== prevCategory;
      prevCategory = item.workCategory;

      row.getCell(1).value = showCategory ? item.workCategory : '';
      row.getCell(2).value = item.detailName;
      row.getCell(3).value = item.vendor;
      row.getCell(4).value = item.spec;
      row.getCell(5).value = item.unitPrice;
      row.getCell(6).value = item.quantity;
      row.getCell(7).value = item.unit;
      row.getCell(8).value = item.detailAmount;
      row.getCell(9).value = item.categoryAmount || '';
      row.getCell(10).value = item.remarks;
      row.getCell(11).value = item.orderType;

      // スタイル
      for (let c = 1; c <= 11; c++) {
        const cell = row.getCell(c);
        cell.font = { size: 9 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        };
        if (currentRow % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
        }
      }

      // 数値フォーマット
      row.getCell(5).numFmt = '#,##0';
      row.getCell(6).numFmt = '#,##0.00';
      row.getCell(8).numFmt = '#,##0';
      if (item.categoryAmount) {
        row.getCell(9).numFmt = '#,##0';
        row.getCell(9).font = { size: 9, bold: true };
      }

      // カテゴリ表示行
      if (showCategory) {
        row.getCell(1).font = { size: 9, bold: true };
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } };
      }

      currentRow++;
    });

    // ===== 合計行 =====
    currentRow++;
    const totalRow = sheet.getRow(currentRow);
    sheet.mergeCells(`A${currentRow}:G${currentRow}`);
    totalRow.getCell(1).value = '実行予算合計';
    totalRow.getCell(1).font = { size: 12, bold: true };
    totalRow.getCell(1).alignment = { horizontal: 'right' };
    totalRow.getCell(8).value = totalAmount;
    totalRow.getCell(8).numFmt = '#,##0';
    totalRow.getCell(8).font = { size: 12, bold: true };
    for (let c = 1; c <= 11; c++) {
      totalRow.getCell(c).border = {
        top: { style: 'double' },
        bottom: { style: 'double' },
      };
      totalRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
    }

    // 単価情報
    currentRow += 2;
    sheet.getCell(`A${currentRow}`).value = '坪単価';
    sheet.getCell(`B${currentRow}`).value = tsuboUnitPrice;
    sheet.getCell(`B${currentRow}`).numFmt = '#,##0';
    sheet.getCell(`C${currentRow}`).value = '円/坪';
    sheet.getCell(`A${currentRow}`).font = { bold: true };

    currentRow++;
    sheet.getCell(`A${currentRow}`).value = '㎡単価';
    sheet.getCell(`B${currentRow}`).value = sqmUnitPrice;
    sheet.getCell(`B${currentRow}`).numFmt = '#,##0';
    sheet.getCell(`C${currentRow}`).value = '円/㎡';
    sheet.getCell(`A${currentRow}`).font = { bold: true };

    // バッファに書き出し
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(project.name || '実行予算書')}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Excel出力に失敗しました' }, { status: 500 });
  }
}
