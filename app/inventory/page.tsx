"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/db";
import ProtectedRoute from "../components/ProtectedRoute";

function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // Edit/Delete state
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Edit form fields
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from("items").select("*");
    if (error) {
      console.error("Error fetching items:", error.message);
      showToast("Error fetching items", "error");
    } else setItems(data ?? []);
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
    if (error) {
      console.error("Error adding item:", error.message);
      showToast("Error adding item", "error");
    } else {
      setName("");
      setCategory("");
      setUnit("");
      setPrice("");
      setQuantity("");
      fetchItems();
      showToast("Item added successfully ✅", "success");
    }
  }

  async function updateItem(itemId: string) {
    const { error } = await supabase
      .from("items")
      .update({
        name: editName,
        category: editCategory,
        unit: editUnit,
        price: parseFloat(editPrice),
        quantity: parseInt(editQuantity),
      })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating item:", error.message);
      showToast("Error updating item", "error");
    } else {
      setEditTarget(null);
      fetchItems();
      showToast("Item updated successfully ✏️", "success");
    }
  }

  async function deleteItem(itemId: string) {
    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) {
      console.error("Error deleting item:", error.message);
      showToast("Error deleting item", "error");
    } else {
      setDeleteTarget(null);
      fetchItems();
      showToast("Item deleted successfully 🗑️", "success");
    }
  }

  // Toast helper
  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // auto-hide after 3s
  }
    return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🛒 Quickmart Inventory</h1>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white transition-transform ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

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
              <p className="text-gray-700">
                {item.quantity} {item.unit}
              </p>
              <p className="text-green-600 font-bold">
                {item.price} UGX / {item.unit}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditTarget(item);
                  setEditName(item.name);
                  setEditCategory(item.category);
                  setEditUnit(item.unit);
                  setEditPrice(item.price.toString());
                  setEditQuantity(item.quantity.toString());
                }}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setDeleteTarget(item)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="mt-6 p-4 bg-gray-100 rounded shadow-md max-w-lg">
          <h3 className="font-semibold mb-2">Edit {editTarget.name}</h3>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full border rounded p-2 mb-2"
          />
          <input
            type="text"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="w-full border rounded p-2 mb-2"
          />
          <input
            type="text"
            value={editUnit}
            onChange={(e) => setEditUnit(e.target.value)}
            className="w-full border rounded p-2 mb-2"
          />
          <input
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            className="w-full border rounded p-2 mb-2"
          />
          <input
            type="number"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            className="w-full border rounded p-2 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => updateItem(editTarget.id)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ✅ Save
            </button>
            <button
              onClick={() => setEditTarget(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="mt-6 p-4 bg-red-100 rounded shadow-md max-w-lg">
          <h3 className="font-semibold mb-2">
            Are you sure you want to delete {deleteTarget.name}?
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => deleteItem(deleteTarget.id)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              🗑️ Confirm Delete
            </button>
            <button
              onClick={() => setDeleteTarget(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Wrap in ProtectedRoute
export default function Inventory() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <InventoryPage />
    </ProtectedRoute>
  );
}