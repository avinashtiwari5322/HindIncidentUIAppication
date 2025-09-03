import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Toast Component
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-hide after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
      <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-green-200 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

const AssignIncidentDetails = () => {
  const { incidentId } = useParams();
  const [incidentData, setIncidentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    types: true,
    injured: true,
    chronology: true,
    causes: true,
    other: true,
    why: true,
    actions: true,
    files: true,
    assignment: true,
    updates: true,
    timeline: true,
    communication: true
  });

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: ''
  });

  // Assignment update states
  const [assignmentStatus, setAssignmentStatus] = useState('In Progress');
  const [currentActivity, setCurrentActivity] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(25);
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [challenges, setChallenges] = useState('');
  const [resourcesNeeded, setResourcesNeeded] = useState('');
  const [updates, setUpdates] = useState([
    {
      id: 1,
      date: '2025-09-01',
      time: '10:30 AM',
      status: 'Started',
      activity: 'Initial assessment of the incident scene',
      comments: 'Preliminary investigation completed'
    }
  ]);
  const [newUpdate, setNewUpdate] = useState({
    activity: '',
    comments: '',
    status: 'In Progress'
  });
  const [communicationLog, setCommunicationLog] = useState([
    {
      id: 1,
      date: '2025-09-01',
      time: '09:00 AM',
      from: 'Safety Manager',
      to: 'Assigned Investigator',
      message: 'Please prioritize this incident investigation',
      type: 'email'
    }
  ]);
  const [newCommunication, setNewCommunication] = useState({
    to: '',
    message: '',
    type: 'email'
  });

  useEffect(() => {
    const fetchIncidentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://hindincidentapiapplication.onrender.com/api/incident/assign-user/details?incidentId=${incidentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch incident data');
        }
        const data = await response.json();

        // Parse all stringified JSON fields
        const parsedData = {
          ...data,
          InjuredHTPLEmployees: parseJSONSafely(data.InjuredHTPLEmployees, []),
          InjuredContractWorkers: parseJSONSafely(data.InjuredContractWorkers, []),
          InjuredVisitors: parseJSONSafely(data.InjuredVisitors, []),
          UploadedFiles: parseJSONSafely(data.UploadedFiles, []),
          Chronology: parseJSONSafely(data.Chronology, []),
          ManCauses: parseJSONSafely(data.ManCauses, []),
          MachineCauses: parseJSONSafely(data.MachineCauses, []),
          MotherNatureCauses: parseJSONSafely(data.MotherNatureCauses, []),
          WhyAnalysis: parseJSONSafely(data.WhyAnalysis, []),
          Actions: Array.isArray(data.Actions) ? data.Actions.map(action => ({
            ...action,
            AttachmentsAssign: parseJSONSafely(action.AttachmentsAssign, [])
          })) : []
        };

        setIncidentData(parsedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (incidentId) {
      fetchIncidentData();
    }
  }, [incidentId]);

  // Utility function to safely parse JSON
  const parseJSONSafely = (str, defaultValue) => {
    try {
      return str ? JSON.parse(str) : defaultValue;
    } catch (e) {
      console.error(`Error parsing JSON for ${str}:`, e);
      return defaultValue;
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const showToast = (message) => {
    setToast({
      isVisible: true,
      message: message
    });
  };

  const hideToast = () => {
    setToast({
      isVisible: false,
      message: ''
    });
  };

  const handleUpdateSubmit = () => {
    if (newUpdate.activity.trim()) {
      const update = {
        id: updates.length + 1,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        activity: newUpdate.activity,
        comments: newUpdate.comments,
        status: newUpdate.status
      };
      setUpdates([...updates, update]);
      setNewUpdate({ activity: '', comments: '', status: 'In Progress' });
      
      showToast('Update saved successfully!');
    }
  };

  const handleCommunicationSubmit = () => {
    if (newCommunication.to.trim() && newCommunication.message.trim()) {
      const communication = {
        id: communicationLog.length + 1,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        from: 'Assigned Person',
        to: newCommunication.to,
        message: newCommunication.message,
        type: newCommunication.type
      };
      setCommunicationLog([...communicationLog, communication]);
      setNewCommunication({ to: '', message: '', type: 'email' });
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-red-600">Error: {error}</div>;
  }

  if (!incidentData) {
    return <div className="container mx-auto p-6">No incident data found.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl bg-gray-100 min-h-screen">
      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Incident Report</h1>

      {/* General Information Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('general')}>
          <h2 className="text-xl font-semibold">General Information</h2>
          <span>{expandedSections.general ? '▼' : '▶'}</span>
        </div>
        {expandedSections.general && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <table className="min-w-full border-collapse">
              <tbody>
                {Object.entries({
                  'Incident ID': incidentData.IncidentID,
                  'Incident Date': incidentData.IncidentDate ? new Date(incidentData.IncidentDate).toLocaleDateString() : 'N/A',
                  'Incident Time': incidentData.IncidentTime ? new Date(incidentData.IncidentTime).toLocaleTimeString() : 'N/A',
                  'Location': incidentData.Location,
                  'Weather Condition': incidentData.WeatherCondition,
                  'HTPL Shift In-Charge': incidentData.HTPLShiftInCharge,
                  'Contractor Supervisor': incidentData.ContractorSupervisor,
                  'Incident Reported By': incidentData.IncidentReportedBy,
                  'Report Prepared By': incidentData.ReportPreparedBy,
                  'Incident Title': incidentData.IncidentTitle,
                  'Incident Summary': incidentData.IncidentSummary
                }).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-700">{key}</td>
                    <td className="py-3 px-4 text-gray-600">{value || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Incident Types Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('types')}>
          <h2 className="text-xl font-semibold">Incident Types</h2>
          <span>{expandedSections.types ? '▼' : '▶'}</span>
        </div>
        {expandedSections.types && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Type</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Occurred</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Count</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Injury', occurred: incidentData.TypeInjury, count: incidentData.CountInjury },
                  { type: 'Property Damage', occurred: incidentData.TypePropertyDamage, count: incidentData.CountPropertyDamage },
                  { type: 'Fire', occurred: incidentData.TypeFire, count: incidentData.CountFire },
                  { type: 'Near Miss', occurred: incidentData.TypeNearMiss, count: incidentData.CountNearMiss },
                  { type: 'Environment', occurred: incidentData.TypeEnvironment, count: incidentData.CountEnvironment },
                  { type: 'Fatality', occurred: incidentData.TypeFatality, count: incidentData.CountFatality },
                  { type: 'Other', occurred: incidentData.TypeOther, count: incidentData.CountOther }
                ].map(({ type, occurred, count }) => (
                  <tr key={type} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{type}</td>
                    <td className="py-3 px-4">{occurred ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4">{count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Injured Persons Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('injured')}>
          <h2 className="text-xl font-semibold">Injured Persons</h2>
          <span>{expandedSections.injured ? '▼' : '▶'}</span>
        </div>
        {expandedSections.injured && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            {['InjuredHTPLEmployees', 'InjuredContractWorkers', 'InjuredVisitors'].map((category) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">{category.replace(/([A-Z])/g, ' $1').trim()}</h3>
                {Array.isArray(incidentData[category]) && incidentData[category].length > 0 ? (
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">ID/Gate Pass No</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Department</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Age</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Sex</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Contact Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidentData[category].map((person, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{person.name || 'N/A'}</td>
                          <td className="py-3 px-4">{person.id_no_gate_pass_no || 'N/A'}</td>
                          <td className="py-3 px-4">{person.department || 'N/A'}</td>
                          <td className="py-3 px-4">{person.age || 'N/A'}</td>
                          <td className="py-3 px-4">{person.sex || 'N/A'}</td>
                          <td className="py-3 px-4">{person.contact_number || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600">No data available.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Chronology and Statements Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('chronology')}>
          <h2 className="text-xl font-semibold">Chronology and Statements</h2>
          <span>{expandedSections.chronology ? '▼' : '▶'}</span>
        </div>
        {expandedSections.chronology && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Chronology</h3>
            <table className="min-w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Date/Time</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Activity</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(incidentData.Chronology) && incidentData.Chronology.length > 0 ? (
                  incidentData.Chronology.map((event, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{event.dateTime ? new Date(event.dateTime).toLocaleString() : 'N/A'}</td>
                      <td className="py-3 px-4">{event.activity || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-3 px-4 text-gray-600">No chronology data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800">Driver Statement</h3>
              <p className="text-gray-600">{incidentData.DriverStatement || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800">Supervisor Statement</h3>
              <p className="text-gray-600">{incidentData.SupervisorStatement || 'N/A'}</p>
            </div>
          </div>
        )}
      </section>

      {/* Evidence Details Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('files')}>
          <h2 className="text-xl font-semibold">Evidence Details</h2>
          <span>{expandedSections.files ? '▼' : '▶'}</span>
        </div>
        {expandedSections.files && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            {Array.isArray(incidentData.UploadedFiles) && incidentData.UploadedFiles.length > 0 ? (
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">File Name</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentData.UploadedFiles.map((file, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{file.original_name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No files available.</p>
            )}
          </div>
        )}
      </section>

      {/* Causes Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('causes')}>
          <h2 className="text-xl font-semibold">Causes</h2>
          <span>{expandedSections.causes ? '▼' : '▶'}</span>
        </div>
        {expandedSections.causes && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            {['ManCauses', 'MachineCauses', 'MotherNatureCauses'].map((causeType) => (
              <div key={causeType} className="mb-4">
                <h3 className="text-lg font-medium text-gray-800">{causeType.replace(/([A-Z])/g, ' $1').trim()}</h3>
                {Array.isArray(incidentData[causeType]) && incidentData[causeType].length > 0 ? (
                  <ul className="list-disc pl-6 text-gray-600">
                    {incidentData[causeType].map((cause, index) => (
                      <li key={index} className="py-1">{cause || 'N/A'}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No causes listed.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Other Details Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('other')}>
          <h2 className="text-xl font-semibold">Other Details</h2>
          <span>{expandedSections.other ? '▼' : '▶'}</span>
        </div>
        {expandedSections.other && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <table className="min-w-full border-collapse">
              <tbody>
                {Object.entries({
                  'CFT Members': incidentData.CftMembers,
                  'Past Incident': incidentData.PastIncident,
                  'Past Incident Details': incidentData.PastIncidentDetails,
                  'Actions Incident Summary': incidentData.ActionsIncidentSummary,
                  'Probable Cause': incidentData.ProbableCause,
                  'Actual Root Cause': incidentData.ActualRootCause,
                  'Corrective Action': incidentData.CorrectiveAction,
                  'Preventive Action': incidentData.PreventiveAction
                }).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-700">{key}</td>
                    <td className="py-3 px-4 text-gray-600">{value || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Why Analysis Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('why')}>
          <h2 className="text-xl font-semibold">Why Analysis</h2>
          <span>{expandedSections.why ? '▼' : '▶'}</span>
        </div>
        {expandedSections.why && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Why</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(incidentData.WhyAnalysis) && incidentData.WhyAnalysis.length > 0 ? (
                  incidentData.WhyAnalysis.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.why || 'N/A'}</td>
                      <td className="py-3 px-4">{item.description || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-3 px-4 text-gray-600">No why analysis data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Actions Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('actions')}>
          <h2 className="text-xl font-semibold">Actions</h2>
          <span>{expandedSections.actions ? '▼' : '▶'}</span>
        </div>
        {expandedSections.actions && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            {Array.isArray(incidentData.Actions) && incidentData.Actions.length > 0 ? (
              incidentData.Actions.map((action, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Action {index + 1}</h3>
                  <table className="min-w-full border-collapse mb-4">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Action</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Document Reference</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Target Date</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Responsible ID</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Attachments</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{action.Action || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            action.Status === 'Open' ? 'bg-yellow-100 text-yellow-800' : 
                            action.Status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            action.Status === 'Completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {action.Status || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{action.DocReff || 'N/A'}</td>
                        <td className="py-3 px-4">{action.TargetDate ? new Date(action.TargetDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-3 px-4">{action.ResponsibleId || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {Array.isArray(action.AttachmentsAssign) && action.AttachmentsAssign.length > 0 ? (
                            action.AttachmentsAssign.map((attachment, attIndex) => (
                              <div key={attIndex}>
                                {attachment.originalName || 'N/A'} 
                              </div>
                            ))
                          ) : (
                            'No attachments'
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No actions available.</p>
            )}
          </div>
        )}
      </section>

      {/* Activity Updates Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center bg-purple-600 text-white p-4 rounded-t-lg cursor-pointer" onClick={() => toggleSection('updates')}>
          <h2 className="text-xl font-semibold">Activity Updates</h2>
          <span>{expandedSections.updates ? '▼' : '▶'}</span>
        </div>
        {expandedSections.updates && (
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Update</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Description</label>
                  <input
                    type="text"
                    value={newUpdate.activity}
                    onChange={(e) => setNewUpdate({...newUpdate, activity: e.target.value})}
                    placeholder="Describe the activity you completed..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newUpdate.status}
                    onChange={(e) => setNewUpdate({...newUpdate, status: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  <textarea
                    value={newUpdate.comments}
                    onChange={(e) => setNewUpdate({...newUpdate, comments: e.target.value})}
                    placeholder="Additional comments or notes..."
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleUpdateSubmit}
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Add Update
                </button>
              </div>
            </div>
            
            {/* Updates History */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Update History</h3>
              {updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            update.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            update.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            update.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                            update.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {update.status}
                          </span>
                          <span className="text-sm text-gray-500">{update.date} at {update.time}</span>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-2">{update.activity}</h4>
                      {update.comments && (
                        <p className="text-gray-600 text-sm">{update.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No updates available.</p>
              )}
            </div>
          </div>
        )}
      </section>

     
    </div>
  );
};

export default AssignIncidentDetails;