import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import { dashboardAPI } from "../../api/dashboard";
import SalesChart from "../../components/SalesChart";
import socket from "../../socket";

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendType, setTrendType] = useState("weekly");

  // ================= FETCH DATA =================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [summaryRes, trendRes, alertRes] = await Promise.all([
        dashboardAPI.summary(),
        trendType === "weekly"
          ? dashboardAPI.weeklyTrends()
          : dashboardAPI.monthlyTrends(),
        dashboardAPI.alerts(),
      ]);

      // 🔥 SAFE ACCESS (IMPORTANT FIX)
      const summaryData =
        summaryRes?.data?.data || summaryRes?.data || {};

      const alertData =
        alertRes?.data?.data || alertRes?.data || [];

      const trendData =
        trendRes?.data?.data || trendRes?.data || [];

      setSummary(summaryData);
      setAlerts(alertData);

      const formattedTrends = Array.isArray(trendData)
        ? trendData.map((item) => ({
            name:
              item?.date ||
              item?.month ||
              item?._id ||
              "Unknown",

            sales: Number(item?.revenue || 0),
          }))
        : [];

      setTrends(formattedTrends);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [trendType]);

  // ================= INIT =================
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 30000);

    const handleUpdate = () => {
      fetchData();
    };

    socket?.on("dashboard-update", handleUpdate);

    return () => {
      clearInterval(interval);
      socket?.off("dashboard-update", handleUpdate);
    };
  }, [fetchData]);

  // ================= LOADING =================
  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 w-1/3 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }

  // ================= UI =================
  return (
    <Layout>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Analytics Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setTrendType("weekly")}
            className={`px-4 py-2 rounded-lg ${
              trendType === "weekly"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Weekly
          </button>

          <button
            onClick={() => setTrendType("monthly")}
            className={`px-4 py-2 rounded-lg ${
              trendType === "monthly"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">
            Total Products
          </p>
          <h2 className="text-3xl font-bold mt-2">
            {summary?.products?.total || 0}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Revenue</p>
          <h2 className="text-3xl font-bold mt-2">
            ₹ {summary?.sales?.thisMonth?.revenue || 0}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Orders</p>
          <h2 className="text-3xl font-bold mt-2">
            {summary?.sales?.thisMonth?.orders || 0}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">
            Low Stock
          </p>
          <h2 className="text-3xl font-bold mt-2 text-red-500">
            {summary?.products?.lowStock || 0}
          </h2>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Sales Analytics
        </h2>

        <SalesChart data={trends} />
      </div>

      {/* ALERTS */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Alerts
        </h2>

        {alerts.length === 0 ? (
          <p className="text-green-600">
            No alerts 🎉
          </p>
        ) : (
          <ul className="space-y-3">
            {alerts.map((alert, index) => (
              <li
                key={index}
                className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-600"
              >
                {alert.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;