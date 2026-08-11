'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TEMPLATES } from '../config/templates';
import { Member, ImageTransform, TemplateConfig } from '../types/generator';
import { SoloForm, TeamForm } from './Forms';
import ImageControls from './ImageControls';
import ExportButtons from './ExportButtons';
import TypographySelect from './TypographySelect';

// Load CanvasEditor dynamically with ssr: false to prevent Next.js server-side build failures
const CanvasEditor = dynamic(() => import('./CanvasEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-[500px] h-[500px] max-w-full rounded-2xl bg-zinc-950/60 border border-emerald-950 flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-mono text-emerald-300">Loading Graphics Engine...</p>
    </div>
  ),
});

// Helper for image scaling math (covering fit)
function getDefaultTransform(
  imgWidth: number,
  imgHeight: number,
  slotWidth: number,
  slotHeight: number
): ImageTransform {
  const scale = Math.max(slotWidth / imgWidth, slotHeight / imgHeight);
  
  // Since Konva Image offsets the drawing point by half of its width/height
  // (to rotate/zoom around center), we position the node at the center of the slot:
  return {
    x: slotWidth / 2,
    y: slotHeight / 2,
    scaleX: scale,
    scaleY: scale,
    rotation: 0,
  };
}

export default function Generator() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('solo_square');
  const [teamName, setTeamName] = useState<string>('');
  const [selectedFont, setSelectedFont] = useState<string>('Sora');
  const [activeMemberIndex, setActiveMemberIndex] = useState<number>(0);
  const [previewWidth, setPreviewWidth] = useState<number>(500);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  const stageRef = useRef<any>(null);

  // Core members state (store up to 3 members to reuse data when swapping templates)
  const [members, setMembers] = useState<Member[]>([
    {
      id: 'member_0',
      name: '',
      role: '',
      imageFile: null,
      imageUrl: null,
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    },
    {
      id: 'member_1',
      name: '',
      role: '',
      imageFile: null,
      imageUrl: null,
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    },
    {
      id: 'member_2',
      name: '',
      role: '',
      imageFile: null,
      imageUrl: null,
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    },
  ]);

  // Lookup currently selected template config
  const activeTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  // Adjust preview width based on wrapper div size for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        // Leave some margin or limit max width
        const width = Math.min(
          previewContainerRef.current.clientWidth - 16,
          activeTemplate.type === 'team' ? 700 : 500
        );
        setPreviewWidth(width);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTemplate]);

  // Handle template selection changes
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    
    // Auto-adjust active editor index if out of range for the new template
    const newTemplate = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
    if (activeMemberIndex >= newTemplate.memberCount) {
      setActiveMemberIndex(0);
    }

    // Re-verify and compute positions if images are already uploaded
    // (Ensure the default transforms are updated for the new template slot dimensions!)
    members.forEach((m, idx) => {
      if (m.imageUrl && newTemplate.photoAreas[idx]) {
        const img = new window.Image();
        img.src = m.imageUrl;
        img.onload = () => {
          const slot = newTemplate.photoAreas[idx];
          const newTransform = getDefaultTransform(img.width, img.height, slot.width, slot.height);
          setMembers((prev) =>
            prev.map((pm, pi) =>
              pi === idx ? { ...pm, transform: newTransform } : pm
            )
          );
        };
      }
    });
  };

  // Helper when an image is uploaded for a slot
  const handleImageUploaded = (index: number, file: File, url: string) => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      const slot = activeTemplate.photoAreas[index] || activeTemplate.photoAreas[0];
      const defaultTransform = getDefaultTransform(img.width, img.height, slot.width, slot.height);
      
      setMembers((prev) =>
        prev.map((m, idx) =>
          idx === index
            ? {
                ...m,
                imageFile: file,
                imageUrl: url,
                transform: defaultTransform,
              }
            : m
        )
      );
    };
  };

  // Helper to clear an image slot
  const handleImageCleared = (index: number) => {
    setMembers((prev) =>
      prev.map((m, idx) =>
        idx === index
          ? {
              ...m,
              imageFile: null,
              imageUrl: null,
              transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
            }
          : m
      )
    );
  };

  // Sliders/drag update member transforms
  const handleUpdateMemberTransform = (index: number, updates: Partial<ImageTransform>) => {
    setMembers((prev) =>
      prev.map((m, idx) =>
        idx === index
          ? {
              ...m,
              transform: { ...m.transform, ...updates },
            }
          : m
      )
    );
  };

  const handleUpdateMember = (index: number, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m, idx) => (idx === index ? { ...m, ...updates } : m))
    );
  };

  // RESET TRIGGERS:
  
  // 1. Reset Photo position & scale for the active member
  const handleResetActivePhoto = () => {
    const member = members[activeMemberIndex];
    if (member && member.imageUrl) {
      const img = new window.Image();
      img.src = member.imageUrl;
      img.onload = () => {
        const slot = activeTemplate.photoAreas[activeMemberIndex];
        const newTransform = getDefaultTransform(img.width, img.height, slot.width, slot.height);
        handleUpdateMemberTransform(activeMemberIndex, newTransform);
      };
    }
  };

  // 2. Reset template positions & texts (Transforms back to default, clean names)
  const handleResetTemplate = () => {
    // Clear texts
    setTeamName('');
    setMembers((prev) =>
      prev.map((m, idx) => {
        const updated = { ...m, name: '', role: '' };
        // If image exists, recalculate covering transform
        if (m.imageUrl && activeTemplate.photoAreas[idx]) {
          const img = new window.Image();
          img.src = m.imageUrl;
          img.onload = () => {
            const slot = activeTemplate.photoAreas[idx];
            updated.transform = getDefaultTransform(img.width, img.height, slot.width, slot.height);
          };
        }
        return updated;
      })
    );
  };

  // 3. Start over completely (Clear all files, names, team names, resets)
  const handleStartOver = () => {
    setTeamName('');
    setMembers([
      {
        id: 'member_0',
        name: '',
        role: '',
        imageFile: null,
        imageUrl: null,
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      },
      {
        id: 'member_1',
        name: '',
        role: '',
        imageFile: null,
        imageUrl: null,
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      },
      {
        id: 'member_2',
        name: '',
        role: '',
        imageFile: null,
        imageUrl: null,
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      },
    ]);
    setActiveMemberIndex(0);
    setSelectedTemplateId('solo_square');
  };

  // Validation checkers for disabling download/share buttons
  const isSolo = activeTemplate.type === 'solo';
  const displayCount = isSolo ? 1 : activeTemplate.memberCount;
  
  const hasPhotos = members
    .slice(0, displayCount)
    .every((m) => !!m.imageUrl);
    
  const hasNames = members
    .slice(0, displayCount)
    .every((m) => !!m.name.trim() && !!m.role.trim());

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
      {/* LEFT COLUMN: LIVE CANVAS PREVIEW & EXPORT ACTIONS */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col items-center space-y-4">
        <div ref={previewContainerRef} className="w-full flex justify-center items-center">
          <CanvasEditor
            template={activeTemplate}
            members={members.slice(0, displayCount)}
            teamName={teamName}
            activeMemberIndex={activeMemberIndex}
            selectedFont={selectedFont}
            stageRef={stageRef}
            onUpdateMemberTransform={handleUpdateMemberTransform}
            onSelectMember={setActiveMemberIndex}
            previewWidth={previewWidth}
          />
        </div>

        {/* Export and Share Actions */}
        <div className="w-full max-w-[500px] px-1">
          <ExportButtons
            stageRef={stageRef}
            templateScale={previewWidth / activeTemplate.width}
            templateType={activeTemplate.type}
            teamName={teamName}
            hasPhotos={hasPhotos}
            hasNames={hasNames}
          />
        </div>

        {/* Global Action Reset Links */}
        <div className="flex justify-center items-center gap-4 w-full max-w-[500px] text-[11.5px] font-mono text-[#888] select-none pt-1">
          <button
            type="button"
            onClick={handleResetActivePhoto}
            disabled={!members[activeMemberIndex]?.imageUrl}
            className="hover:text-amber-400 disabled:opacity-30 disabled:hover:text-[#888] cursor-pointer transition-colors"
          >
            Reset Photo
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={handleResetTemplate}
            className="hover:text-white cursor-pointer transition-colors"
          >
            Reset Template
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={handleStartOver}
            className="hover:text-rose-400 cursor-pointer transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: DARK UI CARDS */}
      <div className="md:col-span-5 lg:col-span-4 space-y-3">

        {/* ── Card 1: Layout & Format ── */}
        <div className="rounded-2xl bg-black/55 backdrop-blur-2xl border border-white/[0.10] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.08]">
            <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="text-[13px] font-semibold text-[#ddd] tracking-wide">Layout & Format</span>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Solo / Team segmented control */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold tracking-wide text-[#999] uppercase">Mode</label>
              <div className="flex p-1 rounded-xl bg-black/30 border border-white/[0.06] gap-1">
                <button
                  type="button"
                  onClick={() => handleTemplateChange('solo_square')}
                  className={`flex-1 py-2 rounded-lg text-[12px] font-bold tracking-widest transition-all cursor-pointer ${
                    isSolo
                      ? 'bg-amber-500 text-[#0a0a0a] shadow-[0_2px_8px_rgba(245,158,11,0.35)]'
                      : 'text-[#555] hover:text-[#aaa]'
                  }`}
                >
                  SOLO
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('team_two')}
                  className={`flex-1 py-2 rounded-lg text-[12px] font-bold tracking-widest transition-all cursor-pointer ${
                    !isSolo
                      ? 'bg-amber-500 text-[#0a0a0a] shadow-[0_2px_8px_rgba(245,158,11,0.35)]'
                      : 'text-[#555] hover:text-[#aaa]'
                  }`}
                >
                  TEAM
                </button>
              </div>
            </div>

            {/* Frame format grid */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold tracking-wide text-[#999] uppercase">Frame Format</label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.filter((t) => (isSolo ? t.type === 'solo' : t.type === 'team')).map((t, idx) => {
                  const isActive = selectedTemplateId === t.id;
                  // First button: amber tinted — Second button: indigo/slate tinted
                  const activeStyle = isActive
                    ? (idx === 0
                      ? 'border-amber-500/70 bg-amber-500/12 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)]'
                      : 'border-indigo-400/60 bg-indigo-500/10 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]')
                    : (idx === 0
                      ? 'border-amber-500/10 bg-amber-500/[0.03] hover:border-amber-500/25'
                      : 'border-indigo-500/10 bg-indigo-500/[0.03] hover:border-indigo-400/25');
                  const textActive = isActive
                    ? (idx === 0 ? 'text-amber-400' : 'text-indigo-300')
                    : (idx === 0 ? 'text-amber-500/50 group-hover:text-amber-400/80' : 'text-indigo-400/50 group-hover:text-indigo-300/80');
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTemplateChange(t.id)}
                      className={`px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer group ${activeStyle}`}
                    >
                      <p className={`text-[12px] font-semibold transition-colors ${textActive}`}>{t.name}</p>
                      <p className="text-[10px] font-mono text-[#444] mt-0.5">{t.width}×{t.height}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Typography Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold tracking-wide text-[#999] uppercase">Typography</label>
              <TypographySelect
                value={selectedFont}
                onChange={(font) => setSelectedFont(font)}
              />
            </div>
          </div>
        </div>

        {/* ── Card 2: Identity Credentials ── */}
        <div className="rounded-2xl bg-black/55 backdrop-blur-2xl border border-white/[0.10] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.08]">
            <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[13px] font-semibold text-[#ddd] tracking-wide">Identity Credentials</span>
          </div>

          <div className="px-5 py-4">
            {isSolo ? (
              <SoloForm
                member={members[0]}
                teamName={teamName}
                onUpdateMember={(updates) => handleUpdateMember(0, updates)}
                onUpdateTeamName={setTeamName}
              />
            ) : (
              <TeamForm
                members={members}
                teamName={teamName}
                memberCount={activeTemplate.memberCount}
                activeMemberIndex={activeMemberIndex}
                onUpdateMember={handleUpdateMember}
                onUpdateTeamName={setTeamName}
                onSelectActiveMember={setActiveMemberIndex}
                onUpdateMemberCount={(count) => handleTemplateChange(count === 2 ? 'team_two' : 'team_three')}
              />
            )}
          </div>
        </div>

        {/* ── Card 3: Composition Controls (Conditional) ── */}
        {members[activeMemberIndex]?.imageUrl && (
          <ImageControls
            memberName={
              isSolo ? members[0].name : members[activeMemberIndex].name || `Member ${activeMemberIndex + 1}`
            }
            transform={members[activeMemberIndex].transform}
            onUpdateTransform={(updates) => handleUpdateMemberTransform(activeMemberIndex, updates)}
            onReset={handleResetActivePhoto}
          />
        )}
      </div>
    </div>
  );
}
