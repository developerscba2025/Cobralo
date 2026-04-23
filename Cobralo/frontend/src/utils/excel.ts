import * as XLSX from 'xlsx';

/**
 * Premium Excel Export Utility
 * Handles structured exports for Students and Calendar with a professional layout.
 */

interface ExcelColumn {
    header: string;
    key: string;
    width?: number;
}

interface ExcelExportOptions {
    filename: string;
    sheetName: string;
    data: any[];
    columns: ExcelColumn[];
    summaryData?: any;
    title?: string;
}

export const exportToExcel = ({
    filename,
    sheetName,
    data,
    columns,
    summaryData,
    title
}: ExcelExportOptions) => {
    // 1. Prepare worksheet data
    const wsData: any[] = [];

    // Add Title if provided
    if (title) {
        wsData.push([title.toUpperCase()]);
        wsData.push([`Generado por Cobralo - ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`]);
        wsData.push([]); // Spacer
    }

    // Add Headers
    const headers = columns.map(col => col.header);
    wsData.push(headers);

    // Add Data Rows
    data.forEach(item => {
        const row = columns.map(col => item[col.key] ?? '');
        wsData.push(row);
    });

    // Add Summary Row if provided
    if (summaryData) {
        wsData.push([]); // Spacer
        wsData.push(['RESUMEN DE REPORTE']);
        Object.entries(summaryData).forEach(([label, value]) => {
            wsData.push([label, value]);
        });
    }

    // 2. Create Workbook and Sheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 3. Apply Column Widths
    const wscols = columns.map(col => ({ wch: col.width || 15 }));
    ws['!cols'] = wscols;

    // 4. Save File
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Formats currency for Excel display
 */
export const formatExcelCurrency = (value: number | string) => {
    const num = Number(value);
    return isNaN(num) ? value : `$ ${num.toLocaleString('es-AR')}`;
};

/**
 * Formats date for Excel display
 */
export const formatExcelDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('es-AR');
    } catch {
        return dateStr;
    }
};
