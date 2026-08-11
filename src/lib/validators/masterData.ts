import { z } from "zod";

export const workUnitSchema = z.object({
  nama: z.string().min(2, "Nama unit kerja minimal 2 karakter"),
  kode: z.string().max(10, "Kode maksimal 10 karakter").optional().or(z.literal("")),
});

export type WorkUnitInput = z.infer<typeof workUnitSchema>;

export const positionSchema = z.object({
  nama: z.string().min(2, "Nama posisi minimal 2 karakter"),
});

export type PositionInput = z.infer<typeof positionSchema>;
