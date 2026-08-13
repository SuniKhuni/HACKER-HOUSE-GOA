'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Group, Image as KonvaImage, Text } from 'react-konva';
import { TemplateConfig, Member, ImageTransform } from '../types/generator';
import { useImage } from './hooks/useImage'; // Let's write this hook next

interface CanvasEditorProps {
  template: TemplateConfig;
  members: Member[];
  teamName: string;
  activeMemberIndex: number;
  selectedFont: string;
  stageRef: React.RefObject<any>;
  onUpdateMemberTransform: (index: number, transform: Partial<ImageTransform>) => void;
  onSelectMember: (index: number) => void;
  previewWidth?: number; // width for scaling in UI preview
}

export default function CanvasEditor({
  template,
  members,
  teamName,
  activeMemberIndex,
  selectedFont,
  stageRef,
  onUpdateMemberTransform,
  onSelectMember,
  previewWidth = 500,
}: CanvasEditorProps) {
  const [fontsReady, setFontsReady] = useState(false);

  // Load static assets
  const backgroundImage = useImage('/HH_GOA_BACKGROUND.png');
  const overlayImage = useImage(template.overlayUrl);

  // Force re-draw when fonts are ready
  useEffect(() => {
    if (typeof window !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        setFontsReady(true);
      });
    }
  }, [selectedFont]);

  // Hook up user uploaded images statically to respect the Rules of Hooks
  const img0 = useImage(members[0]?.imageUrl || null);
  const img1 = useImage(members[1]?.imageUrl || null);
  const img2 = useImage(members[2]?.imageUrl || null);
  const loadedUserImages = [img0, img1, img2];

  // Calculate scaling for the responsive preview in the browser
  const scale = previewWidth / template.width;
  const previewHeight = template.height * scale;

  // Helper for computing dynamic fitting font size
  const getFitFontSize = (
    text: string,
    fontFamily: string,
    fontWeight: string,
    maxWidth: number,
    maxHeight: number,
    defaultSize: number,
    minSize: number = 10
  ) => {
    if (typeof window === 'undefined') return defaultSize;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return defaultSize;

    let size = defaultSize;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    
    // Width fitting
    while (ctx.measureText(text).width > maxWidth && size > minSize) {
      size -= 1;
      ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    }

    // Height fitting
    while (size * 1.25 > maxHeight && size > minSize) {
      size -= 1;
    }

    return size;
  };

  // Drag handlers for direct canvas image manipulation
  const handleDragMove = (index: number, e: any) => {
    const node = e.target;
    onUpdateMemberTransform(index, {
      x: node.x(),
      y: node.y(),
    });
  };

  // Scroll wheel zoom handler
  const handleWheel = (index: number, e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.05;
    const member = members[index];
    const currentScale = member.transform.scaleX;
    
    let newScale = e.evt.deltaY < 0 ? currentScale * scaleBy : currentScale / scaleBy;
    // Limit zoom between 0.1x and 10x
    newScale = Math.max(0.1, Math.min(10, newScale));

    onUpdateMemberTransform(index, {
      scaleX: newScale,
      scaleY: newScale,
    });
  };

  return (
    /*
     * IMPORTANT: We intentionally do NOT put scaleX/scaleY on the Konva Stage.
     * Doing so shrinks the drawing into the top-left corner of a large canvas,
     * causing exported images to have wrong dimensions/ratio.
     *
     * Instead we apply a CSS transform:scale() to the wrapper div for the preview.
     * The Konva canvas always renders at full template resolution.
     * Export with pixelRatio:1 gives a perfect pixel-for-pixel image.
     */
    <div
      className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 border border-emerald-950/50"
      style={{
        width: previewWidth,
        height: previewHeight,
        touchAction: 'pan-y',
        willChange: 'transform',
      }}
    >
      {/* Scale the Stage element via CSS so the canvas renders at full resolution */}
      <div
        style={{
          width: template.width,
          height: template.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          willChange: 'transform',
        }}
      >
        <Stage
          key={selectedFont + "_" + fontsReady + "_" + template.id}
          ref={stageRef}
          width={template.width}
          height={template.height}
          // On mobile, forward single-finger touch-moves so page scroll is not blocked
          onTouchMove={(e: any) => {
            if (e.evt && e.evt.touches && e.evt.touches.length === 1) {
              const target = e.target;
              const isDraggingImage = target && typeof target.draggable === 'function' && target.draggable();
              if (!isDraggingImage) {
                // Not dragging an image — allow browser to scroll
                e.evt.stopPropagation && e.evt.stopPropagation();
              }
            }
          }}
        >
        {/* Layer 1: Background */}
        <Layer>
          {backgroundImage ? (
            <KonvaImage
              image={backgroundImage}
              width={template.width}
              height={template.height}
            />
          ) : (
            // Fallback solid tropical green
            <Group>
              {/* Green backdrop */}
              <Text text="" width={template.width} height={template.height} fill="#0d1e18" />
            </Group>
          )}
        </Layer>

        {/* Layer 2: User image layer(s) */}
        <Layer>
          {template.photoAreas.map((area, idx) => {
            const member = members[idx];
            const userImg = loadedUserImages[idx];
            const isSelected = activeMemberIndex === idx;

            if (!member || !userImg) return null;

            return (
              <Group
                key={area.id}
                x={area.x}
                y={area.y}
                width={area.width}
                height={area.height}
                clipFunc={(ctx) => {
                  // Draw standard rounded rect clip path inside the group
                  ctx.beginPath();
                  ctx.roundRect(0, 0, area.width, area.height, area.borderRadius);
                  ctx.closePath();
                }}
                onClick={() => onSelectMember(idx)}
                onTouchStart={() => onSelectMember(idx)}
              >
                {/* Border outline inside the group to show selection during hover */}
                {isSelected && (
                  <Text
                    text=""
                    width={area.width}
                    height={area.height}
                    stroke="#fbbf24"
                    strokeWidth={6}
                    listening={false}
                  />
                )}

                <KonvaImage
                  image={userImg}
                  x={member.transform.x}
                  y={member.transform.y}
                  scaleX={member.transform.scaleX}
                  scaleY={member.transform.scaleY}
                  rotation={member.transform.rotation}
                  offsetX={userImg.width / 2}
                  offsetY={userImg.height / 2}
                  draggable
                  onDragMove={(e) => handleDragMove(idx, e)}
                  onWheel={(e) => handleWheel(idx, e)}
                  // Enable cursor pointer
                  onMouseEnter={(e: any) => {
                    const container = e.target.getStage().container();
                    container.style.cursor = 'move';
                  }}
                  onMouseLeave={(e: any) => {
                    const container = e.target.getStage().container();
                    container.style.cursor = 'default';
                  }}
                />
              </Group>
            );
          })}
        </Layer>

        {/* Layer 3: Overlay PNG */}
        <Layer>
          {overlayImage && (
            <KonvaImage
              image={overlayImage}
              width={template.width}
              height={template.height}
              listening={false} // pass clicks through to images underneath
            />
          )}
        </Layer>

        {/* Layer 4: Text layer(s) */}
        <Layer>
          {template.textAreas.map((area) => {
            // Find text value for this area
            let value = '';
            if (area.isTeamName) {
              value = teamName || '';
            } else if (area.id.includes('name')) {
              const memberIdx = area.id.startsWith('member_0') ? 0 : area.id.startsWith('member_1') ? 1 : 2;
              value = members[memberIdx]?.name || '';
            } else if (area.id.includes('role')) {
              const memberIdx = area.id.startsWith('member_0') ? 0 : area.id.startsWith('member_1') ? 1 : 2;
              value = members[memberIdx]?.role || '';
            }

            if (!value) return null;

            // Compute dynamic font size based on text length and active font style
            const fontFamily = selectedFont || 'Outfit';
            const calculatedSize = getFitFontSize(
              value,
              fontFamily,
              area.fontWeight,
              area.width - 20, // margin
              area.height,
              area.fontSize,
              area.minFontSize || 10
            );

            return (
              <Text
                key={area.id}
                text={value}
                x={area.x}
                y={area.y}
                width={area.width}
                height={area.height}
                fontSize={calculatedSize}
                fontFamily={fontFamily}
                fontStyle={area.fontWeight}
                fill={area.color}
                align="center"
                verticalAlign="middle"
                listening={false}
              />
            );
          })}
        </Layer>
      </Stage>
      </div>
    </div>
  );
}
