import React, { useState } from 'react';
import SuggestionTable from './SuggestionTable';
import { Map } from 'lucide-react';

export default function App() {
  const [activeKickoff, setActiveKickoff] = useState('Date_Time_DD04_3045');

  // List mimicking the Date_Time_DDXX_(SLIC) format
  const kickoffs = [
    'Date_Time_DD01_3045', 'Date_Time_DD02_3045', 'Date_Time_DD03_3045', 
    'Date_Time_DD04_3045', 'Date_Time_DD05_3045', 'Date_Time_DD06_3045',
    'Date_Time_DD07_3045', 'Date_Time_DD08_3045', 'Date_Time_DD09_3045'
  ];

  const orionRoutes = ['01A', '01B', '03A', '03B', '04A', '04B', '05A', '05B', '06A', '06B', '07A', '07B', '07C', '08A'];

  // Identify most recent kickoff for viewable vs. editable logic
  const mostRecentKickoff = kickoffs[kickoffs.length - 1];

  return (
    <div className="flex h-screen w-full bg-gray-100 text-sm font-sans">
      
      {/* LEFT PANE: Kickoff List */}
      <div className="w-64 bg-white border-r border-gray-300 flex flex-col shadow-sm z-10">
        <div className="p-4 bg-slate-800 text-white font-bold text-base">
          Dynamic Dispatcher Kickoffs
        </div>
        <div className="flex-1 overflow-y-auto">
          {kickoffs.map((ko, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveKickoff(ko)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${activeKickoff === ko ? 'bg-blue-100 border-l-4 border-blue-600 font-semibold' : ''}`}
            >
              {ko} {ko === mostRecentKickoff && <span className="text-xs text-blue-600 block">Editable</span>}
            </div>
          ))}
        </div>
      </div>

      {/* CENTER PANE: Dashboard */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-1/2 bg-white border-b border-gray-300 flex flex-col">
          <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
            <span>Add/Cut Suggestions for {activeKickoff}</span>
            {activeKickoff !== mostRecentKickoff && (
              <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded">View Only - Not Most Recent</span>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            <SuggestionTable isEditable={activeKickoff === mostRecentKickoff} />
          </div>
        </div>

        {/* SPLIT MAP VIEW */}
        <div className="flex-1 flex bg-gray-200">
          <div className="flex-1 border-r border-gray-400 p-2 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Pre Add/Cut Map</div>
            <div className="flex-1 bg-white rounded shadow-inner flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Map size={48} className="opacity-20 mb-2 mx-auto" />
                <span>Shows stops before the cut</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-2 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Add/Cut Suggestion Map</div>
            <div className="flex-1 bg-white rounded shadow-inner flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Map size={48} className="opacity-20 mb-2 mx-auto" />
                <span>Shows selected moved routes (Denied hidden)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION FOOTER & ROUTE STATS */}
        <div className="h-24 bg-white border-t border-gray-300 flex items-center justify-between px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <div className="flex flex-col text-xs text-gray-600">
            <span className="text-gray-500 uppercase font-bold mb-1">Route Stats Rollup (From)</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span><strong>Miles:</strong> 181</span>
              <span><strong>Cost:</strong> $1145.21</span>
              <span><strong>Hours:</strong> 27.4</span>
              <span><strong>Gain/Loss:</strong> N/A</span>
              <span className="col-span-2"><strong>Feasibility:</strong> Feasible</span>
            </div>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow-md transition-transform transform active:scale-95">
            Accept Selected Moves
          </button>

          <div className="flex flex-col text-xs text-gray-600 text-right">
            <span className="text-gray-500 uppercase font-bold mb-1">Route Stats Rollup (To)</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right">
              <span><strong>Miles:</strong> 171</span>
              <span><strong>Cost:</strong> $1019.88</span>
              <span><strong>Hours:</strong> 27.1</span>
              <span><strong>Gain/Loss:</strong> 125.33</span>
              <span className="col-span-2"><strong>Feasibility:</strong> Feasible</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: ORION Checklist */}
      <div className="w-56 bg-white border-l border-gray-300 flex flex-col shadow-sm z-10">
        <div className="p-4 bg-slate-800 text-white font-bold text-sm">
          Load ORION / Display on Map
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {orionRoutes.map((route, idx) => (
            <label key={idx} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
              <span className="font-medium text-gray-700">{route}</span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}
