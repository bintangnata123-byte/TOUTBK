import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export default function QuestionPaletteModal({
  isOpen,
  onClose,
  totalQuestions,
  currentIndex,
  answers = {},
  onSelectQuestion,
  subtestName = "Subtes Aktif"
}) {
  if (!isOpen) return null;

  const isQuestionAnswered = (ans) => {
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans)) return ans.some(Boolean);
    return String(ans).trim() !== '';
  };

  const answeredCount = Object.keys(answers).filter(k => isQuestionAnswered(answers[k])).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>Daftar Soal</span>
              <span className="text-xs font-normal text-slate-400">({subtestName})</span>
            </h3>
            <div className="text-xs text-slate-300 mt-0.5">
              Terjawab: <span className="font-bold text-emerald-400">{answeredCount}</span> dari {totalQuestions} soal
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Grid Nomor Soal */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const qNum = i + 1;
              const isAnswered = isQuestionAnswered(answers[qNum]);
              const isActive = i === currentIndex;
              
              let btnClass = "bg-white text-slate-700 border-slate-300 hover:bg-slate-50";
              
              if (isAnswered) {
                // Tanda soal yang sudah dikerjakan berwarna hijau (Permintaan User)
                btnClass = "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 font-bold shadow-xs";
              }
              
              if (isActive) {
                btnClass += " ring-3 ring-blue-500 ring-offset-2 border-blue-600 scale-105 z-10";
              }

              return (
                <button
                  key={qNum}
                  onClick={() => {
                    onSelectQuestion(i);
                    onClose();
                  }}
                  className={`h-11 sm:h-12 rounded-xl border flex flex-col items-center justify-center text-sm font-semibold transition-all cursor-pointer relative ${btnClass}`}
                >
                  <span>{qNum}</span>
                  {isAnswered && (
                    <span className="text-[10px] font-mono leading-none opacity-90">
                      {typeof answers[qNum] === 'string' && answers[qNum].length <= 2 ? answers[qNum] : '✓'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer: Keterangan Warna */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 text-xs flex flex-wrap items-center justify-around gap-2 text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-emerald-600 border border-emerald-600"></span>
            <span>Sudah Dikerjakan (Hijau)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-white border border-slate-300"></span>
            <span>Belum Dikerjakan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-white border-2 border-blue-600 ring-2 ring-blue-400"></span>
            <span>Soal Aktif</span>
          </div>
        </div>

      </div>
    </div>
  );
}
