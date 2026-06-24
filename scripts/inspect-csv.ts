import fs from 'fs';
import csv from 'csv-parser';

async function main() {
  const results: any[] = [];
  let rowCount = 0;

  fs.createReadStream('attendancesheetkamahan.csv')
    .pipe(csv({ headers: Array.from({ length: 1000 }, (_, i) => String(i)) }))
    .on('data', (data) => {
      if (!data['0'] || data['0'].trim() === '') return;
      
      if (rowCount < 5) {
        results.push(data);
      }
      rowCount++;
    })
    .on('end', () => {
      const headerRow = results.find(r => r['0'] === 'campus_name');
      const dataRow = results.find(r => r['0'] !== 'campus_name');

      if (!headerRow) return;

      console.log('--- Date Column Mapping ---');
      for (const key in headerRow) {
        const header = headerRow[key];
        const val = dataRow ? dataRow[key] : '';
        // If the header looks like a date or has a value in the data row
        if (header && parseInt(key) > 40) {
          console.log(`Index ${key}: [HEADER] ${header} | [DATA] ${val}`);
        }
      }
    });
}

main();
