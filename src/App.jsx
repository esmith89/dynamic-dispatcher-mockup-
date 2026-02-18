import React, { useState } from 'react';
import { 
  Search, 
  Truck, 
  Calendar, 
  Check, 
  ChevronRight,
  List,          
  X,             
  ExternalLink,  
  MapPin         
} from 'lucide-react';
import SuggestionTable from './SuggestionTable';
import RouteMap from './RouteMap';

const App = () => {
  // --- STATE ---
  // ID Format: DD_##_02182026_4780
  const [kickoffs] = useState([
    { id: 'DD_10_02182026_4780', status: 'Planning',  date: 'Feb 18, 09:00 AM' },
    { id: 'DD_09_02182026_4780', status: 'Review',    date: 'Feb 18, 08:42 AM' },
    { id: 'DD_08_02182026_4780', status: 'Archived',  date: 'Feb 18, 08:15 AM' },
    { id: 'DD_07_02182026_4780', status: 'Completed', date: 'Feb 18, 07:48 AM' },
    { id: 'DD_06_02182026_4780', status: 'Completed', date: 'Feb 18, 07:20 AM' },
    { id: 'DD_05_02182026_4780', status: 'Completed', date: 'Feb 18, 06:55 AM' },
    { id: 'DD_04_02182026_4780', status: 'Completed', date: 'Feb 18, 06:10 AM' },
    { id: 'DD_03_02182026_4780', status: 'Completed', date: 'Feb 18, 05:35 AM' },
    { id: 'DD_02_02182026_4780', status: 'Completed', date: 'Feb 18, 04:50 AM' },
    { id: 'DD_01_02182026_4780', status: 'Completed', date: 'Feb 18, 03:30 AM' },
  ]);

  const [activeKickoffId, setActiveKickoffId] = useState('DD_10_02182026_4780');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  
  // State for Drawer Checkboxes (Default all selected)
  const [selectedRouteIds, setSelectedRouteIds] = useState(
    ['06A', '06B', '06C', '07A', '07B', '07C', '08A', '08B', '08C']
  );

  const mostRecentId = kickoffs[0].id;
  const isEditable = activeKickoffId === mostRecentId;

  // --- MOCK DATA: ROUTES IN PLAN ---
  const planRoutes = [
    { id: '06A', name: '06A', status: 'Adjusted' },
    { id: '06B', name: '06B', status: 'Adjusted' },
    { id: '06C', name: '06C', status: 'Unchanged' },
    { id: '07A', name: '07A', status: 'Unchanged' },
    { id: '07B', name: '07B', status: 'Unchanged' },
    { id: '07C', name: '07C', status: 'Optimized' }, // Focus
    { id: '08A', name: '08A', status: 'Unchanged' },
    { id: '08B', name: '08B', status: 'Unchanged' },
    { id: '08C', name: '08C', status: 'Unchanged' },
  ];

  // Logic to handle button click: Open Drawer AND Filter Routes
  const handleViewRoutesClick = () => {
    setIsDrawerOpen(true);
    // Only select the routes involved in the current scenario
    setSelectedRouteIds(['06A', '06B', '07C']);
  };

  // Toggle Checkbox Logic
  const toggleRouteSelection = (id) => {
    setSelectedRouteIds(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  // --- MAP DATA ---
  const routesBefore = [
    { id: '07C', color: '#2563eb', path: [[39.4667, -87.4139], [39.4850, -87.3900], [39.4500, -87.4200], [39.4800, -87.4300], [39.4600, -87.3800]] },
    { id: '06A', color: '#f97316', path: [[39.4900, -87.4100], [39.4850, -87.4200], [39.4800, -87.4000], [39.4950, -87.4050]] },
    { id: '06B', color: '#8b5cf6', path: [[39.4400, -87.4100], [39.4450, -87.4200], [39.4350, -87.4000], [39.4400, -87.4050]] }
  ];

  const routesAfter = [
    { id: '07C', color: '#2563eb', path: [[39.4667, -87.4139], [39.4500, -87.4200], [39.4800, -87.4300], [39.4850, -87.3900]] },
    { id: '06A', color: '#f97316', path: [[39.4900, -87.4100], [39.4800, -87.4000], [39.4850, -87.4200], [39.4950, -87.4050]] },
    { id: '06B', color: '#8b5cf6', path: [[39.4400, -87.4100], [39.4350, -87.4000], [39.4450, -87.4200], [39.4400, -87.4050]] }
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900 relative">
      
      {/* DRAWER */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px] transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-gray-200 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-14 border-b border-gray-200 flex justify-between items-center px-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Plan Routes</h3>
          <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-3.5rem)] bg-gray-50/50">
          {planRoutes.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800 text-sm">{r.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  r.status === 'Optimized' ? 'bg-green-100 text-green-700' : 
                  r.status === 'Adjusted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {r.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-3 mt-3">
                {/* LOAD ORION BUTTON */}
                <button 
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors" 
                  onClick={() => console.log('Loading Orion', r.id)}
                >
                  <ExternalLink size={12} /> Load ORION
                </button>

                {/* VISIBILITY CHECKBOX */}
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    checked={selectedRouteIds.includes(r.id)}
                    onChange={() => toggleRouteSelection(r.id)}
                  />
                  <span className="text-xs font-bold text-gray-600">Map</span>
                </label>
              </div>

            </div>
          ))}
        </div>
      </div>

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
                  {/* Truncated ID display */}
                  <span className="font-bold text-gray-900 text-xs truncate w-48" title={k.id}>{k.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${k.status === 'Planning' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{k.status}</span>
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
            <SuggestionTable isEditable={isEditable} />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-2/3 flex flex-col min-w-0 bg-gray-100">
        <header className="h-14 bg-white border-b border-gray-300 flex items-center justify-between px-6 z-10 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium text-sm">Kickoff</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="font-bold text-gray-800 text-sm md:text-base">{activeKickoffId}</span>
          </div>
          {/* UPDATED BUTTON: Calls handleViewRoutesClick */}
          <button 
            onClick={handleViewRoutesClick} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-blue-600 rounded-md transition-colors shadow-sm"
          >
            <List size={18} /> View Routes on Map/Load ORION
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* BEFORE */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
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
            <section className="bg-white rounded-xl border-blue-200 border-2 shadow-md overflow-hidden flex flex-col h-[600px]">
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
                    <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> 07C</td><td className="px-1 py-2 text-right">105.0 <span className="text-green-600 text-[9px] font-bold block">-37.4</span></td><td className="px-1 py-2 text-right">$450 <span className="text-green-600 text-[9px] font-bold block">-$160</span></td><td className="px-3 py-2 text-center text-green-700 font-bold bg-green-50">Feasible</td></tr>
                    <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> 06A</td><td className="px-1 py-2 text-right">91.5 <span className="text-red-400 text-[9px] font-bold block">+6.4</span></td><td className="px-1 py-2 text-right">$365 <span className="text-red-400 text-[9px] font-bold block">+$25</span></td><td className="px-3 py-2 text-center text-green-700 bg-green-50">Feasible</td></tr>
                    <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-600"></div> 06B</td><td className="px-1 py-2 text-right">95.0 <span className="text-red-400 text-[9px] font-bold block">+2.7</span></td><td className="px-1 py-2 text-right">$385 <span className="text-red-400 text-[9px] font-bold block">+$10</span></td><td className="px-3 py-2 text-center text-green-700 bg-green-50">Feasible</td></tr>
                    <tr className="bg-blue-50/30 border-t-2 border-blue-100"><td className="px-3 py-2 font-bold text-gray-900">TOTAL</td><td className="px-1 py-2 text-right font-bold">291.5 <span className="text-green-600 text-[10px] ml-1">(-28.3)</span></td><td className="px-1 py-2 text-right font-bold">$1,200 <span className="text-green-600 text-[10px] ml-1">(-$125)</span></td><td className="px-3 py-2 text-center font-bold text-green-700">FEASIBLE</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>

        {/* FOOTER */}
        {isEditable && (
          <div className="border-t border-gray-200 bg-white p-4 flex justify-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] absolute bottom-0 right-0 w-2/3">
            <button className="flex items-center gap-2 px-8 py-3 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
              <Check size={20} /> Accept Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
