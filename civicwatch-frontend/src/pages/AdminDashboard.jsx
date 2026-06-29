import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminIllustration from "../components/illustrations/AdminIllustration";
import { ShieldAlert, Users, Sliders, Star, User } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchReports();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const totalUsers = users.length;
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === "PENDING").length;
  const resolvedReports = reports.filter((r) => r.status === "RESOLVED").length;
  const inProgressReports = reports.filter((r) => r.status === "IN_PROGRESS").length;

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports");
      setReports(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(
        `/reports/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchReports();
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.log("UPDATE ERROR:", error);
    }
  };

  const deleteReport = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Delete Report",
      text: "Are you sure you want to delete this report?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-xl mr-3 outline-none transition-colors duration-200 text-sm font-poppins",
        cancelButton: "bg-gov-navy hover:bg-gov-navy-light text-white font-semibold py-2.5 px-5 rounded-xl ml-3 outline-none transition-colors duration-200 text-sm font-poppins"
      },
      buttonsStyling: false
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await API.delete(`/reports/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Report deleted");
      fetchReports();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.issueType
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statCards = [
    { label: "Total Reports", value: totalReports, gradient: "from-blue-600 to-indigo-700", text: "text-white" },
    { label: "Pending Actions", value: pendingReports, gradient: "from-amber-500 to-orange-600", text: "text-white" },
    { label: "In Progress", value: inProgressReports, gradient: "from-blue-400 to-blue-600", text: "text-white" },
    { label: "Resolutions", value: resolvedReports, gradient: "from-emerald-500 to-teal-600", text: "text-white" },
  ];

  return (
    <div className="min-h-screen bg-gov-cream bg-structure font-poppins pb-16">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-gov-navy text-white relative pt-12 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex-1 text-center md:text-left animate-slide-up">
            <span className="inline-block bg-gov-saffron/10 text-gov-saffron text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3 font-poppins border border-gov-saffron/20">
              Administrative Access
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
              <ShieldAlert size={28} className="text-white" />
              Administrative Dashboard
            </h1>
            <p className="text-indigo-200 mt-2 text-xs md:text-sm font-light">
              Manage public reports, user accounts, and city cleanliness resolutions.
            </p>
          </div>

          {/* Right Illustration */}
          <div className="flex-1 flex justify-center animate-fade-in md:justify-end">
            <AdminIllustration className="w-full max-w-xs md:max-w-sm" />
          </div>
        </div>
        
        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="relative block w-full h-[60px]">
            <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,70L1320,70C1200,70,960,70,720,70C480,70,240,70,120,70L0,70Z" fill="#FFF8F0"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-10 relative z-20">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${stat.gradient} p-5 rounded-2xl shadow-gov hover:-translate-y-0.5 transition-all duration-300 animate-slide-up`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <h3 className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{stat.label}</h3>
              <p className={`text-3xl font-extrabold mt-1 text-white leading-none`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ═══ USER MANAGEMENT ═══ */}
        <div className="mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-bold text-gov-navy mb-4 font-poppins flex items-center gap-2">
            <Users size={18} className="text-gov-navy" />
            Citizen Accounts ({totalUsers})
          </h2>

          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-gov">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-semibold uppercase font-poppins">
                    <th className="text-left py-3.5 px-6">Name</th>
                    <th className="text-left py-3.5 px-6">Email</th>
                    <th className="text-left py-3.5 px-6">Role</th>
                    <th className="text-left py-3.5 px-6">Credibility</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((citizen) => (
                    <tr key={citizen._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gov-navy">{citizen.name}</td>
                      <td className="py-4 px-6 text-gray-500">{citizen.email}</td>
                      <td className="py-4 px-6">
                        {citizen.role === "admin" ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">Admin</span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-gray-50 text-gray-500 border border-gray-200">User</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gov-saffron font-extrabold flex items-center gap-1">
                        <Star size={12} className="fill-gov-saffron text-gov-saffron" />
                        {citizen.credibilityScore || 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ REPORTS CONTROLS ═══ */}
        <div className="mb-10 animate-slide-up" style={{ animationDelay: '240ms' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-gov-navy font-poppins flex items-center gap-2">
              <Sliders size={18} className="text-gov-navy" />
              Moderation Controls ({filteredReports.length})
            </h2>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="gov-input py-1.5 px-3 max-w-[160px] text-xs"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="gov-input py-1.5 px-3 max-w-[130px] text-xs bg-white"
              >
                <option value="ALL">All Reports</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReports.map((report) => {
              const statusConfig = {
                RESOLVED: { class: "gov-badge-resolved", label: "Resolved", accent: "bg-gov-green" },
                IN_PROGRESS: { class: "gov-badge-progress", label: "In Progress", accent: "bg-gov-navy" },
                PENDING: { class: "gov-badge-pending", label: "Pending", accent: "bg-gov-saffron" },
              };
              const status = statusConfig[report.status] || statusConfig.PENDING;

              return (
                <div key={report._id} className="bg-white rounded-2xl border border-gray-150 p-5 relative overflow-hidden flex flex-col md:flex-row gap-5 shadow-gov hover:-translate-y-0.5 transition-all duration-300">
                  {/* Accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${status.accent}`} />

                  <img
                    src={report.imageUrl || "/civic_banner.png"}
                    alt=""
                    className="w-full md:w-32 h-32 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-gov-navy capitalize text-sm">{report.issueType?.replace("_", " ")}</h4>
                        <span className={status.class}>{status.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{report.description}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                        <User size={10} />
                        Reported By: {report.reportedBy?.name || "Citizen"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                      <select
                        value={report.status}
                        onChange={(e) => updateStatus(report._id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs font-bold text-gov-navy outline-none focus:border-gov-navy cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>

                      <button
                        onClick={() => deleteReport(report._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;