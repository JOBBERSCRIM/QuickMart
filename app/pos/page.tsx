"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/db";
import ProtectedRoute from "../components/ProtectedRoute";
import { JSX } from "react/jsx-runtime";

function POSPage(): JSX.Element {
  const [items, setItems] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const [priceList, setPriceList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
    fetchSales();
    fetchPriceList();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from("items").select("*");
    if (!error) setItems(data ?? []);
  }

  async function fetchSales() {
    const { data, error } = await supabase
      .from("sales")
      .select("*, items(name)")
      .order("timestamp", { ascending: false })
      .limit(10);
    if (!error) setSales(data ?? []);
  }

  async function fetchPriceList() {
    const { data, error } = await supabase.from("price_list").select("*");
    if (!error) setPriceList(data ?? []);
  }

  async function processSale(e: React.FormEvent) {
    e.preventDefault();
    const item = items.find((i) => i.id === selectedItem);
    if (!item) return;

    const qty = parseInt(quantity);
    if (qty > item.quantity) {
      setMessage({ type: "error", text: "⚠️ Not enough stock available!" });
      return;
    }

    const totalPrice = item.price * qty;

    const { error: updateError } = await supabase
      .from("items")
      .update({ quantity: item.quantity - qty })
      .eq("id", item.id);

    if (updateError) {
      setMessage({ type: "error", text: "Error updating stock." });
      return;
    }

    const timestamp = new Date().toLocaleString("sv-SE", {
      timeZone: "Africa/Kampala",
    });

    const { error: saleError } = await supabase.from("sales").insert([
      {
        item_id: item.id,
        qty_sold: qty,
        total_price: totalPrice,
        category: item.category,
        unit: item.unit,
        timestamp,
      },
    ]);

    if (saleError) {
      setMessage({ type: "error", text: "Error recording sale." });
      return;
    }

    setQuantity("");
    setSelectedItem("");
    fetchItems();
    fetchSales();
    setMessage({
      type: "success",
      text: `✔ Recorded: ${qty} ${item.unit} of ${item.name} = ${totalPrice.toLocaleString()} UGX`,
    });
  }

  function handleButtonClick(value: string) {
    if (value === "C") {
      setCalcInput("");
      setCalcResult(null);
    } else if (value === "=") {
      try {
        const result = eval(calcInput);
        setCalcResult(result);
      } catch {
        setCalcResult(null);
      }
    } else {
      setCalcInput(calcInput + value);
    }
  }

  const buttons = ["7","8","9","/","4","5","6","*","1","2","3","-","0",".","C","+","="];

  const filteredPriceList = priceList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border-l-8 border-green-600">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Cashier Terminal</h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Denis' Enterprises — POS System</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-gray-400 uppercase">Station Status</p>
            <p className="text-green-600 font-black">● ONLINE / READY</p>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-5 rounded-2xl font-bold shadow-lg animate-pulse border-2 ${
            message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          {/* Main Checkout Area */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h2 className="text-lg font-black uppercase text-gray-500 mb-6 flex items-center gap-2">
                <span>🛒</span> Checkout Process
              </h2>
              <form onSubmit={processSale} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Select Inventory Item</label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:border-green-600 outline-none font-bold text-lg transition-all appearance-none"
                    required
                  >
                    <option value="">Choose item...</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {item.quantity} {item.unit} available
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Quantity to Sell</label>
                  <input
                    placeholder="Enter amount..."
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 focus:bg-white focus:border-green-600 outline-none font-black text-xl text-green-700"
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-95 text-lg uppercase tracking-wider">
                  Complete Transaction
                </button>
              </form>
            </div>

            {/* Price List Searchable */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black uppercase text-gray-500">📋 Price Inquiry</h2>
                <input
                  type="text"
                  placeholder="Search prices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-500 outline-none"
                />
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b-2 border-gray-100">
                      <th className="py-3 text-[10px] font-black uppercase text-gray-400">Item Name</th>
                      <th className="py-3 text-[10px] font-black uppercase text-gray-400 text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPriceList.map((item, idx) => (
                      <tr key={idx} onClick={() => setSelectedItem(item.id)} className="hover:bg-blue-50 cursor-pointer group transition-colors">
                        <td className="py-4 font-black text-gray-800 group-hover:text-blue-700">{item.name}</td>
                        <td className="py-4 font-black text-right text-green-600">{Number(item.price).toLocaleString()} <span className="text-[10px] text-gray-400">UGX</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Calculator & Summary */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xs font-black uppercase text-gray-500 mb-6 tracking-widest">Quick Calculator</h2>
              <div className="bg-black/40 rounded-2xl p-6 mb-6 border border-gray-800">
                <div className="text-right text-gray-500 font-mono text-sm h-4 mb-1 uppercase tracking-tighter">
                  {calcResult !== null ? `Result` : `Ready`}
                </div>
                <div className="text-right text-4xl font-black text-green-500 font-mono truncate">
                  {calcResult !== null ? calcResult.toLocaleString() : (calcInput || "0")}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {buttons.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleButtonClick(btn)}
                    className={`p-5 rounded-2xl font-black text-xl transition-all active:scale-90 ${
                      btn === "=" ? "col-span-2 bg-green-600 text-white hover:bg-green-500" :
                      btn === "C" ? "bg-red-900/40 text-red-400 hover:bg-red-800/60" :
                      ["/", "*", "-", "+"].includes(btn) ? "bg-gray-800 text-blue-400 hover:bg-gray-700" :
                      "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sales History Teaser */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="text-lg font-black uppercase text-gray-500 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-l-4 border-blue-500">
                    <div>
                      <p className="font-black text-gray-800 text-sm">{sale.items?.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <p className="font-black text-green-700">+{Number(sale.total_price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function POS() {
  return (
    <ProtectedRoute allowedRoles={["cashier", "admin", "manager"]}>
      <POSPage />
    </ProtectedRoute>
  );
}