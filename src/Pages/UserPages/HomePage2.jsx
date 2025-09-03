import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Cloud, User, FileText, Upload, X, AlertCircle, Save, Printer, CheckCircle } from 'lucide-react';
import hindLogo from "../../Assets/hindimg.png";

function IncidentReportForm() {
  const [formData, setFormData] = useState({
    // Basic Info
    incident_date: '',
    incident_time: '',
    location: '',
    weather_condition: '',
    
    // Personnel Info
    htpl_shift_in_charge: '',
    contractor_supervisor: '',
    incident_reported_by: '',
    report_prepared_by: '',
    
    // Incident Details
    incident_title: '',
    incident_summary: '',
    
    // Type of Incident
    type_injury: false,
    count_injury: 0,
    type_property_damage: false,
    count_property_damage: 0,
    type_fire: false,
    count_fire: 0,
    type_near_miss: false,
    count_near_miss: 0,
    type_environment: false,
    count_environment: 0,
    type_fatality: false,
    count_fatality: 0,
    type_other: false,
    count_other: 0,
    status : 'active', // Add status field
    // Injured Person Details
    injured_htpl_employees: [],
    injured_contract_workers: [],
    injured_visitors: [],
    
    // Files
    uploaded_files: []
  });

  const [activeTab, setActiveTab] = useState('htpl');
  const [uploadErrors, setUploadErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [submitMessage, setSubmitMessage] = useState('');

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      formData.uploaded_files.forEach(fileObj => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });
    };
  }, [formData.uploaded_files]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCountChange = (field, value) => {
    const count = Math.max(0, parseInt(value) || 0);
    setFormData(prev => ({
      ...prev,
      [field]: count
    }));
  };

  const handleInjuredPersonChange = (category, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].map((person, i) =>
        i === index ? { ...person, [field]: value } : person
      )
    }));
  };

  const handleNumberOfInjuredChange = (category, value) => {
    const count = Math.max(0, parseInt(value) || 0);
    const categoryKey = category === 'htpl' ? 'injured_htpl_employees' : 
                       category === 'contract' ? 'injured_contract_workers' : 
                       'injured_visitors';
    
    setFormData(prev => ({
      ...prev,
      [categoryKey]: Array(count).fill().map((_, i) => (
        prev[categoryKey][i] || {
          name: '',
          id_no_gate_pass_no: '',
          department: '',
          age: '',
          sex: '',
          contact_number: ''
        }
      ))
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 4 * 1024 * 1024; // 4MB
    const errors = [];
    const validFiles = [];

    files.forEach((file, index) => {
      if (file.size > maxSize) {
        errors.push(`File "${file.name}" exceeds 4MB limit`);
      } else {
        validFiles.push({
          id: Date.now() + index,
          file,
          original_name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
      }
    });

    setUploadErrors(errors);
    setFormData(prev => ({
      ...prev,
      uploaded_files: [...prev.uploaded_files, ...validFiles]
    }));

    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setFormData(prev => {
      const fileToRemove = prev.uploaded_files.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return {
        ...prev,
        uploaded_files: prev.uploaded_files.filter(f => f.id !== fileId)
      };
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        // Convert file objects to simplified format for JSON serialization
        uploaded_files: formData.uploaded_files.map(fileObj => ({
          original_name: fileObj.original_name,
          size: fileObj.size,
          type: fileObj.type
        }))
      };

      // In a real application, you would send this to your backend
      const response = await fetch('https://hindincidentapiapplication.onrender.com/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus('success');
        setSubmitMessage('Incident report submitted successfully!');
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            incident_date: '',
            incident_time: '',
            location: '',
            weather_condition: '',
            htpl_shift_in_charge: '',
            contractor_supervisor: '',
            incident_reported_by: '',
            report_prepared_by: '',
            incident_title: '',
            incident_summary: '',
            type_injury: false,
            count_injury: 0,
            type_property_damage: false,
            count_property_damage: 0,
            type_fire: false,
            count_fire: 0,
            type_near_miss: false,
            count_near_miss: 0,
            type_environment: false,
            count_environment: 0,
            type_fatality: false,
            count_fatality: 0,
            type_other: false,
            count_other: 0,
            injured_htpl_employees: [],
            injured_contract_workers: [],
            injured_visitors: [],
            uploaded_files: []
          });
          setSubmitStatus(null);
          setSubmitMessage('');
        }, 3000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to submit incident report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const incidentTypes = [
    { key: 'type_injury', label: 'Injury', count: 'count_injury' },
    { key: 'type_property_damage', label: 'Property Damage', count: 'count_property_damage' },
    { key: 'type_fire', label: 'Fire', count: 'count_fire' },
    { key: 'type_near_miss', label: 'Near Miss', count: 'count_near_miss' },
    { key: 'type_environment', label: 'Environment', count: 'count_environment' },
    { key: 'type_fatality', label: 'Fatality', count: 'count_fatality' },
    { key: 'type_other', label: 'Other', count: 'count_other' }
  ];

  const tabConfig = [
    { key: 'htpl', label: 'HTPL Employee', dataKey: 'injured_htpl_employees' },
    { key: 'contract', label: 'Contract Worker', dataKey: 'injured_contract_workers' },
    { key: 'visitors', label: 'Visitors', dataKey: 'injured_visitors' }
  ];

  const getCurrentTabData = () => {
    const currentTab = tabConfig.find(tab => tab.key === activeTab);
    return formData[currentTab.dataKey];
  };

  const getCurrentTabDataKey = () => {
    const currentTab = tabConfig.find(tab => tab.key === activeTab);
    return currentTab.dataKey;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
              <img src={hindLogo} alt="Hind Logo" className="h-12 w-auto object-contain" />
            </div>
                <span className="text-lg font-semibold text-gray-800"></span>
              </div>
            </div>
            <div className="text-center flex-1 mb-4 lg:mb-0">
              <h2 className="text-xl font-semibold text-gray-800">
                Incident Information Report
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

        {/* Success/Error Messages */}
        {submitStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            submitStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {submitStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              submitStatus === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {submitMessage}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="incident_date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Incident Date
                  </label>
                  <input
                    id="incident_date"
                    type="date"
                    name="incident_date"
                    value={formData.incident_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="incident_time" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Incident Time
                  </label>
                  <input
                    id="incident_time"
                    type="time"
                    name="incident_time"
                    value={formData.incident_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter incident location"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="weather_condition" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    Weather Condition
                  </label>
                  <select
                    id="weather_condition"
                    name="weather_condition"
                    value={formData.weather_condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select weather condition</option>
                    <option value="Clear">Clear</option>
                    <option value="Cloudy">Cloudy</option>
                    <option value="Rainy">Rainy</option>
                    <option value="Foggy">Foggy</option>
                    <option value="Windy">Windy</option>
                    <option value="Hot">Hot</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personnel Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Personnel Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="htpl_shift_in_charge" className="block text-sm font-medium text-gray-700 mb-2">
                    HTPL Shift In Charge
                  </label>
                  <input
                    id="htpl_shift_in_charge"
                    type="text"
                    name="htpl_shift_in_charge"
                    value={formData.htpl_shift_in_charge}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter shift in charge name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contractor_supervisor" className="block text-sm font-medium text-gray-700 mb-2">
                    Contractor Supervisor
                  </label>
                  <input
                    id="contractor_supervisor"
                    type="text"
                    name="contractor_supervisor"
                    value={formData.contractor_supervisor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter supervisor name"
                  />
                </div>
                <div>
                  <label htmlFor="incident_reported_by" className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Reported By
                  </label>
                  <input
                    id="incident_reported_by"
                    type="text"
                    name="incident_reported_by"
                    value={formData.incident_reported_by}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter reporter name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="report_prepared_by" className="block text-sm font-medium text-gray-700 mb-2">
                    Report Prepared By
                  </label>
                  <input
                    id="report_prepared_by"
                    type="text"
                    name="report_prepared_by"
                    value={formData.report_prepared_by}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter preparer name"
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <label htmlFor="incident_title" className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Title
                </label>
                <input
                  id="incident_title"
                  type="text"
                  name="incident_title"
                  value={formData.incident_title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter incident title"
                  required
                />
              </div>
            </div>

            {/* Type of Incident */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Type of Incident
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incidentTypes.map(({ key, label, count }, index) => (
                  <div key={key} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                      <input
                        type="checkbox"
                        checked={formData[key]}
                        onChange={() => handleCheckboxChange(key)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        id={key}
                      />
                      <label htmlFor={key} className="text-sm font-medium text-gray-700">
                        {label}
                      </label>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={formData[count]}
                        onChange={(e) => handleCountChange(count, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        placeholder="Count"
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Injured Person Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Details of Injured Person
              </h3>
              <div className="flex mb-6 border-b border-gray-200">
                {tabConfig.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`px-4 py-2 text-sm font-medium ${activeTab === tab.key ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Person(s) Injured
                </label>
                <input
                  type="number"
                  value={getCurrentTabData().length}
                  onChange={(e) => handleNumberOfInjuredChange(activeTab, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter number"
                  min="0"
                />
              </div>
              {getCurrentTabData().map((person, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Person {index + 1}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => handleInjuredPersonChange(getCurrentTabDataKey(), index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID No/Gate Pass No
                      </label>
                      <input
                        type="text"
                        value={person.id_no_gate_pass_no}
                        onChange={(e) => handleInjuredPersonChange(getCurrentTabDataKey(), index, 'id_no_gate_pass_no', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter ID or gate pass number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={person.department}
                        onChange={(e) => handleInjuredPersonChange(getCurrentTabDataKey(), index, 'department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={person.age}
                        onChange={(e) => handleInjuredPersonChange(getCurrentTabDataKey(), index, 'age', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter age"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sex
                      </label>
                      <select
                        value={person.sex}
                        onChange={(e) => handleInjuredPersonChange(getCurrentTabDataKey(), index, 'sex', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={person.contact_number}
                        onChange={(e) => handleInjuredPersonChange(getCurrentTabDataKey(), index, 'contact_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Incident Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Summary of the Incident
              </h3>
              <div>
                <label htmlFor="incident_summary" className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Summary
                </label>
                <textarea
                  id="incident_summary"
                  name="incident_summary"
                  value={formData.incident_summary}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                  placeholder="Provide a detailed summary of the incident including what happened, when, where, how, and any contributing factors..."
                  required
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                Supporting Documents & Images
              </h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Click to upload files or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Maximum file size: 4MB per file • Supported formats: Images, PDF, DOC, DOCX, TXT
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Browse Files
                  </label>
                </div>
                {uploadErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
                    </div>
                    <ul className="mt-2 text-sm text-red-700">
                      {uploadErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.uploaded_files.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Uploaded Files ({formData.uploaded_files.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.uploaded_files.map((fileObj) => (
                        <div key={fileObj.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                          {fileObj.preview ? (
                            <img
                              src={fileObj.preview}
                              alt={fileObj.original_name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileObj.original_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(fileObj.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(fileObj.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            aria-label={`Remove ${fileObj.original_name}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="text-sm text-gray-600">
                  <p><strong>Prepared By:</strong> {formData.report_prepared_by || '_________________'}</p>
                  <p className="mt-2"><strong>For:</strong> Hind Terminals Pvt Ltd - Palwal</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IncidentReportForm;