import { google } from 'googleapis';

// Helper function to detect month range
async function detectMonthRange(sheets, spreadsheetId) {
  const testRange = 'Categories By Month!M15:M50';
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: testRange,
  });

  const monthCells = response.data.values || [];
  const validMonths = [];

  for (let i = 0; i < monthCells.length; i++) {
    const cellValue = monthCells[i][0]?.trim();
    if (!cellValue ||
        cellValue.toLowerCase().includes('grand total') ||
        cellValue.toLowerCase() === 'total') {
      break;
    }
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(cellValue)) {
      validMonths.push({
        rowIndex: 15 + i,
        monthName: cellValue
      });
    }
  }

  if (validMonths.length < 1) {
    throw new Error('No valid months detected in spreadsheet');
  }

  return validMonths;
}

// Helper function to transform sheet data
function transformSheetData(rows, rawIncomeByRow = {}) {
  // Row 0 (row 13 in sheet): Category group headers
  // Row 1 (row 14 in sheet): Subcategory headers
  // Row 2+ (row 15+ in sheet): Month data

  const categoryHeaders = rows[0];
  const subcategoryHeaders = rows[1];
  const dataRows = rows.slice(2);

  // Parse month strings to extract year and create sortable dates
  function parseMonthString(monthStr) {
    const parts = monthStr.trim().split(/\s+/);
    const monthName = parts[0];
    const year = parts[1] ? parseInt(parts[1]) : new Date().getFullYear();

    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    const monthIndex = monthMap[monthName] ?? 0;
    return new Date(year, monthIndex, 1);
  }

  // Create array with parsed dates and income for sorting
  const monthsWithDates = dataRows.map((row, originalIndex) => {
    const monthName = row[0]?.trim();
    if (!monthName || monthName.toLowerCase().includes('total')) {
      return null;
    }
    return {
      row,
      monthName,
      date: parseMonthString(monthName),
      income: rawIncomeByRow[originalIndex] || 0  // Match income by original row index
    };
  }).filter(Boolean);

  // Sort chronologically (oldest first)
  monthsWithDates.sort((a, b) => a.date - b.date);

  // Extract sorted rows and income
  const sortedDataRows = monthsWithDates.map(m => m.row);
  const sortedIncome = monthsWithDates.map(m => m.income);

  // Build mapping of subcategories to their parent categories
  // Handle merged cells: track last non-empty category
  const categoryMap = {};
  let currentCategory = null;

  // Use Math.max to ensure we process all columns from both headers
  const maxCols = Math.max(categoryHeaders.length, subcategoryHeaders.length);

  for (let i = 1; i < maxCols; i++) {
    const cellCategory = categoryHeaders[i]?.trim();
    const subcategory = subcategoryHeaders[i]?.trim();

    // Skip if no subcategory (these are total columns or empty columns)
    if (!subcategory) {
      continue;
    }

    // Update current category if cell has a value (not merged/empty)
    if (cellCategory) {
      currentCategory = cellCategory;
      // Skip if this is a "Total" column
      if (currentCategory.toLowerCase().includes('total')) {
        continue;
      }
    }

    // Use current category for this subcategory
    if (currentCategory && subcategory) {
      // Skip Income category - it's not spending
      if (currentCategory === 'Income') {
        continue;
      }

      // Skip if category contains "Total"
      if (currentCategory.toLowerCase().includes('total')) {
        continue;
      }

      if (!categoryMap[currentCategory]) {
        categoryMap[currentCategory] = [];
      }
      if (!categoryMap[currentCategory].includes(subcategory)) {
        categoryMap[currentCategory].push(subcategory);
      }
    }
  }

  // Build month data
  const monthsData = [];
  const categorySubcategoryData = {};

  sortedDataRows.forEach((row, index) => {
    const monthName = row[0]?.trim();
    if (!monthName) return;

    // Skip Grand Total row
    if (monthName.toLowerCase().includes('grand total') || monthName.toLowerCase().includes('total')) {
      return;
    }

    const monthEntry = {
      month: monthName,
      income: sortedIncome[index] || 0  // Add income to month entry
    };

    // Initialize category totals for this month
    const categoryTotals = {};

    // Process each column - handle merged category cells
    let currentCategory = null;
    // Process all available columns (use max of row length and header lengths)
    const maxCols = Math.max(row.length, categoryHeaders.length, subcategoryHeaders.length);

    for (let i = 1; i < maxCols && i < row.length; i++) {
      const cellCategory = categoryHeaders[i]?.trim();
      const subcategory = subcategoryHeaders[i]?.trim();

      // Skip if no subcategory (these are total columns or empty columns)
      if (!subcategory) {
        continue;
      }

      // Remove commas before parsing (e.g., "-1,202" -> "-1202")
      const rawValue = parseFloat(String(row[i]).replace(/,/g, '')) || 0;

      // Update current category if cell has a value (not merged/empty)
      if (cellCategory) {
        currentCategory = cellCategory;
      }

      // Skip if current category contains "Total"
      if (currentCategory && currentCategory.toLowerCase().includes('total')) {
        continue;
      }

      // Skip positive values entirely (income, credits, refunds, etc.)
      if (rawValue > 0) {
        continue;
      }

      // Handle expenses: negative values in sheet become positive for display
      // Zero values are kept to maintain continuity in graphs
      const value = Math.abs(rawValue);

      if (currentCategory && subcategory) {
        // Skip Income category - it's not spending
        if (currentCategory === 'Income') {
          continue;
        }

        // Store subcategory data
        if (!categorySubcategoryData[currentCategory]) {
          categorySubcategoryData[currentCategory] = {};
        }
        if (!categorySubcategoryData[currentCategory][subcategory]) {
          categorySubcategoryData[currentCategory][subcategory] = [];
        }

        categorySubcategoryData[currentCategory][subcategory].push({
          month: monthName,
          value: value
        });

        // Add to category total for this month
        if (!categoryTotals[currentCategory]) {
          categoryTotals[currentCategory] = 0;
        }
        categoryTotals[currentCategory] += value;

        // Also add subcategory to month entry for easier access
        monthEntry[subcategory] = value;
      }
    }

    // Add category totals to month entry
    Object.keys(categoryTotals).forEach(cat => {
      monthEntry[cat] = categoryTotals[cat];
    });

    monthsData.push(monthEntry);
  });

  // Ensure all subcategories have data for all months (fill missing with 0)
  const allMonths = monthsData.map(m => m.month);
  Object.keys(categorySubcategoryData).forEach(category => {
    Object.keys(categorySubcategoryData[category]).forEach(subcategory => {
      const existingMonths = categorySubcategoryData[category][subcategory].map(d => d.month);
      allMonths.forEach(month => {
        if (!existingMonths.includes(month)) {
          categorySubcategoryData[category][subcategory].push({
            month: month,
            value: 0
          });
        }
      });
      // Sort by month order to maintain Jan → Dec sequence
      categorySubcategoryData[category][subcategory].sort((a, b) => {
        return allMonths.indexOf(a.month) - allMonths.indexOf(b.month);
      });
    });
  });

  return {
    months: monthsData,
    groupMap: categoryMap,
    categoryData: categorySubcategoryData
  };
}

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID;

    // Detect month range
    const monthsInfo = await detectMonthRange(sheets, spreadsheetId);

    if (monthsInfo.length === 0) {
      return res.status(404).json({ error: 'No valid month data found' });
    }

    const firstRow = monthsInfo[0].rowIndex;
    const lastRow = monthsInfo[monthsInfo.length - 1].rowIndex;

    // Fetch data from Google Sheets
    const range = `Categories By Month!M13:BL${lastRow}`;
    const incomeRange = `Categories By Month!AU${firstRow}:AU${lastRow}`;

    const [response, incomeResponse] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: incomeRange })
    ]);

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Parse income data
    const incomeData = incomeResponse.data.values || [];
    const rawIncomeByRow = {};

    incomeData.forEach((row, index) => {
      const rawValue = parseFloat(String(row[0]).replace(/,/g, '')) || 0;
      rawIncomeByRow[index] = Math.abs(rawValue);
    });

    // Transform data
    const transformedData = transformSheetData(rows, rawIncomeByRow);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Return data
    res.status(200).json(transformedData);

  } catch (error) {
    console.error('Error fetching data:', error);

    if (error.code === 429) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: error.response?.headers?.['retry-after']
      });
    } else {
      res.status(500).json({
        error: 'Failed to fetch data from Google Sheets'
      });
    }
  }
}
