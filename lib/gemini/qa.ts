// lib/gemini/qa.ts
// Gemini 2.5 Pro multimodal QA wrapper.
// SDK: @google/genai v2.x
// Call shape verified: ai.models.generateContent({ model, contents: [{role, parts}] })
// Response shape: response.text (string | undefined)
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type QaResult = {
  score: number;    // 0-10
  pass: boolean;    // true if score >= 7
  issues: string[]; // short bullet list, empty if pass
};

const PROMPT = `You are a senior real-estate photo editor. Compare the ORIGINAL real-estate photo to the EDITED version and rate the edit's quality on a 0-10 scale.

Score on:
1. Photorealism — no warped lines, no impossible geometry, no surreal elements (heaviest weight)
2. Architectural preservation — windows, walls, fixtures, ceiling, flooring all intact and identical placement
3. Lighting consistency — shadows, highlights, white balance plausible for the scene
4. Edit-task quality — if staging, is furniture tasteful and in-style? If decluttering, is the room genuinely clean? If dusk, is the lighting believable?

Respond ONLY with strict JSON in this shape (no prose, no markdown):
{"score": <number 0-10>, "issues": ["short issue 1", "short issue 2"]}

Empty issues array if score >= 7.`;

export async function qaVariant(originalUrl: string, editedUrl: string): Promise<QaResult> {
  const [origBlob, editBlob] = await Promise.all([
    fetch(originalUrl).then((r) => r.arrayBuffer()),
    fetch(editedUrl).then((r) => r.arrayBuffer()),
  ]);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [{
      role: 'user',
      parts: [
        { text: PROMPT },
        { text: 'ORIGINAL:' },
        { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(origBlob).toString('base64') } },
        { text: 'EDITED:' },
        { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(editBlob).toString('base64') } },
      ],
    }],
  });

  const raw = response.text ?? '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Gemini did not return JSON: ${raw.slice(0, 200)}`);

  const parsed = JSON.parse(match[0]) as { score: number; issues: string[] };
  const score = Math.max(0, Math.min(10, Number(parsed.score) || 0));
  return { score, pass: score >= 7, issues: Array.isArray(parsed.issues) ? parsed.issues : [] };
}
