'use client';

import React from 'react';
import { Member } from '../types/generator';
import PhotoUploader from './PhotoUploader';

interface SoloFormProps {
  member: Member;
  teamName: string;
  onUpdateMember: (updates: Partial<Member>) => void;
  onUpdateTeamName: (name: string) => void;
}

export function SoloForm({
  member,
  teamName,
  onUpdateMember,
  onUpdateTeamName,
}: SoloFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="solo-name" className="block text-sm font-semibold text-emerald-400 font-sans">
            Name <span className="text-amber-400">*</span>
          </label>
          <input
            id="solo-name"
            type="text"
            required
            placeholder="e.g. Siddharth Fernandes"
            value={member.name}
            onChange={(e) => onUpdateMember({ name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-950/60 focus:border-amber-400 focus:outline-none font-sans text-emerald-100 text-sm"
          />
        </div>

        {/* Team Name */}
        <div className="space-y-1.5">
          <label htmlFor="solo-team" className="block text-sm font-semibold text-emerald-400 font-sans">
            Team Name
          </label>
          <input
            id="solo-team"
            type="text"
            placeholder="e.g. Goa Hackers"
            value={teamName}
            onChange={(e) => onUpdateTeamName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-950/60 focus:border-amber-400 focus:outline-none font-sans text-emerald-100 text-sm"
          />
        </div>
      </div>

      {/* Role / Stack */}
      <div className="space-y-1.5">
        <label htmlFor="solo-role" className="block text-sm font-semibold text-emerald-400 font-sans">
          Role / Stack <span className="text-amber-400">*</span>
        </label>
        <input
          id="solo-role"
          type="text"
          required
          placeholder="e.g. Fullstack Dev / Next.js / Rust"
          value={member.role}
          onChange={(e) => onUpdateMember({ role: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-950/60 focus:border-amber-400 focus:outline-none font-sans text-emerald-100 text-sm"
        />
      </div>

      {/* Upload Photo */}
      <div className="pt-2">
        <PhotoUploader
          label="Upload Photo"
          hasImage={!!member.imageUrl}
          onImageUploaded={(file, url) => onUpdateMember({ imageFile: file, imageUrl: url })}
          onClear={() => onUpdateMember({ imageFile: null, imageUrl: null })}
        />
      </div>
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
    <div className="space-y-5">
      {/* Number of Members Selector */}
      <div className="space-y-2">
        <span className="block text-sm font-semibold text-emerald-400 font-sans">
          How many members?
        </span>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => onUpdateMemberCount(2)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              memberCount === 2
                ? 'bg-amber-400 border-amber-400 text-emerald-950 glow-gold'
                : 'bg-zinc-900 border-emerald-950/60 text-emerald-300 hover:border-emerald-500/20'
            }`}
            aria-label="Two members mode"
          >
            👥 2 MEMBERS
          </button>
          <button
            type="button"
            onClick={() => onUpdateMemberCount(3)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              memberCount === 3
                ? 'bg-amber-400 border-amber-400 text-emerald-950 glow-gold'
                : 'bg-zinc-900 border-emerald-950/60 text-emerald-300 hover:border-emerald-500/20'
            }`}
            aria-label="Three members mode"
          >
            👥👥 3 MEMBERS
          </button>
        </div>
      </div>

      {/* Team Name */}
      <div className="space-y-1.5">
        <label htmlFor="team-name-input" className="block text-sm font-semibold text-emerald-400 font-sans">
          Team Name <span className="text-amber-400">*</span>
        </label>
        <input
          id="team-name-input"
          type="text"
          required
          placeholder="e.g. Goan Coders Alliance"
          value={teamName}
          onChange={(e) => onUpdateTeamName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-950/60 focus:border-amber-400 focus:outline-none font-sans text-emerald-100 text-sm"
        />
      </div>

      {/* Accordion / Tab headers for Members */}
      <div className="space-y-4 pt-2">
        {members.slice(0, memberCount).map((member, idx) => {
          const isSelected = activeMemberIndex === idx;

          return (
            <div
              key={member.id}
              className={`p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-zinc-900/80 border-amber-400'
                  : 'bg-zinc-950/40 border-emerald-950/60 hover:border-emerald-500/20'
              }`}
            >
              {/* Member title bar */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => onSelectActiveMember(idx)}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    isSelected ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-sm text-emerald-100">
                    {member.name || `Member ${idx + 1}`}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-xs font-mono font-semibold text-emerald-400 hover:text-amber-400 transition-colors"
                  aria-label={`Configure member ${idx + 1}`}
                >
                  {isSelected ? 'Editing' : 'Edit Info'}
                </button>
              </div>

              {/* Collapsed/Expanded inputs */}
              {isSelected && (
                <div className="mt-4 space-y-4 pt-3 border-t border-emerald-950/60">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Member Name */}
                    <div className="space-y-1.5">
                      <label htmlFor={`member-${idx}-name`} className="block text-xs font-semibold text-emerald-400 font-sans">
                        Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id={`member-${idx}-name`}
                        type="text"
                        required
                        placeholder="e.g. Anand Salgaonkar"
                        value={member.name}
                        onChange={(e) => onUpdateMember(idx, { name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-emerald-950/60 focus:border-amber-400 focus:outline-none font-sans text-emerald-100 text-xs"
                      />
                    </div>

                    {/* Member Role */}
                    <div className="space-y-1.5">
                      <label htmlFor={`member-${idx}-role`} className="block text-xs font-semibold text-emerald-400 font-sans">
                        Role <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id={`member-${idx}-role`}
                        type="text"
                        required
                        placeholder="e.g. Smart Contract Auditor"
                        value={member.role}
                        onChange={(e) => onUpdateMember(idx, { role: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-emerald-950/60 focus:border-amber-400 focus:outline-none font-sans text-emerald-100 text-xs"
                      />
                    </div>
                  </div>

                  {/* Photo Uploader */}
                  <div className="pt-1">
                    <PhotoUploader
                      label={`Photo for Member ${idx + 1}`}
                      hasImage={!!member.imageUrl}
                      onImageUploaded={(file, url) => onUpdateMember(idx, { imageFile: file, imageUrl: url })}
                      onClear={() => onUpdateMember(idx, { imageFile: null, imageUrl: null })}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
