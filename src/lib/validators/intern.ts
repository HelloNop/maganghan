import { z } from "zod";

export const internSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  unitKerjaId: z.string().uuid("Pilih unit kerja").optional().or(z.literal("")),
  posisiId: z.string().uuid("Pilih posisi").optional().or(z.literal("")),
  tanggalMulai: z.string().min(1, "Tanggal mulai harus diisi"),
  tanggalSelesai: z.string().min(1, "Tanggal selesai harus diisi"),
});

export type InternInput = z.infer<typeof internSchema>;

export const bulkImportRowSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  unit_kerja: z.string().optional(),
  posisi: z.string().optional(),
  tanggal_mulai: z.string().min(1, "Tanggal mulai harus diisi"),
  tanggal_selesai: z.string().min(1, "Tanggal selesai harus diisi"),
});

export type BulkImportRow = z.infer<typeof bulkImportRowSchema>;
