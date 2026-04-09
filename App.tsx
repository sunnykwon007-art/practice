
import React, { useEffect, useRef, useState } from 'react';
import { MOCK_DATA, REGION_COLORS, UNIVERSITY_PRESETS } from './constants';
import { UniversityData, Region } from './types';
import { getAllData, addUniversity, updateUniversity, deleteUniversity } from './supabase';

declare const L: any;

type ViewMode = 'map' | 'list';
type StatusFilter = 'ALL' | 'NEW' | 'EXISTING';

const App: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  
  // 로컬스토리지에서 먼저 데이터 로드 시도
  const [data, setData] = useState<UniversityData[]>(() => {
    try {
      const saved = localStorage.getItem('univ_dashboard_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('로컬스토리지 파싱 오류:', error);
    }
    return MOCK_DATA;
  });
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string>('전체');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

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

  const industries = ['전체', '반도체', '이차전지', '바이오', '디스플레이', '항공우주', '미래차', '인공지능'];

  // 로컬스토리지에 데이터 저장
  useEffect(() => {
    if (data && data.length > 0) {
      try {
        localStorage.setItem('univ_dashboard_data', JSON.stringify(data));
      } catch (error) {
        console.warn('로컬스토리지 저장 오류:', error);
      }
    }
  }, [data]);

  // Supabase 데이터 로드 (선택사항)
  useEffect(() => {
    const loadSupabaseData = async () => {
      try {
        setIsLoading(true);
        const supabaseData = await getAllData();
        
        // Supabase 데이터가 있고 로컬스토리지가 비어있으면 사용
        if (supabaseData.length > 0 && localStorage.getItem('univ_dashboard_data') === null) {
          setData(supabaseData);
        }
      } catch (error) {
        console.warn('Supabase 로드 실패 (로컬스토리지 사용):', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSupabaseData();
  }, []);

  const handleSchoolNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, school_name: name }));
    const preset = UNIVERSITY_PRESETS[name];
    if (preset) {
      setFormData(prev => ({
        ...prev,
        school_name: name,
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

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "₩ 0 (미정)";
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency', currency: 'KRW', maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredData = data.filter(item => 
    (industryFilter === '전체' || item.industry === industryFilter) &&
    (statusFilter === 'ALL' || item.status === statusFilter)
  );

  const calculateRadius = (amount: number) => {
    if (amount === 0) return 9;
    const logValue = Math.log10(amount || 1);
    const radius = 7 + logValue * 4.5;
    return Math.min(Math.max(radius, 11), 38);
  };

  const renderMarkers = () => {
    if (!mapInstance.current || !markersLayer.current || viewMode !== 'map') return;
    
    markersLayer.current.clearLayers();

    filteredData.forEach((univ) => {
      const color = REGION_COLORS[univ.region] || REGION_COLORS[Region.ETC];
      const radius = calculateRadius(univ.amount_sum);
      const isNew = univ.status === 'NEW';
      
      const markerStyle = {
        radius: radius,
        fillColor: color,
        color: isNew ? '#EF4444' : '#FFFFFF', 
        weight: isNew ? 2 : 1.2,
        opacity: 1,
        fillOpacity: 0.75,
        className: isNew ? 'marker-bid-target' : 'marker-stable'
      };

      const circle = L.circleMarker([univ.lat, univ.lng], markerStyle);

      const statusBadge = isNew 
        ? `<span style="font-size: 9px; background: #EF4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 900; margin-left: 6px; box-shadow: 0 2px 4px rgba(239,68,68,0.2);">2026 프로젝트진행</span>`
        : `<span style="font-size: 9px; background: #64748b; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 800; margin-left: 6px;">기존참여</span>`;

      const proposalTags = univ.proposal_types.map(t => 
        `<span style="font-size: 9px; padding: 1px 5px; border-radius: 4px; font-weight: 800; margin-right: 4px; background: ${t === '교육LMS' ? '#EFF6FF' : '#F5F3FF'}; color: ${t === '교육LMS' ? '#2563EB' : '#7C3AED'}; border: 1px solid ${t === '교육LMS' ? '#DBEAFE' : '#EDE9FE'};">#${t}</span>`
      ).join('');

      const contactSection = univ.contact_info 
        ? `<div style="margin-top: 8px; font-size: 9px; color: #64748b; font-weight: 500; border-top: 1px solid #f1f5f9; padding-top: 6px;">
            <span style="font-weight: 800; color: #94a3b8;">[연구책임자]</span> ${univ.contact_info}
           </div>`
        : '';

      const popupContent = `
        <div style="padding: 12px; font-family: 'Pretendard', sans-serif; width: 230px;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 9px; color: white; background: ${color}; font-weight: 800; padding: 1px 5px; border-radius: 3px;">${univ.industry}</span>
            ${statusBadge}
          </div>
          <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-bottom: 1px; letter-spacing: -0.02em;">${univ.school_name}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px; font-weight: 600;">${univ.address}</div>
          
          <div style="background: #f8fafc; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #f1f5f9;">
            <div style="font-size: 8px; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 2px;">참여 기업</div>
            <div style="font-size: 12px; color: #1e293b; font-weight: 800; line-height: 1.3;">${univ.partner_company}</div>
          </div>

          <div style="margin-bottom: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
            ${proposalTags || '<span style="font-size: 8px; color: #cbd5e1; font-weight: 700;">제안 유형 미정</span>'}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: baseline; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
            <span style="font-size: 9px; color: #94a3b8; font-weight: 700;">견적 규모</span>
            <span style="font-size: 14px; font-weight: 900; color: ${color};">${formatCurrency(univ.amount_sum)}</span>
          </div>
          ${contactSection}
        </div>
      `;

      circle.bindPopup(popupContent, { 
        closeButton: false, 
        offset: [0, -5],
        className: 'custom-university-popup'
      }).addTo(markersLayer.current);
    });
  };

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
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      
      markersLayer.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
      renderMarkers();
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'map') renderMarkers();
  }, [filteredData, viewMode]);

  const resetForm = () => {
    setFormData({
      school_name: '', partner_company: '', region: Region.SEOUL, address: '', lat: '', lng: '', amount_sum: '', status: 'EXISTING', proposal_range: '', industry: '반도체', proposal_types: [], contact_info: ''
    });
    setEditingId(null);
  };

  const handleAddOrUpdateData = async (e: React.FormEvent) => {
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

    try {
      if (editingId) {
        // Supabase에 업데이트
        await updateUniversity(editingId, payload);
        setData(prev => prev.map(item => item.school_id === editingId ? payload : item));
      } else {
        // Supabase에 추가
        await addUniversity(payload);
        setData(prev => [...prev, payload]);
      }
      
      resetForm();
      setIsAdminOpen(false);
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      alert('데이터 저장에 실패했습니다.');
    }
  };

  const handleDeleteUniversity = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await deleteUniversity(id);
      setData(prev => prev.filter(item => item.school_id !== id));
    } catch (error) {
      console.error('데이터 삭제 실패:', error);
      alert('데이터 삭제에 실패했습니다.');
    }
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

  const totalAmount = filteredData.reduce((acc, cur) => acc + cur.amount_sum, 0);

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans overflow-hidden text-slate-900">
      <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-100 shadow-sm z-[1000] shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center pr-6 border-r border-slate-100">
              <div className="flex flex-col">
                  <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1">부트캠프 입찰 현황판 <span className="text-red-500">2026</span></h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Partner Analysis Dashboard</p>
              </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
             <div className="flex flex-col px-4 border-r border-slate-200">
                <span className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Filter</span>
                <div className="flex gap-4">
                  {(['ALL', 'EXISTING', 'NEW'] as StatusFilter[]).map(f => (
                    <button 
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`text-[11px] font-bold transition-colors ${statusFilter === f ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {f === 'ALL' ? '전체' : f === 'NEW' ? '진행프로젝트' : '기존참여'}
                    </button>
                  ))}
                </div>
             </div>
             <div className="flex flex-col px-4 min-w-[120px]">
                <span className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Industry</span>
                <select className="bg-transparent text-[11px] font-bold text-slate-700 outline-none cursor-pointer" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
                    {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
             </div>
          </div>

          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-100">
            <button onClick={() => setViewMode('map')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>Map</button>
            <button onClick={() => setViewMode('list')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>List</button>
          </div>
          
          <button onClick={() => { if (isAdminOpen) resetForm(); setIsAdminOpen(!isAdminOpen); }} className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${isAdminOpen ? 'bg-slate-800 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-100 hover:scale-[1.02]'}`}>
            {isAdminOpen ? '취소' : '데이터 관리'}
          </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden bg-slate-50">
        <div className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div ref={mapContainerRef} id="map" className="w-full h-full" />
        </div>

        <div className={`absolute inset-0 bg-slate-50 overflow-auto p-12 transition-opacity duration-300 ${viewMode === 'list' ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">2026 대학부트캠프 AX_PJT</h2>
                <div className="flex gap-2">
                   <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">총 {filteredData.length}개 기관</span>
                   <span className="text-[11px] font-bold text-white bg-blue-500 px-4 py-1.5 rounded-full shadow-md shadow-blue-100">{filteredData.filter(d => d.status === 'EXISTING').length}개 기존 참여</span>
                   <span className="text-[11px] font-bold text-white bg-red-500 px-4 py-1.5 rounded-full shadow-md shadow-red-100">{filteredData.filter(d => d.status === 'NEW').length}개 입찰 대상</span>
                </div>
              </div>
              <div className="bg-white p-7 rounded-[2rem] shadow-xl border border-slate-100 text-right min-w-[340px]">
                <span className="text-[10px] text-slate-400 font-black block uppercase tracking-[0.2em] mb-1">Total Estimated Amount</span>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-lg font-black text-slate-300">₩</span>
                  <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{new Intl.NumberFormat('ko-KR').format(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-10 py-6">권역</th>
                    <th className="px-6 py-6">학교명</th>
                    <th className="px-6 py-6">운영기준</th>
                    <th className="px-6 py-6">연구책임자(임시)</th>
                    <th className="px-6 py-6 text-right">견적금액</th>
                    <th className="px-10 py-6 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((univ) => (
                    <tr key={univ.school_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{backgroundColor: REGION_COLORS[univ.region]}}></span>
                          <span className="text-xs font-bold text-slate-600">{univ.region}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6"><div className="text-sm font-black text-slate-900">{univ.school_name}</div></td>
                      <td className="px-6 py-6"><div className="text-sm font-bold text-slate-700">{univ.proposal_range}</div></td>
                      <td className="px-6 py-6"><div className="text-[11px] font-bold text-slate-500 truncate max-w-[150px]">{univ.contact_info || '-'}</div></td>
                      <td className="px-6 py-6 text-right font-black text-sm text-slate-800">{formatCurrency(univ.amount_sum)}</td>
                      <td className="px-10 py-6 text-center flex items-center justify-center gap-2">
                        <button onClick={() => startEdit(univ)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors" title="수정"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => handleDeleteUniversity(univ.school_id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="삭제"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isAdminOpen && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/30 backdrop-blur-md pointer-events-auto">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-[500px] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingId ? '현황 데이터 수정' : '신규 입찰 등록'}</h3>
                <button onClick={() => setIsAdminOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleAddOrUpdateData} className="space-y-6">
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-100">
                   <button type="button" onClick={() => setFormData({...formData, status: 'EXISTING'})} className={`py-3 rounded-xl text-xs font-black transition-all ${formData.status === 'EXISTING' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>기존 참여 대학</button>
                   <button type="button" onClick={() => setFormData({...formData, status: 'NEW'})} className={`py-3 rounded-xl text-xs font-black transition-all ${formData.status === 'NEW' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400'}`}>2026 프로젝트진행</button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="학교명" className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.school_name} onChange={e => handleSchoolNameChange(e.target.value)} />
                    <input required placeholder="고객사/참여기업" className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.partner_company} onChange={e => setFormData({...formData, partner_company: e.target.value})} />
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-3">제안 유형 (중복 선택 가능)</span>
                    <div className="flex gap-4">
                      {['교육LMS', '세미나'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                          <div 
                            onClick={() => toggleProposalType(type as '교육LMS' | '세미나')}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.proposal_types.includes(type as any) ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                          >
                            {formData.proposal_types.includes(type as any) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                          </div>
                          <span className={`text-sm font-bold ${formData.proposal_types.includes(type as any) ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <select className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                      {industries.filter(i => i !== '전체').map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <select className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value as Region})}>
                      {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <input required placeholder="운영기준 (LMS/오프라인 등)" className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl" value={formData.proposal_range} onChange={e => setFormData({...formData, proposal_range: e.target.value})} />
                  <input required type="number" placeholder="견적 금액 (₩, 부가세포함)" className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl" value={formData.amount_sum} onChange={e => setFormData({...formData, amount_sum: e.target.value})} />
                  <input placeholder="연구책임자(임시) 등 비고" className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-xl hover:bg-slate-800 transition-all">데이터베이스 업데이트</button>
              </form>
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="absolute bottom-10 right-10 z-[1000] flex flex-col gap-4 scale-90 origin-bottom-right">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl w-64 border border-slate-100">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Marker Identity</h3>
               <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-full border-[2px] border-white bg-slate-400 shadow-sm"></div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700">기존 참여 대학</span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter leading-none">Established Partner</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-7 h-7 flex items-center justify-center relative">
                      <div className="absolute w-full h-full rounded-full bg-red-500 opacity-25 marker-bid-ring"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white shadow-md z-10"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-red-500">2026 프로젝트진행</span>
                      <span className="text-[9px] font-bold text-red-300 uppercase tracking-tighter leading-none">Modu Project In Progress</span>
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl w-64 border border-slate-100">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region Colors</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                {Object.entries(REGION_COLORS).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: color }}></span>
                    <span className="text-[10px] font-bold text-slate-600">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        .marker-bid-target {
          animation: bid-glow 2s infinite ease-in-out;
        }
        @keyframes bid-glow {
          0% { stroke-width: 2; stroke-opacity: 1; }
          50% { stroke-width: 6; stroke-opacity: 0.4; }
          100% { stroke-width: 2; stroke-opacity: 1; }
        }
        .marker-bid-ring {
          animation: bid-ring-expand 2.5s infinite;
        }
        @keyframes bid-ring-expand {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(3); opacity: 0; }
        }
        .marker-stable {
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
        }
        .leaflet-container {
          background: #fdfdfd !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.15) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .custom-university-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default App;
