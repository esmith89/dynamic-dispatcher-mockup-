import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Truck } from 'lucide-react';

const routeOptions = ['06A', '06B', '06C', '07A', '07B', '07C', '08A', '08B', '08C'];

const SuggestionTable = ({ isEditable, activeStatus, activeKickoffId, mapRoutes, suggestionsData }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Populate the table using the exact data synced to the map dots
    if (suggestionsData) {
      setSuggestions(JSON.parse(JSON.stringify(suggestionsData))); // Deep copy for local edits
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

  return (
    <div className="min-w-full inline-block align-middle">
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50 uppercase font-bold text-gray-500">
            <tr className="text-[10px]">
              <th className="px-3 py-2 text-left">From Route</th>
              <th className="px-3 py-2 text-left">To Route</th>
              <th className="px-3 py-2 text-left">Address Range</th>
              <th className="px-3 py-2 text-center">ACTION</th>
              <th className="px-3 py-2 text-left">Move To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {suggestions.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-3 font-bold">{item.from}</td>
                <td className="px-3 py-3 font-bold text-blue-600 flex items-center gap-1"><ArrowRight size={10}/> {item.to}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuggestionTable;