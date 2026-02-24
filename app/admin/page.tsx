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

  // ✅ Fetch profiles
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

  // ✅ Add user
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

  // ✅ Update role
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

  // ✅ Delete user
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

  // Toast helper
  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) return <p className="text-orange-600 font-bold">Loading users...</p>;

  const filteredProfiles = profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.name && p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-black p-8 relative">
      <h1 className="text-4xl font-extrabold text-orange-500 mb-6">👑 Admin Dashboard</h1>
      <p className="mb-6 text-white font-medium">Manage user roles and access.</p>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white font-semibold
            ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search users by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full border-2 border-orange-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white text-black font-bold"
      />

      {/* Add User Form */}
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
        className="mb-6 flex gap-3"
      >
        {/* Add User Form Inputs */}
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="border-2 border-orange-500 p-2 rounded flex-1 font-bold focus:outline-none focus:ring-2 focus:ring-orange-600"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border-2 border-orange-500 p-2 rounded flex-1 font-bold focus:outline-none focus:ring-2 focus:ring-orange-600"
          required
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="border-2 border-orange-500 p-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-orange-600"
        >
          <option value="viewer">Viewer</option>
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 shadow-lg"
        >
          ➕ Add User
        </button>
      </form>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-2 border-orange-600 shadow-lg rounded-lg">
          <thead className="bg-black text-orange-500">
            <tr>
              <th className="py-3 px-4 text-left font-bold">Name</th>
              <th className="py-3 px-4 text-left font-bold">Email</th>
              <th className="py-3 px-4 text-left font-bold">Role</th>
              <th className="py-3 px-4 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfiles.map((profile, idx) => (
              <tr key={profile.id} className={idx % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}>
                <td className="py-2 px-4 text-black font-bold">{profile.name || "—"}</td>
                <td className="py-2 px-4 text-black font-bold">{profile.email}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold
                      ${profile.role === "admin" ? "bg-red-200 text-red-800" :
                        profile.role === "manager" ? "bg-green-200 text-green-800" :
                        profile.role === "cashier" ? "bg-yellow-200 text-yellow-800" :
                        "bg-gray-300 text-gray-800"}`}
                  >
                    {profile.role}
                  </span>
                </td>
                <td className="py-2 px-4 flex gap-2">
                  <select
                    value={profile.role}
                    onChange={(e) => updateRole(profile.id, e.target.value)}
                    className="border-2 border-orange-600 rounded p-2 bg-white text-black font-bold focus:ring-2 focus:ring-orange-700"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {profile.role !== "admin" && (
                    <button
                      onClick={() => setDeleteTarget(profile)}
                      className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 font-bold shadow-lg"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 border-2 border-red-600">
            <h2 className="text-xl font-bold text-black mb-4">Confirm Delete</h2>
            <p className="text-black mb-6">
              Are you sure you want to delete <strong>{deleteTarget.email}</strong>?  
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded bg-gray-400 text-black hover:bg-gray-500 font-bold"
              >
                Cancel
              </button>
              <button
  onClick={() => confirmDelete(deleteTarget.id)}
  className="px-4 py-2 rounded bg-green-700 text-green hover:bg-red-800 font-bold"
>
  Confirm Delete
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Wrap in ProtectedRoute so only Admins can access
export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}