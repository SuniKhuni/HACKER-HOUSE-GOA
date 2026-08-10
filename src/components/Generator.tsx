'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TEMPLATES } from '../config/templates';
import { Member, ImageTransform, TemplateConfig } from '../types/generator';
import { SoloForm, TeamForm } from './Forms';
import ImageControls from './ImageControls';
import ExportButtons from './ExportButtons';

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
  const [selectedFont, setSelectedFont] = useState<string>('Outfit');
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: LIVE CANVAS PREVIEW */}
      <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center space-y-6">
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

        {/* Global Action Reset Buttons */}
        <div className="flex flex-wrap justify-center gap-3 w-full max-w-md px-4">
          <button
            type="button"
            onClick={handleResetActivePhoto}
            disabled={!members[activeMemberIndex]?.imageUrl}
            className="flex-1 min-w-[120px] py-2 px-3 rounded-xl border border-emerald-800/60 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 font-mono text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Reset Photo
          </button>
          <button
            type="button"
            onClick={handleResetTemplate}
            className="flex-1 min-w-[120px] py-2 px-3 rounded-xl border border-emerald-800/60 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 font-mono text-xs font-semibold transition-colors"
          >
            Reset Template
          </button>
          <button
            type="button"
            onClick={handleStartOver}
            className="flex-1 min-w-[120px] py-2 px-3 rounded-xl border border-rose-950/80 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 font-mono text-xs font-semibold transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: EDITOR CONTROLS & FORMS */}
      <div className="lg:col-span-6 xl:col-span-5 space-y-6">
        {/* Step 1: Mode & Template Selection */}
        <div className="p-6 rounded-2xl glass-panel border-emerald-950/50 space-y-4 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-emerald-400 font-semibold font-mono text-xs uppercase tracking-wider">
              Step 1: Choose Layout Mode
            </h2>
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-emerald-950">
              <button
                type="button"
                onClick={() => handleTemplateChange('solo_square')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold font-sans transition-all ${
                  isSolo
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                    : 'text-emerald-400 hover:text-emerald-200'
                }`}
              >
                SOLO
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('team_two')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold font-sans transition-all ${
                  !isSolo
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                    : 'text-emerald-400 hover:text-emerald-200'
                }`}
              >
                TEAM
              </button>
            </div>
          </div>

          {/* Sub Template Carousel */}
          <div className="space-y-2">
            <span className="block text-xs font-mono text-emerald-400/80">
              Select Overlay Frame Format:
            </span>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.filter((t) => (isSolo ? t.type === 'solo' : t.type === 'team')).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplateChange(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplateId === t.id
                      ? 'border-amber-400 bg-amber-400/5 text-amber-300'
                      : 'border-emerald-950/60 bg-zinc-950/50 text-emerald-300 hover:border-emerald-500/20'
                  }`}
                >
                  <p className="text-xs font-bold font-sans">{t.name}</p>
                  <p className="text-[10px] font-mono text-emerald-500 mt-0.5">
                    {t.width}×{t.height} px
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector Control */}
          <div className="space-y-2">
            <label htmlFor="font-select" className="block text-xs font-mono text-emerald-400/80">
              Select Typography Font Style:
            </label>
            <select
              id="font-select"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-emerald-950/60 focus:border-amber-400 focus:outline-none font-mono text-xs text-emerald-300"
            >
              <option value="Outfit">Outfit (Clean Geometry)</option>
              <option value="Space Grotesk">Space Grotesk (Tech Modern)</option>
              <option value="JetBrains Mono">JetBrains Mono (Developer Mono)</option>
              <option value="Bungee">Bungee (Creative Bold)</option>
            </select>
          </div>
        </div>

        {/* Step 2: Information inputs Form */}
        <div className="p-6 rounded-2xl glass-panel border-emerald-950/50 space-y-4 shadow-xl">
          <h2 className="text-emerald-400 font-semibold font-mono text-xs uppercase tracking-wider mb-2">
            Step 2: Enter ID Details
          </h2>
          
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

        {/* Step 3: Interactive Transforms slider controls */}
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

        {/* Step 4: Export and Share actions */}
        <div className="p-6 rounded-2xl glass-panel border-emerald-950/50 shadow-xl">
          <h2 className="text-emerald-400 font-semibold font-mono text-xs uppercase tracking-wider mb-4">
            Step 3: Download & Share
          </h2>
          
          <ExportButtons
            stageRef={stageRef}
            templateScale={previewWidth / activeTemplate.width}
            templateType={activeTemplate.type}
            teamName={teamName}
            hasPhotos={hasPhotos}
            hasNames={hasNames}
          />
        </div>
      </div>
    </div>
  );
}
