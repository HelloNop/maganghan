"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { bulkImportInternsAction } from "@/actions/intern";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  nama: string;
  email: string;
  unit_kerja?: string;
  posisi?: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
}

export function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [resultSummary, setResultSummary] = useState<{
    successCount: number;
    errorCount: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseError(null);
    setResultSummary(null);

    Papa.parse<ParsedRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`Error parsing CSV: ${results.errors[0].message}`);
          setParsedData([]);
        } else {
          setParsedData(results.data);
        }
      },
      error: (err) => {
        setParseError(`Gagal membaca file CSV: ${err.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsLoading(true);
    const res = await bulkImportInternsAction(parsedData);
    setIsLoading(false);

    if (res.error) {
      setParseError(res.error);
    } else if (res.success) {
      setResultSummary({
        successCount: res.successCount || 0,
        errorCount: res.errorCount || 0,
        errors: res.errors || [],
      });
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,nama,email,unit_kerja,posisi,tanggal_mulai,tanggal_selesai\n" +
      "Budi Santoso,budi@example.com,Divisi IT,Frontend Developer,2026-08-01,2026-11-30\n" +
      "Siti Rahma,siti@example.com,Sekretariat,Staff Admin,2026-08-01,2026-11-30";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_import_anak_magang.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    setFile(null);
    setParsedData([]);
    setParseError(null);
    setResultSummary(null);
    onClose();
    if (resultSummary && resultSummary.successCount > 0) {
      window.location.reload();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Bulk Import Data Anak Magang (CSV)"
    >
      <div className="space-y-4 mt-2">
        {/* Success Result Summary */}
        {resultSummary ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Import Selesai!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Berhasil menambahkan{" "}
                  <strong>{resultSummary.successCount}</strong> anak magang.
                  {resultSummary.errorCount > 0 && (
                    <span className="text-rose-600 font-semibold ml-1">
                      ({resultSummary.errorCount} baris gagal)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {resultSummary.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <p className="text-xs font-bold text-rose-800">Detail Error:</p>
                {resultSummary.errors.map((err, idx) => (
                  <p key={idx} className="text-[11px] text-rose-700">
                    Baris {err.row}: {err.message}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={handleCloseModal}>Selesai</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-[#f8fafa] border border-gray-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-[#006761]" />
                <div>
                  <h4 className="text-xs font-bold text-[#1a1c1c]">
                    Gunakan Format Template CSV
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Kolom: nama, email, unit_kerja, posisi, tanggal_mulai, tanggal_selesai
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleDownloadTemplate}
              >
                Unduh Template
              </Button>
            </div>

            {parseError && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-gray-200 hover:border-[#006761] rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-[#006761]/10 flex items-center justify-center text-[#006761]">
                  <Upload className="w-5 h-5" />
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-semibold text-[#1a1c1c]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {parsedData.length} baris terdeteksi
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-[#1a1c1c]">
                      Klik untuk memilih file CSV
                    </p>
                    <p className="text-xs text-gray-400">
                      Format file .csv (Maks. 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Data Preview */}
            {parsedData.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-2">Nama</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Unit Kerja</th>
                      <th className="p-2">Posisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedData.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{row.nama}</td>
                        <td className="p-2 text-gray-500">{row.email}</td>
                        <td className="p-2 text-gray-500">{row.unit_kerja || "-"}</td>
                        <td className="p-2 text-gray-500">{row.posisi || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <p className="p-2 text-center text-gray-400 bg-gray-50 border-t border-gray-100 text-[11px]">
                    ...dan {parsedData.length - 5} baris lainnya
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button
                onClick={handleImport}
                disabled={parsedData.length === 0}
                isLoading={isLoading}
              >
                Import {parsedData.length} Data
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
