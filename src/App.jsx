import React, { useMemo, useState, useCallback, useEffect } from "react";
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

function formatCurrency(n) {
  if (Number.isNaN(n) || n === null || n === undefined) return "$0";
  const abs = Math.abs(n);
  const v = abs >= 1000 ? Math.round(abs) : Math.round(abs * 10) / 10;
  return `$${v.toLocaleString("en-US")}`;
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// ============ REUSABLE CHART COMPONENTS ============

const CategoryBarChart = React.memo(({ data, subcats, palette, viewMode, scale = "absolute" }) => {
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
            tickFormatter={scale === "percent" ? (v) => `${Math.round(v)}%` : formatCurrency}
          />
          <Tooltip content={<TooltipBox scale={scale} />} />
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
    </div>
  );
});
CategoryBarChart.displayName = 'CategoryBarChart';

const CategoryLineChart = React.memo(({ data, subcats, palette, scale = "absolute" }) => {
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
            tickFormatter={scale === "percent" ? (v) => `${Math.round(v)}%` : formatCurrency}
          />
          <Tooltip content={<TooltipBox scale={scale} />} />
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
        <ControlPill label="View" value={viewMode} setValue={handleViewModeChange} options={["stacked", "grouped"]} />
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
function OverviewTab({ excludeFamily, monthsData, givingCategories, groupMap, categoryData }) {
  const [mode, setMode] = useState("stacked");
  const [scale, setScale] = useState("absolute");
  const [topN, setTopN] = useState(THRESHOLDS.topCategories.default);
  const [focusGroup, setFocusGroup] = useState("All");
  const [chartType, setChartType] = useState("bars");
  const [showIncome, setShowIncome] = useState(true);

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
      topGroups.forEach((g) => { const v = Number(m[g] ?? 0); row[g] = scale === "percent" ? (monthTotal > 0 ? (v / monthTotal) * 100 : 0) : v; });
      const rest = groups.filter((g) => !topGroups.includes(g)).reduce((s, g) => s + Number(m[g] ?? 0), 0);
      row["Other"] = scale === "percent" ? (monthTotal > 0 ? (rest / monthTotal) * 100 : 0) : rest;
      row.__total = monthTotal;
      return row;
    });

    const dataForArea = filteredMonths.map((m) => {
      const row = { month: m.month };
      const monthTotal = groups.reduce((s, g) => s + Number(m[g] ?? 0), 0);
      if (focusGroup === "All") row.value = monthTotal;
      else if (focusGroup === "Other") row.value = groups.filter((g) => !topGroups.includes(g)).reduce((s, g) => s + Number(m[g] ?? 0), 0);
      else row.value = Number(m[focusGroup] ?? 0);
      row.value = scale === "percent" ? (monthTotal > 0 ? (row.value / monthTotal) * 100 : 0) : row.value;

      // Add income data from API
      row.income = Number(m.income ?? 0);

      return row;
    });

    return { groups, totalsByGroup, topGroups, dataForBars, dataForArea, monthlyTotals, spikes };
  }, [topN, scale, focusGroup, excludeFamily, monthsData, givingCategories, groupMap]);

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

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 22, padding: "16px 18px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <ControlPill label="Chart" value={chartType} setValue={setChartType} options={["bars", "breakdown", "vs income"]} />
        <ControlPill label="View" value={mode} setValue={setMode} options={["stacked", "grouped"]} />
        <ControlPill label="Scale" value={scale} setValue={setScale} options={["absolute", "percent"]} />
        <ControlPill label="Income" value={showIncome ? "show" : "hide"} setValue={(v) => setShowIncome(v === "show")} options={["show", "hide"]} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
          <div style={{ color: "#888", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>Top</div>
          <input type="range" min={3} max={10} value={topN} onChange={(e) => setTopN(Number(e.target.value))} style={{ width: 120 }} />
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 800, width: 22, textAlign: "right" }}>{topN}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
          <div style={{ color: "#888", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>Focus</div>
          <select value={focusGroup} onChange={(e) => setFocusGroup(e.target.value)} style={{ background: "rgba(0,0,0,0.25)", color: "#fff", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: "8px 10px", fontSize: 13, outline: "none" }}>
            <option value="All">All (Total)</option>
            {topGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 18, alignItems: "start" }}>
        <Panel
          title={
            chartType === "bars"
              ? `Month comparison (${scale === "percent" ? "% of month" : "NET dollars"})`
              : chartType === "breakdown"
              ? "Total Breakdown by Group"
              : "Income vs Expenses"
          }
          subtitle={
            chartType === "bars"
              ? (mode === "stacked" ? "Stacked: composition by month" : "Grouped: side-by-side")
              : chartType === "breakdown"
              ? "All-time spending distribution"
              : "Each group as % of total income (with savings if applicable)"
          }
        >
          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bars" ? (
                <BarChart data={dataForBars} margin={{ top: 10, right: 22, left: 6, bottom: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => (scale === "percent" ? `${Math.round(v)}%` : formatCurrency(v))} />
                  <Tooltip content={<TooltipBox scale={scale} />} />
                  <Legend wrapperStyle={{ color: "#999", fontSize: 11 }} />
                  {activeSeries.map((key) => (<Bar key={key} dataKey={key} stackId={mode === "stacked" ? "a" : undefined} fill={colorFor(key)} radius={mode === "stacked" ? [3, 3, 0, 0] : 3} maxBarSize={36} opacity={key === "Other" ? 0.7 : 0.95} />))}
                </BarChart>
              ) : chartType === "breakdown" ? (
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`}
                    labelLine={{ stroke: "#666", strokeWidth: 1 }}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
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
                    label={({ name, value, percent }) => `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`}
                    labelLine={{ stroke: "#666", strokeWidth: 1 }}
                  >
                    {incomeVsExpensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
          {chartType === "bars" && (
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Tag text={`${activeSeries.length - 1} categories + Other`} />
              <Tag text={spikes.length ? `Spike months: ${spikes.join(", ")}` : "No spikes flagged"} tone={spikes.length ? "warn" : "ok"} />
            </div>
          )}
        </Panel>

        <Panel title={focusGroup === "All" ? "Total trend" : `Trend: ${focusGroup}`} subtitle={scale === "percent" ? "Percent of monthly total" : "NET spending after credits"}>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataForArea} margin={{ top: 10, right: 22, left: 6, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => (scale === "percent" ? `${Math.round(v)}%` : formatCurrency(v))} />
                <Tooltip content={<TooltipBox scale={scale} />} />
                <Area type="monotone" dataKey="value" stroke={colorFor(focusGroup)} fill={colorFor(focusGroup)} fillOpacity={0.18} strokeWidth={2} />
                {showIncome && <Line type="monotone" dataKey="income" stroke="rgba(78, 205, 196, 0.4)" strokeWidth={2} dot={false} strokeDasharray="5 5" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <StatBox label="Total YTD" value={formatCurrency(monthlyTotals.reduce((s, m) => s + m.total, 0))} />
            <StatBox label="Monthly Avg" value={formatCurrency(monthlyTotals.reduce((s, m) => s + m.total, 0) / monthlyTotals.length)} />
            <StatBox label="Highest" value={formatCurrency(highestMonth.value)} subtext={highestMonth.month} />
          </div>
        </Panel>
      </div>

      <div style={{ marginTop: 18 }}>
        <Panel title="Group Totals (YTD NET)" subtitle="Ranked by total spend after credits applied">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {Object.entries(totalsByGroup).sort((a, b) => b[1] - a[1]).map(([group, total]) => {
              const avgMonthly = monthsData.length > 0 ? total / monthsData.length : 0;
              return (
                <div key={group} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: colorFor(group) }} />
                    <span style={{ color: "#aaa", fontSize: 12 }}>{group}</span>
                  </div>
                  <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{formatCurrency(total)}</div>
                  <div style={{ color: "#666", fontSize: 11 }}>Avg: {formatCurrency(avgMonthly)}/mo</div>
                </div>
              );
            })}
            <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(78,205,196,0.08)", border: "1px solid rgba(78,205,196,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: "#4ecdc4" }} />
                <span style={{ color: "#4ecdc4", fontSize: 12 }}>Total Income</span>
              </div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{formatCurrency(totalIncome)}</div>
              <div style={{ color: "#4ecdc4", fontSize: 11 }}>Avg: {formatCurrency(monthsData.length > 0 ? totalIncome / monthsData.length : 0)}/mo</div>
            </div>
          </div>
        </Panel>
      </div>

      <div style={{ marginTop: 18 }}>
        <Panel title="Key Insights" subtitle="NET spending analysis">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ padding: "16px", borderRadius: 12, background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)" }}>
              <div style={{ color: "#ff6b6b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Actual Rent</div>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{formatCurrency(actualRent)}/mo</div>
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Average monthly after split</div>
            </div>
            <div style={{ padding: "16px", borderRadius: 12, background: "rgba(170,150,218,0.08)", border: "1px solid rgba(170,150,218,0.15)" }}>
              <div style={{ color: "#aa96da", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Interest Paid</div>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{formatCurrency(interestPaid)}</div>
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Total interest charged</div>
            </div>
          </div>
        </Panel>
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
        <ControlPill label="View" value={viewMode} setValue={setViewMode} options={["stacked", "grouped"]} />
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
const TooltipBox = React.memo(({ active, payload, label, scale = "absolute" }) => {
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
            {scale === "percent" ? `${p.value.toFixed(1)}%` : formatCurrency(p.value)}
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

const Panel = React.memo(({ title, subtitle, children }) => {
  return (
    <div style={{
      background: `rgba(255,255,255,${OPACITY.surface.level0})`,
      borderRadius: RADIUS['4xl'],
      padding: SPACING['5xl'],
      border: `1px solid rgba(255,255,255,${OPACITY.surface.level3})`
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        gap: SPACING.lg,
        marginBottom: SPACING['2xl']
      }}>
        <div>
          <div style={{ fontSize: FONT_SIZE.lg, fontWeight: 800, color: COLORS.gray[200] }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              marginTop: SPACING.xs,
              fontSize: FONT_SIZE.base,
              color: COLORS.gray[700]
            }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
});
Panel.displayName = 'Panel';

const StatBox = React.memo(({ label, value, subtext }) => {
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
        color: COLORS.white,
        fontSize: FONT_SIZE.xl,
        fontWeight: 800,
        marginTop: SPACING.xs
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
      <div style={{
        color: COLORS.gray[600],
        fontSize: FONT_SIZE.base,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1.2
      }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: SPACING.md }}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              onClick={() => setValue(opt)}
              style={{
                padding: `${SPACING.md}px ${SPACING.xl}px`,
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
                cursor: "pointer"
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
        const response = await fetch('http://localhost:3001/api/spending-data');

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
      background: COLORS.background.primary,
      minHeight: "100vh",
      padding: `${SPACING['7xl']}px ${SPACING['3xl']}px`,
      fontFamily: "system-ui, -apple-system, sans-serif"
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
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: SPACING['3xl']
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: FONT_SIZE['3xl'],
              fontWeight: 800,
              color: COLORS.white,
              letterSpacing: "-0.5px"
            }}>
              {dateRange.yearLabel ? `${dateRange.yearLabel} Spending Analysis` : 'Spending Analysis'}
            </h1>
            <p style={{
              margin: `${SPACING.sm}px 0 0`,
              color: COLORS.gray[800],
              fontSize: FONT_SIZE.md
            }}>
              NET spending after credits • Transfers excluded • {dateRange.monthCount} months
            </p>
          </div>
        {activeTab === "overview" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 12, background: excludeFamily ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={excludeFamily} onChange={(e) => setExcludeFamily(e.target.checked)} style={{ accentColor: "#4ecdc4" }} />
              <span style={{ color: excludeFamily ? "#4ecdc4" : "#888", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>Exclude Family Care</span>
            </label>
          </div>
        )}
        </div>
        <div style={{
          display: "flex",
          gap: SPACING.md,
          marginBottom: SPACING['6xl'],
          borderBottom: `1px solid rgba(255,255,255,${OPACITY.border.default})`,
          paddingBottom: SPACING['3xl'],
          flexWrap: "wrap"
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: `${SPACING.lg}px ${SPACING['3xl']}px`,
                borderRadius: RADIUS.xl,
                border: activeTab === tab.id ? `1px solid ${tab.color}40` : "1px solid transparent",
                background: activeTab === tab.id ? `${tab.color}15` : "transparent",
                color: activeTab === tab.id ? tab.color : COLORS.gray[600],
                fontSize: FONT_SIZE.md,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab excludeFamily={excludeFamily} monthsData={monthsData} givingCategories={categoryData["Giving"] || []} groupMap={groupMap} categoryData={categoryData} />}

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
