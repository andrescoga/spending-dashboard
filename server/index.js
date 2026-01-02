import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Endpoint to fetch spending data
app.get('/api/spending-data', async (req, res) => {
  try {
    const spreadsheetId = process.env.SHEET_ID;
    // Fetch from column M, rows 13-26 (categories, subcategories, and 12 months)
    // Row 13: Category headers, Row 14: Subcategory headers, Rows 15-26: Monthly data
    const range = 'Categories By Month!M13:BL26';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Debug: Log what we received
    console.log(`📊 Fetched ${rows.length} rows`);
    console.log(`📊 Row 0 (categories) has ${rows[0].length} columns`);
    console.log(`📊 Row 1 (subcategories) has ${rows[1].length} columns`);
    console.log(`📊 First 10 category headers:`, rows[0].slice(0, 10));
    console.log(`📊 First 10 subcategory headers:`, rows[1].slice(0, 10));

    // Log December and October row data for debugging
    const decRow = rows.find(r => r[0]?.includes('Dec'));
    const octRow = rows.find(r => r[0]?.includes('Oct'));

    if (decRow) {
      console.log(`\n📊 December row has ${decRow.length} columns`);
      console.log(`📊 First 20 December values:`, decRow.slice(0, 20).map((v, i) => `[${i}]=${v}`));
    }

    if (octRow) {
      console.log(`\n📊 October row has ${octRow.length} columns`);
      console.log(`📊 Columns 7-13 (Food & Dining area):`, octRow.slice(7, 14).map((v, i) => `[${i+7}]=${v}`));
    }

    // Check which columns will be processed
    console.log(`\n📊 Category/Subcategory header analysis:`);
    for (let i = 0; i < 20; i++) {
      const cat = rows[0][i]?.trim() || '(empty)';
      const subcat = rows[1][i]?.trim() || '(empty)';
      console.log(`  Col ${i}: Cat="${cat}" | Subcat="${subcat}"`);
    }

    // Transform the data to match the app's expected format
    const transformedData = transformSheetData(rows);

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
  }
});

// Transform sheet data into the format the app expects
function transformSheetData(rows) {
  // Row 0 (row 13 in sheet): Category group headers
  // Row 1 (row 14 in sheet): Subcategory headers
  // Row 2+ (row 15+ in sheet): Month data

  const categoryHeaders = rows[0];
  const subcategoryHeaders = rows[1];
  const dataRows = rows.slice(2).reverse(); // Reverse to get Jan → Dec order

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

  dataRows.forEach((row) => {
    const monthName = row[0]?.trim();
    if (!monthName) return;

    // Skip Grand Total row
    if (monthName.toLowerCase().includes('grand total') || monthName.toLowerCase().includes('total')) {
      return;
    }

    const monthEntry = { month: monthName };

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

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Ready to fetch data from Google Sheets`);
});
