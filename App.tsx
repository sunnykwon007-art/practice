import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  Map as MapIcon, 
  List, 
  Plus, 
  Settings2, 
  X, 
  Edit3, 
  Trash2,
  Building2,
  User,
  Wallet,
  Globe,
  Check
} from 'lucide-react';
import { MOCK_DATA, REGION_COLORS, UNIVERSITY_PRESETS } from './constants';
import { UniversityData, Region } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ViewMode = 'map' | 'list';
type StatusFilter = 'ALL' | 'NEW' | 'EXISTING';

const INDUSTRIES = ['전체', '반도체', '이차전지', '바이오', '디스플레이', '항공우주', '미래차', '인공지능'];

const App: React.FC = () => {
  // --- Refs ---
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  // --- State ---
  const [data, setData] = useState<UniversityData[]>(() => {
    const saved = localStorage.getItem('univ_dashboard_data');
    return saved ? JSON.parse(saved) : MOCK_DATA;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string>('전체');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    school_name: '',
    partner_company: '',
    region: Region.SEOUL,
    address: '',
    lat: '',
    lng: '',
    amount_sum: '',
    status: 'EXISTING' as 'NEW' | 'EXISTING',
    proposal_range: '',
    industry: '반도체',
    proposal_types: [] as ('교육LMS' | '세미나')[],
    contact_info: ''
  });

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('univ_dashboard_data', JSON.stringify(data));
  }, [data]);

  // --- Helpers ---
  const formatCurrency = useCallback((amount: number) => {
    if (amount === 0) return "₩ 0 (미정)";
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const calculateRadius = useCallback((amount: number) => {
    if (amount === 0) return 9;
    const logValue = Math.log10(amount || 1);
    const radius = 7 + logValue * 4.5;
    return Math.min(Math.max(radius, 11), 38);
  }, []);

  // --- Computed Data ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchIndustry = industryFilter === '전체' || item.industry === industryFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchSearch = item.school_name.includes(searchQuery) || item.partner_company.includes(searchQuery);
      return matchIndustry && matchStatus && matchSearch;
    });
  }, [data, industryFilter, statusFilter, searchQuery]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((acc, cur) => acc + cur.amount_sum, 0);
  }, [filteredData]);

  // --- Map Logic ---
  const renderMarkers = useCallback(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    markersLayer.current.clearLayers();

    filteredData.forEach((univ) => {
      const color = REGION_COLORS[univ.region] || REGION_COLORS[Region.ETC];
      const radius = calculateRadius(univ.amount_sum);
      const isNew = univ.status === 'NEW';

      const marker = L.circleMarker([univ.lat, univ.lng], {
        radius: radius,
        fillColor: color,
        color: isNew ? '#EF4444' : '#FFFFFF',
        weight: isNew ? 2 : 1.2,
        opacity: 1,
        fillOpacity: 0.75,
        className: isNew ? 'marker-bid-target' : 'marker-stable'
      });

      const statusBadge = isNew
        ? `<span class="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black ml-1.5 shadow-sm shadow-red-200">2026 입찰</span>`
        : `<span class="text-[9px] bg-slate-500 text-white px-1.5 py-0.5 rounded font-extrabold ml-1.5">기존참여</span>`;

      const proposalTags = univ.proposal_types.map(t =>
        `<span class="text-[9px] px-1.5 py-0.5 rounded font-bold mr-1 ${t === '교육LMS' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}">#${t}</span>`
      ).join('');

      const contactSection = univ.contact_info
        ? `<div class="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            <span class="font-extrabold text-slate-400 text-[9px] uppercase mr-1">[Manager]</span> ${univ.contact_info}
           </div>`
        : '';

      const popupContent = `
        <div class="p-3.5 w-[240px] font-sans">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="text-[9px] text-white font-black px-1.5 py-0.5 rounded" style="background: ${color}">${univ.industry}</span>
            ${statusBadge}
          </div>
          <div class="text-lg font-black text-slate-900 leading-tight mb-0.5">${univ.school_name}</div>
          <div class="text-[10px] text-slate-400 font-semibold mb-3 flex items-center gap-1">
             <span class="w-1 h-1 rounded-full bg-slate-200"></span>${univ.address}
          </div>
          
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2.5">
            <div class="text-[8px] text-slate-400 font-black uppercase mb-1 tracking-wider">Partner Corporation</div>
            <div class="text-[12px] text-slate-800 font-extrabold leading-snug">${univ.partner_company}</div>
          </div>

          <div class="flex flex-wrap gap-1 mb-3">
            ${proposalTags || '<span class="text-[9px] text-slate-300 font-bold italic">No types assigned</span>'}
          </div>

          <div class="flex justify-between items-baseline pt-2 border-t border-dashed border-slate-200">
            <span class="text-[9px] text-slate-400 font-extrabold uppercase">Estimation</span>
            <span class="text-sm font-black text-slate-900" style="color: ${color}">${formatCurrency(univ.amount_sum)}</span>
          </div>
          ${contactSection}
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -5],
        className: 'custom-university-popup'
      });

      marker.addTo(markersLayer.current!);
    });
  }, [filteredData, calculateRadius, formatCurrency]);

  // Map Initialization & Cleanup
  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current && !mapInstance.current) {
      const southKoreaBounds = L.latLngBounds(L.latLng(32.8, 124.0), L.latLng(38.8, 131.0));
      
      const map = L.map(mapContainerRef.current, {
        center: [36.2, 127.8],
        zoom: 7.5,
        minZoom: 7,
        maxBounds: southKoreaBounds,
        maxBoundsViscosity: 1.0,
        zoomControl: false
      });

      const superCleanTileUrl = 'https://mt1.google.com/vt/lyrs=m&hl=ko&gl=kr&x={x}&y={y}&z={z}&apistyle=s.t:1|p.v:on,s.t:2|p.v:off,s.t:3|p.v:on|p.c:%23f8f9fa,s.t:4|p.v:off,s.t:5|p.v:on|p.c:%23ffffff,s.t:6|p.v:off,s.t:49|p.v:on|p.c:%23e0e0e0,s.t:50|p.v:on|p.c:%23cccccc';
      
      L.tileLayer(superCleanTileUrl, { attribution: '&copy; Google' }).addTo(map);
      
      const customZoomLayer = L.control.zoom({ position: 'bottomright' });
      customZoomLayer.addTo(map);
      
      markersLayer.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
    }

    // Always render markers if layer exists
    if (viewMode === 'map') {
      renderMarkers();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersLayer.current = null;
      }
    };
  }, [viewMode, renderMarkers]);

  // React to data changes
  useEffect(() => {
    if (viewMode === 'map' && mapInstance.current) {
      renderMarkers();
    }
  }, [filteredData, viewMode, renderMarkers]);

  // --- Actions ---
  const handleSchoolNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, school_name: name }));
    const preset = UNIVERSITY_PRESETS[name];
    if (preset) {
      setFormData(prev => ({
        ...prev,
        region: preset.region,
        lat: preset.lat.toString(),
        lng: preset.lng.toString(),
        address: preset.address
      }));
    }
  };

  const toggleProposalType = (type: '교육LMS' | '세미나') => {
    setFormData(prev => ({
      ...prev,
      proposal_types: prev.proposal_types.includes(type)
        ? prev.proposal_types.filter(t => t !== type)
        : [...prev.proposal_types, type]
    }));
  };

  const resetForm = () => {
    setFormData({
      school_name: '', partner_company: '', region: Region.SEOUL, address: '', lat: '', lng: '', amount_sum: '', status: 'EXISTING', proposal_range: '', industry: '반도체', proposal_types: [], contact_info: ''
    });
    setEditingId(null);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UniversityData = {
      school_id: editingId || `S${Date.now()}`,
      school_name: formData.school_name,
      partner_company: formData.partner_company,
      region: formData.region,
      address: formData.address,
      lat: parseFloat(formData.lat) || 0,
      lng: parseFloat(formData.lng) || 0,
      amount_sum: parseInt(formData.amount_sum) || 0,
      status: formData.status,
      proposal_range: formData.proposal_range,
      industry: formData.industry,
      proposal_types: formData.proposal_types,
      contact_info: formData.contact_info
    };

    if (editingId) {
      setData(prev => prev.map(item => item.school_id === editingId ? payload : item));
    } else {
      setData(prev => [...prev, payload]);
    }
    
    resetForm();
    setIsAdminOpen(false);
  };

  const startEdit = (univ: UniversityData) => {
    setEditingId(univ.school_id);
    setFormData({
      school_name: univ.school_name,
      partner_company: univ.partner_company,
      region: univ.region as Region,
      address: univ.address,
      lat: univ.lat.toString(),
      lng: univ.lng.toString(),
      amount_sum: univ.amount_sum.toString(),
      status: univ.status,
      proposal_range: univ.proposal_range,
      industry: univ.industry,
      proposal_types: [...univ.proposal_types],
      contact_info: univ.contact_info || ''
    });
    setIsAdminOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setData(prev => prev.filter(item => item.school_id !== id));
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans overflow-hidden text-slate-900">
      {/* --- HEADER --- */}
      <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-100 shadow-sm z-[1000] shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center pr-6 border-r border-slate-100">
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1 group flex items-center gap-2">
                부트캠프 입찰 현황판 
                <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-sm italic">2026</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Partner Analysis Dashboard</p>
            </div>
          </div>

          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search school or company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-full py-2 pl-9 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Filters Container */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100/50 shadow-inner">
             {/* Status Toggle */}
             <div className="flex items-center px-4 border-r border-slate-200">
                <div className="flex gap-4">
                  {(['ALL', 'EXISTING', 'NEW'] as StatusFilter[]).map(f => (
                    <button 
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={cn(
                        "text-[11px] font-black transition-all relative pb-0.5",
                        statusFilter === f ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {f === 'ALL' ? '전체' : f === 'NEW' ? '입찰대상' : '기존참여'}
                      {statusFilter === f && <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                    </button>
                  ))}
                </div>
             </div>
             
             {/* Industry Dropdown */}
             <div className="flex items-center gap-3 px-4">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Industry</span>
                <select 
                  className="bg-transparent text-[11px] font-black text-slate-700 outline-none cursor-pointer appearance-none pr-4" 
                  value={industryFilter} 
                  onChange={(e) => setIndustryFilter(e.target.value)}
                >
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
             </div>
          </div>

          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-100 shadow-sm">
            <button 
              onClick={() => setViewMode('map')} 
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all",
                viewMode === 'map' ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all",
                viewMode === 'list' ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>
          
          <button 
            onClick={() => { if (isAdminOpen) resetForm(); setIsAdminOpen(!isAdminOpen); }} 
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black transition-all shadow-lg",
              isAdminOpen 
                ? "bg-slate-800 text-white hover:bg-slate-700" 
                : "bg-red-500 text-white shadow-red-200 hover:bg-red-600 hover:-translate-y-0.5 active:translate-y-0"
            )}
          >
            {isAdminOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdminOpen ? '취소' : '데이터 관리'}
          </button>
        </div>
      </header>

      {/* --- MAIN --- */}
      <main className="flex-1 relative overflow-hidden bg-slate-50">
        {/* Map View */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300",
          viewMode === 'map' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
        )}>
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* List View */}
        <div className={cn(
          "absolute inset-0 bg-slate-50/40 backdrop-blur-sm overflow-auto p-8 lg:p-12 transition-all duration-300",
          viewMode === 'list' ? "opacity-100 z-20 translate-y-0" : "opacity-0 z-0 translate-y-12 pointer-events-none"
        )}>
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 flex items-center gap-3">
                  <Globe className="w-10 h-10 text-slate-200" />
                  대학 협력 데이터베이스
                </h2>
                <div className="flex flex-wrap gap-2">
                   <div className="flex items-center gap-2 bg-white border border-slate-200/50 px-4 py-2 rounded-full shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      <span className="text-[11px] font-black text-slate-600">총 {filteredData.length}개 기관</span>
                   </div>
                   <div className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-full shadow-md shadow-blue-100">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      <span className="text-[11px] font-black text-white">{filteredData.filter(d => d.status === 'EXISTING').length}개 기존 참여</span>
                   </div>
                   <div className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full shadow-md shadow-red-100">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      <span className="text-[11px] font-black text-white">{filteredData.filter(d => d.status === 'NEW').length}개 입찰 대상</span>
                   </div>
                </div>
              </div>
              
              <div className="bg-white p-7 rounded-[2.5rem] shadow-xl border border-slate-100 text-right min-w-[340px] relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-[0.2em] mb-1 relative z-10">Total Estimated Amount</span>
                <div className="flex items-baseline justify-end gap-1 relative z-10">
                  <span className="text-lg font-black text-slate-300">₩</span>
                  <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                    {new Intl.NumberFormat('ko-KR').format(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-10 py-6">권역</th>
                    <th className="px-6 py-6">학교명</th>
                    <th className="px-6 py-6">매칭 기업</th>
                    <th className="px-6 py-6">운영기준</th>
                    <th className="px-6 py-6 text-right">견적금액</th>
                    <th className="px-10 py-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.length > 0 ? filteredData.map((univ) => (
                    <tr key={univ.school_id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full shadow-sm ring-4 ring-slate-50" style={{backgroundColor: REGION_COLORS[univ.region]}}></span>
                          <span className="text-xs font-extrabold text-slate-600">{univ.region}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{univ.school_name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{univ.industry}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-bold text-xs text-slate-700">{univ.partner_company}</td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-slate-100 text-[10px] font-extrabold text-slate-500 rounded-full border border-slate-200/50">
                          {univ.proposal_range}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className={cn(
                          "font-black text-sm",
                          univ.amount_sum > 0 ? "text-slate-900" : "text-slate-300 italic font-bold"
                        )}>
                          {formatCurrency(univ.amount_sum)}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => startEdit(univ)} 
                            className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(univ.school_id)} 
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                          <Search className="w-12 h-12 opacity-20" />
                          <p className="font-black text-lg tracking-tight">검색 결과가 없습니다.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- ADMIN MODAL --- */}
        {isAdminOpen && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-[540px] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[92vh] overflow-y-auto relative">
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg",
                    editingId ? "bg-blue-600 shadow-blue-100" : "bg-red-500 shadow-red-100"
                  )}>
                    {editingId ? <Settings2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingId ? '현황 데이터 수정' : '신규 입찰 등록'}
                  </h3>
                </div>
                <button onClick={() => setIsAdminOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-8">
                {/* Status Switcher */}
                <div className="p-1.5 bg-slate-100/80 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2">
                   <button 
                    type="button" 
                    onClick={() => setFormData({...formData, status: 'EXISTING'})} 
                    className={cn(
                      "py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                      formData.status === 'EXISTING' ? "bg-white text-slate-900 shadow-md scale-[1.02]" : "text-slate-400 hover:text-slate-500"
                    )}
                   >
                     {formData.status === 'EXISTING' && <Check className="w-3.5 h-3.5" />}
                     기존 참여 대학
                   </button>
                   <button 
                    type="button" 
                    onClick={() => setFormData({...formData, status: 'NEW'})} 
                    className={cn(
                      "py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                      formData.status === 'NEW' ? "bg-red-500 text-white shadow-lg shadow-red-100 scale-[1.02]" : "text-slate-400 hover:text-slate-500"
                    )}
                   >
                     {formData.status === 'NEW' && <Check className="w-3.5 h-3.5" />}
                     2026 입찰 예정
                   </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">School Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          required 
                          placeholder="한양대, 성균관대 등" 
                          className="w-full p-4 pl-11 text-sm font-bold bg-slate-50 border border-slate-200/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all" 
                          value={formData.school_name} 
                          onChange={e => handleSchoolNameChange(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Partner Agent</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          required 
                          placeholder="고객사/참여기업" 
                          className="w-full p-4 pl-11 text-sm font-bold bg-slate-50 border border-slate-200/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all" 
                          value={formData.partner_company} 
                          onChange={e => setFormData({...formData, partner_company: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-4 tracking-widest">제안 유형 (중복 선택 가능)</span>
                    <div className="flex gap-6">
                      {['교육LMS', '세미나'].map((type) => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={formData.proposal_types.includes(type as any)}
                            onChange={() => toggleProposalType(type as '교육LMS' | '세미나')}
                          />
                          <div className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                            formData.proposal_types.includes(type as any) 
                              ? "bg-slate-900 border-slate-900 ring-4 ring-slate-100" 
                              : "bg-white border-slate-200 group-hover:border-slate-300"
                          )}>
                            {formData.proposal_types.includes(type as any) && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span className={cn(
                            "text-sm font-bold transition-colors",
                            formData.proposal_types.includes(type as any) ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                          )}>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Industry Field</label>
                      <select className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-200/50 rounded-2xl" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                        {INDUSTRIES.filter(i => i !== '전체').map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Regional Area</label>
                      <select className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-200/50 rounded-2xl" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value as Region})}>
                        {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Operational Base</label>
                    <input required placeholder="운영기준 (LMS/오프라인 등)" className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-200/50 rounded-2xl" value={formData.proposal_range} onChange={e => setFormData({...formData, proposal_range: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest text-blue-500">Estimation (₩)</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input required type="number" placeholder="견적 금액 (세금 포함)" className="w-full p-4 pl-11 text-sm font-bold bg-slate-50 border border-slate-200/50 rounded-2xl text-blue-600" value={formData.amount_sum} onChange={e => setFormData({...formData, amount_sum: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Additional Notes</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input placeholder="연구책임자 또는 특이사항" className="w-full p-4 pl-11 text-sm font-bold bg-white border border-slate-200 rounded-2xl shadow-inner outline-none focus:ring-4 focus:ring-slate-50" value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-slate-900 text-white py-4.5 rounded-[1.25rem] font-black shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:translate-y-0"
                  >
                    {editingId ? '업데이트 저장하기' : '데이터베이스 신규 등록'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MAP LEGEND --- */}
        {viewMode === 'map' && (
          <div className="absolute bottom-10 right-10 z-[1000] flex flex-col gap-4 scale-[0.85] origin-bottom-right pointer-events-none sm:pointer-events-auto">
            {/* Legend 1: Markers */}
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl w-64 border border-white shadow-slate-200/50">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                 Marker Identity
               </h3>
               <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-[2.5px] border-white bg-slate-400 shadow-md shadow-slate-200"></div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700">기존 참여 대학</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Registered Partner</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center relative">
                      <div className="absolute w-full h-full rounded-full bg-red-500 opacity-20 marker-bid-ring"></div>
                      <div className="w-4 h-4 rounded-full bg-red-600 border-[2.5px] border-white shadow-lg z-10"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-red-500">2026 입찰 대학</span>
                      <span className="text-[9px] font-bold text-red-300/80 uppercase tracking-tighter leading-none">Priority Target</span>
                    </div>
                  </div>
               </div>
            </div>
            
            {/* Legend 2: Region Colors */}
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl w-64 border border-white shadow-slate-200/50">
               <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region Spectrum</h3>
               </div>
               <div className="grid grid-cols-2 gap-y-3.5 gap-x-2">
                {Object.entries(REGION_COLORS).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full ring-2 ring-slate-50" style={{ backgroundColor: color }}></span>
                    <span className="text-[10px] font-extrabold text-slate-600">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
