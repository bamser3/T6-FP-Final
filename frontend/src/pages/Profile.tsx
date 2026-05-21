import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

type Tab = "view" | "update" | "delete";

export default function Profile() {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("view");

  // Update form
  const [email, setEmail]           = useState(user?.email || "");
  const [username, setUsername]     = useState(user?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError]     = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Delete form
  const [deletePassword, setDeletePassword]   = useState("");
  const [deleteConfirm, setDeleteConfirm]     = useState("");
  const [deleteError, setDeleteError]         = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading]     = useState(false);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null); setUpdateSuccess(null);
    setUpdateLoading(true);
    try {
      await updateProfile({
        email:            email !== user.email ? email : undefined,
        username:         username !== user.username ? username : undefined,
        password:         newPassword || undefined,
        current_password: currentPassword,
      });
      setUpdateSuccess("Profile updated successfully!");
      setNewPassword(""); setCurrentPassword("");
    } catch (err: unknown) {
      setUpdateError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (deleteConfirm !== user.username) {
      setDeleteError(`Type your username "${user.username}" exactly to confirm`);
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      setLocation("/");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const tabClass = (t: Tab) =>
    `flex-1 py-3 text-xs uppercase tracking-widest font-mono transition-colors border-b-2 ${
      activeTab === t
        ? t === "delete"
          ? "border-red-500 text-red-400 bg-red-950/20"
          : "border-primary text-primary bg-primary/10"
        : "border-transparent text-primary/40 hover:text-primary/70"
    }`;

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">

      {/* Header */}
      <div className="border border-primary/30 bg-black/70 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-primary/40 uppercase tracking-widest font-mono">&gt; logged in as</p>
          <p className="text-xl font-bold text-primary glow font-mono">{user.username}</p>
          <p className="text-xs text-primary/50 font-mono mt-0.5">{user.email}</p>
        </div>
        <button onClick={handleLogout}
          className="border border-primary/40 text-primary/60 px-4 py-2 text-xs font-mono uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">
          [ LOGOUT ]
        </button>
      </div>

      {/* Tab buttons — UPDATE and DELETE clearly visible */}
      <div className="border border-primary/30 bg-black/70">
        <div className="flex border-b border-primary/20">
          <button onClick={() => setActiveTab("view")}   className={tabClass("view")}>   👤 View    </button>
          <button onClick={() => setActiveTab("update")} className={tabClass("update")}> ✏️ Update  </button>
          <button onClick={() => setActiveTab("delete")} className={tabClass("delete")}> 🗑️ Delete  </button>
        </div>

        <div className="p-6">

          {/* ── VIEW TAB ── */}
          {activeTab === "view" && (
            <div className="space-y-4 font-mono">
              <p className="text-xs text-primary/40 uppercase tracking-widest mb-4">&gt; Account Details</p>
              <div className="border border-primary/20 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-primary/50">Username</span>
                  <span className="text-primary">{user.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/50">Email</span>
                  <span className="text-primary">{user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/50">User ID</span>
                  <span className="text-primary/60">#{user.id}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setActiveTab("update")}
                  className="flex-1 bg-primary/10 border border-primary text-primary py-2.5 text-xs uppercase tracking-widest hover:bg-primary/20 transition-colors font-mono">
                  ✏️ UPDATE PROFILE
                </button>
                <button onClick={() => setActiveTab("delete")}
                  className="flex-1 bg-red-950/20 border border-red-500/50 text-red-400 py-2.5 text-xs uppercase tracking-widest hover:bg-red-950/40 transition-colors font-mono">
                  🗑️ DELETE ACCOUNT
                </button>
              </div>
            </div>
          )}

          {/* ── UPDATE TAB ── */}
          {activeTab === "update" && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <p className="text-xs text-primary/40 uppercase tracking-widest mb-4 font-mono">&gt; Update Your Details</p>

              {updateError   && <div className="border border-red-500/60 bg-red-950/30 px-4 py-3 text-red-400 text-xs font-mono">[ERROR] {updateError}</div>}
              {updateSuccess && <div className="border border-green-500/60 bg-green-950/30 px-4 py-3 text-green-400 text-xs font-mono">[OK] {updateSuccess}</div>}

              <div>
                <label className="block text-xs uppercase tracking-widest text-primary/50 mb-1 font-mono">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-black border border-primary/30 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-primary/50 mb-1 font-mono">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required minLength={3}
                  className="w-full bg-black border border-primary/30 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-primary/50 mb-1 font-mono">
                  New Password <span className="normal-case tracking-normal text-primary/30">(leave blank to keep current)</span>
                </label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-black border border-primary/30 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary placeholder:text-primary/20" />
              </div>
              <div className="border-t border-primary/20 pt-4">
                <label className="block text-xs uppercase tracking-widest text-red-400/70 mb-1 font-mono">
                  Current Password <span className="text-red-400">(required to save changes)</span>
                </label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                  placeholder="Enter your current password"
                  className="w-full bg-black border border-red-500/30 text-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-500 placeholder:text-primary/20" />
              </div>
              <button type="submit" disabled={updateLoading}
                className="w-full bg-primary text-black font-bold py-3 text-sm uppercase tracking-widest hover:bg-primary/80 transition-colors disabled:opacity-50 font-mono">
                {updateLoading ? "[ SAVING... ]" : "[ SAVE CHANGES ]"}
              </button>
            </form>
          )}

          {/* ── DELETE TAB ── */}
          {activeTab === "delete" && (
            <form onSubmit={handleDelete} className="space-y-4">
              <p className="text-xs text-red-400/70 uppercase tracking-widest mb-4 font-mono">&gt; Delete Account</p>
              <div className="border border-red-500/30 bg-red-950/10 p-4 text-xs text-red-300/80 font-mono space-y-1">
                <p>⚠️  This will permanently delete your account.</p>
                <p>⚠️  All your extractions and data will be lost.</p>
                <p>⚠️  This action cannot be undone.</p>
              </div>

              {deleteError && <div className="border border-red-500/60 bg-red-950/30 px-4 py-3 text-red-400 text-xs font-mono">[ERROR] {deleteError}</div>}

              <div>
                <label className="block text-xs uppercase tracking-widest text-red-400/70 mb-1 font-mono">
                  Type your username to confirm: <span className="text-red-300">{user.username}</span>
                </label>
                <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} required
                  placeholder={user.username}
                  className="w-full bg-black border border-red-500/40 text-red-300 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-500 placeholder:text-red-900" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-red-400/70 mb-1 font-mono">Your Password</label>
                <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-black border border-red-500/40 text-red-300 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-500 placeholder:text-red-900" />
              </div>
              <button type="submit" disabled={deleteLoading}
                className="w-full bg-red-900/50 border-2 border-red-500 text-red-300 font-bold py-3 text-sm uppercase tracking-widest hover:bg-red-900/80 transition-colors disabled:opacity-50 font-mono">
                {deleteLoading ? "[ DELETING... ]" : "[ PERMANENTLY DELETE ACCOUNT ]"}
              </button>
              <button type="button" onClick={() => setActiveTab("view")}
                className="w-full border border-primary/30 text-primary/50 py-2 text-xs uppercase tracking-widest hover:text-primary hover:border-primary transition-colors font-mono">
                [ CANCEL ]
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
