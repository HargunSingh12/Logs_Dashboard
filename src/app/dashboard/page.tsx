"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Dashboard() {
  const [logs, setLogs] = useState<unknown[]>([]);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [queryField, setQueryField] = useState<string>('');
  const [queryValue, setQueryValue] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Get all possible fields from logs
  const allFields = React.useMemo(() => {
    if (logs.length === 0) return [];
    const fieldSet = new Set<string>();
    logs.forEach(log => {
      if (typeof log === 'object' && log !== null) {
        Object.keys(log).forEach(key => fieldSet.add(key));
      }
    });
    return Array.from(fieldSet);
  }, [logs]);

  // Get all unique values for the selected field
  const allValues = React.useMemo(() => {
    if (!queryField || logs.length === 0) return [];
    const valueSet = new Set<string>();
    logs.forEach(log => {
      if (typeof log === 'object' && log !== null && queryField in log) {
        valueSet.add(String((log as Record<string, unknown>)[queryField]));
      }
    });
    return Array.from(valueSet);
  }, [logs, queryField]);

  // Filter logs by selected field/value
  const filteredLogs = React.useMemo(() => {
    if (!queryField || !queryValue) return [];
    return logs.filter(log =>
      typeof log === 'object' && log !== null && String((log as Record<string, unknown>)[queryField]) === queryValue
    );
  }, [logs, queryField, queryValue]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/logs');
      setLogs(res.data);
      setSelectedLogIndex(null);
    } catch (err) {
      setLogs([]);
      setSelectedLogIndex(null);
      console.log(err)
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleImportLogs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setImporting(true);
    setImportError(null);
    setImportSuccess(null);
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.[0]) {
      setImportError('Please select a file.');
      setImporting(false);
      return;
    }
    const file = fileInput.files[0];
    try {
      const text = await file.text();
      const logs = JSON.parse(text);
      if (!Array.isArray(logs)) throw new Error('File must contain a JSON array.');
      const res = await axios.post('/api/logs', { logs });
      setImportSuccess(`Imported ${res.data.imported} logs successfully.`);
      fetchLogs();
      // Clear file input after successful import
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setImportError(err.response?.data?.error || err.message);
      } else {
        setImportError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setImporting(false);
    }
  };

  // Clear import messages when user selects a new file
  const handleFileInputChange = () => {
    setImportError(null);
    setImportSuccess(null);
  };

  const handleClearLogs = async () => {
    try {
      await axios.delete('/api/logs');
      setLogs([]);
      setSelectedLogIndex(null);
    } catch (err) {
      alert('Failed to clear logs.');
      console.log(err)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 py-12 transition-colors duration-500">
      <div className="max-w-3xl mx-auto p-8 bg-gray-900/80 rounded-2xl shadow-2xl border border-gray-800 backdrop-blur-md">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-400 tracking-tight drop-shadow-lg">Log Dashboard</h1>
        {/* Import Logs Section */}
        <form className="mb-10" onSubmit={handleImportLogs}>
          <label className="block mb-2 text-base font-semibold text-blue-300">Import Logs (JSON Array)</label>
          <input
            type="file"
            name="logfile"
            accept="application/json"
            className="block w-full text-sm text-gray-200 border border-blue-700 rounded-lg cursor-pointer bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 transition"
            onChange={handleFileInputChange}
            ref={fileInputRef}
          />
          <button
            type="submit"
            disabled={importing}
            className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg shadow hover:from-green-700 hover:to-green-600 focus:ring-2 focus:ring-green-400 transition disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Import Logs'}
          </button>
          {importError && <div className="text-red-400 mt-2">{importError}</div>}
          {importSuccess && <div className="text-green-400 mt-2">{importSuccess}</div>}
        </form>
        {/* Logs Dropdown and Display Section */}
        <div className="mb-10 p-6 bg-gray-800/80 rounded-xl border border-gray-700 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-blue-300">Select a Log</h2>
            <button
              onClick={handleClearLogs}
              className="px-4 py-1 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-lg hover:from-red-800 hover:to-red-700 focus:ring-2 focus:ring-red-400 transition text-sm font-semibold shadow"
            >
              Clear Logs
            </button>
          </div>
          {logs.length === 0 ? (
            <div className="text-gray-400">No logs found.</div>
          ) : (
            <>
              <select
                className="mb-4 p-2 border border-blue-700 rounded-lg bg-gray-900 text-blue-200 focus:ring-2 focus:ring-blue-500 transition"
                value={selectedLogIndex ?? ''}
                onChange={e => setSelectedLogIndex(Number(e.target.value))}
                size={10}
                style={{ minWidth: '100%', maxWidth: '100%', height: 'auto' }}
              >
                {logs.map((log, idx) => {
                  let label = '';
                  try {
                    label = JSON.stringify(log);
                  } catch {
                    label = String(log);
                  }
                  if (label.length > 60) label = label.slice(0, 60) + '...';
                  return (
                    <option key={idx} value={idx} className="bg-gray-900 text-blue-200 hover:bg-blue-900">{label}</option>
                  );
                })}
              </select>
              {selectedLogIndex !== null && logs[selectedLogIndex] && (
                <pre className="bg-gray-950 text-green-300 p-4 rounded-lg overflow-x-auto text-xs border border-gray-800 shadow-inner">
                  {JSON.stringify(logs[selectedLogIndex], null, 2)}
                </pre>
              )}
            </>
          )}
        </div>
        {/* Query Executor Section */}
        <div className="mb-10 p-6 bg-gray-800/80 rounded-xl border border-green-900 shadow-inner">
          <h2 className="text-2xl font-bold text-green-300 mb-3">Query Executor</h2>
          {logs.length === 0 ? (
            <div className="text-gray-400">No logs found to query.</div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <select
                className="p-2 border border-green-700 rounded-lg bg-gray-900 text-green-200 focus:ring-2 focus:ring-green-500 transition"
                value={queryField}
                onChange={e => {
                  setQueryField(e.target.value);
                  setQueryValue('');
                }}
              >
                <option value="">Select field</option>
                {allFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
              <select
                className="p-2 border border-green-700 rounded-lg bg-gray-900 text-green-200 focus:ring-2 focus:ring-green-500 transition"
                value={queryValue}
                onChange={e => setQueryValue(e.target.value)}
                disabled={!queryField}
                style={{ maxWidth: '400px', minWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                <option value="">Select value</option>
                {allValues.map(value => {
                  const display = value.length > 40 ? value.slice(0, 40) + '...' : value;
                  return (
                    <option key={value} value={value} title={value}>{display}</option>
                  );
                })}
              </select>
            </div>
          )}
          {filteredLogs.length > 0 && (
            <div className="max-h-64 overflow-y-auto mt-2">
              <div className="text-green-400 mb-2">{filteredLogs.length} result{filteredLogs.length > 1 ? 's' : ''} found</div>
              {filteredLogs.map((log, idx) => (
                <pre key={idx} className="bg-gray-950 text-green-300 p-4 mb-2 rounded-lg overflow-x-auto text-xs border border-gray-800 shadow-inner">
                  {JSON.stringify(log, null, 2)}
                </pre>
              ))}
            </div>
          )}
          {queryField && queryValue && filteredLogs.length === 0 && (
            <div className="text-red-400">No logs found for this query.</div>
          )}
        </div>
      </div>
    </div>
  );
}
