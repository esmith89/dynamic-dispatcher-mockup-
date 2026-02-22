import React, { useState, useEffect, useMemo } from 'react';
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

const seededRandom = (s) => {
  let seed = s;
  return () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
};

const streetNames = ['N 13th St', 'Locust St', 'Ash St', 'Chestnut St', 'Ohio St', 'Hulman St', 'S 25th St', 'Poplar St'];
const SIZE = 0.035; 
const DEPOT_COORD = [39.4667, -87.4139];

const ROUTE_CENTERS = {
  '06A': [39.4667 + SIZE, -87.4139 - SIZE*1.3],
  '06B': [39.4667 + SIZE*1.1, -87.4139 + 0.005],
  '06C': [39.4667 + SIZE*0.9, -87.4139 + SIZE*1.4],
  '07A': [39.4667 - 0.005, -87.4139 - SIZE*1.2],
  '07B': [39.4667, -87.4139],
  '07C': [39.4667 + 0.005, -87.4139 + SIZE*1.3],
  '08A': [39.4667 - SIZE*1.1, -87.4139 - SIZE*1.4],
  '08B': [39.4667 - SIZE*0.9, -87.4139 - 0.005],
  '08C': [39.4667 - SIZE, -87.4139 + SIZE*1.2],
};

const ADJACENCY = {
  '06A': ['06B', '07A', '07B'],
  '06B': ['06A', '06C', '07A', '07B', '07C'],
  '06C': ['06B', '07B', '07C'],
  '07A': ['06A', '06B', '07B', '08A', '08B'],
  '07B': ['06A', '06B', '06C', '07A', '07C', '08A', '08B', '08C'],
  '07C': ['06B', '06C', '07B', '08B', '08C'],
  '08A': ['07A', '07B', '08B'],
  '08B': ['07A', '07B', '07C', '08A', '08C'],
  '08C': ['07B', '07C', '08B'],
};

const baseRoutesInfo = [
  { id: '06A', color: '#f97316', defaultMiles: 91.5, cost: 365 },
  { id: '06B', color: '#8b5cf6', defaultMiles: 95.0, cost: 385 },
  { id: '06C', color: '#db2777', defaultMiles: 78.2, cost: 310 },
  { id: '07A', color: '#16a34a', defaultMiles: 110.5, cost: 450 },
  { id: '07B', color: '#ca8a04', defaultMiles: 65.0, cost: 260 },
  { id: '07C', color: '#2563eb', defaultMiles: 105.0, cost: 450 },
  { id: '08A', color: '#dc2626', defaultMiles: 82.4, cost: 330 },
  { id: '08B', color: '#0d9488', defaultMiles: 88.9, cost: 350 },
  { id: '08C', color: '#4f46e5', defaultMiles: 75.3, cost: 310 },
];

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

  const [activeKickoffId, setActiveKickoffId] = useState(kickoffs[0].id);
  const [selectedRouteIds, setSelectedRouteIds] = useState([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isRouteFilterOpen, setIsRouteFilterOpen] = useState(false);
  const [routeFilters, setRouteFilters] = useState([]);

  const mostRecentId = kickoffs[0].id;
  const isEditable = activeKickoffId === mostRecentId;
  const activeStatus = kickoffs.find(k => k.id === activeKickoffId)?.status;

  const variations = useMemo(() => {
    const vars = [];
    const rnd = seededRandom(42); 

    for (let k = 0; k < 10; k++) {
      const numRoutes = Math.floor(rnd() * 7) + 2; 
      const shuffledBase = [...baseRoutesInfo].sort(() => rnd() - 0.5);
      
      const subset = [shuffledBase[0]];
      while(subset.length < numRoutes) {
        const nextRoute = shuffledBase.find(r => 
          !subset.includes(r) && subset.some(subR => ADJACENCY[subR.id].includes(r.id))
        );
        if(nextRoute) subset.push(nextRoute);
        else break;
      }
      
      const mapRoutes = subset.map(r => r.id);
      
      // dynamically generate organic Voronoi for this specific subset
      const activeBGStops = {};
      subset.forEach(r => activeBGStops[r.id] = []);
      
      // Generate points around each active route's center with a randomized radius.
      // This creates an irregular, non-circular outer boundary while keeping perfect internal borders!
      for (const genRoute of subset) {
          const genCenter = ROUTE_CENTERS[genRoute.id];
          const routeRadius = 0.035 + rnd() * 0.025; // Variable reach per route (0.035 to 0.060 degrees)
          const numPoints = 250 + Math.floor(rnd() * 100);

          for (let i = 0; i < numPoints; i++) {
              const r = Math.sqrt(rnd()) * routeRadius;
              const theta = rnd() * 2 * Math.PI;
              const lat = genCenter[0] + r * Math.cos(theta);
              const lng = genCenter[1] + r * Math.sin(theta) * 1.3;

              let closestId = subset[0].id;
              let minDist = Infinity;
              for (const route of subset) {
                  const center = ROUTE_CENTERS[route.id];
                  const dist = Math.pow(lat - center[0], 2) + Math.pow((lng - center[1])/1.3, 2);
                  if (dist < minDist) {
                      minDist = dist;
                      closestId = route.id;
                  }
              }
              activeBGStops[closestId].push([lat, lng]);
          }
      }

      // GENERATE SUGGESTIONS DATA TIED DIRECTLY TO MAP TRANSFERS
      const suggestions = [];
      const transferMap = {}; // Tracks exactly how many stops to move on map
      const numSuggestions = Math.floor(rnd() * 3) + 5; // 5 to 7 suggestions
      const kickoffStatus = kickoffs[k].status;

      for (let i = 0; i < numSuggestions; i++) {
        const fromRoute = subset[Math.floor(rnd() * subset.length)];
        const validNeighbors = subset.filter(r => r.id !== fromRoute.id && ADJACENCY[fromRoute.id].includes(r.id));
        if (validNeighbors.length === 0) continue; 
        const toRoute = validNeighbors[Math.floor(rnd() * validNeighbors.length)];

        const isSingleAddress = rnd() < 0.35;
        const street = streetNames[Math.floor(rnd() * streetNames.length)];
        const startNum = Math.floor(rnd() * 2000) + 100;
        
        let stopsCount = 1;
        let addressDisplay = "";

        if (isSingleAddress) {
          addressDisplay = `${startNum} ${street}`;
          stopsCount = 1;
        } else {
          const endNum = startNum + Math.floor(rnd() * 100) + 10;
          addressDisplay = `${startNum} - ${endNum} ${street}`;
          stopsCount = Math.floor(rnd() * 4) + 2; // 2 to 5 stops
        }

        const transKey = `${fromRoute.id}->${toRoute.id}`;
        if(!transferMap[transKey]) transferMap[transKey] = { from: fromRoute.id, to: toRoute.id, count: 0 };
        transferMap[transKey].count += stopsCount;

        let randomStatus = 'none';
        if (kickoffStatus === 'Completed') randomStatus = rnd() > 0.3 ? 'accepted' : 'rejected';
        else if (kickoffStatus === 'Planning') randomStatus = 'accepted';

        suggestions.push({
          id: i + 1,
          from: fromRoute.id,
          to: toRoute.id,
          address: addressDisplay,
          isSingleAddress,
          stops: stopsCount,
          uow: stopsCount + Math.floor(rnd() * 5) + 1,
          status: randomStatus,
          manualTo: ''
        });
      }

      // Execute transfers on the map based EXACTLY on suggestion amounts
      const transfers = [];
      const allMovedCoords = [];

      Object.values(transferMap).forEach(t => {
        const availableStops = activeBGStops[t.from].filter(c => !allMovedCoords.includes(c));
        const toCenter = ROUTE_CENTERS[t.to];
        
        // Find dots perfectly on the border
        availableStops.sort((a, b) => {
          const distA = Math.pow(a[0] - toCenter[0], 2) + Math.pow((a[1] - toCenter[1])/1.3, 2);
          const distB = Math.pow(b[0] - toCenter[0], 2) + Math.pow((b[1] - toCenter[1])/1.3, 2);
          return distA - distB;
        });
        
        const movedForThisTransfer = availableStops.slice(0, t.count); // Shave exact match amount
        movedForThisTransfer.forEach(s => allMovedCoords.push(s));

        transfers.push({
          fromId: t.from,
          toId: t.to,
          stops: movedForThisTransfer
        });
      });

      const routesBefore = [];
      const routesAfter = [];
      let totalsBefore = { miles: 0, cost: 0 };
      let totalsAfter = { miles: 0, cost: 0 };
      const beforeStats = [];
      const afterStats = [];

      subset.forEach(route => {
        const movedOut = transfers.filter(t => t.fromId === route.id).flatMap(t => t.stops.map(coord => ({
          coord
        })));
        
        const movedIn = transfers.filter(t => t.toId === route.id).flatMap(t => t.stops.map(coord => ({
          coord
        })));

        const baseBgStops = activeBGStops[route.id].filter(c => !allMovedCoords.includes(c));

        routesBefore.push({
          id: route.id, color: route.color,
          backgroundStops: baseBgStops, movedStops: movedOut
        });

        routesAfter.push({
          id: route.id, color: route.color,
          backgroundStops: baseBgStops, movedStops: movedIn
        });

        const isOverloaded = movedOut.length > 0; 
        const beforeMiles = route.defaultMiles + (isOverloaded ? 18.5 : 0);
        const beforeCost = route.cost + (isOverloaded ? 115 : 0);
        
        beforeStats.push({
          id: route.id, color: route.color,
          miles: beforeMiles, cost: beforeCost,
          status: isOverloaded ? 'Infeasible' : 'Feasible', isRed: isOverloaded
        });
        totalsBefore.miles += beforeMiles; totalsBefore.cost += beforeCost;

        const afterMiles = route.defaultMiles + (movedIn.length * 1.5);
        const afterCost = route.cost + (movedIn.length * 8);
        afterStats.push({
          id: route.id, color: route.color,
          miles: afterMiles, cost: afterCost, status: 'Feasible'
        });
        totalsAfter.miles += afterMiles; totalsAfter.cost += afterCost;
      });

      vars.push({
        mapRoutes, suggestions, beforeStats, afterStats,
        totalsBefore, totalsAfter: {
          ...totalsAfter,
          milesDiff: (totalsAfter.miles - totalsBefore.miles).toFixed(1),
          costDiff: `-$${Math.abs(totalsAfter.cost - totalsBefore.cost).toLocaleString()}`
        },
        routesBefore, routesAfter
      });
    }
    return vars;
  }, [kickoffs]);

  const kickoffIndex = kickoffs.findIndex(k => k.id === activeKickoffId);
  const currentVar = variations[kickoffIndex !== -1 ? kickoffIndex : 0];

  const basePlanRoutes = [
    { id: '06A', name: '06A', defaultFeasibility: 'Feasible', stops: 124, packages: 156, hours: 8.5, defaultMiles: 91.5 },
    { id: '06B', name: '06B', defaultFeasibility: 'Feasible', stops: 118, packages: 142, hours: 8.2, defaultMiles: 95.0 },
    { id: '06C', name: '06C', defaultFeasibility: 'Feasible', stops: 105, packages: 120, hours: 7.5, defaultMiles: 78.2 },
    { id: '07A', name: '07A', defaultFeasibility: 'Risk Feasible', stops: 132, packages: 170, hours: 9.1, defaultMiles: 110.5 },
    { id: '07B', name: '07B', defaultFeasibility: 'Feasible', stops: 98, packages: 115, hours: 7.1, defaultMiles: 65.0 },
    { id: '07C', name: '07C', defaultFeasibility: 'Feasible', stops: 145, packages: 188, hours: 9.5, defaultMiles: 105.0 },
    { id: '08A', name: '08A', defaultFeasibility: 'Risk Feasible', stops: 112, packages: 134, hours: 8.0, defaultMiles: 82.4 },
    { id: '08B', name: '08B', defaultFeasibility: 'Feasible', stops: 125, packages: 150, hours: 8.6, defaultMiles: 88.9 },
    { id: '08C', name: '08C', defaultFeasibility: 'Feasible', stops: 109, packages: 128, hours: 7.8, defaultMiles: 75.3 },
  ];

  const planRoutes = basePlanRoutes.map(r => {
    const isFocused = currentVar.mapRoutes.includes(r.id);
    const afterStat = currentVar.afterStats.find(s => s.id === r.id);
    return {
      ...r,
      feasibility: isFocused ? 'Feasible' : r.defaultFeasibility,
      miles: isFocused ? afterStat.miles : r.defaultMiles
    };
  });

  const displayedRoutes = planRoutes.filter(r => routeFilters.length === 0 || routeFilters.includes(r.id));

  useEffect(() => {
    setSelectedRouteIds(currentVar.mapRoutes);
  }, [activeKickoffId, currentVar.mapRoutes]);

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
            <SuggestionTable 
              isEditable={isEditable} 
              activeStatus={activeStatus} 
              activeKickoffId={activeKickoffId} 
              mapRoutes={currentVar.mapRoutes} 
              suggestionsData={currentVar.suggestions}
            />
          </div>
        </div>
      </div>

      <div className="w-2/3 flex flex-col min-w-0 bg-gray-100 h-screen">
        <main className="flex-1 overflow-y-auto p-6 space-y-3">
          
          {isTableExpanded && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all">
              <div className="h-14 px-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 text-sm">Route Overview (If Changes are Accepted)</h2>
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
                        <td className="px-3 py-2 text-right">{r.miles.toFixed(1)}</td>
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
              <div className="h-[350px] relative">
                <RouteMap routes={currentVar.routesBefore} />
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-[400]">
                  {currentVar.beforeStats.map(stat => (
                    <span key={stat.id} style={{ color: stat.color, borderColor: stat.color + '40' }} className="bg-white/90 px-2 py-1 text-[10px] font-bold rounded shadow border">
                      {stat.id}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b">
                    <tr><th className="px-3 py-2">Route</th><th className="px-2 py-2 text-right">Miles</th><th className="px-2 py-2 text-right">Cost</th><th className="px-3 py-2 text-center">Status</th></tr>
                  </thead>
                  <tbody className="divide-y font-medium text-gray-700">
                    {currentVar.beforeStats.map(stat => (
                      <tr key={stat.id}>
                        <td className="px-3 py-2 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: stat.color }}></div> {stat.id}
                        </td>
                        <td className="px-2 py-2 text-right">{stat.miles.toFixed(1)}</td>
                        <td className="px-2 py-2 text-right">${stat.cost.toLocaleString()}</td>
                        <td className={`px-3 py-2 text-center ${stat.isRed ? 'text-red-600 font-bold bg-red-50' : 'text-green-600'}`}>{stat.status}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold border-t-2">
                      <td className="px-3 py-2">TOTAL</td>
                      <td className="px-2 py-2 text-right">{currentVar.totalsBefore.miles.toFixed(1)}</td>
                      <td className="px-2 py-2 text-right">${currentVar.totalsBefore.cost.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white rounded-xl border-blue-200 border-2 shadow-md overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b bg-blue-50 text-xs font-bold text-blue-700 uppercase flex justify-between tracking-widest"><span>After</span></div>
              <div className="h-[350px] relative">
                <RouteMap routes={currentVar.routesAfter} />
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-[400]">
                  {currentVar.afterStats.map(stat => (
                    <span key={stat.id} style={{ backgroundColor: stat.color }} className="text-white px-2 py-1 text-[10px] font-bold rounded shadow">
                      {stat.id}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-50/50 text-blue-800 uppercase font-bold border-b">
                    <tr><th className="px-3 py-2">Route</th><th className="px-2 py-2 text-right">Miles</th><th className="px-2 py-2 text-right">Cost</th><th className="px-3 py-2 text-center">Status</th></tr>
                  </thead>
                  <tbody className="divide-y font-medium text-gray-700">
                    {currentVar.afterStats.map(stat => (
                      <tr key={stat.id}>
                        <td className="px-3 py-2 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: stat.color }}></div> {stat.id}
                        </td>
                        <td className="px-2 py-2 text-right">{stat.miles.toFixed(1)}</td>
                        <td className="px-2 py-2 text-right">${stat.cost.toLocaleString()}</td>
                        <td className={`px-3 py-2 text-center ${stat.isRed ? 'text-red-600 font-bold bg-red-50' : 'text-green-700'}`}>{stat.status}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50/30 font-bold border-t-2">
                      <td className="px-3 py-2">TOTAL</td>
                      <td className="px-2 py-2 text-right text-green-700">
                        {currentVar.totalsAfter.miles.toFixed(1)} ({currentVar.totalsAfter.milesDiff})
                      </td>
                      <td className="px-2 py-2 text-right text-green-700">
                        ${currentVar.totalsAfter.cost.toLocaleString()} ({currentVar.totalsAfter.costDiff})
                      </td>
                      <td className="px-3 py-2 text-center"></td>
                    </tr>
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