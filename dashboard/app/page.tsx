"use client";

import { useEffect, useState } from "react";
import { Package, Terminal, Zap, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const [dashRes, pricesRes, prodRes, retRes, alertRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/prices`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/retailers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/alerts`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (dashRes.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        setData(await dashRes.json());
        setPrices(await pricesRes.json() || []);
        setProducts(await prodRes.json() || []);
        setRetailers(await retRes.json() || []);
        setAlerts(await alertRes.json() || []);
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy text-emerald">
        <Activity className="animate-spin h-12 w-12" />
      </div>
    );
  }

  // Generate fake sparkline data based on current price for visualization
  const generateSparkline = (currentPrice: number) => {
    return Array.from({ length: 10 }).map((_, i) => ({
      value: currentPrice * (1 + (Math.random() * 0.1 - 0.05)),
    }));
  };

  return (
    <div className="flex h-screen bg-navy text-slate">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate/10 bg-navy p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-emerald mb-8">
            Precision Arbitrage
          </h1>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full text-left rounded-md px-4 py-2 font-medium ${activeTab === 'overview' ? 'bg-emerald/10 text-emerald' : 'text-slate/70 hover:bg-slate/5 hover:text-slate'}`}>Overview</button>
            <button onClick={() => setActiveTab('products')} className={`w-full text-left rounded-md px-4 py-2 font-medium ${activeTab === 'products' ? 'bg-emerald/10 text-emerald' : 'text-slate/70 hover:bg-slate/5 hover:text-slate'}`}>Products</button>
            <button onClick={() => setActiveTab('retailers')} className={`w-full text-left rounded-md px-4 py-2 font-medium ${activeTab === 'retailers' ? 'bg-emerald/10 text-emerald' : 'text-slate/70 hover:bg-slate/5 hover:text-slate'}`}>Retailers</button>
            <button onClick={() => setActiveTab('alerts')} className={`w-full text-left rounded-md px-4 py-2 font-medium ${activeTab === 'alerts' ? 'bg-emerald/10 text-emerald' : 'text-slate/70 hover:bg-slate/5 hover:text-slate'}`}>Alerts</button>
          </nav>
        </div>
        <button onClick={handleLogout} className="text-left text-sm text-slate/50 hover:text-alert transition">
          Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate p-8 text-navy">
        {/* Top Nav / Search */}
        <header className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Overview</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search SKU or Product..."
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald w-64"
            />
            <div className="h-8 w-8 rounded-full bg-emerald flex items-center justify-center text-white font-bold">
              U
            </div>
          </div>
        </header>

        {/* System Health Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-4xl bg-white p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Products Tracked</p>
              <p className="text-3xl font-bold">{data?.total_products || 0}</p>
            </div>
          </div>
          <div className="rounded-4xl bg-white p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                <Terminal size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Workers</p>
                <p className="text-3xl font-bold">{data?.active_workers || 0}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald/20 px-3 py-1 text-xs font-semibold text-emerald">Online</span>
          </div>
          <div className="rounded-4xl bg-white p-6 shadow-sm border border-gray-100 flex items-center justify-between">
             <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-alert/10 text-alert">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Opportunities</p>
                <p className="text-3xl font-bold">{data?.opportunities || 0}</p>
              </div>
            </div>
            <div className="flex items-center text-emerald text-sm font-medium">
              <ArrowUpRight size={16} className="mr-1" /> 12%
            </div>
          </div>
        </div>

        {/* Main Conditional Content */}
        {activeTab === 'overview' && (
          <>
            <h3 className="mb-4 text-lg font-semibold">Latest Price Feeds</h3>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {prices.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-gray-400">Waiting for live market data...</div>
              ) : prices.slice(0, 6).map((priceItem, idx) => (
                <div key={idx} className="rounded-4xl bg-white p-6 shadow-sm border border-gray-100 transition hover:shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Product ID: {priceItem.product_id}</p>
                      <p className="text-xl font-bold">${priceItem.price.toFixed(2)}</p>
                    </div>
                    {idx % 3 === 0 ? (
                      <span className="rounded-md bg-alert px-2 py-1 text-xs font-bold text-white tracking-wider">ARBITRAGE ALERT</span>
                    ) : (
                      <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-bold text-gray-600 tracking-wider">STABLE</span>
                    )}
                  </div>
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateSparkline(priceItem.price)}>
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Line type="monotone" dataKey="value" stroke={idx % 3 === 0 ? '#ef4444' : '#10b981'} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <span>Retailer ID: {priceItem.retailer_id}</span>
                    <span>Just now</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            <h3 className="mb-6 text-xl font-bold">Tracked Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3">SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i} className="border-b bg-white">
                      <td className="px-6 py-4 font-medium text-gray-900">{p.id}</td>
                      <td className="px-6 py-4">{p.name}</td>
                      <td className="px-6 py-4">{p.sku}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'retailers' && (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            <h3 className="mb-6 text-xl font-bold">Supported Retailers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Retailer Name</th>
                    <th className="px-6 py-3">URL</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {retailers.map((r, i) => (
                    <tr key={i} className="border-b bg-white">
                      <td className="px-6 py-4 font-medium text-gray-900">{r.id}</td>
                      <td className="px-6 py-4">{r.name}</td>
                      <td className="px-6 py-4 text-emerald">{r.url}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald/20 text-emerald rounded-full text-xs font-bold">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            <h3 className="mb-6 text-xl font-bold">Arbitrage Alerts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Min Price</th>
                    <th className="px-6 py-3">Max Price</th>
                    <th className="px-6 py-3">Spread (Profit)</th>
                    <th className="px-6 py-3">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a, i) => (
                    <tr key={i} className="border-b bg-white">
                      <td className="px-6 py-4 font-medium text-gray-900">{a.product_name}</td>
                      <td className="px-6 py-4 text-emerald font-bold">${a.min_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-alert font-bold">${a.max_price.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">${a.spread.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-emerald">{a.roi.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No active arbitrage opportunities found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
