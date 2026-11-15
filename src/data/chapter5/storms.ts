import { z } from 'zod';
import snapshot from './storms-archive.json';

const level = z.enum(['S1', 'S2', 'S3', 'S4', 'S5', 'unknown']);
const sep = z.object({ id: z.string().min(1), time: z.string().min(1), linkedFlareIds: z.array(z.string()), level, noaaFlareId: z.string().optional() });
const flare = z.object({ id: z.string().min(1), time: z.string().min(1), class: z.string().nullable(), linkedSepIds: z.array(z.string()) });
export const stormArchiveSchema = z.object({
  downloadedAt: z.iso.date(), sourceKeys: z.array(z.string()), noaaUrl: z.url(),
  months: z.array(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/), sourceUrls: z.array(z.url()), flares: z.array(flare), seps: z.array(sep) })),
}).superRefine((archive, context) => {
  for (const month of archive.months) {
    const ids = new Set(month.seps.map(event => event.id));
    if (ids.size !== month.seps.length || new Set(month.flares.map(event => event.id)).size !== month.flares.length)
      context.addIssue({ code: 'custom', message: `Duplicate event ID in ${month.month}` });
    for (const event of month.flares) for (const id of event.linkedSepIds) if (!ids.has(id))
      context.addIssue({ code: 'custom', message: `Missing SEP ${id}` });
  }
});
export const stormArchive = stormArchiveSchema.parse(snapshot);
export type ArchiveMonth = typeof stormArchive.months[number];
