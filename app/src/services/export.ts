// src/services/ExportService.ts
import { createObjectCsvStringifier } from 'csv-writer';
import puppeteer from 'puppeteer';

export interface StatisticsData {
    name: string;
    value: number;
    timestamp: Date; 
}

export interface ClusteringData {
    name: string;
    value: number;
    timestamp: Date; 
}

export interface ValidatedReportData {
    name: string;
    value: number;
    timestamp: Date;
}

type DataItem = StatisticsData | ClusteringData | ValidatedReportData;


export class ExportService {
    private data: DataItem[];

    constructor(data: DataItem[]) {
        this.data = data;
    }

    async generateJson(): Promise<Buffer> {
        return Buffer.from(JSON.stringify(this.data, null, 2), 'utf-8');
    }

    async generateCsv(): Promise<Buffer> {
        if (Object.keys(this.data).length === 0) {
            throw new Error('No data available for CSV export');
        }
    
        // Trasformare i dati in un array di oggetti
        const formattedData: any[] = [];
        for (const [category, subCategories] of Object.entries(this.data)) {
            for (const [subCategory, counts] of Object.entries(subCategories)) {
                formattedData.push({
                    category,
                    subCategory,
                    ...counts
                });
            }
        }
    
        const csvStringifier = createObjectCsvStringifier({
            header: Object.keys(formattedData[0] || {}).map(key => ({ id: key, title: key.toUpperCase() }))
        });
    
        const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedData);
        return Buffer.from(csv, 'utf-8');
    }
    
    async generatePdf(): Promise<Buffer> {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
        try {
            const page = await browser.newPage();
    
            // Trasformare i dati in una forma tabellare
            let htmlRows = '';
            for (const [category, subCategories] of Object.entries(this.data)) {
                for (const [subCategory, counts] of Object.entries(subCategories)) {
                    htmlRows += `<tr>
                        <td>${category}</td>
                        <td>${subCategory}</td>
                        <td>${counts.PENDING}</td>
                        <td>${counts.REJECTED}</td>
                        <td>${counts.VALIDATED}</td>
                    </tr>`;
                }
            }
    
            const html = `
                <html>
                <head>
                    <style>
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    </style>
                </head>
                <body>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Sub-Category</th>
                                <th>PENDING</th>
                                <th>REJECTED</th>
                                <th>VALIDATED</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${htmlRows}
                        </tbody>
                    </table>
                </body>
                </html>
            `;
    
            await page.setContent(html);
            const pdfBuffer = await page.pdf();
            return pdfBuffer;
        } finally {
            await browser.close();
        }
    }
    
}

export default ExportService;