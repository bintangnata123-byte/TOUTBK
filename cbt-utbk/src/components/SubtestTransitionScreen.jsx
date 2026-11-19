import React, { useState, useEffect } from 'react';
import { Clock, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SubtestTransitionScreen({
  previousSubtest,
  nextSubtest,
  nextIndex,
  totalSubtests,
  onStartNextSubtest
}) {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (countdown <= 0) {
      onStartNextSubtest();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onStartNextSubtest]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 select-none">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-6">
        
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
            SUBTES SELESAI
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {previousSubtest ? previousSubtest.name : 'Subtes Sebelumnya'} Selesai
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Jawaban Anda telah tersimpan. Sistem sedang mempersiapkan subtes berikutnya.
          </p>
        </div>

        {/* Info Subtes Berikutnya */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center justify-between text-xs text-blue-400 font-bold uppercase tracking-wider">
            <span>Subtes {nextIndex + 1} dari {totalSubtests}</span>
            <span>{nextSubtest.category}</span>
          </div>

          <h3 className="text-lg font-bold text-white">
            {nextSubtest.name}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {nextSubtest.description}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Alokasi Waktu:</span>
                <span className="font-bold text-white text-xs sm:text-sm">{nextSubtest.duration / 60} Menit</span>
              </div>
            </div>
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Jumlah Soal:</span>
                <span className="font-bold text-white text-xs sm:text-sm">{nextSubtest.totalQuestions} Soal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto Countdown & Action Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onStartNextSubtest}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Mulai Subtes Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="text-xs text-slate-400 font-mono">
            Otomatis mulai dalam <span className="font-bold text-emerald-400">{countdown}</span> detik...
          </div>
        </div>

      </div>
    </div>
  );
}
