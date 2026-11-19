import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Footer({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmitSubtest,
  isLastSubtest
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <footer className="bg-white border-t border-slate-200 select-none py-2.5 px-4 shadow-sm sticky bottom-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Tombol Sebelumnya */}
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
            isFirst
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm active:bg-slate-100 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Soal Sebelumnya</span>
        </button>

        {/* Center: Info Posisi */}
        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Nomor <span className="font-bold text-slate-800">{currentIndex + 1}</span> dari <span className="font-bold text-slate-800">{totalQuestions}</span>
        </div>

        {/* Tombol Kanan: Selanjutnya atau Selesaikan */}
        <div className="flex items-center gap-2">
          {!isLast ? (
            <button
              onClick={onNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm transition-all cursor-pointer"
            >
              <span>Soal Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSubmitSubtest}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md transition-all cursor-pointer animate-pulse hover:animate-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLastSubtest ? 'Selesaikan Ujian' : 'Selesaikan Subtes'}</span>
            </button>
          )}
        </div>

      </div>
    </footer>
  );
}
