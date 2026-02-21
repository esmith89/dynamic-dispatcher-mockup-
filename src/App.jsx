import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Check, 
  ChevronRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter
} from 'lucide-react';
import SuggestionTable from './SuggestionTable';
import RouteMap from './RouteMap';

const App = () => {
  const [kickoffs] = useState([
    { id: 'DD_10_02182026_0900_4780', displayTime: '09:00 AM', status: 'Planning',  date: 'Feb 18' },
    { id: 'DD_09_02182026_0842_4780', displayTime: '08:42 AM', status: 'Expired',   date: 'Feb 18' },
    { id: 'DD_08_02182026_0815_4780', displayTime: '08:15 AM', status: 'Completed', date: 'Feb 18' },
    { id: 'DD_07_02182026_0748_4780', displayTime: '07:48 AM', status: 'Completed', date: 'Feb 18' },
    { id: 'DD_06_02182026_0720_4780', displayTime: '07:20 AM', status: 'Completed', date: 'Feb 18' },
    { id: 'DD_05_02182026_0655_4780', displayTime: '06:55 AM', status: 'Completed', date: 'Feb 18' },
    { id: 'DD_04_02182026_0610_4780', displayTime: '06:10 AM', status: 'Expired',   date: 'Feb 18' },
    { id: 'DD_03_02182026_0535_4780', displayTime: '05:35 AM', status: 'Completed', date: 'Feb 18' },
    { id: 'DD_02_02182026_0450_4780', displayTime: '04:50 AM', status: 'Completed', date: 'Feb 18' },
    { id: 'DD_01_02182026_0330_4780', displayTime: '03:30 AM', status: 'Completed', date: 'Feb 18' },
  ]);

  const [activeKickoffId, setActiveKickoffId] = useState('DD_10_02182026_0900_4780');
  const [selectedRouteIds, setSelectedRouteIds] = useState(['06A', '06B', '07C']);
  
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  
  const [isRouteFilterOpen, setIsRouteFilterOpen] = useState(false);
  const [routeFilters, setRouteFilters] = useState([]);

  const mostRecentId = kickoffs[0].id;
  const isEditable = activeKickoffId === mostRecentId;
  const activeStatus = kickoffs.find(k => k.id === activeKickoffId)?.status;

  const planRoutes = [
    { id: '06A', name: '06A', feasibility: 'Feasible', stops: 124, packages: 156, hours: 8.5, miles: 91.5 },
    { id: '06B', name: '06B', feasibility: 'Feasible', stops: 118, packages: 142, hours: 8.2, miles: 95.0 },
    { id: '06C', name: '06C', feasibility: 'Feasible', stops: 105, packages: 120, hours: 7.5, miles: 78.2 },
    { id: '07A', name: '07A', feasibility: 'Risk Feasible', stops: 132, packages: 170, hours: 9.1, miles: 110.5 },
    { id: '07B', name: '07B', feasibility: 'Feasible', stops: 98, packages: 115, hours: 7.1, miles: 65.0 },
    { id: '07C', name: '07C', feasibility: 'Infeasible', stops: 145, packages: 188, hours: 9.5, miles: 105.0 },
    { id: '08A', name: '08A', feasibility: 'Risk Feasible', stops: 112, packages: 134, hours: 8.0, miles: 82.4 },
    { id: '08B', name: '08B', feasibility: 'Feasible', stops: 125, packages: 150, hours: 8.6, miles: 88.9 },
    { id: '08C', name: '08C', feasibility: 'Feasible', stops: 109, packages: 128, hours: 7.8, miles: 75.3 },
  ];

  const displayedRoutes = planRoutes.filter(r => routeFilters.length === 0 || routeFilters.includes(r.id));

  const STOPS = {
    depot: [39.4667, -87.4139], n1: [39.4900, -87.4100], n2: [39.4850, -87.4200], n3: [39.4800, -87.4000],
    s1: [39.4400, -87.4100], s2: [39.4450, -87.4200], s3: [39.4350, -87.4000], e1: [39.4600, -87.3800],
    e2: [39.4650, -87.3900], out1: [39.4800, -87.4300], out2: [39.4500, -87.4200]
  };

  const routesBefore = [
    { id: '06A', color: '#f97316', path: [STOPS.depot, STOPS.out1, STOPS.n2, STOPS.n1, STOPS.n3] },
    { id: '06B', color: '#8b5cf6', path: [STOPS.depot, STOPS.out2, STOPS.s2, STOPS.s1, STOPS.s3] },
    { id: '07C', color: '#2563eb', path: [STOPS.depot, STOPS.e1, STOPS.out1, STOPS.e2] }
  ];

  const routesAfter = [
    { id: '06A', color: '#f97316', path: [STOPS.depot, STOPS.n1, STOPS.n2, STOPS.n3] },
    { id: '06B', color: '#8b5cf6', path: [STOPS.depot, STOPS.s1, STOPS.s2, STOPS.s3] },
    { id: '07C', color: '#2563eb', path: [STOPS.depot, STOPS.e1, STOPS.e2] }
  ];

  const toggleRouteSelection = (id) => {
    setSelectedRouteIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleRouteFilter = (id) => {
    setRouteFilters(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900 relative">
      <div className="w-1/3 min-w-[350px] bg-white border-r border-gray-300 flex flex-col z-20 shadow-xl">
        <div className="flex flex-col h-1/2 border-b-4 border-gray-200">
          <div className="h-14 border-b border-gray-200 flex items-center px-4 font-bold text-gray-700 bg-gray-50 flex-shrink-0">
            Kickoffs
          </div>
          <div className="flex-1 overflow-y-auto">
            {kickoffs.map((k) => (
              <div key={k.id} onClick={() => setActiveKickoffId(k.id)} className={`p-4 border-b cursor-pointer transition-colors ${activeKickoffId === k.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-[11px] truncate w-48 text-gray-800">{k.id}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${k.status === 'Planning' ? 'bg-blue-100 text-blue-700' : k.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{k.status}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium">
                  <div className="flex items-center gap-1"><Calendar size={12} className="text-gray-400"/> {k.date}</div>
                  <div className="flex items-center gap-1 text-blue-600 font-bold"><Clock size={12}/> {k.displayTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col h-1/2 bg-gray-50">
          <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center h-auto min-h-[56px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-gray-800 text-sm">Change Details</h2>
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{activeKickoffId}</span>
            </div>
            <button 
              disabled={!isEditable}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-md shadow-sm transition-colors flex-shrink-0 ${isEditable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              <Check size={14} /> Accept Changes
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <SuggestionTable isEditable={isEditable} activeStatus={activeStatus} activeKickoffId={activeKickoffId} />
          </div>
        </div>
      </div>

      <div className="w-2/3 flex flex-col min-w-0 bg-gray-100 h-screen">
        <main className="flex-1 overflow-y-auto p-6 space-y-3">
          
          {isTableExpanded && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Route Overview</h3>
                <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-100 transition-colors">
                  <Filter size={12} /> Filter
                </button>
              </div>
              <div className="overflow-x-visible">
                <table className="w-full text-left text-sm relative">
                  <thead className="bg-white z-10 border-b shadow-sm relative">
                    <tr className="text-gray-500 uppercase text-xs">
                      
                      <th className="px-3 py-2 font-bold whitespace-nowrap relative">
                        <div 
                          className="flex items-center gap-1 cursor-pointer hover:text-blue-600 select-none"
                          onClick={() => setIsRouteFilterOpen(!isRouteFilterOpen)}
                        >
                          Route <Filter size={12} className={routeFilters.length > 0 ? "text-blue-600" : ""} />
                        </div>
                        {isRouteFilterOpen && (
                          <div className="absolute top-full left-2 mt-1 bg-white border border-gray-200 shadow-lg rounded-md p-2 z-50 min-w-[140px]">
                            <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Filter Routes</div>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {planRoutes.map(r => (
                                <label key={r.id} className="flex items-center gap-2 text-xs py-1 px-1 cursor-pointer hover:bg-gray-50 rounded">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={routeFilters.includes(r.id)}
                                    onChange={() => toggleRouteFilter(r.id)}
                                  />
                                  <span className="font-medium text-gray-700">{r.name}</span>
                                </label>
                              ))}
                            </div>
                            {routeFilters.length > 0 && (
                              <div className="border-t mt-2 pt-2 flex justify-end">
                                <button onClick={() => setRouteFilters([])} className="text-[10px] text-blue-600 font-bold hover:underline">Clear All</button>
                              </div>
                            )}
                          </div>
                        )}
                      </th>

                      <th className="px-3 py-2 font-bold text-center whitespace-nowrap">Feasibility</th>
                      <th className="px-3 py-2 font-bold text-center whitespace-nowrap">View on Map</th>
                      <th className="px-3 py-2 font-bold text-center whitespace-nowrap">Load ORION</th>
                      <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Stops</th>
                      <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Packages</th>
                      <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Hours</th>
                      <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Miles</th>
                      <th className="w-full"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {displayedRoutes.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-bold">{r.name}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                            r.feasibility === 'Feasible' ? 'bg-green-100 text-green-700' : 
                            r.feasibility === 'Risk Feasible' ? 'bg-amber-100 text-amber-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {r.feasibility}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" className="w-4 h-4 cursor-pointer text-blue-600 rounded focus:ring-blue-500" checked={selectedRouteIds.includes(r.id)} onChange={() => toggleRouteSelection(r.id)} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button 
                            className="px-3 py-1 text-xs font-bold text-white rounded whitespace-nowrap bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                            onClick={() => console.log(`ORION Loaded for ${r.name}`)}
                          >
                            Load ORION
                          </button>
                        </td>
                        <td className="px-3 py-2 text-right">{r.stops}</td>
                        <td className="px-3 py-2 text-right">{r.packages}</td>
                        <td className="px-3 py-2 text-right">{r.hours}</td>
                        <td className="px-3 py-2 text-right">{r.miles}</td>
                        <td className="w-full"></td>
                      </tr>
                    ))}
                    {displayedRoutes.length === 0 && (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-gray-400 font-medium text-sm">
                          No routes match the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-center pb-2">
            <button 
              onClick={() => setIsTableExpanded(!isTableExpanded)} 
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full shadow-sm hover:bg-blue-100 transition-colors text-blue-700"
            >
              {isTableExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span className="text-xs font-bold uppercase tracking-wider">{isTableExpanded ? 'Collapse View' : 'Expand Route Overview'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase flex justify-between tracking-widest"><span>Before</span></div>
              <div className="h-[350px] relative"><RouteMap routes={routesBefore} /></div>
              <div className="border-t">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b">
                    <tr><th className="px-3 py-2">Route</th><th className="px-2 py-2 text-right">Miles</th><th className="px-2 py-2 text-right">Cost</th><th className="px-3 py-2 text-center">Status</th></tr>
                  </thead>
                  <tbody className="divide-y font-medium text-gray-700">
                    <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#f97316]"></div> 06A</td><td className="px-2 py-2 text-right">85.1</td><td className="px-2 py-2 text-right">$340</td><td className="px-3 py-2 text-center text-green-600">Feasible</td></tr>
                    <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#8b5cf6]"></div> 06B</td><td className="px-2 py-2 text-right">92.3</td><td className="px-2 py-2 text-right">$375</td><td className="px-3 py-2 text-center text-green-600">Feasible</td></tr>
                    <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2563eb]"></div> 07C</td><td className="px-2 py-2 text-right">142.4</td><td className="px-2 py-2 text-right">$610</td><td className="px-3 py-2 text-center text-red-600 font-bold bg-red-50">Infeasible</td></tr>
                    <tr className="bg-gray-50 font-bold border-t-2"><td className="px-3 py-2">TOTAL</td><td className="px-2 py-2 text-right">319.8</td><td className="px-2 py-2 text-right">$1,325</td><td className="px-3 py-2 text-center"></td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white rounded-xl border-blue-200 border-2 shadow-md overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b bg-blue-50 text-xs font-bold text-blue-700 uppercase flex justify-between tracking-widest"><span>After</span></div>
              <div className="h-[350px] relative"><RouteMap routes={routesAfter} /></div>
              <div className="border-t">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-50/50 text-blue-800 uppercase font-bold border-b">
                    <tr><th className="px-3 py-2">Route</th><th className="px-2 py-2 text-right">Miles</th><th className="px-2 py-2 text-right">Cost</th><th className="px-3 py-2 text-center">Status</th></tr>
                  </thead>
                  <tbody className="divide-y font-medium text-gray-700">
                    <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#f97316]"></div> 06A</td><td className="px-2 py-2 text-right">91.5</td><td className="px-2 py-2 text-right">$365</td><td className="px-3 py-2 text-center text-green-700">Feasible</td></tr>
                    <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#8b5cf6]"></div> 06B</td><td className="px-2 py-2 text-right">95.0</td><td className="px-2 py-2 text-right">$385</td><td className="px-3 py-2 text-center text-green-700">Feasible</td></tr>
                    <tr><td className="px-3 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2563eb]"></div> 07C</td><td className="px-2 py-2 text-right">105.0</td><td className="px-2 py-2 text-right">$450</td><td className="px-3 py-2 text-center text-green-700 font-bold bg-green-50">Feasible</td></tr>
                    <tr className="bg-blue-50/30 font-bold border-t-2"><td className="px-3 py-2">TOTAL</td><td className="px-2 py-2 text-right text-green-700">291.5 (-28.3)</td><td className="px-2 py-2 text-right text-green-700">$1,200 (-$125)</td><td className="px-3 py-2 text-center"></td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;