/**
 * Robust CSV parser and writer
 * Supports quoted fields, escaped quotes, and preserves column order
 */

export function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });

  return { headers, rows };
}

export function writeCSV(headers, rows) {
  const csvLines = [];

  // Write headers
  csvLines.push(escapeCSVLine(headers));

  // Write rows
  rows.forEach(row => {
    const values = headers.map(header => row[header] || '');
    csvLines.push(escapeCSVLine(values));
  });

  return csvLines.join('\n') + '\n';
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

function escapeCSVLine(values) {
  return values.map(value => {
    const str = String(value);

    // If the value contains commas, quotes, or newlines, wrap in quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      // Escape quotes by doubling them
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    }

    return str;
  }).join(',');
}
