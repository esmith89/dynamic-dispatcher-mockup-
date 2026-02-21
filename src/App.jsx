import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Check, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import SuggestionTable from './SuggestionTable';
import RouteMap from './RouteMap';

const App = () => {
  // --- STATE ---
  // ID Format: DD_##_02182026_4780
  const [kickoffs] = useState([
    { id: 'DD_10_02182026_4780', status: 'Planning',  date: 'Feb 18, 09:00 AM' },
    { id: 'DD_09_02182026_4780', status: 'Expired',   date: 'Feb 18, 08:42 AM' },
    { id: 'DD_08_02182026_4780', status: 'Expired',   date: 'Feb 18, 08:15 AM' },
    { id: 'DD_07_02182026_4780', status: 'Completed', date: 'Feb 18, 07:48 AM' },
    { id: 'DD_06_02182026_4780', status: 'Completed', date: 'Feb 18, 07:20 AM' },
    { id: 'DD_05_02182026_4780', status: 'Expired',   date: 'Feb 18, 06:55 AM' },
    { id: 'DD_04_02182026_4780', status: 'Completed', date: 'Feb 18, 06:10 AM' },
    { id: 'DD_03_02182026_4780', status: 'Expired',   date: 'Feb 18, 05:35 AM' },
    { id: 'DD_02_02182026_4780', status: 'Completed', date: 'Feb 18, 04:50 AM' },
    { id: 'DD_01_02182026_4780', status: 'Completed', date: 'Feb 18, 03:30 AM' },
  ]);

  const [activeKickoffId, setActiveKickoffId] = useState('DD_10_02182026_4780');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Checkboxes (Default only map routes selected)
  const [selectedRouteIds, setSelectedRouteIds] = useState(['06A', '06B', '07C']);

  const mostRecentId = kickoffs[0].id;
  const isEditable = activeKickoffId === mostRecentId;
  const activeStatus = kickoffs.find(k => k.id === activeKickoffId)?.status;

  // --- MOCK DATA: ROUTES IN PLAN ---
  const planRoutes = [
    { id: '06A', name: '06A', status: 'Adjusted', stops: 124, packages: 156, hours: 8.5, miles: 91.5 },
    { id: '06B', name: '06B', status: 'Adjusted', stops: 118, packages: 142, hours: 8.2, miles: 95.0 },
    { id: '06C', name: '06C', status: 'Unchanged', stops: 105, packages: 120, hours: 7.5, miles: 78.2 },
    { id: '07A', name: '07A', status: 'Unchanged', stops: 132, packages: 170, hours: 9.1, miles: 110.5 },
    { id: '07B', name: '07B', status: 'Unchanged', stops: 98, packages: 115, hours: 7.1, miles: 65.0 },
    { id: '07C', name: '07C', status: 'Optimized', stops: 145, packages: 188, hours: 9.5, miles: 105.0 },
    { id: '08A', name: '08A', status: 'Unchanged', stops: 112, packages: 134, hours: 8.0, miles: 82.4 },
    { id: '08B', name: '08B', status: 'Unchanged', stops: 125, packages: 150, hours: 8.6, miles: 88.9 },
    { id: '08C', name: '08C', status: 'Unchanged', stops: 109, packages: 128, hours: 7.8, miles: 75.3 },
  ];

  // Toggle Checkbox Logic
  const toggleRouteSelection = (id) => {
    if (!isEditable) return; // Prevent toggling if not editable
    setSelectedRouteIds(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  // --- MAP DATA ---
  const STOPS = {
    depot: [39.4667, -87.4139],
    east1: [39.4600, -87.3800],
    east2: [39.4650, -87.3900],

    north1: [39.4900, -87.4100],
    north2: [39.4850, -87.4200],
    north3: [39.4800, -87.4000],
    north4: [39.4950, -87.4050],
    nw_outlier: [39.4800, -87.4300], 
    ne_outlier: [39.4850, -87.3900], 

    south1: [39.4400, -87.4100],
    south2: [39.4450, -87.4200],
    south3: [39.4350, -87.4000],
    south4: [39.4400, -87.4050],
    sw_outlier: [39.4500, -87.4200]  
  };

  const routesBefore = [
    { 
      id: '07C', color: '#2563eb', 
      path: [STOPS.depot, STOPS.nw_outlier, STOPS.ne_outlier, STOPS.sw_outlier, STOPS.east2, STOPS.east1] 
    },
    { 
      id: '06A', color: '#f97316', 
      path: [STOPS.depot, STOPS.north1, STOPS.north4, STOPS.north2, STOPS.north3] 
    },
    { 
      id: '06B', color: '#8b5cf6', 
      path: [STOPS.depot, STOPS.south3, STOPS.south1, STOPS.south4, STOPS.south2] 
    }
  ];

  const routesAfter = [
    { 
      id: '07C', color: '#2563eb', 
      path: [STOPS.depot, STOPS.east2, STOPS.east1] 
    },
    { 
      id: '06A', color: '#f97316', 
      path: [STOPS.depot, STOPS.nw_outlier, STOPS.north2, STOPS.north1, STOPS.north4, STOPS.north3, STOPS.ne_outlier] 
    },
    { 
      id: '06B', color: '#8b5cf6', 
      path: [STOPS.depot, STOPS.sw_outlier, STOPS.south2, STOPS.south1, STOPS.south4, STOPS.south3] 
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900 relative">

      {/* LEFT PANEL */}
      <div className="w-1/3 min-w-[350px] bg-white border-r border-gray-300 flex flex-col z-20 shadow-xl">
        <div className="flex flex-col h-1/2 border-b-4 border-gray-200">
          <div className="h-14 border-b border-gray-200 flex items-center px-4 font-bold text-gray-700 bg-white flex-shrink-0">
            Kickoffs
          </div>
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
              <input type="text" placeholder="Search kickoffs..." className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            {kickoffs.map((k) => (
              <div key={k.id} onClick={() => setActiveKickoffId(k.id)} className={`p-4 border-b border-gray-100 cursor-pointer ${activeKickoffId === k.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-900 text-xs truncate w-48" title={k.id}>{k.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    k.status === 'Planning' ? 'bg-blue-100 text-blue-700' : 
                    k.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                    k.status === 'Expired' ? 'bg-red-100 text-red-700' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {k.status}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500 gap-3">
                  <div className="flex items-center gap-1"><Calendar size={12} /> {k.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col h-1/2 bg-gray-50">
          <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center flex-shrink-0 h-14">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Change Details</h2>
            {!isEditable && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">HISTORY</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-auto p-2">
            {/* PASSING STATUS AND ID TO SUGGESTION TABLE */}
            <SuggestionTable isEditable={isEditable} activeStatus={activeStatus} activeKickoffId={activeKickoffId} />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-2/3 flex flex-col min-w-0 bg-gray-100 h-screen">
        <header className="h-14 bg-white border-b border-gray-300 flex items-center px-6 z-10 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium text-sm">Kickoff</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="font-bold text-gray-800 text-sm md:text-base">{activeKickoffId}</span>
          </div>
        </header>

        {/* TOP CONTENT AREA (Route Overview Table) */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Route Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-white text-gray-500 uppercase text-xs">
                    <th className="px-4 py-3 font-bold">Route</th>
                    <th className="px-4 py-3 font-bold text-center">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Stops</th>
                    <th className="px-4 py-3 font-bold text-right">Packages</th>
                    <th className="px-4 py-3 font-bold text-right">Hours</th>
                    <th className="px-4 py-3 font-bold text-right">Miles</th>
                    <th className="px-4 py-3 font-bold text-center">View on Map</th>
                    <th className="px-4 py-3 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {planRoutes.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold">{r.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          r.status === 'Optimized' ? 'bg-green-100 text-green-700' : 
                          r.status === 'Adjusted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{r.stops}</td>
                      <td className="px-4 py-3 text-right font-medium">{r.packages}</td>
                      <td className="px-4 py-3 text-right font-medium">{r.hours}</td>
                      <td className="px-4 py-3 text-right font-medium">{r.miles}</td>
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          disabled={!isEditable}
                          className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 ${!isEditable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          checked={selectedRouteIds.includes(r.id)}
                          onChange={() => toggleRouteSelection(r.id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          disabled={!isEditable}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded shadow-sm transition-colors ${!isEditable ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`} 
                          onClick={() => console.log('Loading Orion', r.id)}
                        >
                          <ExternalLink size={12} /> Load ORION
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* BOTTOM ANCHORED SECTION: Maps + Footer */}
        <div className="flex flex-col flex-shrink-0">
          
          {/* MAPS CONTAINER */}
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* BEFORE */}
              <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Before</h3>
                  <span className="text-[10px] font-bold text-gray-400 px-2 py-0.5 bg-gray-100 rounded">Current State</span>
                </div>
                <div className="flex-1 bg-gray-200 relative z-0">
                  <RouteMap routes={routesBefore} />
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-[400]">
                    <span className="bg-white/90 text-blue-600 px-2 py-1 text-[10px] font-bold rounded shadow border border-blue-100">07C</span>
                    <span className="bg-white/90 text-orange-500 px-2 py-1 text-[10px] font-bold rounded shadow border border-orange-100">06A</span>
                    <span className="bg-white/90 text-violet-600 px-2 py-1 text-[10px] font-bold rounded shadow border border-violet-100">06B</span>
                  </div>
                </div>
                <div className="bg-white border-t border-gray-200 p-0 flex-shrink-0">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 uppercase">
                        <th className="px-3 py-2 font-bold w-1/4">Route</th>
                        <th className="px-1 py-2 font-bold text-right">Miles</th>
                        <th className="px-1 py-2 font-bold text-right">Cost</th>
                        <th className="px-3 py-2 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> 07C</td><td className="px-1 py-2 text-right">142.4</td><td className="px-1 py-2 text-right">$610</td><td className="px-3 py-2 text-center text-red-600 font-bold bg-red-50">Infeasible</td></tr>
                      <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> 06A</td><td className="px-1 py-2 text-right">85.1</td><td className="px-1 py-2 text-right">$340</td><td className="px-3 py-2 text-center text-green-600 bg-green-50">Feasible</td></tr>
                      <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-600"></div> 06B</td><td className="px-1 py-2 text-right">92.3</td><td className="px-1 py-2 text-right">$375</td><td className="px-3 py-2 text-center text-green-600 bg-green-50">Feasible</td></tr>
                      <tr className="bg-gray-50 border-t-2 border-gray-100"><td className="px-3 py-2 font-bold text-gray-900">TOTAL</td><td className="px-1 py-2 text-right font-bold">319.8</td><td className="px-1 py-2 text-right font-bold">$1,325</td><td className="px-3 py-2 text-center font-bold text-red-600">INFEASIBLE</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* AFTER */}
              <section className="bg-white rounded-xl border-blue-200 border-2 shadow-md overflow-hidden flex flex-col h-[500px]">
                <div className="px-4 py-3 border-b border-blue-100 bg-blue-50 flex justify-between items-center flex-shrink-0">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest">After</h3>
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 bg-blue-600 rounded">Optimized</span>
                </div>
                <div className="flex-1 bg-blue-50 relative z-0">
                  <RouteMap routes={routesAfter} />
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-[400]">
                    <span className="bg-blue-600 text-white px-2 py-1 text-[10px] font-bold rounded shadow">07C</span>
                    <span className="bg-orange-500 text-white px-2 py-1 text-[10px] font-bold rounded shadow">06A</span>
                    <span className="bg-violet-600 text-white px-2 py-1 text-[10px] font-bold rounded shadow">06B</span>
                  </div>
                </div>
                <div className="bg-white border-t border-blue-100 p-0 flex-shrink-0">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-blue-50 bg-blue-50/50 text-blue-800 uppercase">
                        <th className="px-3 py-2 font-bold w-1/4">Route</th>
                        <th className="px-1 py-2 font-bold text-right">Miles</th>
                        <th className="px-1 py-2 font-bold text-right">Cost</th>
                        <th className="px-3 py-2 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      <tr>
                        <td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> 07C</td>
                        <td className="px-1 py-2 text-right">105.0</td>
                        <td className="px-1 py-2 text-right">$450</td>
                        <td className="px-3 py-2 text-center text-green-700 font-bold bg-green-50">Feasible</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> 06A</td>
                        <td className="px-1 py-2 text-right">91.5</td>
                        <td className="px-1 py-2 text-right">$365</td>
                        <td className="px-3 py-2 text-center text-green-700 bg-green-50">Feasible</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-600"></div> 06B</td>
                        <td className="px-1 py-2 text-right">95.0</td>
                        <td className="px-1 py-2 text-right">$385</td>
                        <td className="px-3 py-2 text-center text-green-700 bg-green-50">Feasible</td>
                      </tr>
                      <tr className="bg-blue-50/30 border-t-2 border-blue-100">
                        <td className="px-3 py-2 font-bold text-gray-900">TOTAL</td>
                        <td className="px-1 py-2 text-right font-bold">291.5 <span className="text-green-600 text-[10px] ml-1">(-28.3)</span></td>
                        <td className="px-1 py-2 text-right font-bold">$1,200 <span className="text-green-600 text-[10px] ml-1">(-$125)</span></td>
                        <td className="px-3 py-2 text-center font-bold text-green-700">FEASIBLE</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>

          {/* FOOTER */}
          {isEditable && (
            <div className="border-t border-gray-200 bg-white p-2 flex justify-center z-30 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.1)]">
              <button className="flex items-center gap-2 px-6 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow hover:shadow-md transition-all transform hover:-translate-y-0.5">
                <Check size={16} /> Accept Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;