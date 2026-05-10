'use client';

import { useState } from 'react';
import type { StylePreset } from './types';
import { IntakeForm } from './IntakeForm';
import { ReviewScreen } from './ReviewScreen';

export type ServiceId = 'declutter' | 'stage' | 'dusk';

export type UploadedPhoto = {
  blobUrl: string;
  filename: string;
  size: number;
  services: ServiceId[];
  style?: string;
  previewUrl?: string;
};

export type IntakeState = {
  propertyId: string;
  address: string;
  contactEmail: string;
  photos: UploadedPhoto[];
};

export function Intake({ stylePresets }: { stylePresets: readonly StylePreset[] }) {
  const [mode, setMode] = useState<'intake' | 'review'>('intake');
  const [state, setState] = useState<IntakeState | null>(null);

  if (mode === 'review' && state) {
    return (
      <ReviewScreen
        state={state}
        stylePresets={stylePresets}
        onEdit={() => setMode('intake')}
      />
    );
  }

  return (
    <IntakeForm
      stylePresets={stylePresets}
      initial={state ?? undefined}
      onContinue={(s) => { setState(s); setMode('review'); }}
    />
  );
}
