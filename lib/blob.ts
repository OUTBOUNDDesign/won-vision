// lib/blob.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export async function handleClientBlobUpload(
  body: HandleUploadBody,
  request: Request,
  opts: { propertyId: string; editorId: string }
) {
  return handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => ({
      allowedContentTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
      addRandomSuffix: true,
      tokenPayload: JSON.stringify({
        propertyId: opts.propertyId,
        editorId: opts.editorId,
        pathname,
      }),
      maximumSizeInBytes: 50 * 1024 * 1024, // 50MB per photo
    }),
    onUploadCompleted: async () => {
      // No-op: blob row gets attached via attachPhoto server action.
    },
  });
}
