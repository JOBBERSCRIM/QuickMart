"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/db";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from("items").select("*");
    if (error) console.error("Error fetching items:", error.message);
    else setItems(data ?? []);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("items").insert([
      {
        name,
        category,
        unit,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      },
    ]);
    if (error) console.error("Error adding item:", error.message);
    else {
      setName("");
      setCategory("");
      setUnit("");
      setPrice("");
      setQuantity("");
      fetchItems();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🛒 Quickmart Inventory</h1>

      {/* Add Item Form */}
      <form
        onSubmit={addItem}
        className="bg-white shadow-md rounded-lg p-6 space-y-4 max-w-lg mb-10"
      >
        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2 text-gray-800"
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded p-2 text-gray-800"
          required
        >
          <option value="">Select category</option>
          <option value="Foodstuff">Foodstuff</option>
          <option value="Household">Household</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full border rounded p-2 text-gray-800"
          required
        >
          <option value="">Select unit</option>
          <option value="kg">Kg</option>
          <option value="ltr">Litre</option>
          <option value="sachet">Sachet</option>
          <option value="pcs">Pieces</option>
          <option value="bar">Bar</option>
          <option value="set">Set</option>
        </select>

        <input
          placeholder="Price per unit"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded p-2 text-gray-800"
          required
        />

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
          ➕ Add Item
        </button>
      </form>

      {/* Inventory List */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">📦 Current Stock</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-bold text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">{item.category}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-700">
                {item.quantity} {item.unit}
              </p>
              <p className="text-green-600 font-bold">
                {item.price} UGX / {item.unit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}