import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  subtestName,
  totalQuestions,
  answeredCount,
  isLastSubtest
}) {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-center font-bold text-lg text-slate-900 mb-2">
          {isLastSubtest ? 'Konfirmasi Selesaikan Ujian' : 'Konfirmasi Selesaikan Subtes'}
        </h3>

        <p className="text-center text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
          Apakah Anda yakin ingin menyelesaikan <span className="font-semibold text-slate-800">{subtestName}</span>?
          <br />
          <span className="text-red-600 font-medium text-xs mt-1 block">
            ⚠️ Sesuai aturan UTBK resmi, setelah berpindah Anda tidak dapat kembali lagi ke subtes ini!
          </span>
        </p>

        {/* Ringkasan Status Pengerjaan */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Sudah Dijawab:</span>
            <span className="font-bold text-emerald-600 text-base">{answeredCount} soal</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Belum Dijawab:</span>
            <span className={`font-bold text-base ${unansweredCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {unansweredCount} soal
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Lanjutkan Mengerjakan
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{isLastSubtest ? 'Selesai & Lihat Hasil' : 'Lanjut ke Subtes Berikutnya'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
