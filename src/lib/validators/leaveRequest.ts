import { z } from "zod";

export const leaveRequestSchema = z.object({
  jenis: z.enum(["izin", "sakit"], {
    errorMap: () => ({ message: "Pilih jenis izin atau sakit" }),
  }),
  tanggalMulai: z.string().min(1, "Tanggal mulai harus diisi"),
  tanggalSelesai: z.string().min(1, "Tanggal selesai harus diisi"),
  keterangan: z.string().min(5, "Alasan minimal 5 karakter"),
  fileSuratUrl: z.string().optional(),
});

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
