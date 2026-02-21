import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Truck, ChevronDown } from 'lucide-react';

// Options to use for random generation
const routeOptions = ['06A', '06B', '06C', '07A', '07B', '07C', '08A', '08B', '08C'];
const streetNames = [
  'N 13th St', 'Locust St', 'Ash St', 'Chestnut St', 'Ohio St', 
  'Hulman St', 'S 25th St', 'Poplar St', 'Sycamore', 'Fruitridge', 
  'Wabash Ave', 'Maple Ave', '3rd Ave', 'College Ave', 'Main St', 'Elm St'
];

const SuggestionTable = ({ isEditable, activeStatus, activeKickoffId }) => {
  const [suggestions, setSuggestions] = useState([]);
  
  // Filter states
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  // Generate random data whenever the activeKickoffId changes
  useEffect(() => {
    const generateRandomData = () => {
      const numberOfItems = Math.floor(Math.random() * 6) + 6; // Randomly generate between 6 and 11 rows
      const newData = [];

      // Determine which pool of routes to pull from based on the status
      const currentRoutePool = activeStatus === 'Planning' 
        ? ['06A', '06B', '07C'] // Only use map routes for Planning
        : routeOptions;         // Use all routes for everything else

      for (let i = 0; i < numberOfItems; i++) {
        // Pick random From/To routes from the current pool, ensuring they aren't the same
        const fromRoute = currentRoutePool[Math.floor(Math.random() * currentRoutePool.length)];
        let toRoute = currentRoutePool[Math.floor(Math.random() * currentRoutePool.length)];
        while (toRoute === fromRoute) {
          toRoute = currentRoutePool[Math.floor(Math.random() * currentRoutePool.length)];
        }

        // Generate a random block range and street
        const blockStart = Math.floor(Math.random() * 30 + 1) * 100;
        const street = streetNames[Math.floor(Math.random() * streetNames.length)];
        const address = `${blockStart}-${blockStart + 90} ${street}`;

        // Randomize accepted/rejected for historical DDs. Default 'accepted' for current Planning.
        const statuses = ['accepted', 'rejected'];
        const randomStatus = activeStatus === 'Planning' 
          ? 'accepted' 
          : activeStatus === 'Expired'
            ? 'none' // Expired gets a neutral status so it doesn't color the rows
            : statuses[Math.floor(Math.random() * statuses.length)];

        newData.push({
          id: i + 1,
          from: fromRoute,
          to: toRoute,
          address: address,
          stops: Math.floor(Math.random() * 15) + 2, // 2 to 16 stops
          status: randomStatus,
          manualTo: ''
        });
      }

      // Sort them by the 'From' route just to keep it looking tidy
      return newData.sort((a, b) => a.from.localeCompare(b.from));
    };

    setSuggestions(generateRandomData());
    
    // Reset filters when changing kickoffs
    setFromFilter('');
    setToFilter('');
  }, [activeKickoffId, activeStatus]);

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

  // Filter the suggestions array based on the selected dropdowns
  const filteredSuggestions = suggestions.filter(item => {
    const matchFrom = fromFilter === '' || item.from === fromFilter;
    const matchTo = toFilter === '' || item.to === toFilter;
    return matchFrom && matchTo;
  });

  return (
    <div className="min-w-full inline-block align-middle">
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* 1. FROM ROUTE (With Filter) */}
              <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider align-top">
                <div className="flex flex-col gap-1.5">
                  <span>From Route</span>
                  <select 
                    className="w-full text-xs font-normal border border-gray-300 rounded p-1 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                    value={fromFilter}
                    onChange={(e) => setFromFilter(e.target.value)}
                  >
                    <option value="">All Routes</option>
                    {routeOptions.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </th>
              
              {/* 2. TO ROUTE (With Filter) */}
              <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider align-top">
                <div className="flex flex-col gap-1.5">
                  <span>To Route</span>
                  <select 
                    className="w-full text-xs font-normal border border-gray-300 rounded p-1 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                    value={toFilter}
                    onChange={(e) => setToFilter(e.target.value)}
                  >
                    <option value="">All Routes</option>
                    {routeOptions.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </th>

              {/* 3. ADDRESS RANGE */}
              <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider align-top pt-3">
                Address Range
              </th>
              
               {/* 4. ACTION (Middle) */}
               <th scope="col" className="px-3 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24 align-top pt-3">
                {isEditable ? 'Action' : 'Status'}
              </th>
              
              {/* 5. MOVE TO (Right - Blank Dropdown) */}
              <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 align-top pt-3">
                Move To
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((item) => (
                <tr 
                  key={item.id} 
                  className={`${item.status === 'accepted' ? 'bg-blue-50/10' : item.status === 'rejected' ? 'bg-red-50/10' : 'bg-gray-50/50'} hover:bg-gray-50 transition-colors`}
                >
                  {/* 1. FROM ROUTE */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-600">{item.from}</span>
                  </td>

                  {/* 2. TO ROUTE */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ArrowRight size={12} className="text-gray-400" />
                      <span className="text-xs font-bold text-blue-600">{item.to}</span>
                    </div>
                  </td>

                  {/* 3. ADDRESS RANGE */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">{item.address}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Truck size={10} /> {item.stops} stops
                      </span>
                    </div>
                  </td>

                  {/* 4. ACTION BUTTONS (Middle) */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    {activeStatus === 'Expired' ? (
                      <div className="flex justify-center text-gray-400 font-bold text-sm">-</div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        {/* CHECK BUTTON */}
                        <button
                          onClick={() => handleAction(item.id, 'accepted')}
                          disabled={!isEditable}
                          className={`
                            w-6 h-6 rounded flex items-center justify-center transition-all
                            ${item.status === 'accepted' 
                              ? 'bg-green-600 text-white shadow-sm' 
                              : `bg-white border border-gray-200 text-gray-300 ${isEditable ? 'hover:border-green-400 hover:text-green-500' : ''}`}
                            ${!isEditable ? 'cursor-not-allowed' : ''}
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
                              : `bg-white border border-gray-200 text-gray-300 ${isEditable ? 'hover:border-red-400 hover:text-red-500' : ''}`}
                            ${!isEditable ? 'cursor-not-allowed' : ''}
                            ${!isEditable && item.status !== 'rejected' ? 'opacity-20' : ''}
                          `}
                          title="Reject Change"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* 5. MOVE TO DROPDOWN (Defaults to blank) */}
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
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-3 py-8 text-center text-sm text-gray-500">
                  No routes match the selected filters.
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