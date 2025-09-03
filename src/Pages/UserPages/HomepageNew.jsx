import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import hindLogo from "../../Assets/hindimg.png";

// Simple toast component
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div style={{position:'fixed',top:20,right:20,zIndex:9999}} className="bg-green-600 text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
}

function New() {
  const { id } = useParams();
  const [incidentApiData, setIncidentApiData] = useState(null);
  const [responsibleOptions, setResponsibleOptions] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const username = localStorage.getItem('username') || '';
  const userId = localStorage.getItem('userId') || '';

  const [formData, setFormData] = useState({
    docNo: 'HTPL/OHS/10',
    effDate: '2023-10-03',
    revisionNo: '00',
    cftMembers: '',
    pastIncident: 'No',
    pastIncidentDetails: '',
    incidentSummary: '',
    chronology: [{ dateTime: '', activity: '' }],
    attachments: [],
    facts: '',
    evidence: '',
    driverStatement: '',
    supervisorStatement: '',
    manCauses: [],
    machineCauses: [],
    methodCauses: [],
    motherNatureCauses: [],
    probableCause: '',
    whyAnalysis: [
      { why: 'Why-01', description: '' },
      { why: 'Why-02', description: '' },
      { why: 'Why-03', description: '' },
      { why: 'Why-04', description: '' },
      { why: 'Why-05', description: '' },
    ],
    actualRootCause: '',
    correctiveAction: '',
    preventiveAction: '',
    actions: [{ action: '', status: 'Open', responsibleId: '', responsibleName: '', targetDate: '', docRef: '', attachmentsAssign: [] }],
    preparedBy: username,
    preparedByUserId: userId,
  });

  // Fetch responsible users
  useEffect(() => {
    fetch('https://hindincidentapiapplication.onrender.com/api/users/role3')
      .then(res => res.json())
      .then(data => setResponsibleOptions(data))
      .catch(() => setResponsibleOptions([]));
  }, []);

  // Fetch incident data
  useEffect(() => {
    if (id) {
      fetch(`https://hindincidentapiapplication.onrender.com/api/incident/${id}`)
        .then(res => res.json())
        .then(data => setIncidentApiData(data))
        .catch(() => setIncidentApiData(null));
    }
  }, [id]);

  // Debug: Log formData.actions changes
  useEffect(() => {
    console.log('Updated formData.actions:', formData.actions);
  }, [formData.actions]);

  // Handle attachment upload for actions
  const handleActionAttachmentsAssignChange = (index, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return; // Skip if no files selected
    console.log('Selected Files:', files); // Debug: Log selected files
    const fileMeta = files.map(file => ({
      originalName: file.name,
      size: file.size,
      mimetype: file.type
    }));
    console.log('File Metadata:', fileMeta); // Debug: Log metadata
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index
          ? {
              ...action,
              attachmentsAssign: [
                ...(action.attachmentsAssign || []).filter(
                  existingFile => !fileMeta.some(newFile => newFile.originalName === existingFile.originalName)
                ),
                ...fileMeta
              ]
            }
          : action
      )
    }));
  };

  // Handle input changes for text fields
  const handleInputChange = (e, field) => {
    if (field === 'preparedBy' || field === 'preparedByUserId') return;
    setFormData({ ...formData, [field]: e.target.value });
  };

  // Handle file attachments for general attachments
  const handleFileChange = (e) => {
    setFormData({ ...formData, attachments: [...formData.attachments, ...Array.from(e.target.files)] });
  };

  // Handle checkbox changes for causes
  const handleCauseChange = (category, cause) => {
    const updatedCauses = formData[category].includes(cause)
      ? formData[category].filter((c) => c !== cause)
      : [...formData[category], cause];
    setFormData({ ...formData, [category]: updatedCauses });
  };

  // Handle chronology input changes
  const handleChronologyChange = (index, field, value) => {
    const updatedChronology = formData.chronology.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, chronology: updatedChronology });
  };

  // Add a new action entry
  const addAction = () => {
    setFormData({
      ...formData,
      actions: [
        ...formData.actions,
        { action: '', status: 'Open', responsibleId: '', responsibleName: '', targetDate: '', docRef: '', attachmentsAssign: [] },
      ],
    });
  };

  // Remove an action entry
  const removeAction = (index) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  // Handle responsible person selection
  const handleResponsibleChange = (index, userId) => {
    const selectedUser = responsibleOptions.find(u => u.UserID === parseInt(userId));
    const updatedActions = formData.actions.map((item, i) =>
      i === index
        ? { ...item, responsibleId: userId, responsibleName: selectedUser ? selectedUser.UserName : '' }
        : item
    );
    setFormData({ ...formData, actions: updatedActions });
  };

  // Handle action input changes
  const handleActionChange = (index, field, value) => {
    const updatedActions = formData.actions.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, actions: updatedActions });
  };

  // Handle 5 Why input changes
  const handleWhyChange = (index, value) => {
    const updatedWhy = formData.whyAnalysis.map((item, i) =>
      i === index ? { ...item, description: value } : item
    );
    setFormData({ ...formData, whyAnalysis: updatedWhy });
  };

  // Submit report handler
  const handleSubmitReport = async () => {
    const latestUsername = localStorage.getItem('username') || '';
    const latestUserId = localStorage.getItem('userId') || '';
    const reportData = {
      id,
      ...formData,
      preparedBy: latestUsername,
      preparedByUserId: latestUserId,
      actions: formData.actions.map(action => ({
        ...action,
        responsibleId: action.responsibleId || '',
        attachmentsAssign: action.attachmentsAssign?.filter(file => Object.keys(file).length > 0) || []
      }))
    };
    console.log('Report Data Before Submission:', reportData); // Debug: Log payload
    try {
      const response = await fetch('https://hindincidentapiapplication.onrender.com/api/incident-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      if (response.ok) {
        setToastMsg('Report submitted successfully!');
      } else {
        setToastMsg('Failed to submit report.');
      }
    } catch (error) {
      setToastMsg('Error submitting report.');
    }
  };

  // Define cause options
  const manCausesOptions = [
    'Lack of training or awareness about safety procedures.',
    'Fatigue or physical stress due to long working hours.',
    'Non-compliance with PPE requirements.',
    'Improper manual handling techniques.',
    'Lack of Proper Security Measures',
    'Carelessness or negligence by operator',
    'New manpower engage.',
    'Inadequate supervision or lack of communication.',
    'Dishonest worker',
  ];

  const machineCausesOptions = [
    'Malfunctioning or poorly maintained equipment.',
    'Absence of pre-use inspections for machinery.',
    'Lack of safety guards or interlocks on machines.',
    'Use of outdated or inappropriate tools/equipment.',
    'Overloading of handling equipment.',
    'Faulty Handling Equipment.',
    'Wrong vehicle/equipment selection.',
  ];

  const methodCausesOptions = [
    'Non-adherence to standard operating procedures.',
    'Use of outdated or inefficient work (wrong) methods.',
    'Unsafe lifting techniques',
    'Poor planning and scheduling.',
    'Poor labelling or identification of materials.',
    'Rough Handling',
    'Warehouse Structural Problems i.e. Leaky roofs, poor ventilation, or weak flooring.',
    'Inadequate Lighting & Security',
    'Poor pest control leads to the presence of rodents, cockroaches, and insects.',
    'Lack of clear workflows or processes for loading /unloading.',
    'Lack of Technology in Monitoring',
    'Use of damaged pallets or packaging',
    'Incorrect stacking or storage of goods',
    'Lack of Proper Inspection & Quality Checks',
    'Wrong material dispatch',
    'Weak Access Control',
    'Poor Lighting',
  ];

  const motherNatureCausesOptions = [
    'Exposure to Moisture & Humidity leads to fungi, Corrosion & Rust',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="flex items-center space-x-2">
                <img src={hindLogo} alt="Hind Logo" className="h-12 w-auto object-contain" />
                <span className="text-lg font-semibold text-gray-800"></span>
              </div>
            </div>
            <div className="text-center flex-1 mb-4 lg:mb-0">
              <h2 className="text-xl font-semibold text-gray-800">
                Root Cause Analysis Report
              </h2>
            </div>
            <div className="bg-gray-50 border border-gray-300 rounded-md p-3 text-sm">
              <div className="grid grid-cols-1 gap-1">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Doc No:</span>
                  <span className="text-gray-800">HTPL/OHS/10A</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Eff. Date:</span>
                  <span className="text-gray-800">03.10.2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Rev no & Date:</span>
                  <span className="text-gray-800">00</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
            <div className="border-2 border-black p-2 text-center">
              <h1 className="text-lg font-bold text-gray-900">
                Hind Terminals Pvt Ltd - Palwal
              </h1>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            {/* CFT Members */}
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold w-1/3 align-top bg-gray-50">
                Member of CFT (Cross functional Team) during Incident Investigation process
              </td>
              <td className="border-b border-gray-300 p-3">
                <textarea
                  value={formData.cftMembers}
                  onChange={(e) => handleInputChange(e, 'cftMembers')}
                  className="w-full h-16 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter CFT member details..."
                />
              </td>
            </tr>

            {/* Past Incident */}
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold align-top bg-gray-50">
                Any similar incident happened in terminal in Past
              </td>
              <td className="border-b border-gray-300 p-3">
                <select
                  value={formData.pastIncident}
                  onChange={(e) => handleInputChange(e, 'pastIncident')}
                  className="mb-2 bg-transparent border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <span className="ml-2 text-sm text-gray-600">Yes/No</span>
              </td>
            </tr>

            {/* Details if Yes */}
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold align-top bg-gray-50">
                Details (If Yes)
              </td>
              <td className="border-b border-gray-300 p-3">
                <textarea
                  value={formData.pastIncidentDetails}
                  onChange={(e) => handleInputChange(e, 'pastIncidentDetails')}
                  className={`w-full h-16 resize-none ${formData.pastIncident === 'No' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-transparent'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1`}
                  placeholder="Provide details if yes..."
                  disabled={formData.pastIncident === 'No'}
                />
              </td>
            </tr>

            {/* Summary of Incident (Read-only from API) */}
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold align-top bg-gray-50">
                Summary of Incident
              </td>
              <td className="border-b border-gray-300 p-3">
                <textarea
                  value={incidentApiData?.IncidentSummary || ''}
                  readOnly
                  className="w-full h-20 resize-none bg-gray-100 text-gray-700 border border-gray-300 rounded px-2 py-1 cursor-not-allowed"
                  placeholder="Loading from API..."
                />
              </td>
            </tr>
          </table>

          {/* Chronology of Events */}
          <div className="mt-6">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="text-center font-semibold text-gray-800">
                Chronology of Events
              </h3>
            </div>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <td className="border-r border-b border-gray-300 p-2 font-semibold text-center w-1/2 bg-gray-50">
                    Date & Time
                  </td>
                  <td className="border-b border-gray-300 p-2 font-semibold text-center w-1/2 bg-gray-50">
                    Activity
                  </td>
                </tr>
              </thead>
              <tbody>
                {incidentApiData && (
                  <tr>
                    <td
                      className="border-r border-b border-gray-300 p-2 text-center align-top"
                      rowSpan={formData.chronology.length}
                    >
                      <input
                        type="text"
                        value={`${new Date(
                          incidentApiData.IncidentDate
                        ).toLocaleDateString()} ${
                          incidentApiData.IncidentTime
                            ? new Date(
                                incidentApiData.IncidentTime
                              ).toLocaleTimeString()
                            : ''
                        }`}
                        readOnly
                        className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded px-2 py-1 cursor-not-allowed"
                      />
                    </td>
                    <td className="border-b border-gray-300 p-2">
                      <input
                        type="text"
                        value={formData.chronology[0]?.activity || ''}
                        onChange={(e) =>
                          handleChronologyChange(0, 'activity', e.target.value)
                        }
                        className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1"
                        placeholder="Enter activity..."
                      />
                    </td>
                  </tr>
                )}
                {formData.chronology.slice(1).map((entry, index) => (
                  <tr key={index + 1}>
                    <td className="border-b border-gray-300 p-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={entry.activity || ''}
                        onChange={(e) =>
                          handleChronologyChange(index + 1, 'activity', e.target.value)
                        }
                        className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1"
                        placeholder="Enter activity..."
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            chronology: prev.chronology.filter(
                              (_, i) => i !== index + 1
                            ),
                          }))
                        }
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    chronology: [...prev.chronology, { activity: '' }],
                  }))
                }
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded shadow hover:bg-blue-600"
              >
                + Add Activity
              </button>
            </div>
          </div>

          {/* Other sections */}
          <table className="w-full text-sm mt-6" style={{ borderCollapse: 'collapse' }}>
            <tr>
              <td colSpan="2" className="border-b border-gray-300 p-3 font-semibold bg-gray-50">
                Photograph / Video etc :- Attach in next slide 
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 p-3 font-bold text-xl text-sky-600 bg-gray-50 align-middle text-center">
                Facts collected during Investigation
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold align-top bg-gray-50">
                Evidence
              </td>
              <td className="border-b border-gray-300 p-3">
                {incidentApiData && incidentApiData.UploadedFiles && incidentApiData.UploadedFiles.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {incidentApiData.UploadedFiles.map((file, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-medium">{file.original_name}</span> <span className="text-xs text-gray-500">({file.type}, {file.size} bytes)</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500">No files uploaded</span>
                )}
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold align-top bg-gray-50">
                Statement of driver/Operator/Helper/Victim
              </td>
              <td className="border-b border-gray-300 p-3">
                <textarea
                  value={formData.driverStatement}
                  onChange={(e) => handleInputChange(e, 'driverStatement')}
                  className="w-full h-20 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter driver/operator/helper/victim statement..."
                />
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold align-top bg-gray-50">
                Statement of the supervisor/In charge
              </td>
              <td className="border-b border-gray-300 p-3">
                <textarea
                  value={formData.supervisorStatement}
                  onChange={(e) => handleInputChange(e, 'supervisorStatement')}
                  className="w-full h-20 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter supervisor/in charge statement..."
                />
              </td>
            </tr>
          </table>

          {/* Possible Causes Section */}
          <div className="mt-6">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="text-center font-bold text-gray-800">Possible Causes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="border-r border-gray-300 p-4">
                <div className="font-bold text-center mb-3 bg-red-100 p-2 rounded">MAN CAUSES</div>
                <div className="space-y-1">
                  {manCausesOptions.map((cause, index) => (
                    <div key={cause} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.manCauses.includes(cause)}
                        onChange={() => handleCauseChange('manCauses', cause)}
                        className="mr-2 mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-xs leading-tight">
                        {index + 1}. {cause}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="font-bold text-center mb-3 bg-blue-100 p-2 rounded">MACHINE CAUSES</div>
                <div className="space-y-1">
                  {machineCausesOptions.map((cause, index) => (
                    <div key={cause} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.machineCauses.includes(cause)}
                        onChange={() => handleCauseChange('machineCauses', cause)}
                        className="mr-2 mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-xs leading-tight">
                        {index + 1}. {cause}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-gray-300">
              <div className="border-r border-gray-300 p-4">
                <div className="font-bold text-center mb-3 bg-green-100 p-2 rounded">METHOD CAUSES</div>
                <div className="space-y-1">
                  {methodCausesOptions.map((cause, index) => (
                    <div key={cause} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.methodCauses.includes(cause)}
                        onChange={() => handleCauseChange('methodCauses', cause)}
                        className="mr-2 mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-xs leading-tight">
                        {index + 1}. {cause}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="font-bold text-center mb-3 bg-yellow-100 p-2 rounded">MOTHER NATURE CAUSES</div>
                <div className="space-y-1">
                  {motherNatureCausesOptions.map((cause, index) => (
                    <div key={cause} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.motherNatureCauses.includes(cause)}
                        onChange={() => handleCauseChange('motherNatureCauses', cause)}
                        className="mr-2 mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-xs leading-tight">
                        {index + 1}. {cause}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Probable Cause - Show selected causes */}
          <div className="mt-6">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="text-center font-bold text-gray-800">Probable Cause</h3>
            </div>
            <div className="p-4">
              <div className="mb-2 font-semibold">Selected Causes by Category:</div>
              <div className="ml-4">
                {formData.manCauses && formData.manCauses.length > 0 && (
                  <div className="mb-2">
                    <span className="font-bold">Man:</span>
                    <ul className="list-disc ml-6">
                      {formData.manCauses.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.machineCauses && formData.machineCauses.length > 0 && (
                  <div className="mb-2">
                    <span className="font-bold">Machine:</span>
                    <ul className="list-disc ml-6">
                      {formData.machineCauses.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.methodCauses && formData.methodCauses.length > 0 && (
                  <div className="mb-2">
                    <span className="font-bold">Method:</span>
                    <ul className="list-disc ml-6">
                      {formData.methodCauses.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.motherNatureCauses && formData.motherNatureCauses.length > 0 && (
                  <div className="mb-2">
                    <span className="font-bold">Mother Nature:</span>
                    <ul className="list-disc ml-6">
                      {formData.motherNatureCauses.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* WHY-WHY Analysis */}
          <div className="mt-6">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="text-center font-bold text-gray-800">WHY-WHY (5WHY) Analysis</h3>
            </div>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <tr>
                <td className="border-r border-b border-gray-300 p-2 font-semibold text-center w-1/4 bg-gray-50">5 Why</td>
                <td className="border-b border-gray-300 p-2 font-semibold text-center bg-gray-50">Description</td>
              </tr>
              {formData.whyAnalysis.map((why, index) => (
                <tr key={index}>
                  <td className="border-r border-b border-gray-300 p-2 font-medium bg-gray-50">{why.why}</td>
                  <td className="border-b border-gray-300 p-2">
                    <input
                      type="text"
                      value={why.description}
                      onChange={(e) => handleWhyChange(index, e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1"
                      placeholder={`Enter ${why.why} description...`}
                    />
                  </td>
                </tr>
              ))}
            </table>
          </div>

          {/* Actual Root Cause, Corrective Action, Preventive Action */}
          <table className="w-full text-sm mt-6" style={{ borderCollapse: 'collapse' }}>
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold align-top w-1/3 bg-gray-50">Actual Root Cause</td>
              <td className="border-b border-gray-300 p-3">
                <textarea
                  value={formData.actualRootCause}
                  onChange={(e) => handleInputChange(e, 'actualRootCause')}
                  className="w-full h-16 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter actual root cause..."
                />
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold align-top bg-gray-50">Corrective Action</td>
              <td className="border-b border-gray-300 p-3">
                <textarea
                  value={formData.correctiveAction}
                  onChange={(e) => handleInputChange(e, 'correctiveAction')}
                  className="w-full h-16 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter corrective action..."
                />
              </td>
            </tr>
            <tr>
              <td className="border-b border-gray-300 p-3 font-semibold align-top bg-gray-50">Preventive Action</td>
              <td className="border-b border-gray-300 p-3">
                <textarea
                  value={formData.preventiveAction}
                  onChange={(e) => handleInputChange(e, 'preventiveAction')}
                  className="w-full h-16 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter preventive action..."
                />
              </td>
            </tr>
          </table>

          {/* Action & Standardization */}
          <div className="mt-6">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="text-center font-bold text-gray-800">Action & Standardization</h3>
            </div>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <tr>
                <td className="border-r border-b border-gray-300 p-2 font-semibold text-center bg-gray-50">Action</td>
                <td className="border-r border-b border-gray-300 p-2 font-semibold text-center bg-gray-50">Status</td>
                <td className="border-r border-b border-gray-300 p-2 font-semibold text-center bg-gray-50">Responsible Person</td>
                <td className="border-r border-b border-gray-300 p-2 font-semibold text-center bg-gray-50">Target Date</td>
                <td className="border-r border-b border-gray-300 p-2 font-semibold text-center bg-gray-50">Doc Ref</td>
                <td className="border-b border-gray-300 p-2 font-semibold text-center bg-gray-50">Attachments</td>
                <td className="border-b border-gray-300 p-2 font-semibold text-center bg-gray-50">Actions</td>
              </tr>
              {formData.actions.map((action, index) => (
                <tr key={index}>
                  <td className="border-r border-b border-gray-300 p-1">
                    <input
                      type="text"
                      value={action.action}
                      onChange={(e) => handleActionChange(index, 'action', e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs border border-gray-300 rounded px-1 py-1"
                      placeholder="Enter action..."
                    />
                  </td>
                  <td className="border-r border-b border-gray-300 p-1">
                    <select
                      value={action.status || ''}
                      onChange={(e) => handleActionChange(index, 'status', e.target.value)}
                      className="w-full bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs border border-gray-300 rounded px-1 py-1"
                    >
                      <option value="Open">Open</option>
                      <option value="Close">Close</option>
                    </select>
                  </td>
                  <td className="border-r border-b border-gray-300 p-1">
                    <select
                      value={action.responsibleId || ''}
                      onChange={(e) => handleResponsibleChange(index, e.target.value)}
                      className="w-full bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs border border-gray-300 rounded px-1 py-1"
                    >
                      <option value="">Select Responsible Person</option>
                      {responsibleOptions.map(user => (
                        <option key={user.UserID} value={user.UserID}>{user.UserName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border-r border-b border-gray-300 p-1">
                    <input
                      type="date"
                      value={action.targetDate}
                      onChange={(e) => handleActionChange(index, 'targetDate', e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs border border-gray-300 rounded px-1 py-1"
                    />
                  </td>
                  <td className="border-r border-b border-gray-300 p-1">
                    <input
                      type="text"
                      value={action.docRef}
                      onChange={(e) => handleActionChange(index, 'docRef', e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs border border-gray-300 rounded px-1 py-1"
                      placeholder="Doc ref..."
                    />
                  </td>
                  <td className="border-r border-b border-gray-300 p-1">
                    <div className="flex flex-col gap-1">
                      <label className="cursor-pointer text-xs text-blue-700">
                        Attach Doc Ref
                        <input
                          type="file"
                          multiple
                          onChange={(e) => handleActionAttachmentsAssignChange(index, e)}
                          className="hidden"
                        />
                      </label>
                      {action.attachmentsAssign && action.attachmentsAssign.length > 0 && (
                        <ul className="list-disc ml-2 text-xs">
                          {action.attachmentsAssign.map((file, idx) => (
                            <li key={idx}>
                              {file.originalName} ({file.mimetype}, {file.size} bytes)
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </td>
                  <td className="border-b border-gray-300 p-1 text-center">
                    <button
                      onClick={() => removeAction(index)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="7" className="border-b border-gray-300 p-2 flex gap-2">
                  <button
                    onClick={addAction}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Add Action
                  </button>
                </td>
              </tr>
            </table>
          </div>

          {/* Prepared By */}
          <table className="w-full text-sm mt-6" style={{ borderCollapse: 'collapse' }}>
            <tr>
              <td className="p-3 font-semibold align-top w-1/3 bg-gray-50">Prepared By:</td>
              <td className="p-3">
                <input
                  type="text"
                  value={formData.preparedBy}
                  readOnly
                  className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded px-2 py-1 cursor-not-allowed"
                />
              </td>
            </tr>
          </table>

          {/* Submit Button */}
          <div className="mt-6 p-4 text-right">
            <button
              onClick={handleSubmitReport}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default New;