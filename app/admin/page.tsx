"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";

function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("viewer");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Search state
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    try {
      const res = await fetch("/api/getProfiles");
      const result = await res.json();
      if (result.error) {
        showToast(result.error, "error");
      } else {
        setProfiles(result.data ?? []);
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
    setLoading(false);
  }

  async function addUser(email: string, password: string, role: string) {
    try {
      const res = await fetch("/api/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const result = await res.json();
      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("User added successfully!", "success");
        fetchProfiles();
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  async function updateRole(userId: string, newRole: string) {
    try {
      const res = await fetch("/api/updateRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });
      const result = await res.json();
      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("Role updated successfully!", "success");
        fetchProfiles();
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  async function confirmDelete(userId: string) {
    try {
      const res = await fetch("/api/deleteUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const result = await res.json();
      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("User deleted successfully!", "success");
        setDeleteTarget(null);
        fetchProfiles();
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-orange-500 font-black animate-pulse text-2xl tracking-tighter italic">INITIALIZING COMMAND CENTER...</p>
    </div>
  );

  const filteredProfiles = profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.name && p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black text-orange-500 tracking-tighter mb-2 uppercase italic">
              Command <span className="text-white">Center</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.3em]">
              Denis' Enterprises / Administrative Protocol
            </p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full">
            <span className="text-orange-500 font-black text-sm uppercase italic">Total Users: {profiles.length}</span>
          </div>
        </header>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-black animate-bounce border-2 ${
            toast.type === "success" ? "bg-green-600 border-green-400" : "bg-red-600 border-red-400"
          }`}>
            {toast.message}
          </div>
        )}

        <div className="grid gap-8">
          {/* Action Bar: Search & Add */}
          <section className="bg-white/5 p-2 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="flex flex-col lg:flex-row gap-2">
              <input
                type="text"
                placeholder="Find a member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border-2 border-transparent focus:border-orange-500 p-4 rounded-2xl flex-[2] outline-none font-bold transition-all placeholder:text-gray-600"
              />
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newEmail && newPassword && newRole) {
                    addUser(newEmail, newPassword, newRole);
                    setNewEmail("");
                    setNewPassword("");
                    setNewRole("viewer");
                  }
                }}
                className="flex flex-col md:flex-row gap-2 flex-[3]"
              >
                <input
                  type="email"
                  placeholder="New Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-white/5 border-2 border-transparent focus:border-orange-500 p-4 rounded-2xl outline-none font-bold transition-all flex-1"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/5 border-2 border-transparent focus:border-orange-500 p-4 rounded-2xl outline-none font-bold transition-all flex-1"
                  required
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="bg-white/10 border-2 border-transparent p-4 rounded-2xl font-black uppercase text-xs tracking-widest outline-none cursor-pointer hover:bg-white/20 transition-all"
                >
                  <option className="bg-black" value="viewer">Viewer</option>
                  <option className="bg-black" value="cashier">Cashier</option>
                  <option className="bg-black" value="manager">Manager</option>
                  <option className="bg-black" value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95"
                >
                  Create User
                </button>
              </form>
            </div>
          </section>

          {/* Users Table */}
          <section className="bg-white rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black text-orange-500 border-b border-white/10">
                    <th className="py-6 px-8 text-xs font-black uppercase tracking-widest">Identity</th>
                    <th className="py-6 px-8 text-xs font-black uppercase tracking-widest">Access Level</th>
                    <th className="py-6 px-8 text-xs font-black uppercase tracking-widest text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-6 px-8">
                        <div className="font-black text-gray-900 text-lg">{profile.name || "Anonymous User"}</div>
                        <div className="text-gray-400 font-bold text-sm">{profile.email}</div>
                      </td>
                      <td className="py-6 px-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                          profile.role === "admin" ? "bg-red-600 text-white" :
                          profile.role === "manager" ? "bg-blue-600 text-white" :
                          profile.role === "cashier" ? "bg-green-600 text-white" :
                          "bg-gray-200 text-gray-700"
                        }`}>
                          {profile.role}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex justify-end items-center gap-3">
                          <select
                            value={profile.role}
                            onChange={(e) => updateRole(profile.id, e.target.value)}
                            className="bg-gray-100 border-2 border-transparent hover:border-orange-500 px-3 py-2 rounded-xl text-black font-black text-xs uppercase outline-none transition-all cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="cashier">Cashier</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          
                          {profile.role !== "admin" && (
                            <button
                              onClick={() => setDeleteTarget(profile)}
                              className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <span className="text-xl">🗑️</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full border-[6px] border-red-600">
              <h2 className="text-3xl font-black text-black mb-4 uppercase italic tracking-tighter">Security Breach?</h2>
              <p className="text-gray-600 font-bold mb-8 leading-relaxed">
                You are about to terminate access for <span className="text-red-600 underline">{deleteTarget.email}</span>. This protocol is irreversible.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-6 py-4 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 font-black uppercase tracking-widest text-xs transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={() => confirmDelete(deleteTarget.id)}
                  className="px-6 py-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}