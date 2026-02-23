import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Truck, Filter } from 'lucide-react';

const routeOptions = ['06A', '06B', '06C', '07A', '07B', '07C', '08A', '08B', '08C'];

const SuggestionTable = ({ isEditable, activeStatus, activeKickoffId, mapRoutes, suggestionsData }) => {
  const [suggestions, setSuggestions] = useState([]);
  
  // Filter States
  const [fromFilterOpen, setFromFilterOpen] = useState(false);
  const [toFilterOpen, setToFilterOpen] = useState(false);
  const [fromFilters, setFromFilters] = useState([]);
  const [toFilters, setToFilters] = useState([]);

  useEffect(() => {
    // Populate the table using the exact data synced to the map dots
    if (suggestionsData) {
      setSuggestions(JSON.parse(JSON.stringify(suggestionsData))); // Deep copy for local edits
      // Reset filters when the active kickoff changes
      setFromFilters([]);
      setToFilters([]);
      setFromFilterOpen(false);
      setToFilterOpen(false);
    }
  }, [suggestionsData, activeKickoffId, activeStatus]);

  const handleAction = (id, newStatus) => {
    if (activeStatus !== 'Planning') return;
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleRouteChange = (id, newRoute) => {
    if (activeStatus !== 'Planning') return;
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, manualTo: newRoute } : s));
  };

  const toggleFromFilter = (route) => {
    setFromFilters(prev => prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]);
  };

  const toggleToFilter = (route) => {
    setToFilters(prev => prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]);
  };

  // Extract unique routes available in the current suggestions for the filter lists
  const uniqueFromRoutes = [...new Set(suggestions.map(s => s.from))].sort();
  const uniqueToRoutes = [...new Set(suggestions.map(s => s.to))].sort();

  // Filter the displayed suggestions based on selections
  const displayedSuggestions = suggestions.filter(s => {
    const matchFrom = fromFilters.length === 0 || fromFilters.includes(s.from);
    const matchTo = toFilters.length === 0 || toFilters.includes(s.to);
    return matchFrom && matchTo;
  });

  return (
    <div className="min-w-full inline-block align-middle pb-24">
      <div className="border rounded-lg overflow-visible bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50 uppercase font-bold text-gray-500">
            <tr className="text-[10px]">
              
              {/* FROM ROUTE COLUMN WITH FILTER */}
              <th className="px-3 py-2 text-left relative">
                <div 
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => { setFromFilterOpen(!fromFilterOpen); setToFilterOpen(false); }}
                >
                  From Route <Filter size={12} className={fromFilters.length > 0 ? "text-blue-600" : ""} />
                </div>
                {fromFilterOpen && (
                  <div className="absolute top-full left-2 mt-1 bg-white border border-gray-200 shadow-lg rounded-md p-2 z-50 min-w-[120px]">
                    <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Filter From</div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {uniqueFromRoutes.map(r => (
                        <label key={r} className="flex items-center gap-2 text-xs py-1 px-1 cursor-pointer hover:bg-gray-50 rounded normal-case font-medium text-gray-700">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={fromFilters.includes(r)}
                            onChange={() => toggleFromFilter(r)}
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                    {fromFilters.length > 0 && (
                      <div className="border-t mt-2 pt-2 flex justify-end">
                        <button onClick={() => setFromFilters([])} className="text-[10px] text-blue-600 font-bold hover:underline normal-case">Clear All</button>
                      </div>
                    )}
                  </div>
                )}
              </th>

              {/* TO ROUTE COLUMN WITH FILTER */}
              <th className="px-3 py-2 text-left relative">
                <div 
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => { setToFilterOpen(!toFilterOpen); setFromFilterOpen(false); }}
                >
                  To Route <Filter size={12} className={toFilters.length > 0 ? "text-blue-600" : ""} />
                </div>
                {toFilterOpen && (
                  <div className="absolute top-full left-2 mt-1 bg-white border border-gray-200 shadow-lg rounded-md p-2 z-50 min-w-[120px]">
                    <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Filter To</div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {uniqueToRoutes.map(r => (
                        <label key={r} className="flex items-center gap-2 text-xs py-1 px-1 cursor-pointer hover:bg-gray-50 rounded normal-case font-medium text-gray-700">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={toFilters.includes(r)}
                            onChange={() => toggleToFilter(r)}
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                    {toFilters.length > 0 && (
                      <div className="border-t mt-2 pt-2 flex justify-end">
                        <button onClick={() => setToFilters([])} className="text-[10px] text-blue-600 font-bold hover:underline normal-case">Clear All</button>
                      </div>
                    )}
                  </div>
                )}
              </th>

              <th className="px-3 py-2 text-left">Address Range</th>
              <th className="px-3 py-2 text-center">ACTION</th>
              <th className="px-3 py-2 text-left">Move To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedSuggestions.length > 0 ? (
              displayedSuggestions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700">{item.from}</span>
                      <ArrowRight size={14} className="text-gray-400 mx-2" />
                    </div>
                  </td>
                  <td className="px-3 py-3 font-bold text-gray-700">
                    {item.to}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-bold text-gray-700">{item.address}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {!item.isSingleAddress && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1"><Truck size={10} /> {item.stops} stops</div>
                      )}
                      <div className="text-[10px] font-bold text-indigo-500">UOW: {item.uow}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      {activeStatus !== 'Expired' ? (
                        <>
                          <button 
                            onClick={() => handleAction(item.id, 'accepted')}
                            className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                              item.status === 'accepted' 
                                ? 'bg-green-600 text-white border-green-600' 
                                : 'bg-white border-gray-200 text-gray-300'
                            } ${activeStatus === 'Planning' ? 'hover:border-green-400' : 'cursor-default'}`}
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleAction(item.id, 'rejected')}
                            className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                              item.status === 'rejected' 
                                ? 'bg-red-600 text-white border-red-600' 
                                : 'bg-white border-gray-200 text-gray-300'
                            } ${activeStatus === 'Planning' ? 'hover:border-red-400' : 'cursor-default'}`}
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        </>
                      ) : <span className="text-gray-300">-</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {activeStatus === 'Planning' ? (
                      <select 
                        value={item.manualTo}
                        onChange={(e) => handleRouteChange(item.id, e.target.value)}
                        className="text-[10px] border rounded p-1 w-20 bg-gray-50 font-bold outline-none focus:border-blue-500"
                      >
                        <option value="">Select...</option>
                        {routeOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-400 font-medium text-sm">
                  No suggestions match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuggestionTable;