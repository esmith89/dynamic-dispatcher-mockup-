import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function SuggestionTable({ isEditable }) {
  // Spreadsheet wireframe data
  const [suggestions, setSuggestions] = useState([
    { id: 1, toRoute: '07C', fromRoute: '06A', territory: '1 S. Main St. - 9 S. Main St.', stops: 1, packages: 4, status: 'pending', moveTo: '' },
    { id: 2, toRoute: '07C', fromRoute: '06A', territory: '10 S. Main St. - 29 S. Main St.', stops: 2, packages: 2, status: 'pending', moveTo: '' },
    { id: 3, toRoute: '07C', fromRoute: '06A', territory: '30 S. Main St. - 39 S. Main St.', stops: 1, packages: 26, status: 'pending', moveTo: '' },
    { id: 4, toRoute: '07C', fromRoute: '06B', territory: '100 1st St. - 199 1st St.', stops: 3, packages: 3, status: 'pending', moveTo: '' },
    { id: 5, toRoute: '07C', fromRoute: '06B', territory: '5433 Camelia St. - 5433 Camelia St.', stops: 1, packages: 11, status: 'pending', moveTo: '' },
  ]);

  const routeOptions = ['01A', '01B', '03A', '03B', '04A', '04B', '05A', '05B', '06A', '06B', '07A', '07B', '07C', '08A'];

  const handleAction = (id, actionType) => {
    if (!isEditable) return;
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: actionType } : s));
  };

  const handleMoveTo = (id, newRoute) => {
    if (!isEditable) return;
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, moveTo: newRoute } : s));
  };

  const handleRightClick = (e, territory) => {
    e.preventDefault();
    alert(`Map Event Triggered: Zooming into ${territory}`);
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-100 sticky top-0 shadow-sm z-10">
        <tr>
          <th className="p-3 border-b font-semibold text-gray-700">To Route</th>
          <th className="p-3 border-b font-semibold text-gray-700">From Route</th>
          <th className="p-3 border-b font-semibold text-gray-700">Territory / Stop</th>
          <th className="p-3 border-b font-semibold text-gray-700 text-center">Stops</th>
          <th className="p-3 border-b font-semibold text-gray-700 text-center">Packages</th>
          <th className="p-3 border-b font-semibold text-gray-700 text-center">Action</th>
          <th className="p-3 border-b font-semibold text-gray-700">Move To</th>
        </tr>
      </thead>
      <tbody>
        {suggestions.map((row) => (
          <tr 
            key={row.id} 
            className={`border-b hover:bg-gray-50 transition-colors ${row.status === 'denied' ? 'bg-red-50 opacity-60' : row.status === 'accepted' ? 'bg-green-50' : ''}`}
            onContextMenu={(e) => handleRightClick(e, row.territory)}
          >
            <td className="p-3 font-medium text-gray-800">{row.toRoute}</td>
            <td className="p-3 text-gray-600">{row.fromRoute}</td>
            <td className="p-3 text-gray-600">{row.territory}</td>
            <td className="p-3 text-center">{row.stops}</td>
            <td className="p-3 text-center">{row.packages}</td>
            <td className="p-3">
              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => handleAction(row.id, 'accepted')}
                  disabled={!isEditable}
                  className={`p-1.5 rounded-full transition-colors ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''} ${row.status === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-green-200 hover:text-green-700'}`}
                  title="Accept"
                >
                  <Check size={16} strokeWidth={3} />
                </button>
                <button 
                  onClick={() => handleAction(row.id, 'denied')}
                  disabled={!isEditable}
                  className={`p-1.5 rounded-full transition-colors ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''} ${row.status === 'denied' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-red-200 hover:text-red-700'}`}
                  title="Deny"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            </td>
            <td className="p-3">
              <select 
                className="w-full p-1.5 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={row.moveTo}
                onChange={(e) => handleMoveTo(row.id, e.target.value)}
                disabled={!isEditable || row.status === 'denied'}
              >
                <option value="">Select Route</option>
                {routeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
