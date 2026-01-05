import React, { useMemo, useState, useCallback, useEffect } from "react";
import { API_BASE_URL, API_ENDPOINT } from './config';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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


const PALETTE = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#95e1d3", "#f38181", "#aa96da", "#fcbad3", "#a8d8ea", "#f9c74f", "#90be6d", "#e17055", "#577590"];

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

const FOOD_PALETTE = { "Bars": "#f38181", "Cafes": "#f9c74f", "Groceries": "#90be6d", "Restaurants": "#ff6b6b", "Takeout & Delivery": "#4ecdc4" };
const FUN_PALETTE = { "Activities & Attractions": "#aa96da", "Books, Movies & Music": "#4ecdc4", "Live Events": "#ff6b6b" };
const GIVING_PALETTE = { "Charity": "#90be6d", "Family Care": "#ff6b6b", "Gifts": "#f9c74f" };
const HEALTH_PALETTE = { "Fitness": "#4ecdc4", "Healthcare & Pharmacy": "#ff6b6b", "Personal Care": "#f9c74f" };
const HOME_PALETTE = { "Home Improvement": "#aa96da", "Laundry & Dry Cleaning": "#f9c74f", "Rent & Insurance": "#ff6b6b", "Utilities": "#4ecdc4" };
const SHOPPING_PALETTE = { "Clothing": "#aa96da", "Hobbies": "#4ecdc4", "Various": "#f9c74f" };
const FINANCIAL_PALETTE = { "Fees & Admin": "#f38181", "Financial Fees": "#aa96da", "Interest Charged": "#ff6b6b", "Membership Fees": "#4ecdc4", "Taxes": "#90be6d" };
const TRANSPORTATION_PALETTE = { "Public Transportation": "#90be6d", "Ride Share": "#4ecdc4" };
const TRAVEL_PALETTE = { "Air Travel": "#aa96da", "Hotels": "#ff6b6b" };
const SUBSCRIPTIONS_PALETTE = { "AI Services": "#ff6b6b", "Courses & Classes": "#aa96da", "Newspapers & Magazines": "#f9c74f", "Streaming Services": "#4ecdc4", "Tech & Memberships": "#95e1d3" };

// ============ DESIGN SYSTEM CONSTANTS ============

// Typography Scale
const FONT_SIZE = {
  xs: 10,
  sm: 11,
  base: 12,
  md: 13,
  lg: 14,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
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
    teal: '#4ecdc4',
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
    info: '#4ecdc4',
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

// ============ GENERIC CATEGORY TAB ============
function CategoryTab({ title, data, subcats, palette, insights }) {
  const [viewMode, setViewMode] = useState("stacked");

  const totals = useMemo(() => {
    const t = {};
    subcats.forEach(c => t[c] = 0);
    data.forEach(m => {
      subcats.forEach(c => t[c] += m[c] || 0);
    });
    return t;
  }, [data, subcats]);

  const monthlyTotals = useMemo(
    () => data.map(m => ({
      month: m.month,
      total: subcats.reduce((s, c) => s + (m[c] || 0), 0)
    })),
    [data, subcats]
  );

  const avgMonthly = useMemo(
    () => monthlyTotals.reduce((s, m) => s + m.total, 0) / monthlyTotals.length,
    [monthlyTotals]
  );

  const grandTotal = useMemo(
    () => Object.values(totals).reduce((a, b) => a + b, 0),
    [totals]
  );

  const topMonths = useMemo(
    () => [...monthlyTotals].sort((a, b) => b.total - a.total).slice(0, 3),
    [monthlyTotals]
  );

  const handleViewModeChange = useCallback((mode) => setViewMode(mode), []);

  return (
    <>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: SPACING['2xl'],
        marginBottom: SPACING['5xl'],
        padding: `${SPACING['3xl']}px ${SPACING['4xl']}px`,
        borderRadius: RADIUS['3xl'],
        background: `rgba(255,255,255,${OPACITY.surface.level0})`,
        border: `1px solid rgba(255,255,255,${OPACITY.surface.level3})`
      }}>
        <ControlPill value={viewMode} setValue={handleViewModeChange} options={["stacked", "grouped"]} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING['4xl'] }}>
        <Panel title={`${title} by Month`} subtitle="NET spending by subcategory">
          <CategoryBarChart data={data} subcats={subcats} palette={palette} viewMode={viewMode} />
        </Panel>
        <Panel title="Subcategory Trends" subtitle="Month-over-month comparison">
          <CategoryLineChart data={data} subcats={subcats} palette={palette} />
        </Panel>
      </div>
      <div style={{
        marginTop: SPACING['4xl'],
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(subcats.length, 5)}, 1fr)`,
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING['4xl'] }}>
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

  const [topN, setTopN] = useState(THRESHOLDS.topCategories.default);
  const [focusGroup, setFocusGroup] = useState("All");
  const [chartType, setChartType] = useState("bars");
  const [showIncome, setShowIncome] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null); // For mobile DataGrid

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
    const topGroups = ordered.slice(0, clamp(topN, THRESHOLDS.topCategories.min, ordered.length));

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
      const rest = groups.filter((g) => !topGroups.includes(g)).reduce((s, g) => s + Number(m[g] ?? 0), 0);
      row["Other"] = rest;
      row.__total = monthTotal;
      return row;
    });

    const dataForArea = filteredMonths.map((m) => {
      const row = { month: m.month };
      const monthTotal = groups.reduce((s, g) => s + Number(m[g] ?? 0), 0);
      if (focusGroup === "All") row.value = monthTotal;
      else if (focusGroup === "Other") row.value = groups.filter((g) => !topGroups.includes(g)).reduce((s, g) => s + Number(m[g] ?? 0), 0);
      else row.value = Number(m[focusGroup] ?? 0);

      // Add income data from API
      row.income = Number(m.income ?? 0);

      return row;
    });

    return { groups, totalsByGroup, topGroups, dataForBars, dataForArea, monthlyTotals, spikes };
  }, [topN, focusGroup, excludeFamily, monthsData, givingCategories, groupMap]);

  const activeSeries = [...topGroups, "Other"];
  const colorFor = useCallback((key) => {
    // Use fixed colors for spending groups
    if (GROUP_COLORS[key]) {
      return GROUP_COLORS[key];
    }
    // Fallback for "Other" or unknown groups
    if (key === "Other") {
      return "#888888";
    }
    // Final fallback to hash-based color
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
  }, []);

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
      color: '#4ecdc4' // teal for savings
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
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "repeat(12, 1fr)",
        gridTemplateRows: isMobile ? "auto auto auto auto" : "auto auto",
        gap: "1px",
        background: "#000000",
        marginBottom: "0"
      }}>
        {/* Top Left - Month Comparison */}
        <div style={{
          gridColumn: isMobile ? "1" : isTablet ? "1" : "span 8",
          gridRow: isMobile ? "1" : "1"
        }}>
          <Panel
            title={chartType === "bars" ? "Month Comparison" : "Income vs Expenses"}
            subtitle={chartType === "bars" ? "NET spending by category" : "Spending as % of total income"}
            theme={theme}
            style={{ border: "none", borderRadius: 0 }}
          >
          {/* Chart Controls - Upper Right */}
          <div style={{
            position: isMobile ? "static" : "absolute",
            top: isMobile ? undefined : 16,
            right: isMobile ? undefined : 16,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 8,
            alignItems: isMobile ? "stretch" : "center",
            zIndex: 10,
            marginBottom: isMobile ? 16 : undefined
          }}>
            <ControlPill value={chartType} setValue={setChartType} options={["bars", "vs income"]} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", fontSize: 10, color: "#888" }}>
              <span style={{ textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>TOP</span>
              <input type="range" min={3} max={10} value={topN} onChange={(e) => setTopN(Number(e.target.value))} style={{ width: 60 }} />
              <span style={{ color: "#fff", fontWeight: 600, minWidth: "16px" }}>{topN}</span>
            </div>
          </div>
          <div style={{ width: "100%", height: chartHeight + 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bars" ? (
                <BarChart data={dataForBars} margin={{ top: 10, right: 22, left: 6, bottom: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: theme === "light" ? "#1a1a1a" : "#888", fontSize: 10 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: theme === "light" ? "#1a1a1a" : "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                  {!isMobile && <Tooltip content={<TooltipBox scale="absolute" />} />}
                  {!isMobile && <Legend wrapperStyle={{ color: theme === "light" ? "#1a1a1a" : "#999", fontSize: 11 }} />}
                  {activeSeries.map((key) => (<Bar key={key} dataKey={key} stackId="a" fill={colorFor(key)} radius={[3, 3, 0, 0]} maxBarSize={36} opacity={key === "Other" ? 0.7 : 0.95} />))}
                </BarChart>
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
          <DataGrid data={dataForBars} colorMap={colorFor} selectedMonth={selectedMonth} onMonthSelect={setSelectedMonth} monthsData={monthsData} />
          {/* Controls below chart */}
          <div style={{ marginTop: isMobile ? SPACING['2xl'] : 12, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "center" : "space-between", alignItems: "center" }}>
            {!isMobile && chartType === "bars" && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Tag text={`${activeSeries.length - 1} categories + Other`} />
                <Tag text={spikes.length ? `Spike months: ${spikes.join(", ")}` : "No spikes flagged"} tone={spikes.length ? "warn" : "ok"} />
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: isMobile ? "10px 16px" : "6px 12px", borderRadius: 8, background: excludeFamily ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={excludeFamily} onChange={(e) => setExcludeFamily(e.target.checked)} style={{ accentColor: "#4ecdc4" }} />
                <span style={{ color: excludeFamily ? "#4ecdc4" : "#888", fontSize: isMobile ? 12 : 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Exclude Family Care</span>
              </label>
            </div>
          </div>
          </Panel>
        </div>

        {/* Top Right - Total Trend */}
        <div style={{
          gridColumn: isMobile ? "1" : isTablet ? "1" : "span 4",
          gridRow: isMobile ? "2" : "1"
        }}>
          <Panel
            title={focusGroup === "All" ? "Total Trend" : focusGroup}
            theme={theme}
            style={{ border: "none", borderRadius: 0 }}
          >
          {/* Line Chart Controls - Below Header */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 4, background: "rgba(255,255,255,0.03)", fontSize: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>FOCUS</span>
              <select value={focusGroup} onChange={(e) => setFocusGroup(e.target.value)} style={{ background: "rgba(0,0,0,0.25)", color: "#fff", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 4, padding: "3px 6px", fontSize: 10, outline: "none", textTransform: "uppercase" }}>
                <option value="All">ALL</option>
                {topGroups.map((g) => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                <option value="Other">OTHER</option>
              </select>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={showIncome} onChange={(e) => setShowIncome(e.target.checked)} style={{ accentColor: theme === "light" ? "#1a1a1a" : "#888", cursor: "pointer" }} />
              <span style={{ color: theme === "light" ? "#1a1a1a" : "#888", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>SHOW INCOME</span>
            </label>
          </div>
          <div style={{ width: "100%", height: chartHeight - 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataForArea} margin={{ top: 10, right: 22, left: 6, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                {!isMobile && <Tooltip content={<TooltipBox scale="absolute" />} />}
                <Area type="monotone" dataKey="value" stroke={colorFor(focusGroup)} fill={colorFor(focusGroup)} fillOpacity={0.18} strokeWidth={2} />
                {showIncome && <Line type="monotone" dataKey="income" stroke="rgba(78, 205, 196, 0.4)" strokeWidth={2} dot={false} strokeDasharray="5 5" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <StatBox label="Total YTD" value={formatCurrency(monthlyTotals.reduce((s, m) => s + m.total, 0))} theme={theme} />
            <StatBox label="Monthly Avg" value={formatCurrency(monthlyTotals.reduce((s, m) => s + m.total, 0) / monthlyTotals.length)} theme={theme} />
            <StatBox label="Highest" value={formatCurrency(highestMonth.value)} subtext={highestMonth.month} theme={theme} />
            <StatBox label="Total Income" value={formatCurrency(totalIncome)} subtext={`Avg: ${formatCurrency(monthsData.length > 0 ? totalIncome / monthsData.length : 0)}/mo`} theme={theme} />
            <StatBox
              label={monthlySurplus >= 0 ? "Monthly Surplus" : "Monthly Deficit"}
              value={formatCurrency(Math.abs(monthlySurplus))}
              subtext={monthlySurplus >= 0 ? "Saving" : "Overspending"}
              theme={theme}
            />
            <StatBox label="Lowest" value={formatCurrency(lowestMonth.value)} subtext={lowestMonth.month} theme={theme} />
          </div>
          </Panel>
        </div>

        {/* Bottom Left - Group Totals */}
        <div style={{
          gridColumn: isMobile ? "1" : isTablet ? "1" : "span 8",
          gridRow: isMobile ? "3" : "2"
        }}>
          <Panel
            title="Group Totals"
            subtitle="Ranked by total spend after credits applied"
            theme={theme}
            style={{ border: "none", borderRadius: 0 }}
          >
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 10 }}>
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
                  <div style={{ color: valueColor, fontSize: 15, fontWeight: 700, marginBottom: 2, transition: "color 0.3s ease" }}>{formatCurrency(total)}</div>
                  <div style={{ color: "#666", fontSize: 11, marginBottom: 2 }}>{percentOfIncome.toFixed(1)}% of income</div>
                  <div style={{ color: "#666", fontSize: 11 }}>Avg: {formatCurrency(avgMonthly)}/mo</div>
                </div>
              );
            })}
          </div>
          </Panel>
        </div>

        {/* Bottom Right - Recurrent Expenses */}
        <div style={{
          gridColumn: isMobile ? "1" : isTablet ? "1" : "span 4",
          gridRow: isMobile ? "4" : "2"
        }}>
          <Panel title="Recurrent Expenses" theme={theme} style={{ border: "none", borderRadius: 0 }}>
          {(() => {
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
                  { name: "MUBI", amount: 167.88, frequency: "Yearly" }
                ]
              },
              {
                name: "Services",
                items: [
                  { name: "Apple Care", amount: 8.70, frequency: "Monthly" },
                  { name: "Amazon Prime", amount: 16.32, frequency: "Monthly" },
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

            return (
              <div>
                {/* Summary Card */}
                <div style={{
                  padding: "12px",
                  borderRadius: 8,
                  background: theme === "light" ? "rgba(78,205,196,0.08)" : "rgba(78,205,196,0.08)",
                  border: `1px solid ${theme === "light" ? "rgba(78,205,196,0.2)" : "rgba(78,205,196,0.15)"}`,
                  marginBottom: 12
                }}>
                  <div style={{ color: "#4ecdc4", fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Monthly Average</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, fontSize: 10 }}>
                    {groupAverages.map((group, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: theme === "light" ? "#6a6a6a" : "#888" }}>{group.name}</span>
                        <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 600 }}>{formatCurrency(group.monthly)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: `1px solid ${theme === "light" ? "rgba(78,205,196,0.2)" : "rgba(78,205,196,0.15)"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontSize: 11, fontWeight: 700 }}>Total</span>
                    <span style={{ color: "#4ecdc4", fontSize: 16, fontWeight: 800 }}>{formatCurrency(totalMonthly)}</span>
                  </div>
                </div>

                {/* Group Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                  {expenseGroups.map((group, groupIdx) => (
                    <div key={groupIdx} style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: theme === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`
                    }}>
                      <div style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontSize: 10, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>
                        {group.name}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {group.items.map((item, itemIdx) => (
                          <div key={itemIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10 }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                              <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 500 }}>{item.name}</span>
                              <span style={{ color: theme === "light" ? "#888" : "#666", fontSize: 8 }}>({item.frequency})</span>
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
                        fontSize: 10
                      }}>
                        <span style={{ color: theme === "light" ? "#6a6a6a" : "#888" }}>Avg/month</span>
                        <span style={{ color: theme === "light" ? "#1a1a1a" : "#fff", fontWeight: 700 }}>
                          {formatCurrency(group.items.reduce((sum, item) => sum + toMonthly(item.amount, item.frequency), 0))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          </Panel>
        </div>
      </div>
    </>
  );
}

// ============ GIVING TAB (with Family Care toggle) ============
function GivingTab({ categoryData }) {
  const [viewMode, setViewMode] = useState("stacked");
  const [excludeFamily, setExcludeFamily] = useState(false);
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
        <ControlPill value={viewMode} setValue={setViewMode} options={["stacked", "grouped"]} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 12, background: excludeFamily ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={excludeFamily} onChange={(e) => setExcludeFamily(e.target.checked)} style={{ accentColor: "#4ecdc4" }} />
            <span style={{ color: excludeFamily ? "#4ecdc4" : "#888", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>Exclude Family Care</span>
          </label>
        </div>
      </div>
      {excludeFamily && (<div style={{ background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}><span style={{ color: "#4ecdc4" }}>ℹ</span><span style={{ color: "#94a3b8", fontSize: 13 }}>Family Care ({formatCurrency(totalFamilyCare)}) excluded from charts</span></div>)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Panel title="Giving by Month" subtitle="NET spending by subcategory">
          <div style={{ width: "100%", height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 22, left: 6, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                <Tooltip content={<TooltipBox scale="absolute" />} />
                <Legend wrapperStyle={{ color: "#999", fontSize: 11 }} />
                {subcats.map((key) => (<Bar key={key} dataKey={key} stackId={viewMode === "stacked" ? "a" : undefined} fill={GIVING_PALETTE[key]} radius={viewMode === "stacked" ? [2, 2, 0, 0] : 2} maxBarSize={32} />))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Subcategory Trends" subtitle="Month-over-month comparison">
          <div style={{ width: "100%", height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 22, left: 6, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                <Tooltip content={<TooltipBox scale="absolute" />} />
                <Legend wrapperStyle={{ color: "#999", fontSize: 11 }} />
                {subcats.map((key) => (<Line key={key} type="monotone" dataKey={key} stroke={GIVING_PALETTE[key]} strokeWidth={2} dot={{ r: 3 }} />))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: `repeat(${subcats.length}, 1fr)`, gap: 14 }}>
        {subcats.map(cat => (
          <Panel key={cat} title={cat} subtitle="">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: GIVING_PALETTE[cat] }} />
              <span style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{formatCurrency(totals[cat])}</span>
            </div>
            <div style={{ color: "#666", fontSize: 11 }}>{grandTotal > 0 ? ((totals[cat] / grandTotal) * 100).toFixed(1) : 0}% of total</div>
            <div style={{ color: "#888", fontSize: 11, marginTop: 4 }}>Avg: {formatCurrency(totals[cat] / chartData.length)}/mo</div>
          </Panel>
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        <Panel title="Giving Insights" subtitle="">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
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
              <div style={{ color: "#4ecdc4", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Key Stats</div>
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

// Interactive data grid for mobile - shows selected month's breakdown
const DataGrid = React.memo(({ data, colorMap, selectedMonth, onMonthSelect, monthsData }) => {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);
  if (!isMobile || !data || data.length === 0) return null;

  // Default to most recent month if none selected
  const currentMonth = selectedMonth || data[data.length - 1]?.month;
  const monthData = data.find(m => m.month === currentMonth) || data[data.length - 1];

  // Get income for the selected month
  const monthInfo = monthsData?.find(m => m.month === currentMonth);
  const income = monthInfo?.income || 0;

  // Extract categories and values for the selected month (exclude __TOTAL and similar to avoid duplication)
  const categories = Object.entries(monthData)
    .filter(([key, value]) => {
      // Exclude: month, __TOTAL, TOTAL, or anything starting with underscore
      if (key === 'month' || key.startsWith('_') || key.toUpperCase().includes('TOTAL')) return false;
      return typeof value === 'number' && value > 0;
    })
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8); // Show top 8 categories

  const monthTotal = categories.reduce((sum, [, value]) => sum + value, 0);
  const surplus = income - monthTotal;
  const isSurplus = surplus >= 0;

  return (
    <div style={{ marginTop: SPACING['3xl'] }}>
      {/* Month selector */}
      <div style={{
        marginBottom: SPACING['2xl'],
        display: "flex",
        alignItems: "center",
        gap: SPACING.md
      }}>
        <div style={{
          color: COLORS.gray[600],
          fontSize: FONT_SIZE.sm,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          Month:
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
          {data.map((m) => (
            <option key={m.month} value={m.month}>
              {m.month}
            </option>
          ))}
        </select>
      </div>

      {/* Category grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: SPACING.md
      }}>
        {categories.map(([category, value]) => (
          <div key={category} style={{
            display: "flex",
            flexDirection: "column",
            gap: SPACING.xs,
            padding: SPACING.lg,
            background: `rgba(255,255,255,${OPACITY.surface.level1})`,
            borderRadius: RADIUS.md,
            border: `1px solid rgba(255,255,255,${OPACITY.border.default})`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: colorMap(category),
                flexShrink: 0
              }} />
              <div style={{
                color: COLORS.gray[400],
                fontSize: FONT_SIZE.sm,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {category}
              </div>
            </div>
            <div style={{
              color: COLORS.white,
              fontSize: FONT_SIZE.lg,
              fontWeight: 800
            }}>
              {formatCurrency(value)}
            </div>
            <div style={{
              color: COLORS.gray[600],
              fontSize: FONT_SIZE.xs
            }}>
              {income > 0 ? ((value / income) * 100).toFixed(1) : 0}% of income
            </div>
          </div>
        ))}

        {/* Total row - spans both columns */}
        <div style={{
          gridColumn: "1 / -1",
          display: "flex",
          flexDirection: "column",
          gap: SPACING.xs,
          padding: SPACING.lg,
          background: `rgba(255,255,255,${OPACITY.surface.level2})`,
          borderRadius: RADIUS.md,
          border: `2px solid rgba(255,255,255,${OPACITY.border.strong})`
        }}>
          <div style={{
            color: COLORS.gray[400],
            fontSize: FONT_SIZE.sm,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Total Spending
          </div>
          <div style={{
            color: COLORS.white,
            fontSize: FONT_SIZE.xl,
            fontWeight: 800
          }}>
            {formatCurrency(monthTotal)}
          </div>
          <div style={{
            color: isSurplus ? COLORS.accent.teal : COLORS.accent.red,
            fontSize: FONT_SIZE.sm,
            fontWeight: 700
          }}>
            {isSurplus ? '↑ ' : '↓ '}{formatCurrency(Math.abs(surplus))} {isSurplus ? 'surplus' : 'deficit'}
          </div>
        </div>
      </div>
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

// ============ MAIN DASHBOARD ============
export default function SpendingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [excludeFamily, setExcludeFamily] = useState(false);
  const [theme, setTheme] = useState("dark"); // "dark" or "light"

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

  // Fetch data from Google Sheets API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update months data
        setMonthsData(data.months);

        // Store group map
        setGroupMap(data.groupMap || {});

        // Transform and update category data
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

  const tabs = [
    { id: "overview", label: "Overview", color: "#4ecdc4" },
    { id: "food", label: "Food & Dining", color: "#ff6b6b" },
    { id: "giving", label: "Giving", color: "#f9c74f" },
    { id: "health", label: "Health", color: "#90be6d" },
    { id: "home", label: "Home", color: "#aa96da" },
    { id: "shopping", label: "Shopping", color: "#f38181" },
    { id: "subscriptions", label: "Subscriptions", color: "#95e1d3" },
    { id: "transportation", label: "Transportation", color: "#4ecdc4" },
    { id: "travel", label: "Travel", color: "#aa96da" },
    { id: "financial", label: "Financial", color: "#e17055" },
    { id: "fun", label: "Fun", color: "#fcbad3" },
  ];

  return (
    <div style={{
      background: isMobile && theme === "dark" ? "#000000" : currentTheme.background,
      minHeight: "100vh",
      padding: isMobile ? `${SPACING['3xl']}px ${SPACING.md}px` : `${SPACING['7xl']}px ${SPACING['3xl']}px`,
      fontFamily: "'Archivo Narrow', sans-serif",
      transition: "background 0.3s ease"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%"
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
              borderTop: "4px solid #4ecdc4",
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
        <div style={{
          marginBottom: SPACING['6xl'],
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: SPACING['3xl'],
          position: "relative"
        }}>
          <h1 style={{
            margin: 0,
            fontSize: FONT_SIZE['3xl'],
            fontWeight: 600,
            color: currentTheme.text,
            letterSpacing: "2px",
            textTransform: "uppercase",
            textAlign: "center",
            transition: "color 0.3s ease"
          }}>
            {dateRange.yearLabel ? `${dateRange.yearLabel} Spending Analysis` : 'Spending Analysis'}
          </h1>
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: currentTheme.panelBg,
              border: `1px solid ${currentTheme.panelBorder}`,
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: currentTheme.text }}>
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: currentTheme.text }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
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

        {activeTab === "food" && (
          <CategoryTab
            title="Food & Dining"
            data={categoryData["Food & Dining"] || []}
            subcats={["Restaurants", "Takeout & Delivery", "Bars", "Groceries", "Cafes"]}
            palette={FOOD_PALETTE}
            insights={[
              { label: "Restaurants % of Total", value: "52.6%" },
              { label: "Bars Peak", value: "Jul 2025 ($500)" }
            ]}
          />
        )}

        {activeTab === "giving" && <GivingTab categoryData={categoryData["Giving"] || []} />}

        {activeTab === "health" && (
          <CategoryTab
            title="Health & Wellness"
            data={categoryData["Health & Wellness"] || []}
            subcats={["Fitness", "Healthcare & Pharmacy", "Personal Care"]}
            palette={HEALTH_PALETTE}
            insights={[
              { label: "Fitness Monthly", value: "~$244/mo" },
              { label: "Healthcare Peak", value: "Aug 2025 ($303)" }
            ]}
          />
        )}

        {activeTab === "home" && (
          <CategoryTab
            title="Home"
            data={categoryData["Home"] || []}
            subcats={["Rent & Insurance", "Utilities", "Home Improvement", "Laundry & Dry Cleaning"]}
            palette={HOME_PALETTE}
            insights={[
              { label: "Actual Rent", value: "~$859/mo (after split)" },
              { label: "Utilities Avg", value: "~$157/mo" }
            ]}
          />
        )}

        {activeTab === "shopping" && (
          <CategoryTab
            title="Shopping"
            data={categoryData["Shopping"] || []}
            subcats={["Clothing", "Hobbies", "Various"]}
            palette={SHOPPING_PALETTE}
            insights={[
              { label: "Hobbies Peak", value: "Dec 2025 ($610)" },
              { label: "Clothing Peak", value: "Sep 2025 ($236)" }
            ]}
          />
        )}

        {activeTab === "subscriptions" && (
          <CategoryTab
            title="Subscriptions"
            data={categoryData["Subscriptions"] || []}
            subcats={["AI Services", "Courses & Classes", "Newspapers & Magazines", "Streaming Services", "Tech & Memberships"]}
            palette={SUBSCRIPTIONS_PALETTE}
            insights={[
              { label: "AI Services YTD", value: "$1,026" },
              { label: "Courses Peak", value: "Feb 2025 ($280)" }
            ]}
          />
        )}

        {activeTab === "transportation" && (
          <CategoryTab
            title="Transportation"
            data={categoryData["Transportation"] || []}
            subcats={["Ride Share", "Public Transportation"]}
            palette={TRANSPORTATION_PALETTE}
            insights={[
              { label: "Ride Share Peak", value: "Jul 2025 ($537)" },
              { label: "Transit Peak", value: "Oct 2025 ($162)" }
            ]}
          />
        )}

        {activeTab === "travel" && (
          <CategoryTab
            title="Travel"
            data={categoryData["Travel"] || []}
            subcats={["Air Travel", "Hotels"]}
            palette={TRAVEL_PALETTE}
            insights={[
              { label: "Jan Trip", value: "$1,256" },
              { label: "Oct Europe Trip", value: "$1,497" }
            ]}
          />
        )}

        {activeTab === "financial" && (
          <CategoryTab
            title="Financial"
            data={categoryData["Financial"] || []}
            subcats={["Interest Charged", "Membership Fees", "Fees & Admin", "Financial Fees", "Taxes"]}
            palette={FINANCIAL_PALETTE}
            insights={[
              { label: "Interest YTD", value: "$1,334" },
              { label: "Tax Refund (Mar)", value: "$1,198 credit" }
            ]}
          />
        )}

        {activeTab === "fun" && (
          <CategoryTab
            title="Fun & Entertainment"
            data={categoryData["Fun & Entertainment"] || []}
            subcats={["Activities & Attractions", "Books, Movies & Music", "Live Events"]}
            palette={FUN_PALETTE}
            insights={[
              { label: "Summer Peak (May-Aug)", value: "~$656/mo avg" },
              { label: "Live Events Peak", value: "Nov 2025 ($449)" }
            ]}
          />
        )}
          </>
        )}
      </div>
    </div>
  );
}
