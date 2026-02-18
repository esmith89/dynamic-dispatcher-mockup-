import React, { useState } from 'react';
import { Check, X, ArrowRight, Truck, ChevronDown } from 'lucide-react';

const SuggestionTable = ({ isEditable }) => {
  // Routes for the Dropdown
  const routeOptions = ['06A', '06B', '06C', '07A', '07B', '07C', '08A', '08B', '08C'];

  // Data: Grouped by 'from' route (06A, then 06B, then 07C)
  const [suggestions, setSuggestions] = useState([
    // --- FROM 06A ---
    { id: 1, from: '06A', to: '07C', address: '1400-1450 N 13th St', stops: 12, status: 'accepted', manualTo: '' },
    { id: 2, from: '06A', to: '07C', address: '2200-2290 Locust St', stops: 8, status: 'accepted', manualTo: '' },
    { id: 5, from: '06A', to: '07C', address: '1100-1120 Ash St', stops: 4, status: 'accepted', manualTo: '' },
    { id: 8, from: '06A', to: '07C', address: '900-950 Chestnut St', stops: 7, status: 'accepted', manualTo: '' },
    { id: 11, from: '06A', to: '07C', address: '400-450 Ohio St', stops: 5, status: 'accepted', manualTo: '' },
    { id: 14, from: '06A', to: '07C', address: '100-150 Hulman St', stops: 4, status: 'accepted', manualTo: '' },

    // --- FROM 06B ---
    { id: 3, from: '06B', to: '07C', address: '850-900 S 25th St', stops: 15, status: 'accepted', manualTo: '' },
    { id: 7, from: '06B', to: '07C', address: '1800-1850 Poplar St', stops: 9, status: 'accepted', manualTo: '' },
    { id: 10, from: '06B', to: '07C', address: '2100-2150 Sycamore', stops: 11, status: 'accepted', manualTo: '' },
    { id: 13, from: '06B', to: '07C', address: '1500-1550 Fruitridge', stops: 6, status: 'accepted', manualTo: '' },

    // --- FROM 07C ---
    { id: 4, from: '07C', to: '06B', address: '300-350 Wabash Ave', stops: 5, status: 'accepted', manualTo: '' },
    { id: 6, from: '07C', to: '06A', address: '500-550 Maple Ave', stops: 6, status: 'accepted', manualTo: '' },
    { id: 9, from: '07C', to: '06B', address: '1200-1250 3rd Ave', stops: 3, status: 'accepted', manualTo: '' },
    { id: 12, from: '07C', to: '06A', address: '600-680 College Ave', stops: 8, status: 'accepted', manualTo: '' },
  ]);

  const handleAction = (id, newStatus) => {
    if (!isEditable) return;
    setSuggestions(suggestions.map(s => 
      s.id === id ? { ...s, status: newStatus } : s
    ));
  };

  const handleRouteChange = (id, newRoute) => {
    if (!isEditable) return;
    setSuggestions(suggestions.map(s => 
      s.id === id ? { ...s, manualTo: newRoute } : s
    ));
  };

  return (
    <div className="min-w-full inline-block align-middle">
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* 1. MOVE DETAIL (From -> To) */}
              <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Move Detail
              </th>
              {/* 2. ADDRESS RANGE */}
              <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Address Range
              </th>
               {/* 3. ACTION (Middle) */}
               <th scope="col" className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                {isEditable ? 'Action' : 'Status'}
              </th>
              {/* 4. MOVE TO (Right - Blank Dropdown) */}
              <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                Move To
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suggestions.map((item) => (
              <tr 
                key={item.id} 
                className={`${item.status === 'accepted' ? 'bg-blue-50/10' : 'bg-gray-50/50'} hover:bg-gray-50 transition-colors`}
              >
                {/* 1. MOVE DETAIL */}
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                    <span>{item.from}</span>
                    <ArrowRight size={12} className="text-gray-400" />
                    <span className="font-bold text-gray-800">{item.to}</span>
                  </div>
                </td>

                {/* 2. ADDRESS RANGE */}
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700">{item.address}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Truck size={10} /> {item.stops} stops
                    </span>
                  </div>
                </td>

                {/* 3. ACTION BUTTONS (Middle) */}
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    {/* CHECK BUTTON */}
                    <button
                      onClick={() => handleAction(item.id, 'accepted')}
                      disabled={!isEditable}
                      className={`
                        w-6 h-6 rounded flex items-center justify-center transition-all
                        ${item.status === 'accepted' 
                          ? 'bg-green-600 text-white shadow-sm' 
                          : 'bg-white border border-gray-200 text-gray-300 hover:border-green-400 hover:text-green-500'}
                        ${!isEditable && item.status !== 'accepted' ? 'opacity-20' : ''}
                      `}
                      title="Accept Change"
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>

                    {/* X BUTTON */}
                    <button
                      onClick={() => handleAction(item.id, 'rejected')}
                      disabled={!isEditable}
                      className={`
                        w-6 h-6 rounded flex items-center justify-center transition-all
                        ${item.status === 'rejected' 
                          ? 'bg-red-600 text-white shadow-sm' 
                          : 'bg-white border border-gray-200 text-gray-300 hover:border-red-400 hover:text-red-500'}
                        ${!isEditable && item.status !== 'rejected' ? 'opacity-20' : ''}
                      `}
                      title="Reject Change"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                </td>

                {/* 4. MOVE TO DROPDOWN (Defaults to blank) */}
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="relative">
                    {isEditable ? (
                      <div className="relative w-28">
                        <select 
                          className={`w-full appearance-none border text-xs font-bold py-1 pl-2 pr-6 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                            item.manualTo ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-500'
                          }`}
                          value={item.manualTo}
                          onChange={(e) => handleRouteChange(item.id, e.target.value)}
                        >
                          <option value="">Select...</option>
                          {routeOptions.map(route => (
                            <option key={route} value={route}>{route}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                          <ChevronDown size={12} />
                        </div>
                      </div>
                    ) : (
                      // Read-only state
                      <span className={`text-xs font-bold px-2 py-1 rounded ${item.manualTo ? 'bg-blue-100 text-blue-800' : 'text-gray-400 italic'}`}>
                        {item.manualTo || '-'}
                      </span>
                    )}
                  </div>
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
