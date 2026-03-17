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
  const [purchasePrice, setPurchasePrice] = useState(""); 
  const [quantity, setQuantity] = useState("");

  // Edit/Delete state
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Edit form fields
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editPrice, setEditPrice] = useState(""); 
  const [editPurchasePrice, setEditPurchasePrice] = useState(""); 
  const [editQuantity, setEditQuantity] = useState("");

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from("items").select("*").order("name", { ascending: true });
    if (error) {
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
        purchase_price: parseFloat(purchasePrice),
        quantity: parseInt(quantity),
      },
    ]);
    if (error) {
      showToast("Error adding item", "error");
    } else {
      setName(""); setCategory(""); setUnit(""); setPrice(""); setPurchasePrice(""); setQuantity("");
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
        purchase_price: parseFloat(editPurchasePrice),
        quantity: parseInt(editQuantity),
      })
      .eq("id", itemId);

    if (error) {
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
      showToast("Error deleting item", "error");
    } else {
      setDeleteTarget(null);
      fetchItems();
      showToast("Item deleted successfully 🗑️", "success");
    }
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">Inventory Management</h1>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 font-bold text-gray-500">
          Total Items: {items.length}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-bold transition-all transform animate-bounce ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column: Add Item Form */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-xl rounded-2xl p-8 border-t-8 border-green-600 sticky top-8">
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-600 mb-6">Add New Product</h2>
            <form onSubmit={addItem} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-1">Product Name</label>
                <input placeholder="e.g. Sugar" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-600 outline-none font-bold" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-600 outline-none font-bold" required>
                    <option value="">Select</option>
                    <option value="Foodstuff">Foodstuff</option>
                    <option value="Household">Household</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1">Unit</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-600 outline-none font-bold" required>
                    <option value="">Select</option>
                    <option value="kg">Kg</option>
                    <option value="ltr">Litre</option>
                    <option value="sachet">Sachet</option>
                    <option value="pcs">Pieces</option>
                    <option value="bar">Bar</option>
                    <option value="set">Set</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1">Purchase Price</label>
                  <input type="number" placeholder="Cost" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-600 outline-none font-bold text-blue-600" required />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1">Selling Price</label>
                  <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-600 outline-none font-bold text-green-600" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-1">Stock Quantity</label>
                <input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-600 outline-none font-bold" required />
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02]">
                ➕ ADD TO INVENTORY
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Inventory List */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-wide">📦 Current Stock Gallery</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="bg-white shadow-md rounded-2xl p-6 border-l-8 border-gray-800 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">{item.category}</span>
                    <p className="text-2xl font-black text-gray-900 leading-tight mt-1">{item.name}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg font-black text-sm ${item.quantity <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    {item.quantity} {item.unit}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-50 p-3 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Buying</p>
                    <p className="font-bold text-blue-600">{Number(item.purchase_price).toLocaleString()} <span className="text-[10px]">UGX</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Selling</p>
                    <p className="font-bold text-green-700">{Number(item.price).toLocaleString()} <span className="text-[10px]">UGX</span></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => {
                    setEditTarget(item); setEditName(item.name); setEditCategory(item.category); setEditUnit(item.unit);
                    setEditPrice(item.price?.toString() ?? ""); setEditPurchasePrice(item.purchase_price?.toString() ?? "");
                    setEditQuantity(item.quantity?.toString() ?? "");
                  }} className="flex-1 bg-gray-900 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">✏️ Edit</button>
                  <button onClick={() => setDeleteTarget(item)} className="bg-gray-100 text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-600 hover:text-white transition-all">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal (Centered Overlay) */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full border-t-8 border-blue-600">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Editing: {editTarget.name}</h3>
            <div className="space-y-4">
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border-2 p-3 rounded-xl font-bold" placeholder="Item Name" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full border-2 p-3 rounded-xl font-bold" placeholder="Category" />
                <input type="text" value={editUnit} onChange={(e) => setEditUnit(e.target.value)} className="w-full border-2 p-3 rounded-xl font-bold" placeholder="Unit" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={editPurchasePrice} onChange={(e) => setEditPurchasePrice(e.target.value)} className="w-full border-2 p-3 rounded-xl font-bold text-blue-600" placeholder="Cost Price" />
                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full border-2 p-3 rounded-xl font-bold text-green-700" placeholder="Selling Price" />
              </div>
              <input type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} className="w-full border-2 p-3 rounded-xl font-bold" placeholder="Quantity" />
              <div className="flex gap-4 pt-4">
                <button onClick={() => updateItem(editTarget.id)} className="bg-blue-600 text-white font-black py-3 rounded-xl flex-1 shadow-lg">✅ SAVE CHANGES</button>
                <button onClick={() => setEditTarget(null)} className="bg-gray-200 text-gray-700 font-bold py-3 rounded-xl px-6">CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation (Centered Overlay) */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border-t-8 border-red-600">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 font-medium mb-8">Are you sure you want to remove <span className="text-red-600 font-bold">{deleteTarget.name}</span> from the inventory?</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => deleteItem(deleteTarget.id)} className="bg-red-600 text-white font-black py-3 rounded-xl shadow-lg">YES, DELETE ITEM</button>
              <button onClick={() => setDeleteTarget(null)} className="bg-gray-100 text-gray-700 font-bold py-3 rounded-xl">NO, KEEP IT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Inventory() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <InventoryPage />
    </ProtectedRoute>
  );
}