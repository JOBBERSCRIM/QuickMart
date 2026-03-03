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

  // ✅ Price list state + search
  const [priceList, setPriceList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculator state
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
    fetchSales();
    fetchPriceList();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from("items").select("*");
    if (error) {
      console.error("Error fetching items:", error.message);
    } else {
      setItems(data ?? []);
    }
  }

  async function fetchSales() {
    const { data, error } = await supabase
      .from("sales")
      .select("*, items(name)")
      .order("timestamp", { ascending: false })
      .limit(10);
    if (error) {
      console.error("Error fetching sales:", error.message);
    } else {
      setSales(data ?? []);
    }
  }

  async function fetchPriceList() {
    const { data, error } = await supabase.from("price_list").select("*");
    if (error) {
      console.error("Error fetching price list:", error.message);
    } else {
      setPriceList(data ?? []);
    }
  }

  async function processSale(e: React.FormEvent) {
    e.preventDefault();
    const item = items.find((i) => i.id === selectedItem);
    if (!item) return;

    const qty = parseInt(quantity);
    if (qty > item.quantity) {
      setMessage({ type: "error", text: "Not enough stock available!" });
      return;
    }

    const totalPrice = item.price * qty;

    // Update stock
    const { error: updateError } = await supabase
      .from("items")
      .update({ quantity: item.quantity - qty })
      .eq("id", item.id);

    if (updateError) {
      setMessage({ type: "error", text: "Error updating stock." });
      return;
    }

    // ✅ Kampala-local timestamp
    const timestamp = new Date().toLocaleString("sv-SE", {
      timeZone: "Africa/Kampala",
    });

    // Insert sale
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
      text: `✔ Sale recorded: ${qty} ${item.unit} of ${item.name} (${item.category}) = ${totalPrice} UGX`,
    });
  }

  // Calculator logic
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
        setMessage({ type: "error", text: "Invalid calculation input." });
      }
    } else {
      setCalcInput(calcInput + value);
    }
  }

  const buttons = ["7","8","9","/","4","5","6","*","1","2","3","-","0",".","C","+","="];

  // ✅ Filtered price list
  const filteredPriceList = priceList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        💵 Denis' Enterprises Quickmart POS
      </h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-400"
              : "bg-red-100 text-red-700 border border-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* POS Form */}
        <form
          onSubmit={processSale}
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
        >
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full border rounded p-2 text-gray-800"
            required
          >
            <option value="">Select item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.category}) — {item.quantity} {item.unit} left
              </option>
            ))}
          </select>

          <input
            placeholder="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border rounded p-2 text-gray-800"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            ✅ Process Sale
          </button>
        </form>

        {/* Quick Calculator */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">🧮 Quick Calculator</h2>
          <div className="border rounded p-3 text-3xl font-extrabold text-green-800 bg-white shadow-inner tracking-wide">
            {calcInput || "0"}
          </div>
          {calcResult !== null && (
            <div className="text-3xl font-extrabold text-green-900 mt-2">
              Result: {calcResult}
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((btn) => (
              <button
                key={btn}
                onClick={() => handleButtonClick(btn)}
                className={`p-4 rounded font-bold ${
                  btn === "="
                    ? "col-span-4 bg-green-600 text-white hover:bg-green-700"
                    : btn === "C"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div> {/* closes grid wrapper */}

      {/* Sales History */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Sales</h2>
        <div className="overflow-x-auto">
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
                  <td className="py-2 px-4 font-bold text-gray-900">
                    {sale.items?.name || "Unknown Item"}
                  </td>
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
      </div>

      {/* Price List */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Price List</h2>
        {/* ✅ Search bar */}
        <input
          type="text"
          placeholder="Search item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded p-2 mb-4 text-gray-800"
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left text-gray-800 font-semibold">Item</th>
                <th className="py-2 px-4 text-left text-gray-800 font-semibold">Price (UGX)</th>
                <th className="py-2 px-4 text-left text-gray-800 font-semibold">Unit</th>
              </tr>
            </thead>
            <tbody>
              {filteredPriceList.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedItem(item.id)} // ✅ click-to-select
                >
                  <td className="py-2 px-4 font-bold text-gray-900">{item.name}</td>
                  <td className="py-2 px-4 text-green-700 font-bold">{item.price}</td>
                  <td className="py-2 px-4 text-gray-800">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function POS() {
  return (
    <ProtectedRoute allowedRoles={["cashier"]}>
      <POSPage />
    </ProtectedRoute>
  );
}
