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
  { id: '06A', driver: 'A. Kaminski', color: '#f97316', defaultMiles: 91.5, cost: 365, defaultFeasibility: 'Feasible' },
  { id: '06B', driver: 'E. Smith', color: '#8b5cf6', defaultMiles: 95.0, cost: 385, defaultFeasibility: 'Risk Feasible' },
  { id: '06C', driver: 'B. Conard', color: '#db2777', defaultMiles: 78.2, cost: 310, defaultFeasibility: 'Feasible' },
  { id: '07A', driver: 'M. Spence', color: '#16a34a', defaultMiles: 110.5, cost: 450, defaultFeasibility: 'Risk Feasible' },
  { id: '07B', driver: 'L. Phillips', color: '#ca8a04', defaultMiles: 65.0, cost: 260, defaultFeasibility: 'Feasible' },
  { id: '07C', driver: 'J. Tippins', color: '#2563eb', defaultMiles: 105.0, cost: 450, defaultFeasibility: 'Risk Feasible' },
  { id: '08A', driver: 'C. Cummings', color: '#dc2626', defaultMiles: 82.4, cost: 330, defaultFeasibility: 'Feasible' },
  { id: '08B', driver: 'A. Squitieri', color: '#0d9488', defaultMiles: 88.9, cost: 350, defaultFeasibility: 'Feasible' },
  { id: '08C', driver: 'K. Snyder', color: '#4f46e5', defaultMiles: 75.3, cost: 310, defaultFeasibility: 'Feasible' },
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
  const [hiddenMapRoutes, setHiddenMapRoutes] = useState([]);

  // Location Dropdown State
  const [isCenterDropdownOpen, setIsCenterDropdownOpen] = useState(false);
  const centerOptions = [
    'INTER - 4780 (Terre Haute)',
    'Building - SLIC (Center)',
    'Building - SLIC (Center)',
    'Building - SLIC (Center)',
    'Building - SLIC (Center)'
  ];

  // Column Visibility State for Route Overview
  const [isColFilterOpen, setIsColFilterOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState([
    'feasibility', 'viewOnMap', 'loadOrion', 'leaveBuildingTime', 'stops', 'packages', 'hours', 'miles'
  ]);

  const toggleCol = (colId) => {
    setVisibleCols(prev => prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]);
  };

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
      
      const activeBGStops = {};
      subset.forEach(r => activeBGStops[r.id] = []);
      
      for (const genRoute of subset) {
          const genCenter = ROUTE_CENTERS[genRoute.id];
          const routeRadius = 0.035 + rnd() * 0.025;
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

      const suggestions = [];
      const transferMap = {};
      const numSuggestions = Math.floor(rnd() * 3) + 5;
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
          stopsCount = Math.floor(rnd() * 4) + 2; 
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

      const transfers = [];
      const allMovedCoords = [];

      Object.values(transferMap).forEach(t => {
        const availableStops = activeBGStops[t.from].filter(c => !allMovedCoords.includes(c));
        const toCenter = ROUTE_CENTERS[t.to];
        
        availableStops.sort((a, b) => {
          const distA = Math.pow(a[0] - toCenter[0], 2) + Math.pow((a[1] - toCenter[1])/1.3, 2);
          const distB = Math.pow(b[0] - toCenter[0], 2) + Math.pow((b[1] - toCenter[1])/1.3, 2);
          return distA - distB;
        });
        
        const movedForThisTransfer = availableStops.slice(0, t.count);
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
        const beforeStatus = isOverloaded ? 'Infeasible' : (route.defaultFeasibility || 'Feasible');
        
        beforeStats.push({
          id: route.id, color: route.color, driver: route.driver,
          miles: beforeMiles, cost: beforeCost,
          status: beforeStatus
        });
        totalsBefore.miles += beforeMiles; totalsBefore.cost += beforeCost;

        const afterMiles = route.defaultMiles + (movedIn.length * 1.5);
        const afterCost = route.cost + (movedIn.length * 8);
        afterStats.push({
          id: route.id, color: route.color, driver: route.driver,
          miles: afterMiles, cost: afterCost, status: route.defaultFeasibility || 'Feasible'
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
    { id: '06A', name: '06A', driver: 'A. Kaminski', defaultFeasibility: 'Feasible', leaveBuildingTime: '8:50', stops: 124, packages: 156, hours: 8.5, defaultMiles: 91.5, eows: 0, helperHours: 0 },
    { id: '06B', name: '06B', driver: 'E. Smith', defaultFeasibility: 'Risk Feasible', leaveBuildingTime: '8:50', stops: 118, packages: 142, hours: 8.2, defaultMiles: 95.0, eows: 1, helperHours: 0 },
    { id: '06C', name: '06C', driver: 'B. Conard', defaultFeasibility: 'Feasible', leaveBuildingTime: '8:50', stops: 105, packages: 120, hours: 7.5, defaultMiles: 78.2, eows: 0, helperHours: 0 },
    { id: '07A', name: '07A', driver: 'M. Spence', defaultFeasibility: 'Risk Feasible', leaveBuildingTime: '8:50', stops: 132, packages: 170, hours: 9.1, defaultMiles: 110.5, eows: 1, helperHours: 0 },
    { id: '07B', name: '07B', driver: 'L. Phillips', defaultFeasibility: 'Feasible', leaveBuildingTime: '8:50', stops: 98, packages: 115, hours: 7.1, defaultMiles: 65.0, eows: 0, helperHours: 0 },
    { id: '07C', name: '07C', driver: 'J. Tippins', defaultFeasibility: 'Risk Feasible', leaveBuildingTime: '8:50', stops: 145, packages: 188, hours: 9.5, defaultMiles: 105.0, eows: 2, helperHours: 0 },
    { id: '08A', name: '08A', driver: 'C. Cummings', defaultFeasibility: 'Feasible', leaveBuildingTime: '8:50', stops: 112, packages: 134, hours: 8.0, defaultMiles: 82.4, eows: 0, helperHours: 0 },
    { id: '08B', name: '08B', driver: 'A. Squitieri', defaultFeasibility: 'Feasible', leaveBuildingTime: '8:50', stops: 125, packages: 150, hours: 8.6, defaultMiles: 88.9, eows: 0, helperHours: 0 },
    { id: '08C', name: '08C', driver: 'K. Snyder', defaultFeasibility: 'Feasible', leaveBuildingTime: '8:50', stops: 109, packages: 128, hours: 7.8, defaultMiles: 75.3, eows: 0, helperHours: 0 },
  ];

  const planRoutes = basePlanRoutes.map(r => {
    const isFocused = currentVar.mapRoutes.includes(r.id);
    const afterStat = currentVar.afterStats.find(s => s.id === r.id);
    return {
      ...r,
      feasibility: isFocused ? afterStat.status : r.defaultFeasibility,
      miles: isFocused ? afterStat.miles : r.defaultMiles
    };
  });

  const displayedRoutes = planRoutes;

  useEffect(() => {
    setSelectedRouteIds(currentVar.mapRoutes);
    setHiddenMapRoutes([]); // Reset map filters on kickoff change
  }, [activeKickoffId, currentVar.mapRoutes]);

  const toggleRouteSelection = (id) => {
    setSelectedRouteIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleMapRouteVisibility = (id) => {
    setHiddenMapRoutes(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  // Filter routes passed to RouteMap based on the toggled checkboxes
  const filteredRoutesBefore = currentVar.routesBefore.filter(r => !hiddenMapRoutes.includes(r.id));
  const filteredRoutesAfter = currentVar.routesAfter.filter(r => !hiddenMapRoutes.includes(r.id));

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleWindowClick = (e) => {
      if (!e.target.closest('.location-dropdown-container')) {
        setIsCenterDropdownOpen(false);
      }
      if (!e.target.closest('.col-filter-container')) {
        setIsColFilterOpen(false);
      }
    };
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

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
              onClick={() => console.log('Changes Accepted')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-md shadow-sm transition-all flex-shrink-0 ${isEditable ? 'bg-blue-600 hover:bg-blue-700 active:scale-95' : 'bg-gray-400 cursor-not-allowed'}`}
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
        {/* Top Header Bar for Global Actions - Set z-50 to overlap below content */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm relative">
          
          {/* Location Dropdown */}
          <div className="relative location-dropdown-container">
            <button 
              onClick={() => setIsCenterDropdownOpen(!isCenterDropdownOpen)}
              className="flex items-center gap-2 font-bold text-gray-800 text-xl tracking-tight hover:text-blue-600 transition-colors outline-none"
            >
              INTER - 4780 (Terre Haute)
              <ChevronDown size={20} className={`text-gray-500 transition-transform duration-200 ${isCenterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCenterDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-50">
                <div className="px-4 pb-2 mb-2 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Location
                </div>
                {centerOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsCenterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${idx === 0 ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 border-l-2 border-transparent'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => console.log('Reports Loaded')} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-sm transition-all active:scale-95 flex-shrink-0 bg-blue-600 hover:bg-blue-700">
              Reports
            </button>
            <button onClick={() => console.log('ORSS/ADIM Loaded')} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-sm transition-all active:scale-95 flex-shrink-0 bg-blue-600 hover:bg-blue-700">
              ORSS/ADIM
            </button>
            <button onClick={() => console.log('GTS Timecard Viewer Loaded')} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-sm transition-all active:scale-95 flex-shrink-0 bg-blue-600 hover:bg-blue-700">
              GTS Timecard Viewer
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-3 relative z-0">
          
          {isTableExpanded && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible flex flex-col transition-all">
              <div className="h-14 px-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 text-sm">
                  {activeStatus === 'Planning' ? 'Route Overview (If Changes are Accepted)' : 'Route Overview'}
                </h2>
              </div>
              <div className="overflow-x-visible">
                <table className="w-full text-left text-sm relative">
                  <thead className="bg-white z-10 border-b shadow-sm relative">
                    <tr className="text-gray-500 uppercase text-xs">
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Route</th>
                      <th className="px-3 py-2 font-bold whitespace-nowrap">Driver</th>
                      {visibleCols.includes('feasibility') && <th className="px-3 py-2 font-bold text-center whitespace-nowrap">Feasibility</th>}
                      {visibleCols.includes('viewOnMap') && <th className="px-3 py-2 font-bold text-center whitespace-nowrap">View on Map</th>}
                      {visibleCols.includes('loadOrion') && <th className="px-3 py-2 font-bold text-center whitespace-nowrap">Load ORION</th>}
                      {visibleCols.includes('leaveBuildingTime') && <th className="px-3 py-2 font-bold text-center whitespace-nowrap">Leave Building Time</th>}
                      {visibleCols.includes('stops') && <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Stops</th>}
                      {visibleCols.includes('packages') && <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Packages</th>}
                      {visibleCols.includes('hours') && <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Hours</th>}
                      {visibleCols.includes('miles') && <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Miles</th>}
                      {visibleCols.includes('eows') && <th className="px-3 py-2 font-bold text-right whitespace-nowrap">EOW's</th>}
                      {visibleCols.includes('helperHours') && <th className="px-3 py-2 font-bold text-right whitespace-nowrap">Helper Hours</th>}
                      <th className="w-full px-3 py-1 text-right relative col-filter-container z-50">
                        <button 
                          onClick={() => setIsColFilterOpen(!isColFilterOpen)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-100 transition-colors normal-case"
                        >
                          <Filter size={12} /> Filter
                        </button>
                        {isColFilterOpen && (
                          <div className="absolute top-full right-2 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-50 text-left">
                            <div className="px-4 pb-2 mb-2 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Toggle Columns
                            </div>
                            {[
                              { id: 'feasibility', label: 'Feasibility' },
                              { id: 'viewOnMap', label: 'View on Map' },
                              { id: 'loadOrion', label: 'Load ORION' },
                              { id: 'leaveBuildingTime', label: 'Leave Building Time' },
                              { id: 'stops', label: 'Stops' },
                              { id: 'packages', label: 'Packages' },
                              { id: 'hours', label: 'Hours' },
                              { id: 'miles', label: 'Miles' },
                              { id: 'eows', label: "EOW's" },
                              { id: 'helperHours', label: 'Helper Hours' },
                            ].map(col => (
                              <label key={col.id} className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium hover:bg-gray-50 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={visibleCols.includes(col.id)}
                                  onChange={() => toggleCol(col.id)}
                                />
                                <span className="text-gray-700">{col.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {displayedRoutes.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-bold">{r.name}</td>
                        <td className="px-3 py-2 text-gray-600 font-medium whitespace-nowrap">{r.driver}</td>
                        {visibleCols.includes('feasibility') && (
                          <td className="px-3 py-2 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                              r.feasibility === 'Feasible' ? 'bg-green-100 text-green-700' : 
                              r.feasibility === 'Risk Feasible' ? 'bg-amber-100 text-amber-700' : 
                              'bg-red-100 text-red-700'
                            }`}>
                              {r.feasibility}
                            </span>
                          </td>
                        )}
                        {visibleCols.includes('viewOnMap') && (
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" className="w-4 h-4 cursor-pointer text-blue-600 rounded focus:ring-blue-500" checked={selectedRouteIds.includes(r.id)} onChange={() => toggleRouteSelection(r.id)} />
                          </td>
                        )}
                        {visibleCols.includes('loadOrion') && (
                          <td className="px-3 py-2 text-center">
                            <button 
                              className="px-3 py-1 text-xs font-bold text-white rounded whitespace-nowrap bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                              onClick={() => console.log(`ORION Loaded for ${r.name}`)}
                            >
                              Load ORION
                            </button>
                          </td>
                        )}
                        {visibleCols.includes('leaveBuildingTime') && (
                          <td className="px-3 py-2 text-center font-medium whitespace-nowrap">{r.leaveBuildingTime}</td>
                        )}
                        {visibleCols.includes('stops') && (
                          <td className="px-3 py-2 text-right">{r.stops}</td>
                        )}
                        {visibleCols.includes('packages') && (
                          <td className="px-3 py-2 text-right">{r.packages}</td>
                        )}
                        {visibleCols.includes('hours') && (
                          <td className="px-3 py-2 text-right">{r.hours}</td>
                        )}
                        {visibleCols.includes('miles') && (
                          <td className="px-3 py-2 text-right">{r.miles.toFixed(1)}</td>
                        )}
                        {visibleCols.includes('eows') && (
                          <td className="px-3 py-2 text-right">{r.eows}</td>
                        )}
                        {visibleCols.includes('helperHours') && (
                          <td className="px-3 py-2 text-right">{r.helperHours}</td>
                        )}
                        <td className="w-full"></td>
                      </tr>
                    ))}
                    {displayedRoutes.length === 0 && (
                      <tr>
                        <td colSpan="13" className="px-4 py-8 text-center text-gray-400 font-medium text-sm">
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
                <RouteMap routes={filteredRoutesBefore} />
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-[400]">
                  {currentVar.beforeStats.map(stat => (
                    <label 
                      key={stat.id} 
                      style={{ color: stat.color, borderColor: stat.color + '40' }} 
                      className="bg-white/90 px-2 py-1 text-[10px] font-bold rounded shadow border flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        className="w-2.5 h-2.5 cursor-pointer rounded-sm"
                        checked={!hiddenMapRoutes.includes(stat.id)}
                        onChange={() => toggleMapRouteVisibility(stat.id)}
                      />
                      <span>{stat.id}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t">
                <table className="w-full text-left text-xs table-fixed">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b">
                    <tr>
                      <th className="px-3 py-2 w-[16%]">Route</th>
                      <th className="px-2 py-2 w-[24%]">Driver</th>
                      <th className="px-2 py-2 text-right w-[18%]">Miles</th>
                      <th className="px-2 py-2 text-right w-[20%]">Cost</th>
                      <th className="px-3 py-2 text-center w-[22%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium text-gray-700">
                    {currentVar.beforeStats.map(stat => (
                      <tr key={stat.id}>
                        <td className="px-3 py-2 flex items-center gap-2 truncate">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ backgroundColor: stat.color }}></div> {stat.id}
                        </td>
                        <td className="px-2 py-2 truncate text-gray-600 font-medium">{stat.driver}</td>
                        <td className="px-2 py-2 text-right truncate">{stat.miles.toFixed(1)}</td>
                        <td className="px-2 py-2 text-right truncate">${stat.cost.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center truncate">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                            stat.status === 'Feasible' ? 'bg-green-100 text-green-700' : 
                            stat.status === 'Risk Feasible' ? 'bg-amber-100 text-amber-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {stat.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold border-t-2">
                      <td className="px-3 py-2 truncate">TOTAL</td>
                      <td className="px-2 py-2 truncate"></td>
                      <td className="px-2 py-2 text-right truncate">{currentVar.totalsBefore.miles.toFixed(1)}</td>
                      <td className="px-2 py-2 text-right truncate">${currentVar.totalsBefore.cost.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase flex justify-between tracking-widest"><span>After</span></div>
              <div className="h-[350px] relative">
                <RouteMap routes={filteredRoutesAfter} />
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-[400]">
                  {currentVar.afterStats.map(stat => (
                    <label 
                      key={stat.id} 
                      style={{ color: stat.color, borderColor: stat.color + '40' }} 
                      className="bg-white/90 px-2 py-1 text-[10px] font-bold rounded shadow border flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        className="w-2.5 h-2.5 cursor-pointer rounded-sm"
                        checked={!hiddenMapRoutes.includes(stat.id)}
                        onChange={() => toggleMapRouteVisibility(stat.id)}
                      />
                      <span>{stat.id}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t">
                <table className="w-full text-left text-xs table-fixed">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b">
                    <tr>
                      <th className="px-3 py-2 w-[16%]">Route</th>
                      <th className="px-2 py-2 w-[24%]">Driver</th>
                      <th className="px-2 py-2 text-right w-[18%]">Miles</th>
                      <th className="px-2 py-2 text-right w-[20%]">Cost</th>
                      <th className="px-3 py-2 text-center w-[22%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium text-gray-700">
                    {currentVar.afterStats.map(stat => (
                      <tr key={stat.id}>
                        <td className="px-3 py-2 flex items-center gap-2 truncate">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ backgroundColor: stat.color }}></div> {stat.id}
                        </td>
                        <td className="px-2 py-2 truncate text-gray-600 font-medium">{stat.driver}</td>
                        <td className="px-2 py-2 text-right truncate">{stat.miles.toFixed(1)}</td>
                        <td className="px-2 py-2 text-right truncate">${stat.cost.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center truncate">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                            stat.status === 'Feasible' ? 'bg-green-100 text-green-700' : 
                            stat.status === 'Risk Feasible' ? 'bg-amber-100 text-amber-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {stat.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold border-t-2">
                      <td className="px-3 py-2 truncate">TOTAL</td>
                      <td className="px-2 py-2 truncate"></td>
                      <td className="px-2 py-2 text-right text-green-700 truncate">
                        {currentVar.totalsAfter.miles.toFixed(1)} ({currentVar.totalsAfter.milesDiff})
                      </td>
                      <td className="px-2 py-2 text-right text-green-700 truncate">
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