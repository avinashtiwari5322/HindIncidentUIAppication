import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Users,
  Eye,
} from "lucide-react";

const MyRequests = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch incidents from the API
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://hindincidentapiapplication.onrender.com/api/incidents");
        if (!response.ok) {
          throw new Error("Failed to fetch incidents");
        }
        const data = await response.json();
        console.log("Fetched incidents:", data);
        const incidentsWithStatus = data.map((incident) => ({
          ...incident,
          status: incident.Status || "Pending", // Use backend status or default to Pending
        }));
        setRequests(incidentsWithStatus);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Handle status change (Approve/Reject)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`https://hindincidentapiapplication.onrender.com/api/incident/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setRequests((prev) =>
        prev.map((request) =>
          request.IncidentID === id ? { ...request, status: newStatus } : request
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getRiskColor = (typeInjury) => {
    return typeInjury ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50";
  };

  const getPriorityColor = (countInjury) => {
    if (countInjury > 1) return "text-red-600 bg-red-50";
    if (countInjury === 1) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const filteredRequests =
    statusFilter === "All"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white border-2 border-gray-300 mb-6">
          <div className="bg-blue-600 text-white text-center py-3">
            <h1 className="text-2xl font-bold">Hind Terminals Pvt Ltd - Palwal</h1>
            <h2 className="text-lg">Incident Report - Approval System</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-300 p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Incidents</label>
                <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
              </div>
              <div className="border border-gray-300 p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pending Approval</label>
                <div className="text-2xl font-bold text-yellow-600">
                  {requests.filter((r) => r.status === "Pending").length}
                </div>
              </div>
              <div className="border border-gray-300 p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Approved Today</label>
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "Approved").length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border-2 border-gray-300 mb-6">
          <div className="border-b border-gray-300 bg-gray-100 px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filter Incidents
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-gray-300 p-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white border-2 border-gray-300">
          <div className="border-b border-gray-300 bg-gray-100 px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Incident Reports - Approval Pending
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800 text-sm">Incident ID</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800 text-sm">Location</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800 text-sm">Reported By</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800 text-sm">Department</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800 text-sm">Injuries</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800 text-sm">Status</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-800 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="border border-gray-300 px-4 py-6 text-center text-gray-600"
                    >
                      No incidents found for the selected status.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.IncidentID} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-600" />
                          {request.IncidentID}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          {request.Location}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        {request.IncidentReportedBy}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        {request.InjuredHTPLEmployees[0]?.department || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-blue-600" />
                          {request.CountInjury}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            request.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : request.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <div className="flex space-x-1">
                          <Link
                            to={`/incident/${request.IncidentID}`}
                            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Link>
                          {request.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(request.IncidentID, "Approved")}
                                className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(request.IncidentID, "Rejected")}
                                className="flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRequests;