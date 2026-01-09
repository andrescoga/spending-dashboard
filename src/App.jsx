import React, { useMemo, useState, useCallback, useEffect } from "react";
import { API_BASE_URL, API_ENDPOINT } from './config';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Helper function to transform category data from API format to app format
// API format: { group: { category: [{month, value}] } }
// App format: [{ month, category1, category2, ... }]
function transformCategoryData(categoryDataForGroup) {
  if (!categoryDataForGroup) return [];

  const monthMap = {};

  // Iterate through each category
  Object.entries(categoryDataForGroup).forEach(([category, dataPoints]) => {
    dataPoints.forEach(({ month, value }) => {
      if (!monthMap[month]) {
        monthMap[month] = { month };
      }
      monthMap[month][category] = value;
    });
  });

  // Convert to array and maintain chronological order
  return Object.values(monthMap);
}

// Main category data (NET spending - chronological order)

// NOTE: All data is now fetched dynamically from Google Sheets API
// No hardcoded data constants needed


const PALETTE = ["#ff6b6b", "rgba(255,255,255,0.95)", "#ffe66d", "#95e1d3", "#f38181", "#aa96da", "#fcbad3", "#a8d8ea", "#f9c74f", "#90be6d", "#e17055", "#577590"];

// Fixed colors for each spending group
const GROUP_COLORS = {
  "Food & Dining": "#C03221",
  "Transportation": "#2B50AA",
  "Home": "#E2B007",
  "Giving": "#1B4332",
  "Shopping": "#F4A261",
  "Subscriptions": "#F1E9DB",
  "Health": "#5D737E",
  "Travel": "#8B4513",
  "Financial": "#8E7C93",
  "Fun": "#262626"
};

const FOOD_PALETTE = { "Bars": "#f38181", "Cafes": "#f9c74f", "Groceries": "#90be6d", "Restaurants": "#ff6b6b", "Takeout & Delivery": "rgba(255,255,255,0.95)" };
const FUN_PALETTE = { "Activities & Attractions": "#aa96da", "Books, Movies & Music": "rgba(255,255,255,0.95)", "Live Events": "#ff6b6b" };
const GIVING_PALETTE = { "Charity": "#90be6d", "Family Care": "#ff6b6b", "Gifts": "#f9c74f" };
const HEALTH_PALETTE = { "Fitness": "rgba(255,255,255,0.95)", "Healthcare & Pharmacy": "#ff6b6b", "Personal Care": "#f9c74f" };
const HOME_PALETTE = { "Home Improvement": "#aa96da", "Laundry & Dry Cleaning": "#f9c74f", "Rent & Insurance": "#ff6b6b", "Utilities": "rgba(255,255,255,0.95)" };
const SHOPPING_PALETTE = { "Clothing": "#aa96da", "Hobbies": "rgba(255,255,255,0.95)", "Various": "#f9c74f" };
const FINANCIAL_PALETTE = { "Fees & Admin": "#f38181", "Financial Fees": "#aa96da", "Interest Charged": "#ff6b6b", "Membership Fees": "rgba(255,255,255,0.95)", "Taxes": "#90be6d" };
const TRANSPORTATION_PALETTE = { "Public Transportation": "#90be6d", "Ride Share": "rgba(255,255,255,0.95)" };
const TRAVEL_PALETTE = { "Air Travel": "#aa96da", "Hotels": "#ff6b6b" };
const SUBSCRIPTIONS_PALETTE = { "AI Services": "#ff6b6b", "Courses & Classes": "#aa96da", "Newspapers & Magazines": "#f9c74f", "Streaming Services": "rgba(255,255,255,0.95)", "Tech & Memberships": "#95e1d3" };

// ============ DESIGN SYSTEM CONSTANTS ============

// Typography Scale
const FONT_SIZE = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
};

// Spacing Scale (4px base)
const SPACING = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  '4xl': 18,
  '5xl': 22,
  '6xl': 24,
  '7xl': 28,
};

// Border Radius Scale
const RADIUS = {
  sm: 2,
  base: 3,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  '4xl': 20,
  full: 999,
};

// Chart Dimensions
const CHART = {
  height: {
    default: 380,
    large: 420,
    compact: 260,
  },
  margin: {
    default: { top: 10, right: 22, left: 6, bottom: 8 },
  },
  maxBarSize: {
    default: 32,
    large: 36,
  },
  xAxisHeight: 60,
};

// Color System
const COLORS = {
  // Base colors
  white: '#fff',
  black: '#000',

  // Gray scale
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#999',
    600: '#888',
    700: '#777',
    800: '#666',
    900: '#333',
  },

  // Accent colors (from PALETTE)
  accent: {
    red: '#ff6b6b',
    teal: 'rgba(255,255,255,0.95)',
    yellow: '#ffe66d',
    mint: '#95e1d3',
    pink: '#f38181',
    purple: '#aa96da',
    lightPink: '#fcbad3',
    blue: '#a8d8ea',
    gold: '#f9c74f',
    green: '#90be6d',
    orange: '#e17055',
    navy: '#577590',
  },

  // Background gradients
  background: {
    primary: 'linear-gradient(145deg, #0d0d12 0%, #1a1a24 100%)',
    dark: '#0d0d12',
    darker: '#1a1a24',
  },

  // Semantic colors
  semantic: {
    success: '#90be6d',
    warning: '#ff6b6b',
    info: 'rgba(255,255,255,0.95)',
  },
};

// Opacity values for consistent transparency
const OPACITY = {
  surface: {
    level0: 0.02,
    level1: 0.03,
    level2: 0.04,
    level3: 0.05,
    level4: 0.08,
  },
  border: {
    subtle: 0.05,
    default: 0.08,
    medium: 0.10,
    emphasis: 0.15,
    strong: 0.18,
    accent: 0.22,
  },
  fill: {
    subtle: 0.08,
    default: 0.12,
    medium: 0.15,
    strong: 0.18,
  },
  chart: {
    area: 0.18,
    default: 0.95,
    dimmed: 0.70,
  },
};

// Chart configuration helpers
const CHART_STYLES = {
  grid: { stroke: `rgba(255,255,255,${OPACITY.surface.level3})`, vertical: false },
  xAxis: {
    tick: { fill: COLORS.gray[600], fontSize: FONT_SIZE.xs },
    axisLine: false,
    tickLine: false,
    angle: -45,
    textAnchor: 'end',
    height: CHART.xAxisHeight,
  },
  yAxis: {
    tick: { fill: COLORS.gray[800], fontSize: FONT_SIZE.sm },
    axisLine: false,
    tickLine: false,
  },
  legend: {
    wrapperStyle: { color: COLORS.gray[500], fontSize: FONT_SIZE.sm },
  },
  tooltip: {
    background: 'rgba(24,24,32,0.96)',
    border: `1px solid rgba(255,255,255,${OPACITY.border.default})`,
    borderRadius: RADIUS['2xl'],
    padding: `${SPACING['2xl']}px ${SPACING['4xl']}px`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
  },
};

// Analysis thresholds
const THRESHOLDS = {
  spikeMultiplier: 1.4, // Months with spending > 1.4x median flagged as spikes
  topCategories: {
    min: 3,
    max: 10,
    default: 8,
  },
};

// Calculated insights helpers (to replace hardcoded values)
const INSIGHTS = {
  calculateActualRent: (homeData, monthCount) => {
    const rentTotal = homeData.reduce((sum, m) => sum + (m['Rent & Insurance'] || 0), 0);
    const avgRent = monthCount > 0 ? rentTotal / monthCount : 0;
    return avgRent;
  },
  calculateInterestPaid: (financialData) => {
    return financialData.reduce((sum, m) => sum + (m['Interest Charged'] || 0), 0);
  },
  calculateCategoryPercentage: (categoryTotal, grandTotal) => {
    return grandTotal > 0 ? ((categoryTotal / grandTotal) * 100).toFixed(1) : '0.0';
  },
  findPeakMonth: (data, subcategory) => {
    let maxValue = 0;
    let maxMonth = '';
    data.forEach(m => {
      const value = m[subcategory] || 0;
      if (value > maxValue) {
        maxValue = value;
        maxMonth = m.month;
      }
    });
    return { month: maxMonth, value: maxValue };
  },
  findLowestMonth: (data, subcategory) => {
    let minValue = Infinity;
    let minMonth = '';
    data.forEach(m => {
      const value = m[subcategory] || 0;
      if (value > 0 && value < minValue) {
        minValue = value;
        minMonth = m.month;
      }
    });
    return minValue === Infinity ? { month: '', value: 0 } : { month: minMonth, value: minValue };
  },
  calculateAverage: (data, subcategory) => {
    const total = data.reduce((sum, m) => sum + (m[subcategory] || 0), 0);
    return data.length > 0 ? total / data.length : 0;
  }
};

// Date utilities for parsing and extracting year ranges
const DATE_UTILS = {
  parseMonth: (monthStr) => {
    const parts = monthStr.trim().split(/\s+/);
    const monthName = parts[0];
    const year = parts[1] ? parseInt(parts[1]) : new Date().getFullYear();

    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    return { year, month: monthMap[monthName] ?? 0, monthName };
  },

  getDateRange: (monthsData) => {
    if (!monthsData || monthsData.length === 0) {
      return { startYear: null, endYear: null, yearLabel: '', monthCount: 0 };
    }

    const years = monthsData.map(m => DATE_UTILS.parseMonth(m.month).year);
    const startYear = Math.min(...years);
    const endYear = Math.max(...years);
    const monthCount = monthsData.length;

    const yearLabel = startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`;

    return { startYear, endYear, yearLabel, monthCount };
  }
};

// Helper to get last 12 months excluding the most recent month
function getLast12MonthsExcludingCurrent(monthsData) {
  if (!monthsData || monthsData.length < 2) return monthsData;

  // Exclude the last month, then take the previous 12 months
  const withoutCurrent = monthsData.slice(0, -1);  // Remove last month
  const last12 = withoutCurrent.slice(-12);         // Take last 12 of remaining

  return last12;
}

// Helper to get last 6 months excluding the most recent month
function getLast6MonthsExcludingCurrent(monthsData) {
  if (!monthsData || monthsData.length < 2) return monthsData;

  // Exclude the last month, then take the previous 6 months
  const withoutCurrent = monthsData.slice(0, -1);  // Remove last month
  const last6 = withoutCurrent.slice(-6);           // Take last 6 of remaining

  return last6;
}

// Helper to get last 3 months excluding the most recent month
function getLast3MonthsExcludingCurrent(monthsData) {
  if (!monthsData || monthsData.length < 2) return monthsData;

  // Exclude the last month, then take the previous 3 months
  const withoutCurrent = monthsData.slice(0, -1);  // Remove last month
  const last3 = withoutCurrent.slice(-3);           // Take last 3 of remaining

  return last3;
}

// Accessibility labels
const A11Y = {
  chartLabels: {
    barChart: (title) => `Bar chart showing ${title} by month`,
    lineChart: (title) => `Line chart showing ${title} trends over time`,
    areaChart: (title) => `Area chart showing ${title} trend`,
  },
  navigation: 'Main category navigation',
  tabPanel: (category) => `${category} spending details`,
  controlPanel: 'Chart display controls',
};

// ============ BUDGET HELPER FUNCTIONS ============

// Calculate actual YTD average for a group
const calculateActualAverage = (group, categoryData, monthsData) => {
  const groupData = categoryData[group] || [];
  const total = groupData.reduce((sum, month) => {
    return sum + Object.values(month)
      .filter(v => typeof v === 'number')
      .reduce((s, v) => s + v, 0);
  }, 0);
  return monthsData.length > 0 ? total / monthsData.length : 0;
};

// Get budget status and color based on actual vs target
const getBudgetStatus = (actual, target) => {
  if (!target || target === 0) return { status: "not-set", color: "#888" };
  const diff = target - actual;
  const percentDiff = (diff / target) * 100;

  if (percentDiff > 5) return { status: "under", color: "#90be6d" };
  if (percentDiff < -5) return { status: "over", color: "#ff6b6b" };
  return { status: "on-track", color: "rgba(255,255,255,0.95)" };
};

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1400
};

// Media query hook for responsive design
function useMediaQuery(maxWidth) {
  const [matches, setMatches] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= maxWidth : false
  );

  React.useEffect(() => {
    const query = `(max-width: ${maxWidth}px)`;
    const media = window.matchMedia(query);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [maxWidth]);

  return matches;
}

// Responsive chart heights
const CHART_HEIGHT_MOBILE = 260;
const CHART_HEIGHT_TABLET = 320;
const CHART_HEIGHT_DESKTOP = 380;

function formatCurrency(n) {
  if (Number.isNaN(n) || n === null || n === undefined) return "$0";
  const abs = Math.abs(n);
  const v = abs >= 1000 ? Math.round(abs) : Math.round(abs * 10) / 10;
  return `$${v.toLocaleString("en-US")}`;
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// ============ REUSABLE CHART COMPONENTS ============

const CategoryBarChart = React.memo(({ data, subcats, palette, viewMode, selectedMonth, onMonthSelect }) => {
  const [localSelectedMonth, setLocalSelectedMonth] = useState(null);
  const currentMonth = selectedMonth !== undefined ? selectedMonth : localSelectedMonth;
  const handleMonthSelect = onMonthSelect || setLocalSelectedMonth;

  // Guard: Don't render if data is empty or invalid
  if (!data || data.length === 0) {
    return (
      <div style={{ width: "100%", height: CHART.height.default, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.gray[600] }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: CHART.height.default }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={CHART.margin.default}
          aria-label={A11Y.chartLabels.barChart('category spending')}
        >
          <CartesianGrid {...CHART_STYLES.grid} />
          <XAxis dataKey="month" {...CHART_STYLES.xAxis} />
          <YAxis
            {...CHART_STYLES.yAxis}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<TooltipBox />} />
          <Legend {...CHART_STYLES.legend} />
          {subcats.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={viewMode === "stacked" ? "a" : undefined}
              fill={palette[key]}
              radius={viewMode === "stacked" ? [RADIUS.sm, RADIUS.sm, 0, 0] : RADIUS.sm}
              maxBarSize={CHART.maxBarSize.default}
              opacity={key === "Other" ? OPACITY.chart.dimmed : OPACITY.chart.default}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {/* Data grid for mobile */}
      <DataGrid data={data} colorMap={(key) => palette[key]} selectedMonth={currentMonth} onMonthSelect={handleMonthSelect} />
    </div>
  );
});
CategoryBarChart.displayName = 'CategoryBarChart';

const CategoryLineChart = React.memo(({ data, subcats, palette }) => {
  // Guard: Don't render if data is empty or invalid
  if (!data || data.length === 0) {
    return (
      <div style={{ width: "100%", height: CHART.height.default, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.gray[600] }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: CHART.height.default }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={CHART.margin.default}
          aria-label={A11Y.chartLabels.lineChart('category spending')}
        >
          <CartesianGrid {...CHART_STYLES.grid} />
          <XAxis dataKey="month" {...CHART_STYLES.xAxis} />
          <YAxis
            {...CHART_STYLES.yAxis}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<TooltipBox />} />
          <Legend {...CHART_STYLES.legend} />
          {subcats.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={palette[key]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
CategoryLineChart.displayName = 'CategoryLineChart';

// ============ INSIGHT UI COMPONENTS ============

const InsightRow = React.memo(({ label, value }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: `${SPACING.md}px 0`,
        borderBottom: `1px solid rgba(255,255,255,${OPACITY.surface.level3})`
      }}
    >
      <span style={{ color: COLORS.gray[400], fontSize: FONT_SIZE.md }}>{label}</span>
      <span style={{ color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: 700 }}>{value}</span>
    </div>
  );
});
InsightRow.displayName = 'InsightRow';

const InsightSection = React.memo(({ title, color, children }) => {
  return (
    <div>
      <div
        style={{
          color: color,
          fontSize: FONT_SIZE.base,
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: SPACING.md
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
});
InsightSection.displayName = 'InsightSection';

const HighlightBox = React.memo(({ title, value, subtext, color }) => {
  const bgColor = color === COLORS.accent.red
    ? `rgba(255,107,107,${OPACITY.fill.subtle})`
    : `rgba(170,150,218,${OPACITY.fill.subtle})`;
  const borderColor = color === COLORS.accent.red
    ? `rgba(255,107,107,${OPACITY.border.medium})`
    : `rgba(170,150,218,${OPACITY.border.medium})`;

  return (
    <div
      style={{
        padding: SPACING['3xl'],
        borderRadius: RADIUS.xl,
        background: bgColor,
        border: `1px solid ${borderColor}`
      }}
    >
      <div
        style={{
          color: color,
          fontSize: FONT_SIZE.base,
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: SPACING.md
        }}
      >
        {title}
      </div>
      <div style={{ color: COLORS.white, fontSize: FONT_SIZE['3xl'], fontWeight: 800 }}>
        {value}
      </div>
      <div style={{ color: COLORS.gray[600], fontSize: FONT_SIZE.base, marginTop: SPACING.xs }}>
        {subtext}
      </div>
    </div>
  );
});
HighlightBox.displayName = 'HighlightBox';

const SubcategorySummaryCard = React.memo(({ total, percentage, avgMonthly, color }) => {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: SPACING.lg, marginBottom: SPACING.md }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: RADIUS.base,
            background: color
          }}
          aria-hidden="true"
        />
        <span style={{ color: COLORS.white, fontSize: FONT_SIZE['2xl'], fontWeight: 800 }}>
          {formatCurrency(total)}
        </span>
      </div>
      <div style={{ color: COLORS.gray[800], fontSize: FONT_SIZE.sm }}>
        {percentage}% of total
      </div>
      <div style={{ color: COLORS.gray[600], fontSize: FONT_SIZE.sm, marginTop: SPACING.xs }}>
        Avg: {formatCurrency(avgMonthly)}/mo
      </div>
    </div>
  );
});
SubcategorySummaryCard.displayName = 'SubcategorySummaryCard';

// Helper function to compute insights for a category
function computeCategoryInsights(data, subcats, insightConfig) {
  if (!data || data.length === 0) return [];

  const totals = {};
  subcats.forEach(c => totals[c] = 0);
  data.forEach(m => subcats.forEach(c => totals[c] += m[c] || 0));
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  return insightConfig.map(config => {
    if (config.type === 'percentage') {
      const percent = INSIGHTS.calculateCategoryPercentage(totals[config.subcat], grandTotal);
      return { label: config.label, value: `${percent}%` };
    }
    if (config.type === 'peak') {
      const peak = INSIGHTS.findPeakMonth(data, config.subcat);
      return { label: config.label, value: peak.month ? `${peak.month} (${formatCurrency(peak.value)})` : 'N/A' };
    }
    if (config.type === 'average') {
      const avg = INSIGHTS.calculateAverage(data, config.subcat);
      return { label: config.label, value: `~${formatCurrency(avg)}/mo` };
    }
    if (config.type === 'total') {
      return { label: config.label, value: formatCurrency(totals[config.subcat]) };
    }
    return config; // Return as-is if no type specified (custom insight)
  });
}

// ============ GENERIC CATEGORY TAB ============
function CategoryTab({ title, data, subcats, palette, insights }) {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);

  // Optimized: Calculate all metrics in a single pass through the data
  const { totals, monthlyTotals, avgMonthly, grandTotal, topMonths } = useMemo(() => {
    const t = {};
    subcats.forEach(c => t[c] = 0);

    const monthly = data.map(m => {
      let monthTotal = 0;
      subcats.forEach(c => {
        const val = m[c] || 0;
        t[c] += val;
        monthTotal += val;
      });
      return { month: m.month, total: monthTotal };
    });

    const grand = Object.values(t).reduce((a, b) => a + b, 0);
    const avg = monthly.length > 0 ? monthly.reduce((s, m) => s + m.total, 0) / monthly.length : 0;
    const top = [...monthly].sort((a, b) => b.total - a.total).slice(0, 3);

    return {
      totals: t,
      monthlyTotals: monthly,
      avgMonthly: avg,
      grandTotal: grand,
      topMonths: top
    };
  }, [data, subcats]);

  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: SPACING['4xl'],
        marginBottom: SPACING['5xl']
      }}>
        <Panel title={`${title} by Month`} subtitle="NET spending by subcategory">
          <CategoryBarChart data={data} subcats={subcats} palette={palette} viewMode="stacked" />
        </Panel>
      </div>
      <div style={{
        marginTop: SPACING['4xl'],
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : `repeat(auto-fit, minmax(200px, 1fr))`,
        gap: SPACING['2xl']
      }}>
        {subcats.map(cat => {
          const percentage = grandTotal > 0 ? ((totals[cat] / grandTotal) * 100).toFixed(1) : '0';
          const avgMonthlyForCat = totals[cat] / data.length;
          return (
            <Panel key={cat} title={cat} subtitle="">
              <SubcategorySummaryCard
                category={cat}
                total={totals[cat]}
                percentage={percentage}
                avgMonthly={avgMonthlyForCat}
                color={palette[cat]}
              />
            </Panel>
          );
        })}
      </div>
      <div style={{ marginTop: SPACING['4xl'] }}>
        <Panel title={`${title} Insights`} subtitle="">
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: SPACING['4xl']
          }}>
            <InsightSection title="Highest Spend Months" color={COLORS.accent.red}>
              {topMonths.map((m, i) => (
                <InsightRow
                  key={m.month}
                  label={`${i + 1}. ${m.month}`}
                  value={formatCurrency(m.total)}
                />
              ))}
            </InsightSection>
            <InsightSection title="Key Stats" color={COLORS.accent.teal}>
              <InsightRow label="YTD Total" value={formatCurrency(grandTotal)} />
              <InsightRow label="Monthly Average" value={formatCurrency(avgMonthly)} />
              {insights && insights.map((ins, i) => (
                <InsightRow key={i} label={ins.label} value={ins.value} />
              ))}
            </InsightSection>
          </div>
        </Panel>
      </div>
    </>
  );
}

// ============ OVERVIEW TAB ============
function OverviewTab({ excludeFamily, setExcludeFamily, monthsData, givingCategories, groupMap, categoryData, theme = "dark" }) {
  // Responsive hooks
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);
  const isTablet = useMediaQuery(BREAKPOINTS.tablet);
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : isTablet ? CHART_HEIGHT_TABLET : CHART_HEIGHT_DESKTOP;

  const [chartType, setChartType] = useState("bars");
  const [showIncome, setShowIncome] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("All"); // For dropdown - default to "All"

  // Calculate dynamic insights
  const actualRent = useMemo(() => {
    const homeCategory = categoryData["Home"] || [];
    const rentTotal = homeCategory.reduce((sum, m) => sum + (m['Rent & Insurance'] || 0), 0);
    return monthsData.length > 0 ? rentTotal / monthsData.length : 0;
  }, [categoryData, monthsData]);

  const interestPaid = useMemo(() => {
    const financialCategory = categoryData["Financial"] || [];
    return financialCategory.reduce((sum, m) => sum + (m['Interest Charged'] || 0), 0);
  }, [categoryData]);

  // Handle empty data
  if (!monthsData || monthsData.length === 0 || !groupMap || Object.keys(groupMap).length === 0) {
    return (
      <div style={{ color: COLORS.gray[600], fontSize: FONT_SIZE.lg, textAlign: "center", padding: SPACING["7xl"] }}>
        Loading data...
      </div>
    );
  }

  const { totalsByGroup, topGroups, dataForBars, dataForArea, monthlyTotals, spikes } = useMemo(() => {
    const filteredMonths = excludeFamily
      ? monthsData.map((m, i) => {
          const familyCare = givingCategories[i]?.["Family Care"] || 0;
          return { ...m, "Giving": Math.max(0, m["Giving"] - familyCare) };
        })
      : monthsData;

    // Use group names from API (not individual categories)
    const groups = Object.keys(groupMap);
    const totalsByGroup = {};
    groups.forEach((g) => (totalsByGroup[g] = 0));
    filteredMonths.forEach((m) => { groups.forEach((g) => { totalsByGroup[g] += Number(m[g] ?? 0); }); });

    const ordered = [...groups].sort((a, b) => (totalsByGroup[b] || 0) - (totalsByGroup[a] || 0));
    const topGroups = ordered; // Show all groups instead of limiting to top N

    const monthlyTotals = filteredMonths.map((m) => {
      const total = groups.reduce((s, g) => s + Number(m[g] ?? 0), 0);
      return { month: m.month, total };
    });

    const totals = monthlyTotals.map((x) => x.total).slice().sort((a, b) => a - b);
    const median = totals.length ? (totals.length % 2 ? totals[(totals.length - 1) / 2] : (totals[totals.length / 2 - 1] + totals[totals.length / 2]) / 2) : 0;
    const spikes = monthlyTotals.filter((x) => median > 0 && x.total > THRESHOLDS.spikeMultiplier * median).map((x) => x.month);

    const dataForBars = filteredMonths.map((m) => {
      const row = { month: m.month };
      const monthTotal = groups.reduce((s, g) => s + Number(m[g] ?? 0), 0);
      topGroups.forEach((g) => { const v = Number(m[g] ?? 0); row[g] = v; });
      row.__total = monthTotal;
      row.income = Number(m.income ?? 0); // Add income for line overlay
      return row;
    });

    return { groups, totalsByGroup, topGroups, dataForBars, monthlyTotals, spikes };
  }, [excludeFamily, monthsData, givingCategories, groupMap]);

  // Prepare data for single-month group breakdown (when specific month selected)
  const singleMonthGroupData = useMemo(() => {
    if (selectedMonth === "All" || !selectedMonth || !categoryData || !groupMap) return null;

    // Build data structure: one bar per group, categories stacked within
    const groupBars = [];
    Object.entries(groupMap).forEach(([group, categories]) => {
      const bar = { group };

      // Find the month data for this group by matching month name
      const groupMonthsData = categoryData[group] || [];
      const monthData = groupMonthsData.find(m => m.month === selectedMonth);

      if (monthData) {
        categories.forEach(category => {
          const value = monthData[category] || 0;
          if (value > 0) {
            bar[category] = value;
          }
        });
      }

      // Only include groups with at least one category with value > 0
      if (Object.keys(bar).length > 1) {
        groupBars.push(bar);
      }
    });

    return groupBars.length > 0 ? groupBars : null;
  }, [selectedMonth, categoryData, groupMap]);

  const activeSeries = [...topGroups]; // Show all groups

  // Memoized color map for all groups AND categories with proper palette support
  const colorMap = useMemo(() => {
    const map = {};
    const allKeys = [...topGroups, ...Object.keys(groupMap), "Other"];

    // Map group names to GROUP_COLORS
    allKeys.forEach(key => {
      if (GROUP_COLORS[key]) {
        map[key] = GROUP_COLORS[key];
      } else if (key === "Other") {
        map[key] = "#888888";
      } else {
        let h = 0;
        for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        map[key] = PALETTE[h % PALETTE.length];
      }
    });

    // Map categories to their individual palette colors
    const categoryPalettes = {
      "Food & Dining": FOOD_PALETTE,
      "Fun & Entertainment": FUN_PALETTE,
      "Fun": FUN_PALETTE,
      "Giving": GIVING_PALETTE,
      "Health & Wellness": HEALTH_PALETTE,
      "Health": HEALTH_PALETTE,
      "Home": HOME_PALETTE,
      "Shopping": SHOPPING_PALETTE,
      "Financial": FINANCIAL_PALETTE,
      "Transportation": TRANSPORTATION_PALETTE,
      "Travel": TRAVEL_PALETTE,
      "Subscriptions": SUBSCRIPTIONS_PALETTE
    };

    Object.entries(groupMap).forEach(([group, categories]) => {
      const palette = categoryPalettes[group];
      if (palette && categories) {
        categories.forEach(category => {
          // Use category-specific color from palette, fallback to group color
          map[category] = palette[category] || map[group] || "#888888";
        });
      } else if (categories) {
        // Fallback: use group color if no palette available
        const groupColor = map[group];
        categories.forEach(category => {
          map[category] = groupColor || "#888888";
        });
      }
    });

    return map;
  }, [topGroups, groupMap]);

  const colorFor = useCallback((key) => {
    return colorMap[key] || "#888888";
  }, [colorMap]);

  // Prepare data for breakdown donut chart
  const donutData = useMemo(() => {
    return Object.entries(totalsByGroup)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        color: colorFor(name)
      }));
  }, [totalsByGroup]);

  // Calculate total income across all months
  const totalIncome = useMemo(() => {
    return monthsData.reduce((sum, m) => sum + (m.income || 0), 0);
  }, [monthsData]);

  // Prepare data for income vs expenses donut chart
  const incomeVsExpensesData = useMemo(() => {
    const totalExpenses = Object.values(totalsByGroup).reduce((sum, val) => sum + val, 0);

    // If income is lower than or equal to expenses, fall back to regular breakdown
    if (totalIncome <= totalExpenses) {
      return donutData;
    }

    // Show each group as % of income, plus savings
    const groupsAsPercentOfIncome = Object.entries(totalsByGroup)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        color: colorFor(name)
      }));

    // Add savings as the difference
    const savings = totalIncome - totalExpenses;
    groupsAsPercentOfIncome.push({
      name: 'Savings',
      value: savings,
      color: 'rgba(255,255,255,0.95)' // teal for savings
    });

    return groupsAsPercentOfIncome;
  }, [totalsByGroup, monthsData, donutData]);

  // Calculate highest month once to avoid redundant operations
  const highestMonth = useMemo(() => {
    const max = Math.max(...monthlyTotals.map(m => m.total));
    const month = monthlyTotals.find(m => m.total === max);
    return { value: max, month: month?.month };
  }, [monthlyTotals]);

  // Calculate lowest month
  const lowestMonth = useMemo(() => {
    const min = Math.min(...monthlyTotals.map(m => m.total));
    const month = monthlyTotals.find(m => m.total === min);
    return { value: min, month: month?.month };
  }, [monthlyTotals]);

  // Calculate monthly surplus/deficit
  const monthlySurplus = useMemo(() => {
    const totalExpenses = monthlyTotals.reduce((s, m) => s + m.total, 0);
    const avgIncome = monthsData.length > 0 ? totalIncome / monthsData.length : 0;
    const avgExpenses = monthsData.length > 0 ? totalExpenses / monthsData.length : 0;
    return avgIncome - avgExpenses;
  }, [monthlyTotals, totalIncome, monthsData]);

  return (
    <>
      <Panel
        title={chartType === "bars" ? "Month Comparison" : "Income vs Expenses"}
            subtitle={chartType === "bars" ? "NET spending by category" : "Spending as % of total income"}
            theme={theme}
            style={{ border: "none", borderRadius: 0 }}
          >
          {/* Mobile Controls - Top */}
          {isMobile && (
            <div style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: SPACING['2xl'],
              flexWrap: "wrap",
              justifyContent: "space-between"
            }}>
              {/* Exclude Family Care toggle - checkbox only */}
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "10px", borderRadius: 8, background: excludeFamily ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <input
                  type="checkbox"
                  checked={excludeFamily}
                  onChange={(e) => setExcludeFamily(e.target.checked)}
                  style={{ accentColor: "rgba(255,255,255,0.95)", cursor: "pointer", transform: "scale(1.5)", margin: 0 }}
                  aria-label="Exclude Family Care"
                  title="Exclude Family Care"
                />
              </label>
              <ControlPill value={chartType} setValue={setChartType} options={["bars", "vs income"]} />
            </div>
          )}
          {/* Chart Controls - Upper Right (Desktop) */}
          {!isMobile && (
            <div style={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              gap: 8,
              alignItems: "center",
              zIndex: 10
            }}>
              {/* Month selector dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", fontSize: 12, color: "#888", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>VIEW</span>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ background: "rgba(0,0,0,0.25)", color: "#fff", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 4, padding: "3px 6px", fontSize: 12, outline: "none" }}>
                  <option value="All">All Months</option>
                  {monthsData.map((m) => (
                    <option key={m.month} value={m.month}>{m.month}</option>
                  ))}
                </select>
              </div>
              {/* Show Income toggle */}
              {chartType === "bars" && (
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "6px 10px", borderRadius: 8, background: showIncome ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <input type="checkbox" checked={showIncome} onChange={(e) => setShowIncome(e.target.checked)} style={{ accentColor: "rgba(255,255,255,0.95)", cursor: "pointer", transform: "scale(1.2)", marginRight: "4px" }} />
                  <span style={{ color: showIncome ? "rgba(255,255,255,0.95)" : "#888", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>SHOW INCOME</span>
                </label>
              )}
              {/* Exclude Family Care toggle - checkbox only */}
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "8px", borderRadius: 8, background: excludeFamily ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <input
                  type="checkbox"
                  checked={excludeFamily}
                  onChange={(e) => setExcludeFamily(e.target.checked)}
                  style={{ accentColor: "rgba(255,255,255,0.95)", cursor: "pointer", transform: "scale(1.4)", margin: 0 }}
                  aria-label="Exclude Family Care"
                  title="Exclude Family Care"
                />
              </label>
              <ControlPill value={chartType} setValue={setChartType} options={["bars", "vs income"]} />
            </div>
          )}
          <div style={{ width: "100%", height: chartHeight + 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bars" ? (
                // Check if we should show single-month group breakdown
                singleMonthGroupData && singleMonthGroupData.length > 0 ? (
                  <ComposedChart data={singleMonthGroupData} margin={{ top: 10, right: 22, left: 6, bottom: 8 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="group" tick={{ fill: theme === "light" ? "#1a1a1a" : "#888", fontSize: 12 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: theme === "light" ? "#1a1a1a" : "#666", fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                    {!isMobile && <Tooltip content={<TooltipBox scale="absolute" />} />}
                    {!isMobile && <Legend wrapperStyle={{ color: theme === "light" ? "#1a1a1a" : "#999", fontSize: 13 }} />}
                    {/* Stack categories within each group */}
                    {(() => {
                      // Extract all unique categories from the data
                      const allCategories = new Set();
                      singleMonthGroupData.forEach(bar => {
                        Object.keys(bar).forEach(key => {
                          if (key !== 'group') allCategories.add(key);
                        });
                      });
                      return Array.from(allCategories).map(category => (
                        <Bar key={category} dataKey={category} stackId="a" fill={colorFor(category)} radius={[3, 3, 0, 0]} maxBarSize={36} opacity={0.95} />
                      ));
                    })()}
                  </ComposedChart>
                ) : (
                  <ComposedChart data={dataForBars} margin={{ top: 10, right: 22, left: 6, bottom: 8 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: theme === "light" ? "#1a1a1a" : "#888", fontSize: 12 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: theme === "light" ? "#1a1a1a" : "#666", fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                    {!isMobile && <Tooltip content={<TooltipBox scale="absolute" />} />}
                    {!isMobile && <Legend wrapperStyle={{ color: theme === "light" ? "#1a1a1a" : "#999", fontSize: 13 }} />}
                    {activeSeries.map((key) => (<Bar key={key} dataKey={key} stackId="a" fill={colorFor(key)} radius={[3, 3, 0, 0]} maxBarSize={36} opacity={0.95} />))}
                    {/* Income line overlay */}
                    {showIncome && <Line type="monotone" dataKey="income" stroke="rgba(255,255,255,0.95)" strokeWidth={1.5} dot={{ fill: "rgba(255,255,255,0.95)", r: 2 }} name="Income" />}
                  </ComposedChart>
                )
              ) : (
                <PieChart>
                  <Pie
                    data={incomeVsExpensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={4}
                    dataKey="value"
                    label={!isMobile ? ({ name, value, percent }) => `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)` : undefined}
                    labelLine={!isMobile ? { stroke: "#666", strokeWidth: 1 } : false}
                  >
                    {incomeVsExpensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {!isMobile && <Tooltip formatter={(value) => formatCurrency(value)} />}
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
          {/* Data grid for mobile - interactive month breakdown (shows for both chart types) */}
          <DataGrid
            data={dataForBars}
            colorMap={colorFor}
            selectedMonth={selectedMonth}
            onMonthSelect={setSelectedMonth}
            monthsData={monthsData}
            totalsByGroup={totalsByGroup}
            totalIncome={totalIncome}
          />
          {/* Tags below chart on desktop */}
          {!isMobile && chartType === "bars" && (
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Tag text={`${activeSeries.length} groups`} />
              <Tag text={spikes.length ? `Spike months: ${spikes.join(", ")}` : "No spikes flagged"} tone={spikes.length ? "warn" : "ok"} />
            </div>
          )}
          {/* Group Summary Cards - below chart on desktop only, linked to month selection */}
          {!isMobile && (
            <div style={{ marginTop: SPACING['3xl'] }}>
              {/* Group summary cards - responsive to month selection */}
              {selectedMonth === "All" ? (
                /* Show Group Totals when "All" selected */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {Object.entries(totalsByGroup).sort((a, b) => b[1] - a[1]).map(([group, total]) => {
                    const avgMonthly = monthsData.length > 0 ? total / monthsData.length : 0;
                    const percentOfIncome = totalIncome > 0 ? (total / totalIncome) * 100 : 0;
                    const valueColor = theme === "light" ? "#1a1a1a" : "#fff";
                    return (
                      <div key={group} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: colorFor(group) }} />
                          <span style={{ color: "#aaa", fontSize: 12 }}>{group}</span>
                        </div>
                        <div style={{ color: valueColor, fontSize: 20, fontWeight: 800, marginBottom: 2, transition: "color 0.3s ease" }}>{percentOfIncome.toFixed(1)}%</div>
                        <div style={{ color: "#666", fontSize: 13 }}>Avg: {formatCurrency(avgMonthly)}/mo</div>
                      </div>
                    );
                  })}
                  {/* Total spending card with teal accent */}
                  {(() => {
                    const grandTotal = Object.values(totalsByGroup).reduce((sum, val) => sum + val, 0);
                    const avgMonthly = monthsData.length > 0 ? grandTotal / monthsData.length : 0;
                    const percentOfIncome = totalIncome > 0 ? (grandTotal / totalIncome) * 100 : 0;
                    return (
                      <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(78,205,196,0.08)", border: "2px solid rgba(78,205,196,0.3)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.95)" }} />
                          <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: 700 }}>TOTAL SPENDING</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.95)", fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{formatCurrency(avgMonthly)}/mo</div>
                        <div style={{ color: "#666", fontSize: 13 }}>{percentOfIncome.toFixed(1)}% of income</div>
                      </div>
                    );
                  })()}
                  {/* Total income card */}
                  {(() => {
                    const avgIncome = monthsData.length > 0 ? totalIncome / monthsData.length : 0;
                    return (
                      <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(78,205,196,0.08)", border: "2px solid rgba(78,205,196,0.3)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.95)" }} />
                          <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: 700 }}>TOTAL INCOME</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.95)", fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{formatCurrency(avgIncome)}/mo</div>
                        <div style={{ color: "#666", fontSize: 13 }}>Total: {formatCurrency(totalIncome)}</div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Show individual month breakdown when specific month selected */
                (() => {
                  const monthData = dataForBars.find(m => m.month === selectedMonth);
                  if (!monthData) return null;

                  const monthInfo = monthsData.find(m => m.month === selectedMonth);
                  const income = monthInfo?.income || 0;

                  const categories = Object.entries(monthData)
                    .filter(([key, value]) => {
                      if (key === 'month' || key.startsWith('_') || key.toUpperCase().includes('TOTAL') || key === 'income') return false;
                      return typeof value === 'number' && value > 0;
                    })
                    .sort(([, a], [, b]) => b - a);

                  const monthTotal = categories.reduce((sum, [, value]) => sum + value, 0);
                  const surplus = income - monthTotal;
                  const isSurplus = surplus >= 0;

                  return (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                        {categories.map(([category, value]) => {
                          const percentOfIncome = income > 0 ? ((value / income) * 100) : 0;
                          const valueColor = theme === "light" ? "#1a1a1a" : "#fff";
                          return (
                            <div key={category} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: colorFor(category) }} />
                                <span style={{ color: "#aaa", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{category}</span>
                              </div>
                              <div style={{ color: valueColor, fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{formatCurrency(value)}</div>
                              <div style={{ color: "#666", fontSize: 13 }}>{percentOfIncome.toFixed(1)}% of income</div>
                            </div>
                          );
                        })}
                        {/* Total spending card */}
                        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(78,205,196,0.08)", border: "2px solid rgba(78,205,196,0.3)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.95)" }} />
                            <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: 700 }}>TOTAL SPENDING</span>
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.95)", fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{formatCurrency(monthTotal)}</div>
                          <div style={{ color: isSurplus ? "rgba(255,255,255,0.95)" : "#ff6b6b", fontSize: 13 }}>
                            {isSurplus ? '↑ ' : '↓ '}{formatCurrency(Math.abs(surplus))} {isSurplus ? 'surplus' : 'deficit'}
                          </div>
                        </div>
                        {/* Income card for the month */}
                        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(78,205,196,0.08)", border: "2px solid rgba(78,205,196,0.3)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.95)" }} />
                            <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: 700 }}>INCOME</span>
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.95)", fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{formatCurrency(income)}</div>
                          <div style={{ color: "#666", fontSize: 13 }}>{selectedMonth}</div>
                        </div>
                      </div>
                    </>
                  );
                })()
              )}
            </div>
          )}
      </Panel>
    </>
  );
}

// ============ RECURRING EXPENSES SECTION ============
const RecurringExpensesSection = React.memo(({ monthsData, theme = "dark" }) => {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);

  // Helper function to convert to monthly average
  const toMonthly = (amount, frequency) => {
    if (frequency === "Monthly") return amount;
    if (frequency === "Yearly" || frequency === "Annually") return amount / 12;
    if (frequency === "Every 12-weeks") return amount * 52 / 12 / 12;
    if (frequency === "Every 5-weeks") return amount * 52 / 5 / 12;
    return amount;
  };

  const expenseGroups = [
    {
      name: "Home",
      items: [
        { name: "Rent", amount: 865, frequency: "Monthly" },
        { name: "Utilities", amount: 150, frequency: "Monthly" }
      ]
    },
    {
      name: "Tech & Cloud",
      items: [
        { name: "ChatGPT", amount: 21.78, frequency: "Monthly" },
        { name: "Claude", amount: 21.78, frequency: "Monthly" },
        { name: "Google One", amount: 21.76, frequency: "Monthly" },
        { name: "Ircamamplify", amount: 11.74, frequency: "Monthly" }
      ]
    },
    {
      name: "Growth & Fun",
      items: [
        { name: "Fitness", amount: 212, frequency: "Monthly" },
        { name: "Coursera", amount: 399, frequency: "Annually" },
        { name: "French", amount: 85, frequency: "Every 5-weeks" },
        { name: "The Economist", amount: 110, frequency: "Every 12-weeks" },
        { name: "MUBI", amount: 167.88, frequency: "Yearly" },
        { name: "MealPal", amount: 54, frequency: "Monthly" }
      ]
    },
    {
      name: "Services",
      items: [
        { name: "Apple Care", amount: 8.70, frequency: "Monthly" },
        { name: "iCloud", amount: 7.97, frequency: "Monthly" }
      ]
    },
    {
      name: "Financial",
      items: [
        { name: "Amex Memberships", amount: 1020, frequency: "Yearly" }
      ]
    }
  ];

  // Calculate monthly averages for each group
  const groupAverages = expenseGroups.map(group => ({
    name: group.name,
    monthly: group.items.reduce((sum, item) => sum + toMonthly(item.amount, item.frequency), 0)
  }));

  const totalMonthly = groupAverages.reduce((sum, g) => sum + g.monthly, 0);

  // Calculate average monthly income from monthsData
  const avgMonthlyIncome = useMemo(() => {
    if (!monthsData || monthsData.length === 0) return 0;
    const totalIncome = monthsData.reduce((sum, month) => sum + (month.income || 0), 0);
    return totalIncome / monthsData.length;
  }, [monthsData]);

  return (
    <div style={{
      paddingBottom: isMobile ? "90px" : "0"
    }}>
      <Panel title="Recurring Expenses" theme={theme}>
        <div>
          {/* Group Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            {expenseGroups.map((group, groupIdx) => (
              <div key={groupIdx} style={{
                padding: "8px 10px",
                borderRadius: 6,
                background: theme === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`
              }}>
                <div style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                  {group.name}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {group.items.map((item, itemIdx) => (
                    <div key={itemIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 500 }}>{item.name}</span>
                        <span style={{ color: theme === "light" ? "#888" : "#666", fontSize: 11 }}>({item.frequency})</span>
                      </div>
                      <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 600 }}>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: `1px solid ${theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12
                }}>
                  <span style={{ color: theme === "light" ? "#6a6a6a" : "#888" }}>Avg/month</span>
                  <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 700 }}>
                    {formatCurrency(group.items.reduce((sum, item) => sum + toMonthly(item.amount, item.frequency), 0))}
                  </span>
                </div>
              </div>
            ))}

            {/* Averages Card */}
            <div style={{
              padding: "8px 10px",
              borderRadius: 6,
              background: theme === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`
            }}>
              <div style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                Averages
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Monthly Average */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 500 }}>Monthly Average</span>
                  <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 600 }}>{formatCurrency(totalMonthly)}</span>
                </div>
                {/* Bi-Weekly Average */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 500 }}>Bi-Weekly Average</span>
                  <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 600 }}>{formatCurrency(totalMonthly / 2.1725)}</span>
                </div>
                {/* Left in Paycheck */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 500 }}>Left in Paycheck</span>
                  <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 600 }}>{formatCurrency((avgMonthlyIncome / 2.1725) - (totalMonthly / 2.1725))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
});
RecurringExpensesSection.displayName = 'RecurringExpensesSection';

// ============ BUDGETING SECTION ============
const BudgetingSection = React.memo(({ monthsData, categoryData, groupMap, theme = "dark" }) => {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);

  // Load budgets from localStorage
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem('spendingBudgets');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Error loading budgets from localStorage:', e);
      return {};
    }
  });

  const [editMode, setEditMode] = useState(false);

  // Save to localStorage when budgets change
  React.useEffect(() => {
    try {
      localStorage.setItem('spendingBudgets', JSON.stringify(budgets));
    } catch (e) {
      console.error('Error saving budgets to localStorage:', e);
    }
  }, [budgets]);

  // Calculate totals
  const { totalBudget, totalActual } = useMemo(() => {
    const groups = Object.keys(groupMap || {});
    const totalBudget = groups.reduce((sum, group) => {
      return sum + (budgets[group]?.target || 0);
    }, 0);
    const totalActual = groups.reduce((sum, group) => {
      return sum + calculateActualAverage(group, categoryData, monthsData);
    }, 0);
    return { totalBudget, totalActual };
  }, [budgets, categoryData, groupMap, monthsData]);

  // Handle empty budgets state
  const hasBudgets = Object.keys(budgets).length > 0 && Object.values(budgets).some(b => b.target > 0);

  if (!monthsData || monthsData.length === 0 || !groupMap || Object.keys(groupMap).length === 0) {
    return (
      <div style={{
        paddingBottom: isMobile ? "90px" : "0",
        color: COLORS.gray[600],
        fontSize: FONT_SIZE.lg,
        textAlign: "center",
        padding: SPACING["7xl"]
      }}>
        Loading data...
      </div>
    );
  }

  return (
    <div style={{
      paddingBottom: isMobile ? "90px" : "0"
    }}>
      <Panel title="Budget Targets" theme={theme}>
        {/* Header with Edit/Save toggle */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: SPACING['3xl'],
          flexWrap: "wrap",
          gap: SPACING.md
        }}>
          <div style={{ color: COLORS.gray[600], fontSize: FONT_SIZE.sm }}>
            Set monthly average targets for each category
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              padding: `${SPACING.lg}px ${SPACING['3xl']}px`,
              minHeight: "44px",
              borderRadius: RADIUS.lg,
              border: `1px solid rgba(255,255,255,${OPACITY.border.default})`,
              background: editMode ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)",
              color: editMode ? "rgba(255,255,255,0.95)" : COLORS.white,
              fontSize: FONT_SIZE.sm,
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              transition: "all 0.2s ease"
            }}
          >
            {editMode ? "Save" : "Edit"}
          </button>
        </div>

        {!hasBudgets && !editMode ? (
          /* Empty state */
          <div style={{
            textAlign: "center",
            padding: SPACING['6xl'],
            background: "rgba(255,255,255,0.02)",
            borderRadius: RADIUS.xl,
            border: `1px solid rgba(255,255,255,${OPACITY.border.default})`
          }}>
            <div style={{
              fontSize: FONT_SIZE.xl,
              color: COLORS.gray[600],
              marginBottom: SPACING['2xl']
            }}>
              No budgets set yet
            </div>
            <button
              onClick={() => setEditMode(true)}
              style={{
                padding: `${SPACING.xl}px ${SPACING['4xl']}px`,
                borderRadius: RADIUS.lg,
                background: "rgba(78,205,196,0.15)",
                border: "1px solid rgba(78,205,196,0.3)",
                color: "rgba(255,255,255,0.95)",
                fontSize: FONT_SIZE.md,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              Set Your First Budget
            </button>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div style={{
              padding: SPACING['3xl'],
              borderRadius: RADIUS.xl,
              background: "rgba(78,205,196,0.08)",
              border: "1px solid rgba(78,205,196,0.2)",
              marginBottom: SPACING['3xl'],
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: SPACING['2xl']
            }}>
              <div>
                <div style={{
                  color: COLORS.gray[600],
                  fontSize: FONT_SIZE.xs,
                  marginBottom: SPACING.xs,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  TOTAL BUDGET
                </div>
                <div style={{ color: "rgba(255,255,255,0.95)", fontSize: FONT_SIZE['2xl'], fontWeight: 800 }}>
                  {formatCurrency(totalBudget)}
                </div>
              </div>
              <div>
                <div style={{
                  color: COLORS.gray[600],
                  fontSize: FONT_SIZE.xs,
                  marginBottom: SPACING.xs,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  ACTUAL AVG
                </div>
                <div style={{ color: COLORS.white, fontSize: FONT_SIZE['2xl'], fontWeight: 800 }}>
                  {formatCurrency(totalActual)}
                </div>
              </div>
              <div>
                <div style={{
                  color: COLORS.gray[600],
                  fontSize: FONT_SIZE.xs,
                  marginBottom: SPACING.xs,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  DIFFERENCE
                </div>
                <div style={{
                  color: totalBudget - totalActual >= 0 ? "#90be6d" : "#ff6b6b",
                  fontSize: FONT_SIZE['2xl'],
                  fontWeight: 800
                }}>
                  {totalBudget - totalActual >= 0 ? "+" : ""}{formatCurrency(totalBudget - totalActual)}
                </div>
              </div>
            </div>

            {/* Budget Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: SPACING['2xl']
            }}>
              {Object.keys(groupMap).map(group => {
                const actualAvg = calculateActualAverage(group, categoryData, monthsData);
                const target = budgets[group]?.target || 0;
                const { status, color } = getBudgetStatus(actualAvg, target);
                const diff = target - actualAvg;
                const progress = target > 0 ? Math.min((actualAvg / target) * 100, 100) : 0;

                return (
                  <div
                    key={group}
                    style={{
                      padding: SPACING['3xl'],
                      borderRadius: RADIUS.lg,
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid rgba(255,255,255,${OPACITY.border.default})`
                    }}
                  >
                    {/* Group Header */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: SPACING['2xl'],
                      flexWrap: "wrap",
                      gap: SPACING.md
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
                        <div style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: RADIUS.sm,
                          background: GROUP_COLORS[group] || "#888"
                        }} />
                        <div style={{ color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: 700 }}>
                          {group}
                        </div>
                      </div>
                      {target > 0 && status !== "not-set" && (
                        <div style={{
                          padding: `${SPACING.xs}px ${SPACING.md}px`,
                          borderRadius: RADIUS.base,
                          background: `${color}22`,
                          border: `1px solid ${color}44`,
                          color: color,
                          fontSize: FONT_SIZE.xs,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          {status === "under" ? "Under" : status === "over" ? "Over" : "On Track"}
                        </div>
                      )}
                    </div>

                    {/* Target Input */}
                    <div style={{ marginBottom: SPACING.md }}>
                      <div style={{
                        color: COLORS.gray[600],
                        fontSize: FONT_SIZE.xs,
                        marginBottom: SPACING.xs,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        Target (Monthly Avg)
                      </div>
                      {editMode ? (
                        <input
                          type="number"
                          value={target || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setBudgets(prev => ({
                              ...prev,
                              [group]: { ...prev[group], target: value, enabled: true }
                            }));
                          }}
                          style={{
                            width: "100%",
                            padding: `${SPACING.md}px ${SPACING.xl}px`,
                            borderRadius: RADIUS.md,
                            border: `1px solid rgba(255,255,255,0.15)`,
                            background: "rgba(255,255,255,0.05)",
                            color: COLORS.white,
                            fontSize: FONT_SIZE.lg,
                            fontWeight: 600,
                            outline: "none"
                          }}
                          placeholder="0"
                        />
                      ) : (
                        <div style={{
                          color: COLORS.white,
                          fontSize: FONT_SIZE.xl,
                          fontWeight: 800
                        }}>
                          {target > 0 ? formatCurrency(target) : "Not set"}
                        </div>
                      )}
                    </div>

                    {/* Actual Average */}
                    <div style={{ marginBottom: SPACING.md }}>
                      <div style={{
                        color: COLORS.gray[600],
                        fontSize: FONT_SIZE.xs,
                        marginBottom: SPACING.xs,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        Actual YTD Avg
                      </div>
                      <div style={{
                        color: COLORS.white,
                        fontSize: FONT_SIZE.xl,
                        fontWeight: 800
                      }}>
                        {formatCurrency(actualAvg)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {target > 0 && (
                      <>
                        <div style={{
                          width: "100%",
                          height: "8px",
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: RADIUS.full,
                          overflow: "hidden",
                          marginBottom: SPACING.md
                        }}>
                          <div style={{
                            width: `${progress}%`,
                            height: "100%",
                            background: color,
                            transition: "width 0.3s ease"
                          }} />
                        </div>

                        {/* Difference */}
                        <div style={{
                          color: diff >= 0 ? "#90be6d" : "#ff6b6b",
                          fontSize: FONT_SIZE.sm,
                          fontWeight: 600
                        }}>
                          {diff >= 0 ? "↓" : "↑"} {formatCurrency(Math.abs(diff))} {diff >= 0 ? "under budget" : "over budget"}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
});
BudgetingSection.displayName = 'BudgetingSection';

// ============ DASHBOARD SECTION ============
const DashboardSection = React.memo(({ monthsData, categoryData, groupMap, theme = "dark" }) => {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);

  // Get the latest month's data
  const latestMonthData = useMemo(() => {
    if (!monthsData || monthsData.length === 0) return null;
    const lastMonth = monthsData[monthsData.length - 1];

    // Calculate total spending for the month
    const groups = Object.keys(groupMap || {});
    const total = groups.reduce((sum, group) => sum + (lastMonth[group] || 0), 0);

    // Get specific subcategory spending
    const restaurants = lastMonth["Restaurants"] || 0;
    const activities = lastMonth["Activities & Attractions"] || 0;
    const groceries = lastMonth["Groceries"] || 0;

    return {
      month: lastMonth.month,
      total: total,
      income: lastMonth.income || 0,
      restaurants: restaurants,
      activities: activities,
      groceries: groceries
    };
  }, [monthsData, groupMap]);

  // Budget targets
  const budgets = useMemo(() => [
    { name: "Restaurants", actual: latestMonthData?.restaurants || 0, budget: 600 },
    { name: "Activities & Attractions", actual: latestMonthData?.activities || 0, budget: 150 },
    { name: "Groceries", actual: latestMonthData?.groceries || 0, budget: 250 }
  ], [latestMonthData]);

  if (!latestMonthData) {
    return (
      <div style={{
        paddingBottom: isMobile ? "90px" : "0",
        color: COLORS.gray[600],
        fontSize: FONT_SIZE.lg,
        textAlign: "center",
        padding: SPACING["7xl"]
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{
      paddingBottom: isMobile ? "90px" : "0"
    }}>
      {/* Current Month Spending Card */}
      <div style={{
        background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
        borderRadius: RADIUS.xl,
        padding: SPACING['4xl'],
        marginBottom: SPACING['4xl'],
        border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        maxWidth: "95%",
        margin: "0 auto",
        marginBottom: SPACING['4xl']
      }}>
        {/* Subheader */}
        <div style={{
          fontSize: FONT_SIZE.xs,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.5px",
          marginBottom: SPACING.lg
        }}>
          Current Spend This Month
        </div>

        {/* Current Month Total */}
        <div style={{
          fontSize: FONT_SIZE['3xl'],
          fontWeight: 800,
          color: theme === "dark" ? COLORS.white : "#1a1a1a",
          marginBottom: SPACING['2xl']
        }}>
          {formatCurrency(latestMonthData.total)}
        </div>

        {/* Month Label */}
        <div style={{
          fontSize: FONT_SIZE.sm,
          color: COLORS.gray[600],
          marginBottom: SPACING['4xl']
        }}>
          {latestMonthData.month}
        </div>

        {/* Budget Progress Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: SPACING['3xl'] }}>
          {budgets.map((item, index) => {
            const percentage = Math.min((item.actual / item.budget) * 100, 100);
            const isOverBudget = item.actual > item.budget;

            return (
              <div key={index}>
                {/* Category Name and Amount */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: SPACING.md
                }}>
                  <span style={{
                    fontSize: FONT_SIZE.sm,
                    color: COLORS.white,
                    fontWeight: 600
                  }}>
                    {item.name}
                  </span>
                  <span style={{
                    fontSize: FONT_SIZE.sm,
                    color: isOverBudget ? "#ff6b6b" : COLORS.gray[400],
                    fontWeight: 700
                  }}>
                    {formatCurrency(item.actual)} / {formatCurrency(item.budget)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: "100%",
                  height: "12px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "999px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: isOverBudget ? "#ff6b6b" : "rgba(255,255,255,0.95)",
                    borderRadius: "999px",
                    transition: "width 0.3s ease"
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
DashboardSection.displayName = 'DashboardSection';

// ============ GIVING TAB (with Family Care toggle) ============
function GivingTab({ categoryData }) {
  const [excludeFamily, setExcludeFamily] = useState(false);
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);
  const subcats = excludeFamily ? ["Charity", "Gifts"] : ["Charity", "Family Care", "Gifts"];

  const totals = useMemo(() => {
    const t = {}; subcats.forEach(c => t[c] = 0);
    categoryData.forEach(m => { subcats.forEach(c => t[c] += m[c] || 0); });
    return t;
  }, [excludeFamily, categoryData]);

  // Calculate dynamic insights
  const familyCarePeaks = useMemo(() => {
    return categoryData
      .map(m => ({ month: m.month, value: m['Family Care'] || 0 }))
      .filter(m => m.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [categoryData]);

  const charityTotal = useMemo(() =>
    categoryData.reduce((sum, m) => sum + (m['Charity'] || 0), 0),
    [categoryData]
  );

  const giftsPeak = useMemo(() =>
    INSIGHTS.findPeakMonth(categoryData, 'Gifts'),
    [categoryData]
  );

  const chartData = useMemo(() => excludeFamily ? categoryData.map(m => ({ month: m.month, "Charity": m["Charity"], "Gifts": m["Gifts"] })) : categoryData, [excludeFamily, categoryData]);
  const totalFamilyCare = categoryData.reduce((s, m) => s + (m["Family Care"] || 0), 0);
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 22, padding: "16px 18px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 12, background: excludeFamily ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={excludeFamily} onChange={(e) => setExcludeFamily(e.target.checked)} style={{ accentColor: "rgba(255,255,255,0.95)", transform: isMobile ? "scale(1.3)" : "scale(1)", marginRight: isMobile ? "4px" : "0" }} />
            <span style={{ color: excludeFamily ? "rgba(255,255,255,0.95)" : "#888", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>Exclude Family Care</span>
          </label>
        </div>
      </div>
      {excludeFamily && (<div style={{ background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}><span style={{ color: "rgba(255,255,255,0.95)" }}>ℹ</span><span style={{ color: "#94a3b8", fontSize: 13 }}>Family Care ({formatCurrency(totalFamilyCare)}) excluded from charts</span></div>)}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 18
      }}>
        <Panel title="Giving by Month" subtitle="NET spending by subcategory">
          <div style={{ width: "100%", height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 22, left: 6, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#666", fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                <Tooltip content={<TooltipBox scale="absolute" />} />
                <Legend wrapperStyle={{ color: "#999", fontSize: 13 }} />
                {subcats.map((key) => (<Bar key={key} dataKey={key} stackId="a" fill={GIVING_PALETTE[key]} radius={[2, 2, 0, 0]} maxBarSize={32} />))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <div style={{
        marginTop: 18,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : `repeat(${subcats.length}, 1fr)`,
        gap: 14
      }}>
        {subcats.map(cat => (
          <Panel key={cat} title={cat} subtitle="">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: GIVING_PALETTE[cat] }} />
              <span style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{formatCurrency(totals[cat])}</span>
            </div>
            <div style={{ color: "#666", fontSize: 13 }}>{grandTotal > 0 ? ((totals[cat] / grandTotal) * 100).toFixed(1) : 0}% of total</div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Avg: {formatCurrency(totals[cat] / chartData.length)}/mo</div>
          </Panel>
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        <Panel title="Giving Insights" subtitle="">
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 18
          }}>
            <div>
              <div style={{ color: "#ff6b6b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Top Family Care Payments</div>
              {familyCarePeaks.map((peak, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#aaa", fontSize: 13 }}>{peak.month}</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{formatCurrency(peak.value)}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Key Stats</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><span style={{ color: "#aaa", fontSize: 13 }}>Total Family Care YTD</span><span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{formatCurrency(totalFamilyCare)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><span style={{ color: "#aaa", fontSize: 13 }}>Monthly Charity</span><span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{formatCurrency(charityTotal / chartData.length)}/mo</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><span style={{ color: "#aaa", fontSize: 13 }}>Gifts Peak</span><span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{giftsPeak.month} ({formatCurrency(giftsPeak.value)})</span></div>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

// ============ SHARED COMPONENTS ============
const TooltipBox = React.memo(({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((s, p) => s + (typeof p.value === "number" ? p.value : 0), 0);
  return (
    <div style={CHART_STYLES.tooltip}>
      <div style={{
        fontWeight: 800,
        color: COLORS.white,
        fontSize: FONT_SIZE.md,
        marginBottom: SPACING.lg
      }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{
          display: "flex",
          justifyContent: "space-between",
          gap: SPACING['3xl'],
          marginBottom: SPACING.xs
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: RADIUS.base,
              background: p.color
            }} />
            <div style={{ color: COLORS.gray[400], fontSize: FONT_SIZE.base }}>{p.name}</div>
          </div>
          <div style={{ color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: 700 }}>
            {formatCurrency(p.value)}
          </div>
        </div>
      ))}
      <div style={{
        marginTop: SPACING.lg,
        paddingTop: SPACING.lg,
        borderTop: `1px solid rgba(255,255,255,${OPACITY.border.default})`,
        display: "flex",
        justifyContent: "space-between"
      }}>
        <div style={{ color: COLORS.gray[600], fontSize: FONT_SIZE.base }}>Total</div>
        <div style={{ color: COLORS.accent.teal, fontSize: FONT_SIZE.md, fontWeight: 800 }}>
          {formatCurrency(total)}
        </div>
      </div>
    </div>
  );
});
TooltipBox.displayName = 'TooltipBox';

// Interactive data grid for mobile - shows group summaries or month breakdown
const DataGrid = React.memo(({ data, colorMap, selectedMonth, onMonthSelect, monthsData, totalsByGroup, totalIncome }) => {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);
  if (!isMobile || !data || data.length === 0 || !totalsByGroup) return null;

  // Default to "All" if none selected
  const currentMonth = selectedMonth || "All";
  const isAllView = currentMonth === "All";
  const monthData = !isAllView ? (data.find(m => m.month === currentMonth) || data[data.length - 1]) : null;

  // Get income for the selected month (only for individual month view)
  const monthInfo = !isAllView ? monthsData?.find(m => m.month === currentMonth) : null;
  const income = monthInfo?.income || 0;

  // Extract categories and values for the selected month (only for individual month view)
  const categories = !isAllView ? Object.entries(monthData)
    .filter(([key, value]) => {
      // Exclude: month, __TOTAL, TOTAL, income, or anything starting with underscore
      if (key === 'month' || key.startsWith('_') || key.toUpperCase().includes('TOTAL') || key === 'income') return false;
      return typeof value === 'number' && value > 0;
    })
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8) : []; // Show top 8 categories

  const monthTotal = !isAllView ? categories.reduce((sum, [, value]) => sum + value, 0) : 0;
  const surplus = !isAllView ? (income - monthTotal) : 0;
  const isSurplus = surplus >= 0;

  return (
    <div style={{ marginTop: SPACING['3xl'], width: "100%", boxSizing: "border-box" }}>
      {/* Month selector */}
      <div style={{
        marginBottom: SPACING['2xl'],
        display: "flex",
        alignItems: "center",
        gap: SPACING.md,
        width: "100%"
      }}>
        <div style={{
          color: COLORS.gray[600],
          fontSize: FONT_SIZE.sm,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          {isAllView ? "View:" : "Month:"}
        </div>
        <select
          value={currentMonth}
          onChange={(e) => onMonthSelect && onMonthSelect(e.target.value)}
          style={{
            flex: 1,
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            borderRadius: RADIUS.md,
            border: `1px solid rgba(255,255,255,${OPACITY.border.default})`,
            background: `rgba(255,255,255,${OPACITY.surface.level1})`,
            color: COLORS.white,
            fontSize: FONT_SIZE.base,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit"
          }}
        >
          <option value="All">All Groups</option>
          {data.map((m) => (
            <option key={m.month} value={m.month}>
              {m.month}
            </option>
          ))}
        </select>
      </div>

      {/* Grid - shows Group Totals for "All" or individual month categories */}
      {isAllView ? (
        /* Group Totals view - single column for full width on mobile */
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, width: "100%" }}>
          {Object.entries(totalsByGroup).sort((a, b) => b[1] - a[1]).map(([group, total]) => {
            const avgMonthly = monthsData.length > 0 ? total / monthsData.length : 0;
            const percentOfIncome = totalIncome > 0 ? (total / totalIncome) * 100 : 0;
            return (
              <div key={group} style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                width: "100%",
                boxSizing: "border-box"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: colorMap(group) }} />
                  <span style={{ color: "#aaa", fontSize: 13, fontWeight: 600 }}>{group}</span>
                </div>
                <div style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{percentOfIncome.toFixed(1)}%</div>
                <div style={{ color: "#666", fontSize: 12 }}>Avg: {formatCurrency(avgMonthly)}/mo</div>
              </div>
            );
          })}
          {/* Total card with teal accent */}
          {(() => {
            const grandTotal = Object.values(totalsByGroup).reduce((sum, val) => sum + val, 0);
            const avgMonthly = monthsData.length > 0 ? grandTotal / monthsData.length : 0;
            const percentOfIncome = totalIncome > 0 ? (grandTotal / totalIncome) * 100 : 0;
            return (
              <div style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: "rgba(78,205,196,0.08)",
                border: "2px solid rgba(78,205,196,0.3)",
                width: "100%",
                boxSizing: "border-box"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,255,255,0.95)" }} />
                  <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 13, fontWeight: 700 }}>TOTAL SPENDING</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.95)", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{percentOfIncome.toFixed(1)}%</div>
                <div style={{ color: "#888", fontSize: 12 }}>Avg: {formatCurrency(avgMonthly)}/mo</div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* Individual month view - single column for full width on mobile */
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: SPACING.md,
          width: "100%"
        }}>
          {categories.map(([category, value]) => (
            <div key={category} style={{
              display: "flex",
              flexDirection: "column",
              gap: SPACING.md,
              padding: "14px 16px",
              background: `rgba(255,255,255,${OPACITY.surface.level1})`,
              borderRadius: RADIUS.md,
              border: `1px solid rgba(255,255,255,${OPACITY.border.default})`,
              width: "100%",
              boxSizing: "border-box"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: colorMap(category),
                  flexShrink: 0
                }} />
                <div style={{
                  color: COLORS.gray[400],
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1
                }}>
                  {category}
                </div>
              </div>
              <div style={{
                color: COLORS.white,
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 1
              }}>
                {formatCurrency(value)}
              </div>
              <div style={{
                color: COLORS.gray[600],
                fontSize: 12
              }}>
                {income > 0 ? ((value / income) * 100).toFixed(1) : 0}% of income
              </div>
            </div>
          ))}

          {/* Total row - full width */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: SPACING.md,
            padding: "14px 16px",
            background: `rgba(78,205,196,${OPACITY.fill.subtle})`,
            borderRadius: RADIUS.md,
            border: `2px solid rgba(78,205,196,0.3)`,
            width: "100%",
            boxSizing: "border-box"
          }}>
            <div style={{
              color: COLORS.accent.teal,
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Total Spending
            </div>
            <div style={{
              color: COLORS.white,
              fontSize: 24,
              fontWeight: 800,
              lineHeight: 1
            }}>
              {formatCurrency(monthTotal)}
            </div>
            <div style={{
              color: isSurplus ? COLORS.accent.teal : COLORS.accent.red,
              fontSize: 12,
              fontWeight: 700
            }}>
              {isSurplus ? '↑ ' : '↓ '}{formatCurrency(Math.abs(surplus))} {isSurplus ? 'surplus' : 'deficit'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
DataGrid.displayName = 'DataGrid';

const Panel = React.memo(({ title, subtitle, children, theme = "dark", style = {} }) => {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);
  const panelBg = theme === "light" ? "#faf9f6" : (isMobile ? "#000000" : `rgba(255,255,255,${OPACITY.surface.level0})`);
  const panelBorder = theme === "light" ? "#000000" : `rgba(255,255,255,${OPACITY.border.default})`;
  const titleColor = theme === "light" ? "#1a1a1a" : COLORS.gray[200];
  const subtitleColor = theme === "light" ? "#6a6a6a" : COLORS.gray[600];

  return (
    <div style={{
      position: "relative",
      background: panelBg,
      borderRadius: "0",
      padding: isMobile ? `${SPACING['2xl']}px ${SPACING.lg}px` : `${SPACING['4xl']}px ${SPACING['4xl']}px`,
      border: `1px solid ${panelBorder}`,
      transition: "all 0.3s ease",
      height: "100%",
      width: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
      ...style
    }}>
      {!isMobile && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          gap: SPACING.lg,
          marginBottom: SPACING['2xl']
        }}>
          <div>
            <div style={{ fontSize: FONT_SIZE.lg, fontWeight: 800, color: titleColor, transition: "color 0.3s ease" }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                marginTop: SPACING.xs,
              fontSize: FONT_SIZE.base,
              color: subtitleColor,
              transition: "color 0.3s ease"
            }}>
              {subtitle}
            </div>
          )}
        </div>
        </div>
      )}
      {children}
    </div>
  );
});
Panel.displayName = 'Panel';

const StatBox = React.memo(({ label, value, subtext, theme = "dark" }) => {
  const valueColor = theme === "light" ? "#1a1a1a" : COLORS.white;

  return (
    <div style={{
      padding: `${SPACING.xl}px ${SPACING['2xl']}px`,
      borderRadius: RADIUS.lg,
      background: `rgba(255,255,255,${OPACITY.surface.level1})`,
      border: `1px solid rgba(255,255,255,${OPACITY.surface.level3})`
    }}>
      <div style={{
        color: COLORS.gray[800],
        fontSize: FONT_SIZE.xs,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1
      }}>
        {label}
      </div>
      <div style={{
        color: valueColor,
        fontSize: FONT_SIZE.xl,
        fontWeight: 800,
        marginTop: SPACING.xs,
        transition: "color 0.3s ease"
      }}>
        {value}
      </div>
      {subtext && (
        <div style={{
          color: COLORS.accent.teal,
          fontSize: FONT_SIZE.sm,
          marginTop: SPACING.sm
        }}>
          {subtext}
        </div>
      )}
    </div>
  );
});
StatBox.displayName = 'StatBox';

const Tag = React.memo(({ text, tone = "neutral" }) => {
  const bg = tone === "warn"
    ? `rgba(255,107,107,${OPACITY.fill.default})`
    : tone === "ok"
    ? `rgba(144,190,109,${OPACITY.fill.default})`
    : `rgba(255,255,255,${OPACITY.surface.level2})`;
  const bd = tone === "warn"
    ? `rgba(255,107,107,${OPACITY.border.accent})`
    : tone === "ok"
    ? `rgba(144,190,109,${OPACITY.border.accent})`
    : `rgba(255,255,255,${OPACITY.border.default})`;
  const fg = tone === "warn"
    ? COLORS.accent.red
    : tone === "ok"
    ? COLORS.accent.green
    : COLORS.gray[400];
  return (
    <div style={{
      padding: `${SPACING.md}px ${SPACING.lg}px`,
      borderRadius: RADIUS.full,
      background: bg,
      border: `1px solid ${bd}`,
      color: fg,
      fontSize: FONT_SIZE.base,
      fontWeight: 700
    }}>
      {text}
    </div>
  );
});
Tag.displayName = 'Tag';

const ControlPill = React.memo(({ label, value, setValue, options }) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: SPACING.lg,
      padding: `${SPACING.md}px ${SPACING.lg}px`,
      borderRadius: RADIUS.xl,
      background: `rgba(255,255,255,${OPACITY.surface.level1})`
    }}>
      {label && (
        <div style={{
          color: COLORS.gray[600],
          fontSize: FONT_SIZE.base,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.2
        }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", gap: SPACING.md }}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              onClick={() => setValue(opt)}
              style={{
                padding: `${SPACING.xl}px ${SPACING['2xl']}px`,
                minHeight: "44px",
                borderRadius: RADIUS.lg,
                border: active
                  ? `1px solid rgba(255,255,255,${OPACITY.border.strong})`
                  : `1px solid rgba(255,255,255,${OPACITY.border.default})`,
                background: active
                  ? `rgba(255,255,255,${OPACITY.fill.subtle})`
                  : "transparent",
                color: active ? COLORS.white : COLORS.gray[600],
                fontSize: FONT_SIZE.md,
                fontWeight: 800,
                cursor: "pointer",
                textTransform: "uppercase"
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
});
ControlPill.displayName = 'ControlPill';

// ============ BOTTOM NAVIGATION (Mobile Only) ============
const BottomNavigation = React.memo(({ activeSection, setActiveSection, isMobile }) => {
  if (!isMobile) return null;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◆" },
    { id: "expenses", label: "Expenses", icon: "$" },
    { id: "recurring", label: "Recurring", icon: "↻" },
    { id: "budgeting", label: "Budgeting", icon: "○" }
  ];

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#000000",
      borderTop: `1px solid rgba(255,255,255,${OPACITY.border.default})`,
      display: "flex",
      justifyContent: "space-around",
      alignItems: "stretch",
      height: "70px",
      paddingBottom: "env(safe-area-inset-bottom)",
      zIndex: 1000
    }}>
      {navItems.map(item => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: SPACING.xs,
              background: "transparent",
              border: "none",
              color: isActive ? "rgba(255,255,255,0.95)" : COLORS.gray[600],
              fontSize: FONT_SIZE.xs,
              fontWeight: isActive ? 700 : 400,
              cursor: "pointer",
              transition: "color 0.2s ease",
              minHeight: "44px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            <span style={{
              fontSize: FONT_SIZE['2xl'],
              lineHeight: 1
            }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
});
BottomNavigation.displayName = 'BottomNavigation';

// ============ MAIN DASHBOARD ============
export default function SpendingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [excludeFamily, setExcludeFamily] = useState(false);
  const [theme, setTheme] = useState("dark"); // "dark" or "light"
  const [activeSection, setActiveSection] = useState("dashboard"); // "dashboard" | "expenses" | "recurring" | "budgeting"

  // Responsive hooks
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);
  const isTablet = useMediaQuery(BREAKPOINTS.tablet);
  const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : isTablet ? CHART_HEIGHT_TABLET : CHART_HEIGHT_DESKTOP;

  // Theme colors
  const themeColors = {
    dark: {
      background: "linear-gradient(145deg, #0d0d12 0%, #1a1a24 100%)",
      text: "#ffffff",
      textSecondary: "#aaa",
      textTertiary: "#888",
      panelBg: "rgba(255,255,255,0.02)",
      panelBorder: "rgba(255,255,255,0.05)",
    },
    light: {
      background: "#faf9f6",
      text: "#1a1a1a",
      textSecondary: "#4a4a4a",
      textTertiary: "#6a6a6a",
      panelBg: "#faf9f6",
      panelBorder: "rgba(0,0,0,0.08)",
    }
  };

  const currentTheme = themeColors[theme];

  // Data fetching state - all data loaded from Google Sheets API
  const [monthsData, setMonthsData] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [groupMap, setGroupMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract date range from data for dynamic title
  const dateRange = useMemo(() => DATE_UTILS.getDateRange(monthsData), [monthsData]);

  // Fetch data from Google Sheets API with caching
  useEffect(() => {
    const CACHE_KEY = 'spendingDashboardData';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const fetchData = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cacheTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
        const now = Date.now();

        if (cachedData && cacheTimestamp) {
          const age = now - parseInt(cacheTimestamp, 10);

          // If cache is fresh (< 5 minutes), use it immediately
          if (age < CACHE_DURATION) {
            const data = JSON.parse(cachedData);
            setMonthsData(data.months);
            setGroupMap(data.groupMap || {});

            const transformedCategories = {};
            Object.entries(data.categoryData).forEach(([group, categoryData]) => {
              transformedCategories[group] = transformCategoryData(categoryData);
            });
            setCategoryData(transformedCategories);
            setIsLoading(false);
            setError(null);
            return; // Use cache, don't fetch
          }

          // If cache is stale, show it while fetching fresh data in background
          if (age < CACHE_DURATION * 2) {
            const data = JSON.parse(cachedData);
            setMonthsData(data.months);
            setGroupMap(data.groupMap || {});

            const transformedCategories = {};
            Object.entries(data.categoryData).forEach(([group, categoryData]) => {
              transformedCategories[group] = transformCategoryData(categoryData);
            });
            setCategoryData(transformedCategories);
            setIsLoading(false); // Show cached data immediately
          }
        }

        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Cache the response
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, now.toString());

        // Update state
        setMonthsData(data.months);
        setGroupMap(data.groupMap || {});

        const transformedCategories = {};
        Object.entries(data.categoryData).forEach(([group, categoryData]) => {
          transformedCategories[group] = transformCategoryData(categoryData);
        });
        setCategoryData(transformedCategories);

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tab configuration with mapping to actual categoryData keys
  const tabs = [
    { id: "overview", label: "Overview", dataKey: null, color: "rgba(255,255,255,0.95)" },
    { id: "last12", label: "Last 12 Months", dataKey: null, color: "#90be6d" },
    { id: "last6", label: "Last 6 Months", dataKey: null, color: "rgba(255,255,255,0.95)" },
    { id: "last3", label: "Last 3 Months", dataKey: null, color: "#aa96da" },
    { id: "food", label: "Food & Dining", dataKey: "Food & Dining", color: "#ff6b6b" },
    { id: "giving", label: "Giving", dataKey: "Giving", color: "#f9c74f" },
    { id: "health", label: "Health", dataKey: "Health & Wellness", color: "#90be6d" },
    { id: "home", label: "Home", dataKey: "Home", color: "#aa96da" },
    { id: "shopping", label: "Shopping", dataKey: "Shopping", color: "#f38181" },
    { id: "subscriptions", label: "Subscriptions", dataKey: "Subscriptions", color: "#95e1d3" },
    { id: "transportation", label: "Transportation", dataKey: "Transportation", color: "rgba(255,255,255,0.95)" },
    { id: "travel", label: "Travel", dataKey: "Travel", color: "#aa96da" },
    { id: "financial", label: "Financial", dataKey: "Financial", color: "#e17055" },
    { id: "fun", label: "Fun", dataKey: "Fun & Entertainment", color: "#fcbad3" },
    { id: "recurring", label: "Recurring Expenses", dataKey: null, color: "#f9c74f" },
    { id: "budgeting", label: "Budgeting", dataKey: null, color: "#90be6d" },
    { id: "dashboard", label: "Dashboard", dataKey: null, color: "#aa96da" },
  ];

  // Debug: Log available category keys on data load
  useEffect(() => {
    if (Object.keys(categoryData).length > 0) {
      console.log('Available categoryData keys:', Object.keys(categoryData));
    }
  }, [categoryData]);

  // Format current date
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = today.toLocaleDateString('en-US', { month: 'short' });
  const dayNumber = today.getDate();
  const formattedDate = `${dayName}, ${monthName} ${dayNumber}`;

  return (
    <div style={{
      background: isMobile && theme === "dark" ? "#000000" : currentTheme.background,
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      transition: "background 0.3s ease"
    }}>
      {/* Sticky Header */}
      <div style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        background: theme === "dark" ? "#000000" : "#ffffff",
        borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        padding: `${SPACING['2xl']}px ${SPACING['3xl']}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)"
      }}>
        {/* Gear Icon - Left */}
        <button
          style={{
            position: "absolute",
            left: SPACING['3xl'],
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: SPACING.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme === "dark" ? COLORS.gray[600] : "#666"
          }}
          aria-label="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        {/* Date - Center */}
        <div style={{
          color: theme === "dark" ? COLORS.white : "#1a1a1a",
          fontSize: FONT_SIZE.base,
          fontWeight: 600,
          letterSpacing: "0.5px"
        }}>
          {formattedDate}
        </div>
      </div>

      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
        padding: isMobile ? `${SPACING['3xl']}px ${SPACING.md}px` : `${SPACING['7xl']}px ${SPACING['3xl']}px`
      }}>
        {/* Loading State */}
        {isLoading && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: SPACING['3xl']
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "4px solid rgba(78,205,196,0.2)",
              borderTop: "4px solid rgba(255,255,255,0.95)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <p style={{
              color: COLORS.gray[600],
              fontSize: FONT_SIZE.lg,
              margin: 0
            }}>
              Loading spending data from Google Sheets...
            </p>
            <style>
              {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div style={{
            background: "rgba(255,107,107,0.08)",
            border: "1px solid rgba(255,107,107,0.2)",
            borderRadius: RADIUS.xl,
            padding: SPACING['5xl'],
            marginBottom: SPACING['6xl']
          }}>
            <h3 style={{
              color: "#ff6b6b",
              margin: `0 0 ${SPACING.md}px 0`,
              fontSize: FONT_SIZE.xl
            }}>
              Failed to load data from Google Sheets
            </h3>
            <p style={{
              color: COLORS.gray[600],
              fontSize: FONT_SIZE.base,
              margin: `${SPACING.md}px 0`
            }}>
              Error: {error}
            </p>
            <p style={{
              color: COLORS.gray[700],
              fontSize: FONT_SIZE.sm,
              margin: `${SPACING.md}px 0 0`
            }}>
              Using fallback data. Please check your .env configuration and ensure the backend server is running.
            </p>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && (
          <>

        {/* SECTION: EXPENSES */}
        {activeSection === "expenses" && (
          <>
            {/* Tab Navigation - Dropdown on mobile, buttons on desktop */}
            {isMobile ? (
          <div style={{ marginBottom: SPACING['3xl'] }}>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              style={{
                width: "100%",
                padding: `${SPACING['2xl']}px ${SPACING['3xl']}px`,
                minHeight: "44px",
                borderRadius: RADIUS.lg,
                border: `1px solid rgba(255,255,255,${OPACITY.border.default})`,
                background: `rgba(255,255,255,${OPACITY.surface.level1})`,
                color: COLORS.white,
                fontSize: FONT_SIZE.base,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{
            display: "flex",
            gap: SPACING.md,
            marginBottom: SPACING['3xl'],
            flexWrap: "wrap"
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: `${SPACING.lg}px ${SPACING['3xl']}px`,
                  border: "none",
                  background: "transparent",
                  color: theme === "light" ? "#1a1a1a" : currentTheme.textTertiary,
                  fontSize: FONT_SIZE.md,
                  fontWeight: activeTab === tab.id ? 800 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === "overview" && <OverviewTab excludeFamily={excludeFamily} setExcludeFamily={setExcludeFamily} monthsData={monthsData} givingCategories={categoryData["Giving"] || []} groupMap={groupMap} categoryData={categoryData} theme={theme} />}

        {activeTab === "last12" && (
          <OverviewTab
            excludeFamily={excludeFamily}
            setExcludeFamily={setExcludeFamily}
            monthsData={getLast12MonthsExcludingCurrent(monthsData)}
            givingCategories={(categoryData["Giving"] || []).slice(0, -1).slice(-12)}
            groupMap={groupMap}
            categoryData={Object.fromEntries(
              Object.entries(categoryData).map(([group, data]) => [
                group,
                (data || []).slice(0, -1).slice(-12)
              ])
            )}
            theme={theme}
          />
        )}

        {activeTab === "last6" && (
          <OverviewTab
            excludeFamily={excludeFamily}
            setExcludeFamily={setExcludeFamily}
            monthsData={getLast6MonthsExcludingCurrent(monthsData)}
            givingCategories={(categoryData["Giving"] || []).slice(0, -1).slice(-6)}
            groupMap={groupMap}
            categoryData={Object.fromEntries(
              Object.entries(categoryData).map(([group, data]) => [
                group,
                (data || []).slice(0, -1).slice(-6)
              ])
            )}
            theme={theme}
          />
        )}

        {activeTab === "last3" && (
          <OverviewTab
            excludeFamily={excludeFamily}
            setExcludeFamily={setExcludeFamily}
            monthsData={getLast3MonthsExcludingCurrent(monthsData)}
            givingCategories={(categoryData["Giving"] || []).slice(0, -1).slice(-3)}
            groupMap={groupMap}
            categoryData={Object.fromEntries(
              Object.entries(categoryData).map(([group, data]) => [
                group,
                (data || []).slice(0, -1).slice(-3)
              ])
            )}
            theme={theme}
          />
        )}

        {activeTab === "food" && (
          <CategoryTab
            title="Food & Dining"
            data={categoryData["Food & Dining"] || []}
            subcats={["Restaurants", "Takeout & Delivery", "Bars", "Groceries", "Cafes"]}
            palette={FOOD_PALETTE}
            insights={computeCategoryInsights(
              categoryData["Food & Dining"] || [],
              ["Restaurants", "Takeout & Delivery", "Bars", "Groceries", "Cafes"],
              [
                { type: 'percentage', subcat: 'Restaurants', label: 'Restaurants % of Total' },
                { type: 'peak', subcat: 'Bars', label: 'Bars Peak' }
              ]
            )}
          />
        )}

        {activeTab === "giving" && <GivingTab categoryData={categoryData["Giving"] || []} />}

        {activeTab === "health" && (
          <CategoryTab
            title="Health & Wellness"
            data={categoryData["Health & Wellness"] || categoryData["Health"] || []}
            subcats={["Fitness", "Healthcare & Pharmacy", "Personal Care"]}
            palette={HEALTH_PALETTE}
            insights={computeCategoryInsights(
              categoryData["Health & Wellness"] || categoryData["Health"] || [],
              ["Fitness", "Healthcare & Pharmacy", "Personal Care"],
              [
                { type: 'average', subcat: 'Fitness', label: 'Fitness Monthly' },
                { type: 'peak', subcat: 'Healthcare & Pharmacy', label: 'Healthcare Peak' }
              ]
            )}
          />
        )}

        {activeTab === "home" && (
          <CategoryTab
            title="Home"
            data={categoryData["Home"] || []}
            subcats={["Rent & Insurance", "Utilities", "Home Improvement", "Laundry & Dry Cleaning"]}
            palette={HOME_PALETTE}
            insights={computeCategoryInsights(
              categoryData["Home"] || [],
              ["Rent & Insurance", "Utilities", "Home Improvement", "Laundry & Dry Cleaning"],
              [
                { type: 'average', subcat: 'Rent & Insurance', label: 'Rent & Insurance Avg' },
                { type: 'average', subcat: 'Utilities', label: 'Utilities Avg' }
              ]
            )}
          />
        )}

        {activeTab === "shopping" && (
          <CategoryTab
            title="Shopping"
            data={categoryData["Shopping"] || []}
            subcats={["Clothing", "Hobbies", "Various"]}
            palette={SHOPPING_PALETTE}
            insights={computeCategoryInsights(
              categoryData["Shopping"] || [],
              ["Clothing", "Hobbies", "Various"],
              [
                { type: 'peak', subcat: 'Hobbies', label: 'Hobbies Peak' },
                { type: 'peak', subcat: 'Clothing', label: 'Clothing Peak' }
              ]
            )}
          />
        )}

        {activeTab === "subscriptions" && (
          <CategoryTab
            title="Subscriptions"
            data={categoryData["Subscriptions"] || []}
            subcats={["AI Services", "Courses & Classes", "Newspapers & Magazines", "Streaming Services", "Tech & Memberships"]}
            palette={SUBSCRIPTIONS_PALETTE}
            insights={computeCategoryInsights(
              categoryData["Subscriptions"] || [],
              ["AI Services", "Courses & Classes", "Newspapers & Magazines", "Streaming Services", "Tech & Memberships"],
              [
                { type: 'total', subcat: 'AI Services', label: 'AI Services YTD' },
                { type: 'peak', subcat: 'Courses & Classes', label: 'Courses Peak' }
              ]
            )}
          />
        )}

        {activeTab === "transportation" && (
          <CategoryTab
            title="Transportation"
            data={categoryData["Transportation"] || []}
            subcats={["Ride Share", "Public Transportation"]}
            palette={TRANSPORTATION_PALETTE}
            insights={computeCategoryInsights(
              categoryData["Transportation"] || [],
              ["Ride Share", "Public Transportation"],
              [
                { type: 'peak', subcat: 'Ride Share', label: 'Ride Share Peak' },
                { type: 'peak', subcat: 'Public Transportation', label: 'Transit Peak' }
              ]
            )}
          />
        )}

        {activeTab === "travel" && (
          <CategoryTab
            title="Travel"
            data={categoryData["Travel"] || []}
            subcats={["Air Travel", "Hotels"]}
            palette={TRAVEL_PALETTE}
            insights={computeCategoryInsights(
              categoryData["Travel"] || [],
              ["Air Travel", "Hotels"],
              [
                { type: 'peak', subcat: 'Air Travel', label: 'Air Travel Peak' },
                { type: 'peak', subcat: 'Hotels', label: 'Hotels Peak' }
              ]
            )}
          />
        )}

        {activeTab === "financial" && (
          <CategoryTab
            title="Financial"
            data={categoryData["Financial"] || []}
            subcats={["Interest Charged", "Membership Fees", "Fees & Admin", "Financial Fees", "Taxes"]}
            palette={FINANCIAL_PALETTE}
            insights={computeCategoryInsights(
              categoryData["Financial"] || [],
              ["Interest Charged", "Membership Fees", "Fees & Admin", "Financial Fees", "Taxes"],
              [
                { type: 'total', subcat: 'Interest Charged', label: 'Interest YTD' },
                { type: 'peak', subcat: 'Taxes', label: 'Tax Impact' }
              ]
            )}
          />
        )}

        {activeTab === "fun" && (
          <CategoryTab
            title="Fun & Entertainment"
            data={categoryData["Fun & Entertainment"] || categoryData["Fun"] || []}
            subcats={["Activities & Attractions", "Books, Movies & Music", "Live Events"]}
            palette={FUN_PALETTE}
            insights={computeCategoryInsights(
              categoryData["Fun & Entertainment"] || categoryData["Fun"] || [],
              ["Activities & Attractions", "Books, Movies & Music", "Live Events"],
              [
                { type: 'average', subcat: 'Activities & Attractions', label: 'Activities Avg' },
                { type: 'peak', subcat: 'Live Events', label: 'Live Events Peak' }
              ]
            )}
          />
        )}

        {activeTab === "recurring" && (
          <RecurringExpensesSection monthsData={monthsData} theme={theme} />
        )}

        {activeTab === "budgeting" && (
          <BudgetingSection
            monthsData={monthsData}
            categoryData={categoryData}
            groupMap={groupMap}
            theme={theme}
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardSection
            monthsData={monthsData}
            categoryData={categoryData}
            groupMap={groupMap}
            theme={theme}
          />
        )}
          </>
        )}

        {/* SECTION: DASHBOARD */}
        {activeSection === "dashboard" && (
          <DashboardSection
            monthsData={monthsData}
            categoryData={categoryData}
            groupMap={groupMap}
            theme={theme}
          />
        )}

        {/* SECTION: RECURRING EXPENSES */}
        {activeSection === "recurring" && (
          <RecurringExpensesSection monthsData={monthsData} theme={theme} />
        )}

        {/* SECTION: BUDGETING */}
        {activeSection === "budgeting" && (
          <BudgetingSection
            monthsData={monthsData}
            categoryData={categoryData}
            groupMap={groupMap}
            theme={theme}
          />
        )}
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isMobile={isMobile}
      />
    </div>
  );
}
