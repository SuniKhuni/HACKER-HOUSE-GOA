export interface ImageTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface PhotoArea {
  id: string; // e.g. 'member_0', 'member_1'
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

export interface TextArea {
  id: string; // e.g. 'member_0_name', 'member_0_role', 'team_name'
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: string; // 'bold' | 'normal' | '500' etc.
  color: string;
  alignment: 'left' | 'center' | 'right';
  maxFontSize?: number;
  minFontSize?: number;
  fontFamily?: string;
  isTeamName?: boolean;
}

export type TemplateType = 'solo' | 'team';

export interface TemplateConfig {
  id: string;
  name: string;
  type: TemplateType;
  memberCount: number;
  width: number;
  height: number;
  overlayUrl: string;
  photoAreas: PhotoArea[];
  textAreas: TextArea[];
}

export interface Member {
  id: string;
  name: string;
  role: string;
  imageFile: File | null;
  imageUrl: string | null;
  transform: ImageTransform;
}

export interface GeneratorState {
  templateId: string;
  teamName: string;
  members: Member[];
}
