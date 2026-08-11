'use client';

import React from 'react';
import { Member } from '../types/generator';
import PhotoUploader from './PhotoUploader';

// Reusable dark-UI field
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold tracking-wide text-[#888] uppercase">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = `w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/[0.07] hover:border-white/[0.14] focus:border-amber-500/50 focus:outline-none font-sans text-[#e0e0e0] text-sm placeholder-[#555] transition-colors backdrop-blur-sm`;

interface SoloFormProps {
  member: Member;
  teamName: string;
  onUpdateMember: (updates: Partial<Member>) => void;
  onUpdateTeamName: (name: string) => void;
}

export function SoloForm({ member, teamName, onUpdateMember, onUpdateTeamName }: SoloFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name" required>
          <input
            id="solo-name"
            type="text"
            placeholder="Siddharth Fernandes"
            value={member.name}
            onChange={(e) => onUpdateMember({ name: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Team Name">
          <input
            id="solo-team"
            type="text"
            placeholder="Goa Hackers"
            value={teamName}
            onChange={(e) => onUpdateTeamName(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Role / Stack" required>
        <input
          id="solo-role"
          type="text"
          placeholder="Fullstack Dev / Next.js / Rust"
          value={member.role}
          onChange={(e) => onUpdateMember({ role: e.target.value })}
          className={inputCls}
        />
      </Field>

      <Field label="Photo">
        <PhotoUploader
          label="Upload Photo"
          hasImage={!!member.imageUrl}
          onImageUploaded={(file, url) => onUpdateMember({ imageFile: file, imageUrl: url })}
          onClear={() => onUpdateMember({ imageFile: null, imageUrl: null })}
        />
      </Field>
    </div>
  );
}

interface TeamFormProps {
  members: Member[];
  teamName: string;
  memberCount: number;
  activeMemberIndex: number;
  onUpdateMember: (index: number, updates: Partial<Member>) => void;
  onUpdateTeamName: (name: string) => void;
  onSelectActiveMember: (index: number) => void;
  onUpdateMemberCount: (count: number) => void;
}

export function TeamForm({
  members,
  teamName,
  memberCount,
  activeMemberIndex,
  onUpdateMember,
  onUpdateTeamName,
  onSelectActiveMember,
  onUpdateMemberCount,
}: TeamFormProps) {
  return (
    <div className="space-y-4">
      {/* Member count segmented control */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold tracking-wide text-[#888] uppercase">
          Team Size
        </label>
        <div className="flex p-1 rounded-xl bg-black/30 border border-white/[0.06] gap-1">
          {[2, 3].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onUpdateMemberCount(count)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-bold tracking-widest transition-all cursor-pointer ${
                memberCount === count
                  ? 'bg-amber-500 text-[#0a0a0a] shadow-[0_2px_8px_rgba(245,158,11,0.35)]'
                  : 'text-[#666] hover:text-[#aaa]'
              }`}
            >
              {count} BUILDERS
            </button>
          ))}
        </div>
      </div>

      {/* Team name */}
      <Field label="Team Name" required>
        <input
          id="team-name-input"
          type="text"
          placeholder="Goan Coders Alliance"
          value={teamName}
          onChange={(e) => onUpdateTeamName(e.target.value)}
          className={inputCls}
        />
      </Field>

      {/* Member accordion */}
      <div className="space-y-2 pt-1">
        {members.slice(0, memberCount).map((member, idx) => {
          const isSelected = activeMemberIndex === idx;
          return (
            <div
              key={member.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isSelected ? 'border-amber-500/30 bg-white/[0.06]' : 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]'
              }`}
            >
              {/* Accordion header */}
              <button
                type="button"
                onClick={() => onSelectActiveMember(idx)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold border transition-colors ${
                    isSelected ? 'bg-amber-500 border-amber-500 text-[#0a0a0a]' : 'bg-transparent border-[#2a2a2a] text-[#666]'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-[#ccc]">
                    {member.name || `Member ${idx + 1}`}
                  </span>
                </div>
                  <span className={`text-[11px] font-mono transition-colors ${isSelected ? 'text-amber-400' : 'text-[#777] hover:text-[#aaa]'}`}>
                  {isSelected ? 'Editing' : 'Edit'}
                </span>
              </button>

              {/* Expanded inputs */}
              {isSelected && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#1e1e1e]">
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <Field label="Name" required>
                      <input
                        id={`member-${idx}-name`}
                        type="text"
                        placeholder="Anand Salgaonkar"
                        value={member.name}
                        onChange={(e) => onUpdateMember(idx, { name: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Role" required>
                      <input
                        id={`member-${idx}-role`}
                        type="text"
                        placeholder="Smart Contract Dev"
                        value={member.role}
                        onChange={(e) => onUpdateMember(idx, { role: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <PhotoUploader
                    label={`Photo — Member ${idx + 1}`}
                    hasImage={!!member.imageUrl}
                    onImageUploaded={(file, url) => onUpdateMember(idx, { imageFile: file, imageUrl: url })}
                    onClear={() => onUpdateMember(idx, { imageFile: null, imageUrl: null })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
