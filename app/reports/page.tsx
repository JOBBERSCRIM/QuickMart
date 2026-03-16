"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/db";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function ReportsPage() {
  // 🔑 State
  const [sales, setSales] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Restock controls
  const [restockTarget, setRestockTarget] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState<number>(0);

  // 📊 Profit Views
  const [dailyProfit, setDailyProfit] = useState<any[]>([]);
  const [categoryProfit, setCategoryProfit] = useState<any[]>([]);

  // Chat Assistant
  const [chatQuery, setChatQuery] = useState("");
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);

  // 🔑 Fetch data on mount
  useEffect(() => {
    fetchSales();
    fetchStockLevels();
    fetchProfitViews();
  }, []);

  // 🔑 Fetch sales data
  async function fetchSales() {
    let query = supabase
      .from("sales")
      .select("*, items(name)")
      .order("timestamp", { ascending: false });

    if (startDate && endDate) {
      query = query.gte("timestamp", startDate).lte("timestamp", endDate);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching sales:", error.message);
    } else {
      setSales(data ?? []);
      computeSummary(data ?? []);
      computeTopItems(data ?? []);
      computeDailyRevenue(data ?? []);
    }
  }

  // 🔑 Fetch stock levels
  async function fetchStockLevels() {
    const { data, error } = await supabase
      .from("current_stock_levels")
      .select("*")
      .order("current_level", { ascending: true });

    if (error) {
      console.error("Error fetching stock levels:", error.message);
    } else {
      setStockLevels(data ?? []);
    }
  }

  // 🔑 Fetch profit views
  async function fetchProfitViews() {
    const { data: dailyData, error: dailyError } = await supabase
      .from("profit_report")
      .select("*");

    if (dailyError) {
      console.error("Error fetching daily profit:", dailyError.message);
    } else {
      setDailyProfit(dailyData ?? []);
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from("profit_by_category")
      .select("*");

    if (categoryError) {
      console.error("Error fetching category profit:", categoryError.message);
    } else {
      setCategoryProfit(categoryData ?? []);
    }
  }

  // 🔑 Restock function
  async function restockItem(itemId: string, addQty: number) {
    const item = stockLevels.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = item.stocked + addQty;
    const { error } = await supabase
      .from("items")
      .update({ quantity: newQty })
      .eq("id", itemId);

    if (error) {
      console.error("Error restocking item:", error.message);
    } else {
      setRestockTarget(null);
      setRestockQty(0);
      fetchStockLevels(); // refresh table after update
    }
  }

  // 🔑 Compute summary by category
  function computeSummary(salesData: any[]) {
    const grouped: Record<string, { totalQty: number; totalRevenue: number }> = {};
    salesData.forEach((sale) => {
      const cat = sale.category || "Other";
      if (!grouped[cat]) {
        grouped[cat] = { totalQty: 0, totalRevenue: 0 };
      }
      grouped[cat].totalQty += sale.qty_sold;
      grouped[cat].totalRevenue += parseFloat(sale.total_price);
    });

    setSummary(
      Object.entries(grouped).map(([category, stats]) => ({
        category,
        totalQty: stats.totalQty,
        totalRevenue: stats.totalRevenue,
      }))
    );
  }

  // 🔑 Compute top items by revenue
  function computeTopItems(salesData: any[]) {
    const grouped: Record<string, number> = {};
    salesData.forEach((sale) => {
      const itemName = sale.items?.name || "Unknown Item";
      if (!grouped[itemName]) grouped[itemName] = 0;
      grouped[itemName] += parseFloat(sale.total_price);
    });

    setTopItems(
      Object.entries(grouped)
        .map(([item, revenue]) => ({ item, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
    );
  }

  // 🔑 Compute daily revenue trend
  function computeDailyRevenue(salesData: any[]) {
    const grouped: Record<string, number> = {};
    salesData.forEach((sale) => {
      const day = new Date(sale.timestamp).toLocaleDateString("en-UG", {
        timeZone: "Africa/Kampala",
      });
      if (!grouped[day]) grouped[day] = 0;
      grouped[day] += parseFloat(sale.total_price);
    });

    setDailyRevenue(
      Object.entries(grouped)
        .map(([day, revenue]) => ({ day, revenue }))
        .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
    );
  }
  // 🔑 Export sales + profit data to CSV
  function exportCSV() {
    const filteredSales = sales.map((sale) => ({
      Item: sale.items?.name || "Unknown Item",
      Category: sale.category,
      Unit: sale.unit,
      QtySold: sale.qty_sold,
      TotalPrice: sale.total_price,
      Date: new Date(sale.timestamp).toLocaleString("en-UG", {
        timeZone: "Africa/Kampala",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    if (filteredSales.length === 0) return;

    const headers = Object.keys(filteredSales[0]).join(",");
    const rows = filteredSales.map((row) => Object.values(row).join(",")).join("\n");
    const csvContent = headers + "\n" + rows;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

// 🔑 Export daily profit data to CSV
function exportDailyProfitCSV() {
  const rows = dailyProfit.map((row) => ({
    Day: row.day,
    GrossRevenue: row.gross_revenue,
    NetProfit: row.net_profit,
    MarginPercent:
      row.gross_revenue > 0
        ? ((row.net_profit / row.gross_revenue) * 100).toFixed(2)
        : "0",
  }));

  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]).join(",");
  const csvRows = rows.map((r) => Object.values(r).join(",")).join("\n");
  const csvContent = headers + "\n" + csvRows;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "daily_profit_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


  // 🔑 Chart Data
  const categoryChartData = {
    labels: summary.map((s) => s.category),
    datasets: [
      {
        label: "Revenue (UGX)",
        data: summary.map((s) => s.totalRevenue),
        backgroundColor: "rgba(34,197,94,0.7)",
      },
      {
        label: "Units Sold",
        data: summary.map((s) => s.totalQty),
        backgroundColor: "rgba(59,130,246,0.7)",
      },
    ],
  };

  const topItemsChartData = {
    labels: topItems.map((t) => t.item),
    datasets: [
      {
        label: "Revenue (UGX)",
        data: topItems.map((t) => t.revenue),
        backgroundColor: "rgba(34,197,94,0.7)",
      },
    ],
  };

  const dailyRevenueChartData = {
    labels: dailyRevenue.map((d) => d.day),
    datasets: [
      {
        label: "Daily Revenue (UGX)",
        data: dailyRevenue.map((d) => d.revenue),
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,0.3)",
        fill: true,
      },
    ],
  };

  // 📊 Profit Chart Data
  const dailyProfitChartData = {
    labels: dailyProfit.map((d) => d.day),
    datasets: [
      {
        label: "Gross Revenue (UGX)",
        data: dailyProfit.map((d) => d.gross_revenue),
        borderColor: "rgba(59,130,246,1)",
        backgroundColor: "rgba(59,130,246,0.3)",
        fill: true,
      },
      {
        label: "Net Profit (UGX)",
        data: dailyProfit.map((d) => d.net_profit),
        borderColor: "rgba(234,179,8,1)",
        backgroundColor: "rgba(234,179,8,0.3)",
        fill: true,
      },
    ],
  };

  const categoryProfitChartData = {
    labels: categoryProfit.map((c) => c.category),
    datasets: [
      {
        label: "Net Profit (UGX)",
        data: categoryProfit.map((c) => c.net_profit),
        backgroundColor: "rgba(239,68,68,0.7)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Denis' Enterprises Reports</h1>

      {/* Inventory Management Link */}
      <div className="mb-6">
        <a
          href="/inventory"
          className="text-blue-600 underline hover:text-blue-800 font-semibold"
        >
          Go to Full Inventory Management →
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 flex gap-4">
        <div>
          <label className="block text-gray-700 font-semibold">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2 text-gray-800"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2 text-gray-800"
          />
        </div>
        <button
          onClick={() => {
            fetchSales();
            fetchProfitViews();
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 self-end"
        >
          🔍 Apply Filter
        </button>
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 self-end"
        >
          📤 Export Sales to CSV
        </button>

          <button
  onClick={exportDailyProfitCSV}
  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 self-end"
>
  📤 Export Daily Profit CSV
</button>


      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white shadow rounded-lg p-6 h-80">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Category Trends</h2>
          <Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="bg-white shadow rounded-lg p-6 h-80">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Top 5 Items by Revenue</h2>
          <Bar data={topItemsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white shadow rounded-lg p-6 h-80">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Daily Revenue Trend</h2>
          <Line data={dailyRevenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="bg-white shadow rounded-lg p-6 h-80">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Category Revenue Share</h2>
          <Pie
            data={{
              labels: summary.map((s) => s.category),
              datasets: [
                {
                  label: "Revenue Share",
                  data: summary.map((s) => s.totalRevenue),
                  backgroundColor: [
                    "rgba(34,197,94,0.7)", // green
                    "rgba(59,130,246,0.7)", // blue
                    "rgba(234,179,8,0.7)",  // yellow
                    "rgba(239,68,68,0.7)",  // red
                    "rgba(168,85,247,0.7)", // purple
                  ],
                  borderColor: "white",
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "right" },
                title: { display: true, text: "Revenue Share by Category" },
              },
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
      {/* Profit Tables */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Daily Profit Summary</h2>
      <div className="overflow-x-auto mb-10">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Day</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Gross Revenue (UGX)</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Net Profit (UGX)</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Margin (%)</th>
            </tr>
          </thead>
          <tbody>
            {dailyProfit.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2 px-4 text-gray-900 font-bold">{row.day}</td>
                <td className="py-2 px-4 text-green-700 font-bold">{row.gross_revenue}</td>
                <td className="py-2 px-4 text-blue-700 font-bold">{row.net_profit}</td>
                <td className="py-2 px-4 text-gray-800">
                  {row.gross_revenue > 0
                    ? ((row.net_profit / row.gross_revenue) * 100).toFixed(2)
                    : "0"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Category Profit Summary</h2>
      <div className="overflow-x-auto mb-10">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Category</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Gross Revenue (UGX)</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Net Profit (UGX)</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Margin (%)</th>
            </tr>
          </thead>
          <tbody>
            {categoryProfit.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2 px-4 text-gray-900 font-bold">{row.category}</td>
                <td className="py-2 px-4 text-green-700 font-bold">{row.gross_revenue}</td>
                <td className="py-2 px-4 text-blue-700 font-bold">{row.net_profit}</td>
                <td className="py-2 px-4 text-gray-800">
                  {row.gross_revenue > 0
                    ? ((row.net_profit / row.gross_revenue) * 100).toFixed(2)
                    : "0"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Detailed Sales Table */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Detailed Sales</h2>
      <div className="overflow-x-auto mb-10">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Item</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Category</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Unit</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Qty Sold</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Total Price (UGX)</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-t">
                <td className="py-2 px-4 font-bold text-gray-900">{sale.items?.name || "Unknown Item"}</td>
                <td className="py-2 px-4 text-gray-800">{sale.category}</td>
                <td className="py-2 px-4 text-gray-800">{sale.unit}</td>
                <td className="py-2 px-4 text-blue-700 font-bold">{sale.qty_sold}</td>
                <td className="py-2 px-4 text-green-700 font-bold">{sale.total_price}</td>
                <td className="py-2 px-4 text-gray-700">
                  {new Date(sale.timestamp).toLocaleString("en-UG", {
                    timeZone: "Africa/Kampala",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Current Stock Levels Table with Restock Controls */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Current Stock Levels</h2>
      <div className="overflow-x-auto mb-10">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-green-100">
            <tr>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Item</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Stocked</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Sold</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Current Level</th>
              <th className="py-2 px-4 text-left text-gray-800 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stockLevels.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="py-2 px-4 font-bold text-gray-900">{row.name}</td>
                <td className="py-2 px-4 text-gray-800">{row.stocked}</td>
                <td className="py-2 px-4 text-blue-700 font-bold">{row.sold}</td>
                <td
                  className={`py-2 px-4 font-bold ${
                    row.current_level <= 5 ? "text-red-600 bg-red-100" : "text-green-700"
                  }`}
                >
                  {row.current_level}
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => setRestockTarget(row.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-800"
                  >
                    ➕ Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Restock Modal/Input */}
      {restockTarget && (
        <div className="mt-6 p-4 bg-green-600 rounded shadow-md">
          <h3 className="font-semibold mb-2">
            Restock {stockLevels.find((i) => i.id === restockTarget)?.name}
          </h3>
          <input
            type="number"
            value={restockQty}
            onChange={(e) => setRestockQty(Number(e.target.value))}
            className="border rounded p-2 mr-2"
            placeholder="Enter units to add"
          />
          <button
            onClick={() => restockItem(restockTarget, restockQty)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            ✅ Update Stock
          </button>
          <button
            onClick={() => {
              setRestockTarget(null);
              setRestockQty(0);
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            ❌ Cancel
          </button>
        </div>
      )}

      {/* Chat Assistant */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 mt-10">Ask the Reports Assistant</h2>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
  <input
    type="text"
    value={chatQuery}
    onChange={(e) => setChatQuery(e.target.value)}
    placeholder="e.g. Show me yesterday's net profit, 16/03/2026, last week, or this month"
    className="border rounded p-2 w-full mb-4"
  />
  <button
    onClick={() => {
      const q = chatQuery.toLowerCase().trim();

      // Yesterday
      if (q.includes("yesterday")) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dayStr = yesterday.toISOString().split("T")[0];
        const result = dailyProfit.find((d) => d.day === dayStr);
        setChatAnswer(
          result
            ? `Yesterday's net profit: UGX ${result.net_profit} (Gross: UGX ${result.gross_revenue})`
            : "No data for yesterday."
        );
      }

      // Today
      else if (q.includes("today")) {
        const today = new Date();
        const dayStr = today.toISOString().split("T")[0];
        const result = dailyProfit.find((d) => d.day === dayStr);
        setChatAnswer(
          result
            ? `Today's net profit: UGX ${result.net_profit} (Gross: UGX ${result.gross_revenue})`
            : "No data for today yet."
        );
      }

      // Highest margin category
      else if (q.includes("highest margin")) {
        const best = categoryProfit.reduce((prev, curr) => {
          const prevMargin = prev.gross_revenue > 0 ? prev.net_profit / prev.gross_revenue : 0;
          const currMargin = curr.gross_revenue > 0 ? curr.net_profit / curr.gross_revenue : 0;
          return currMargin > prevMargin ? curr : prev;
        }, categoryProfit[0]);
        setChatAnswer(best ? `Highest margin category: ${best.category}` : "No category data available.");
      }

      // Last week totals
      else if (q.includes("last week")) {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        const startStr = sevenDaysAgo.toISOString().split("T")[0];
        const endStr = today.toISOString().split("T")[0];
        const weekData = dailyProfit.filter((d) => d.day >= startStr && d.day <= endStr);

        if (weekData.length > 0) {
          const totalGross = weekData.reduce((sum, d) => sum + d.gross_revenue, 0);
          const totalNet = weekData.reduce((sum, d) => sum + d.net_profit, 0);
          setChatAnswer(`Last week's total profit: Net UGX ${totalNet} (Gross UGX ${totalGross})`);
        } else {
          setChatAnswer("No profit data available for last week.");
        }
      }

      // This month totals
      else if (q.includes("this month")) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const startStr = `${yyyy}-${mm}-01`;
        const endStr = today.toISOString().split("T")[0];
        const monthData = dailyProfit.filter((d) => d.day >= startStr && d.day <= endStr);

        if (monthData.length > 0) {
          const totalGross = monthData.reduce((sum, d) => sum + d.gross_revenue, 0);
          const totalNet = monthData.reduce((sum, d) => sum + d.net_profit, 0);
          setChatAnswer(`This month's total profit: Net UGX ${totalNet} (Gross UGX ${totalGross})`);
        } else {
          setChatAnswer("No profit data available for this month.");
        }
      }

      // Flexible date queries
      else {
        let formatted: string | null = null;

        const regex1 = /^(\d{2}),(\d{2}),(\d{4})$/; // DD,MM,YYYY
        const regex2 = /^(\d{2})\/(\d{2})\/(\d{4})$/; // DD/MM/YYYY
        const regex3 = /^(\d{4})-(\d{2})-(\d{2})$/; // YYYY-MM-DD

        if (regex1.test(chatQuery)) {
          const [_, dd, mm, yyyy] = chatQuery.match(regex1)!;
          formatted = `${yyyy}-${mm}-${dd}`;
        } else if (regex2.test(chatQuery)) {
          const [_, dd, mm, yyyy] = chatQuery.match(regex2)!;
          formatted = `${yyyy}-${mm}-${dd}`;
        } else if (regex3.test(chatQuery)) {
          formatted = chatQuery;
        }

        if (formatted) {
          const result = dailyProfit.find((d) => d.day === formatted);
          setChatAnswer(
            result
              ? `Profit for ${formatted}: Net UGX ${result.net_profit} (Gross UGX ${result.gross_revenue})`
              : `No data available for ${formatted}.`
          );
        } else {
          setChatAnswer("Wrong date format. Please use DD,MM,YYYY or DD/MM/YYYY or YYYY-MM-DD.");
        }
      }
    }}
    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
  >
    🔎 Ask
  </button>

  {chatAnswer && (
    <div className="mt-4 p-4 bg-gray-100 rounded text-gray-800 font-semibold">
      {chatAnswer}
    </div>
  )}
</div>

         </div>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute allowedRoles={["manager", "admin", "viewer"]}>
      <ReportsPage />
    </ProtectedRoute>
  );
}
