import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Eye,} from "lucide-react";
// Simple toast component
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }} className="bg-green-600 text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
}

const AssignPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All Status');

  // Fetch incidents from API
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const assignUserId = localStorage.getItem('userId');
        const response = await fetch(`https://hindincidentapiapplication.onrender.com/api/incidents/assign-user?assignUserId=${assignUserId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch incidents');
        }
        const data = await response.json();
        setIncidents(data);
        setError(null);
      } catch (err) {
        setError('Error fetching incidents. Please try again later.');
        setToastMsg('Error fetching incidents');
      }
    };
    fetchIncidents();
  }, []);

  // Calculate dashboard metrics
  const totalIncidents = incidents.length;
  const pendingApproval = incidents.filter(incident => incident.Status === 'Pending' || incident.Status === 'In Progress' || incident.Status === 'active').length;
  const approvedToday = incidents.filter(incident => incident.Status === 'Completed' && new Date(incident.LastUpdated).toDateString() === new Date().toDateString()).length;

  // Filter incidents based on status
  const filteredIncidents = filter === 'All Status' ? incidents : incidents.filter(incident => incident.Status === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
      
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 mb-4 text-center">
        <h1 className="text-xl font-semibold">Hind Terminals Pvt Ltd - Palwal</h1>
        <h2 className="text-sm">Assign Incidents - Training System</h2>
      </div>

      {/* Dashboard Section */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 border border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Total Incidents</p>
          <p className="text-2xl font-bold text-blue-600">{totalIncidents}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Active Incidents</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingApproval}</p>
        </div>
        
      </div>

      

      {/* Incident Table */}
      <div className="mb-6">
        <div className="bg-gray-200 p-2 mb-2">
          <h3 className="text-center font-bold text-gray-800">Incident Reports - Approval Pending</h3>
        </div>
        {error && <div className="text-red-600 p-4">{error}</div>}
        <div className="border border-gray-300">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Incident ID</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Reported By</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Injuries</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map(incident => {
                  const employees = JSON.parse(incident.InjuredHTPLEmployees || '[]');
                  return (
                    <tr key={incident.IncidentID} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{incident.IncidentID}</td>
                      <td className="px-4 py-2">{incident.Location}</td>
                      <td className="px-4 py-2">{incident.IncidentReportedBy}</td>
                      <td className="px-4 py-2">{employees[0]?.department || 'N/A'}</td>
                      <td className="px-4 py-2">{incident.CountInjury || 0}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded ${incident.Status === 'active' ? 'bg-yellow-200 text-yellow-800' : 
                          incident.Status === 'Completed' ? 'bg-green-200 text-green-800' : 
                          'bg-gray-200 text-gray-800'}`}>
                          {incident.Status}
                        </span>
                      </td>
                      <td className="px-4 py-4 ">
                        <div className="flex space-x-1">
                            <Link
                            to={`/incident-details/${incident.IncidentID}`}
                            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Link>
                        </div>
                        
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                    No incidents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignPage;