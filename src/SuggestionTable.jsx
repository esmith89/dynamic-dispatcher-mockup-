import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Truck, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const routeOptions = ['06A', '06B', '06C', '07A', '07B', '07C', '08A', '08B', '08C'];

const seededRandom = (s) => {
  let seed = s;
  return () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
};

const stringHash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const SuggestionTable = ({ isEditable, activeStatus, activeKickoffId, mapRoutes, suggestionsData }) => {
  const [suggestions, setSuggestions] = useState([]);

  // Filter States
  const [fromFilterOpen, setFromFilterOpen] = useState(false);
  const [toFilterOpen, setToFilterOpen] = useState(false);
  const [fromFilters, setFromFilters] = useState([]);
  const [toFilters, setToFilters] = useState([]);

  // Address Range Expand/Collapse
  const [expandedRanges, setExpandedRanges] = useState({});

  useEffect(() => {
    if (!suggestionsData) return;

    const copy = JSON.parse(JSON.stringify(suggestionsData));
    const kickoffSeed = stringHash(String(activeKickoffId || ''));

    const buildAddressDetailsForRange = (item) => {
      // Expected: "123 - 456 Street Name"
      const match = String(item.address || '').match(/^(\d+)\s*-\s*(\d+)\s+(.*)$/);
      if (!match) return [];

      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      const street = match[3];

      const count = Math.max(2, Number(item.stops || 2));
      const span = Math.max(0, end - start);

      // Deterministic per kickoff + row
      const rnd = seededRandom((Number(item.id) || 1) * 1000 + kickoffSeed + count);

      const nums = [];
      const seen = new Set();

      for (let i = 0; i < count; i++) {
        let n;
        if (span === 0) n = start + i;
        else n = Math.round(start + (span * (i / (count - 1))));

        while (seen.has(n)) n += 1;
        seen.add(n);
        nums.push(n);
      }

      // More Forecast than Actual (70/30)
      const initialChildStatus =
        item.status === 'accepted' ? 'accepted' :
        item.status === 'rejected' ? 'rejected' :
        'none';

      return nums.map((n, idx) => {
        const isForecast = rnd() < 0.7;
        return {
          key: `${item.id}-${idx}-${n}`,
          address: `${n} ${street}`,
          type: isForecast ? 'Forecast' : 'Actual',
          status: initialChildStatus,
          manualTo: ''
        };
      });
    };

    copy.forEach((item) => {
      if (item.isSingleAddress) {
        // Single-point: show Forecast label, no dropdown
        item.pointType = 'Forecast';
      } else {
        item.addressDetails = buildAddressDetailsForRange(item);
      }
    });

    setSuggestions(copy);

    // Reset UI state on kickoff/status change
    setFromFilters([]);
    setToFilters([]);
    setFromFilterOpen(false);
    setToFilterOpen(false);
    setExpandedRanges({});
  }, [suggestionsData, activeKickoffId, activeStatus]);

  const handleAction = (id, newStatus) => {
    if (activeStatus !== 'Planning') return;
    setSuggestions(prev => prev.map(s => (s.id === id ? { ...s, status: newStatus } : s)));
  };

  const handleRouteChange = (id, newRoute) => {
    if (activeStatus !== 'Planning') return;
    setSuggestions(prev => prev.map(s => (s.id === id ? { ...s, manualTo: newRoute } : s)));
  };

  const handleDetailAction = (parentId, detailKey, newStatus) => {
    if (activeStatus !== 'Planning') return;
    setSuggestions(prev =>
      prev.map(s => {
        if (s.id !== parentId) return s;
        const nextDetails = (s.addressDetails || []).map(d =>
          d.key === detailKey ? { ...d, status: newStatus } : d
        );
        return { ...s, addressDetails: nextDetails };
      })
    );
  };

  const handleDetailRouteChange = (parentId, detailKey, newRoute) => {
    if (activeStatus !== 'Planning') return;
    setSuggestions(prev =>
      prev.map(s => {
        if (s.id !== parentId) return s;
        const nextDetails = (s.addressDetails || []).map(d =>
          d.key === detailKey ? { ...d, manualTo: newRoute } : d
        );
        return { ...s, addressDetails: nextDetails };
      })
    );
  };

  const toggleFromFilter = (route) => {
    setFromFilters(prev => (prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]));
  };

  const toggleToFilter = (route) => {
    setToFilters(prev => (prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]));
  };

  const toggleRangeExpanded = (id) => {
    // ✅ Correct computed property update (fixes your Babel errors)
    setExpandedRanges(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const uniqueFromRoutes = [...new Set(suggestions.map(s => s.from))].sort();
  const uniqueToRoutes = [...new Set(suggestions.map(s => s.to))].sort();

  const displayedSuggestions = suggestions.filter(s => {
    const matchFrom = fromFilters.length === 0 || fromFilters.includes(s.from);
    const matchTo = toFilters.length === 0 || toFilters.includes(s.to);
    return matchFrom && matchTo;
  });

  return (
    <div className="w-full pb-24">
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        {/* table-fixed + tight widths to avoid horizontal scroll */}
        <table className="w-full table-fixed divide-y divide-gray-200 text-[11px]">
          <thead className="bg-gray-50 uppercase font-bold text-gray-500">
            <tr className="text-[10px]">
              {/* FROM */}
              <th className="px-2 py-2 text-left relative w-[15%]">
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => { setFromFilterOpen(!fromFilterOpen); setToFilterOpen(false); }}
                >
                  From <Filter size={12} className={fromFilters.length > 0 ? "text-blue-600" : ""} />
                </div>
                {fromFilterOpen && (
                  <div className="absolute top-full left-1 mt-1 bg-white border border-gray-200 shadow-lg rounded-md p-2 z-50 w-40">
                    <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Filter From</div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {uniqueFromRoutes.map(r => (
                        <label
                          key={r}
                          className="flex items-center gap-2 text-xs py-1 px-1 cursor-pointer hover:bg-gray-50 rounded normal-case font-medium text-gray-700"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={fromFilters.includes(r)}
                            onChange={() => toggleFromFilter(r)}
                          />
                          <span className="truncate">{r}</span>
                        </label>
                      ))}
                    </div>
                    {fromFilters.length > 0 && (
                      <div className="border-t mt-2 pt-2 flex justify-end">
                        <button
                          onClick={() => setFromFilters([])}
                          className="text-[10px] text-blue-600 font-bold hover:underline normal-case"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </th>

              {/* TO */}
              <th className="px-2 py-2 text-left relative w-[13%]">
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => { setToFilterOpen(!toFilterOpen); setFromFilterOpen(false); }}
                >
                  To <Filter size={12} className={toFilters.length > 0 ? "text-blue-600" : ""} />
                </div>
                {toFilterOpen && (
                  <div className="absolute top-full left-1 mt-1 bg-white border border-gray-200 shadow-lg rounded-md p-2 z-50 w-40">
                    <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Filter To</div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {uniqueToRoutes.map(r => (
                        <label
                          key={r}
                          className="flex items-center gap-2 text-xs py-1 px-1 cursor-pointer hover:bg-gray-50 rounded normal-case font-medium text-gray-700"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={toFilters.includes(r)}
                            onChange={() => toggleToFilter(r)}
                          />
                          <span className="truncate">{r}</span>
                        </label>
                      ))}
                    </div>
                    {toFilters.length > 0 && (
                      <div className="border-t mt-2 pt-2 flex justify-end">
                        <button
                          onClick={() => setToFilters([])}
                          className="text-[10px] text-blue-600 font-bold hover:underline normal-case"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </th>

              {/* ADDRESS */}
              <th className="px-2 py-2 text-left w-[47%]">Address</th>

              {/* ACTION */}
              <th className="px-2 py-2 text-left w-[12%]">Action</th>

              {/* MOVE */}
              <th className="px-2 py-2 text-left w-[13%]">Move</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {displayedSuggestions.length > 0 ? (
              displayedSuggestions.map((item) => {
                const isExpanded = !!expandedRanges[item.id];
                const canExpand =
                  !item.isSingleAddress &&
                  Array.isArray(item.addressDetails) &&
                  item.addressDetails.length > 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors align-top">
                    {/* FROM */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-700">{item.from}</span>
                        <ArrowRight size={12} className="text-gray-300" />
                      </div>
                    </td>

                    {/* TO */}
                    <td className="px-2 py-2">
                      <span className="font-bold text-gray-700">{item.to}</span>
                    </td>

                    {/* ADDRESS */}
                    <td className="px-2 py-2">
                      <div className="min-w-0">
                        <div className="font-bold text-gray-700 flex items-center gap-2">
                          <span className="truncate">{item.address}</span>

                          {/* single-point always shows Forecast */}
                          {item.isSingleAddress && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap bg-amber-100 text-amber-700">
                              Forecast
                            </span>
                          )}

                          {/* range expand toggle */}
                          {canExpand && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleRangeExpanded(item.id); }}
                              className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                              aria-label={isExpanded ? "Collapse address list" : "Expand address list"}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          {!item.isSingleAddress && (
                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Truck size={10} /> {item.stops}
                            </div>
                          )}
                          <div className="text-[10px] font-bold text-indigo-500">UOW: {item.uow}</div>
                        </div>

                        {/* Expanded address list */}
                        {canExpand && isExpanded && (
                          <div className="mt-2 pl-3 border-l border-gray-200 space-y-2">
                            {item.addressDetails.map((addr) => (
                              <div key={addr.key} className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-gray-700 truncate">{addr.address}</span>
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                                        addr.type === 'Actual'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-amber-100 text-amber-700'
                                      }`}
                                    >
                                      {addr.type}
                                    </span>
                                  </div>

                                  {/* Per-address controls (wrap => no horizontal scroll) */}
                                  <div className="mt-1 flex flex-wrap items-center gap-1">
                                    <button
                                      onClick={() => handleDetailAction(item.id, addr.key, 'accepted')}
                                      className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                                        addr.status === 'accepted'
                                          ? 'bg-green-600 text-white border-green-600'
                                          : 'bg-white border-gray-200 text-gray-300'
                                      } ${activeStatus === 'Planning' ? 'hover:border-green-400' : 'cursor-not-allowed opacity-60'}`}
                                      disabled={activeStatus !== 'Planning'}
                                      title="Accept"
                                    >
                                      <Check size={14} strokeWidth={3} />
                                    </button>

                                    <button
                                      onClick={() => handleDetailAction(item.id, addr.key, 'rejected')}
                                      className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                                        addr.status === 'rejected'
                                          ? 'bg-red-600 text-white border-red-600'
                                          : 'bg-white border-gray-200 text-gray-300'
                                      } ${activeStatus === 'Planning' ? 'hover:border-red-400' : 'cursor-not-allowed opacity-60'}`}
                                      disabled={activeStatus !== 'Planning'}
                                      title="Reject"
                                    >
                                      <X size={14} strokeWidth={3} />
                                    </button>

                                    <select
                                      value={addr.manualTo || ''}
                                      onChange={(e) => handleDetailRouteChange(item.id, addr.key, e.target.value)}
                                      className={`text-[10px] border rounded p-1 w-16 bg-gray-50 font-bold outline-none focus:border-blue-500 ${
                                        activeStatus !== 'Planning' ? 'opacity-60 cursor-not-allowed' : ''
                                      }`}
                                      disabled={activeStatus !== 'Planning'}
                                      title="Move To"
                                    >
                                      <option value="">Move</option>
                                      {routeOptions
                                        .filter(r => r !== item.to && r !== item.from)
                                        .map(r => (
                                          <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-2 py-2">
                      <div className="flex justify-start gap-1">
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
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </div>
                    </td>

                    {/* MOVE */}
                    <td className="px-2 py-2">
                      {activeStatus === 'Planning' ? (
                        <select
                          value={item.manualTo}
                          onChange={(e) => handleRouteChange(item.id, e.target.value)}
                          className="text-[10px] border rounded p-1 w-16 bg-gray-50 font-bold outline-none focus:border-blue-500"
                        >
                          <option value="">Move</option>
                          {routeOptions
                            .filter(r => r !== item.to && r !== item.from)
                            .map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
              </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 font-medium text-sm">
                  No suggestions match the selected filters.
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