import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Truck } from 'lucide-react';

const routeOptions = ['06A', '06B', '06C', '07A', '07B', '07C', '08A', '08B', '08C'];
const streetNames = ['N 13th St', 'Locust St', 'Ash St', 'Chestnut St', 'Ohio St', 'Hulman St', 'S 25th St', 'Poplar St'];

const SuggestionTable = ({ isEditable, activeStatus, activeKickoffId }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const generateRandomData = () => {
      const numberOfItems = 8;
      const currentRoutePool = activeStatus === 'Planning' ? ['06A', '06B', '07C'] : routeOptions;
      const newData = [];

      for (let i = 0; i < numberOfItems; i++) {
        const fromRoute = currentRoutePool[Math.floor(Math.random() * currentRoutePool.length)];
        let toRoute = currentRoutePool[Math.floor(Math.random() * currentRoutePool.length)];
        while (toRoute === fromRoute) toRoute = currentRoutePool[Math.floor(Math.random() * currentRoutePool.length)];

        let randomStatus = 'none';
        if (activeStatus === 'Completed') {
          randomStatus = Math.random() > 0.3 ? 'accepted' : 'rejected';
        } else if (activeStatus === 'Planning') {
          randomStatus = 'accepted';
        }

        const street = streetNames[Math.floor(Math.random() * streetNames.length)];
        const startNum = Math.floor(Math.random() * 2000) + 100;
        
        // Randomly decide if this is a single address (~35% chance) or a range
        const isSingleAddress = Math.random() < 0.35;
        let addressDisplay = "";
        let stopsDisplay = 0;

        if (isSingleAddress) {
          addressDisplay = `${startNum} ${street}`;
          stopsDisplay = 1;
        } else {
          const endNum = startNum + Math.floor(Math.random() * 500) + 50;
          addressDisplay = `${startNum} - ${endNum} ${street}`;
          stopsDisplay = Math.floor(Math.random() * 10) + 2;
        }

        newData.push({
          id: i + 1,
          from: fromRoute,
          to: toRoute,
          address: addressDisplay,
          stops: stopsDisplay,
          status: randomStatus,
          manualTo: ''
        });
      }
      return newData.sort((a, b) => a.from.localeCompare(b.from));
    };
    setSuggestions(generateRandomData());
  }, [activeKickoffId, activeStatus]);

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
                  <div className="text-[10px] text-gray-400">{item.stops} stop{item.stops !== 1 ? 's' : ''}</div>
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