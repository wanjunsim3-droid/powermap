const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelFilePath = path.join(__dirname, '힘찬 2026년 매물정리 에이치12 (1) (6) (1).xlsx');
const outputJsonPath = path.join(__dirname, 'public', 'properties.json');

if (!fs.existsSync(excelFilePath)) {
  console.error('Excel file not found!');
  process.exit(1);
}

const workbook = XLSX.readFile(excelFilePath);

function cleanNumber(val) {
  if (val === undefined || val === null) return 0;
  let str = String(val).trim().replace(/,/g, '');
  if (str === '-' || str === '' || str.toLowerCase() === 'none' || str.toLowerCase() === 'null') return 0;
  if (str.includes('~')) str = str.split('~')[0].trim();
  let cleanStr = str.replace(/[^0-9.]/g, '');
  let num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}

function cleanArea(val) {
  if (val === undefined || val === null) return 0;
  let str = String(val).trim().replace(/평/g, '').replace(/약/g, '');
  let num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function getMapUrl(sheet, r, c, val, address) {
  const cellAddress = XLSX.utils.encode_cell({ r, c });
  const cell = sheet[cellAddress];
  let url = '';
  if (cell && cell.l && cell.l.Target) {
    url = cell.l.Target;
  } else if (val) {
    url = String(val).trim();
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (address && address.trim() !== '') {
      const cleanAddr = address.replace(/\*공실/g, '').replace(/\*/g, '').trim();
      return `https://map.naver.com/p/search/${encodeURIComponent(cleanAddr)}`;
    }
    return '';
  }
  return url;
}

const allProperties = [];
let idCounter = 1;

workbook.SheetNames.forEach((sheetName) => {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (data.length === 0) return;

  if (sheetName === '26년') {
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[0]) continue;
      const address = String(row[0]).trim();
      allProperties.push({
        id: idCounter++,
        address,
        map_url: getMapUrl(sheet, i, 1, row[1], address),
        floor: row[2] ? String(row[2]).trim() : '',
        shop_name: row[3] ? String(row[3]).trim() : '',
        area: cleanArea(row[4]),
        deposit: cleanNumber(row[5]),
        rent: cleanNumber(row[6]),
        premium: cleanNumber(row[7]),
        maintenance: cleanNumber(row[8]),
        note: row[9] ? String(row[9]).trim() : '',
        sheet_name: sheetName
      });
    }
  }
  else if (sheetName === '11월27일') {
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[0]) continue;
      if (row[0] === '주소') continue;
      const address = String(row[0]).trim();
      allProperties.push({
        id: idCounter++,
        address,
        map_url: getMapUrl(sheet, i, 1, row[1], address),
        floor: row[2] ? String(row[2]).trim() : '',
        shop_name: '',
        area: cleanArea(row[3]),
        deposit: cleanNumber(row[4]),
        rent: cleanNumber(row[5]),
        premium: cleanNumber(row[6]),
        maintenance: cleanNumber(row[7]),
        note: row[8] ? String(row[8]).trim() : '',
        sheet_name: sheetName
      });
    }
  }
  else if (sheetName === 'Sheet1') {
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[0]) continue;
      const address = String(row[0]).trim();
      allProperties.push({
        id: idCounter++,
        address,
        map_url: getMapUrl(sheet, i, 1, row[1], address),
        floor: row[2] ? String(row[2]).trim() : '',
        shop_name: row[3] ? String(row[3]).trim() : '',
        area: cleanArea(row[4]),
        deposit: cleanNumber(row[5]),
        rent: cleanNumber(row[6]),
        premium: cleanNumber(row[7]),
        maintenance: cleanNumber(row[8]),
        note: row[9] ? String(row[9]).trim() : '',
        sheet_name: sheetName
      });
    }
  }
  else if (sheetName === 'Sheet2') {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[0]) continue;
      const address = String(row[0]).trim();
      allProperties.push({
        id: idCounter++,
        address,
        map_url: getMapUrl(sheet, i, 1, row[1], address),
        floor: row[2] ? String(row[2]).trim() : '',
        shop_name: row[3] ? String(row[3]).trim() : '',
        area: cleanArea(row[4]),
        deposit: cleanNumber(row[5]),
        rent: cleanNumber(row[6]),
        premium: cleanNumber(row[7]),
        maintenance: cleanNumber(row[8]),
        note: row[9] ? String(row[9]).trim() : '',
        sheet_name: sheetName
      });
    }
  }
});

fs.writeFileSync(outputJsonPath, JSON.stringify(allProperties, null, 2), 'utf-8');
console.log(`Generated public/properties.json with ${allProperties.length} items.`);
