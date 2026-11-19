import React from 'react';
import { Clock, ListOrdered, User, AlertCircle } from 'lucide-react';

export default function Header({
  subtest,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  answeredCount,
  onOpenPalette,
  participantName = "Peserta Ujian",
  participantClass = "",
  participantNumber
}) {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isUrgent = timeRemaining <= 300; // < 5 menit

  return (
    <header className="bg-slate-900 text-white shadow-md select-none sticky top-0 z-30 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2">
        
        {/* Left: Branding & Subtest Info */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center font-black tracking-wider text-xs sm:text-sm shadow-sm">
            CBT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold hidden md:inline">
                SIMULASI CBT UTBK-SNBT
              </span>
              <span className="text-xs text-slate-400 hidden lg:inline">•</span>
              <span className="text-xs font-medium text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                {subtest?.name}
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>Soal No. {currentQuestionIndex + 1}</span>
              <span className="text-slate-400 font-normal text-xs sm:text-sm">dari {totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Participant (Desktop) */}
        <div className="hidden xl:flex items-center gap-2.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-slate-200">{participantName}</div>
            <div className="text-slate-400 font-mono text-[10px]">
              {participantClass ? `Kelas: ${participantClass}` : (participantNumber || '')}
            </div>
          </div>
        </div>

        {/* Right: Timer & Daftar Soal Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border font-mono font-bold text-xs sm:text-sm tracking-wider transition-colors ${
              isUrgent
                ? 'bg-red-950/80 border-red-500/80 text-red-200 animate-pulse shadow-sm shadow-red-900/50'
                : 'bg-slate-800 border-slate-700 text-emerald-400 shadow-sm'
            }`}
            title="Sisa Waktu Pengerjaan Subtes Ini"
          >
            {isUrgent ? (
              <AlertCircle className="w-4 h-4 text-red-400 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 text-emerald-400" />
            )}
            <span className="hidden sm:inline text-xs text-slate-400 font-sans font-normal">Sisa Waktu:</span>
            <span>{formatTime(timeRemaining)}</span>
          </div>

          {/* Daftar Soal Button */}
          <button
            onClick={onOpenPalette}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs sm:text-sm px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
            <span className="hidden sm:inline">Daftar Soal</span>
            <span className="bg-blue-800/80 text-blue-200 text-xs px-1.5 py-0.5 rounded font-bold">
              {answeredCount}/{totalQuestions}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}
