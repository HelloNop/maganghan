import { z } from "zod";

export const attendanceCheckInSchema = z.object({
  fotoDataUrl: z.string().min(1, "Foto selfie harus diambil"),
  lat: z.number({ required_error: "Lokasi GPS dibutuhkan" }),
  lng: z.number({ required_error: "Lokasi GPS dibutuhkan" }),
});

export type AttendanceCheckInInput = z.infer<typeof attendanceCheckInSchema>;
