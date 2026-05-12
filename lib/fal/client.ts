// lib/fal/client.ts
// Thin wrapper around @fal-ai/client with model routing and 4K output floor.
//
// Model slug substitution vs plan:
//   Plan slug: 'fal-ai/nano-banana/pro/edit'  ← 404 on fal.ai
//   Actual slug: 'fal-ai/nano-banana-pro/edit' ← verified live 2026-05-11
import { fal } from '@fal-ai/client';
import { buildPrompt, type HelperType } from './prompts';

export type ServiceId = 'declutter' | 'stage' | 'dusk' | 'sky' | 'lawn' | 'fire' | 'ceiling';

fal.config({ credentials: process.env.FAL_API_KEY });

// Model routing per service.
// stage + dusk + sky use Nano Banana Pro (best at additive realism + lighting).
// Everything else uses Seedream 4.5 (best at clean removals / corrections).
const MODEL_NANO_BANANA_PRO = 'fal-ai/nano-banana-pro/edit';
const MODEL_SEEDREAM = 'fal-ai/bytedance/seedream/v4.5/edit';

function pickModel(service: ServiceId): string {
  if (service === 'stage' || service === 'dusk' || service === 'sky') {
    return MODEL_NANO_BANANA_PRO;
  }
  return MODEL_SEEDREAM;
}

export type GenerateResult = { url: string; width: number; height: number };

export async function generate(opts: {
  prompt: string;
  service: ServiceId;
  inputImageUrl: string;
  numOutputs: 1 | 2;
}): Promise<GenerateResult[]> {
  const model = pickModel(opts.service);
  const result = await fal.subscribe(model, {
    input: {
      prompt: opts.prompt,
      image_url: opts.inputImageUrl,
      num_images: opts.numOutputs,
      image_size: { width: 4096, height: 4096 }, // 4K native; model crops to source aspect
      output_format: 'jpeg',
    },
    logs: false,
  });

  const images = (result.data as { images: { url: string; width: number; height: number }[] }).images;
  if (!images || images.length === 0) {
    throw new Error(`fal.ai returned no images for service=${opts.service}`);
  }

  // Enforce 4K floor — any output <4000px long edge is a generation failure.
  for (const img of images) {
    const longEdge = Math.max(img.width, img.height);
    if (longEdge < 4000) {
      throw new Error(`fal.ai output below 4K floor (${longEdge}px) for service=${opts.service}`);
    }
  }

  return images.map((img) => ({ url: img.url, width: img.width, height: img.height }));
}

// Convenience wrapper: build the prompt from a HelperType and call generate().
export async function generateFromHelper(opts: {
  helper: HelperType;
  service: ServiceId;
  inputImageUrl: string;
  numOutputs: 1 | 2;
}): Promise<GenerateResult[]> {
  const prompt = buildPrompt(opts.helper);
  return generate({ prompt, service: opts.service, inputImageUrl: opts.inputImageUrl, numOutputs: opts.numOutputs });
}
