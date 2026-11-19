import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import QuestionPaletteModal from './QuestionPaletteModal';
import ConfirmModal from './ConfirmModal';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Trash2, BookOpen, FileText, Split, ChevronUp, ChevronDown } from 'lucide-react';

export default function ExamScreen({
  subtest,
  questions = [],
  currentQuestionIndex,
  onSelectQuestion,
  answers = {},
  onSaveAnswer,
  timeRemaining,
  onSubmitSubtest,
  isLastSubtest,
  participantName,
  participantClass,
  participantNumber
}) {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [modalImage, setModalImage] = useState(null);
  const [stimulusMode, setStimulusMode] = useState('split'); // 'split' | 'question_only' | 'stimulus_only'
  const leftColRef = useRef(null);

  const currentQ = questions[currentQuestionIndex] || {};
  const currentAnswer = answers[currentQ.number] ?? '';

  // Reset scroll position to top when question changes
  useEffect(() => {
    if (leftColRef.current) {
      leftColRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentQuestionIndex]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toUpperCase();
      const availableOptions = (currentQ.options && currentQ.options.length > 0) ? currentQ.options : ['A', 'B', 'C', 'D', 'E'];
      if (availableOptions.includes(key) && currentQ.type === 'multiple_choice') {
        onSaveAnswer(currentQ.number, key);
      } else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        onSelectQuestion(currentQuestionIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        onSelectQuestion(currentQuestionIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, currentQuestionIndex, questions.length, onSaveAnswer, onSelectQuestion]);

  // Table configuration for complex_table questions
  const tableConfig = currentQ.tableConfig || {
    columns: (currentQ.options && currentQ.options.length > 0) ? currentQ.options : ['Benar', 'Salah'],
    rowCount: Array.isArray(currentQ.key) ? currentQ.key.length : 4
  };
  const tableColumns = tableConfig.columns || ['Benar', 'Salah'];
  const tableRowCount = tableConfig.rowCount || (Array.isArray(currentQ.key) ? currentQ.key.length : 4);

  const getTableAnswers = () => {
    if (Array.isArray(currentAnswer)) {
      const arr = [...currentAnswer];
      while (arr.length < tableRowCount) arr.push('');
      return arr.slice(0, tableRowCount);
    }
    if (typeof currentAnswer === 'string' && currentAnswer.trim() !== '') {
      const parts = currentAnswer.includes(',') 
        ? currentAnswer.split(',').map(s => s.trim()) 
        : currentAnswer.split('-');
      const arr = parts.slice(0, tableRowCount);
      while (arr.length < tableRowCount) arr.push('');
      return arr;
    }
    return Array(tableRowCount).fill('');
  };

  const handleSelectTableRow = (rowIdx, selectedCol) => {
    const newAnswers = getTableAnswers();
    newAnswers[rowIdx] = selectedCol;
    onSaveAnswer(currentQ.number, newAnswers);
  };

  const isCurrentQAnswered = () => {
    if (currentQ.type === 'complex_table') {
      const arr = getTableAnswers();
      return arr.some(Boolean);
    }
    return currentAnswer !== undefined && currentAnswer !== '';
  };

  const formatDisplaySelected = () => {
    if (!isCurrentQAnswered()) return 'Belum Dijawab';
    if (currentQ.type === 'complex_table') {
      const arr = getTableAnswers();
      const filled = arr.filter(Boolean).length;
      const compactCodes = arr.map(a => {
        if (!a) return '_';
        const s = a.toLowerCase();
        if (s.includes('tidak didukung')) return 'TD';
        if (s.includes('didukung')) return 'D';
        if (s.includes('tidak memperlemah')) return 'TM';
        if (s.includes('memperlemah')) return 'M';
        if (s.includes('benar')) return 'B';
        if (s.includes('salah')) return 'S';
        return a.slice(0, 1).toUpperCase();
      }).join('-');
      return `${compactCodes} (${filled}/${tableRowCount})`;
    }
    if (currentQ.type === 'multiple_choice') {
      return `Pilihan ${currentAnswer}`;
    }
    return currentAnswer;
  };

  const answeredCount = Object.keys(answers).filter((k) => {
    const a = answers[k];
    if (Array.isArray(a)) return a.some(Boolean);
    return a !== undefined && a !== '';
  }).length;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      onSelectQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      onSelectQuestion(currentQuestionIndex - 1);
    }
  };

  const handleClearAnswer = () => {
    onSaveAnswer(currentQ.number, currentQ.type === 'complex_table' ? [] : '');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 select-none overflow-hidden">
      
      {/* Top Header (shrink-0) */}
      <Header
        subtest={subtest}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        timeRemaining={timeRemaining}
        answeredCount={answeredCount}
        onOpenPalette={() => setIsPaletteOpen(true)}
        participantName={participantName}
        participantClass={participantClass || participantNumber}
      />

      {/* Main Content Area (flex-1 min-h-0) */}
      <main className="flex-1 min-h-0 max-w-7xl mx-auto w-full p-2 sm:p-3 md:p-4 flex flex-col overflow-hidden">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Stimulus & Question Card (Scrollable) */}
          <div 
            ref={leftColRef}
            className="flex-1 min-h-0 p-3.5 sm:p-5 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto"
          >
            
            {/* Header Nomor Soal & Zoom Toolbar */}
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white font-bold text-xs sm:text-sm px-3 py-1 rounded-lg shadow-xs">
                  SOAL NO. {currentQ.number}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">{subtest.name}</span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-slate-600">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                  className="p-1 hover:bg-white rounded transition-colors text-slate-700 cursor-pointer"
                  title="Perkecil Gambar"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-medium px-1.5 min-w-[36px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
                  className="p-1 hover:bg-white rounded transition-colors text-slate-700 cursor-pointer"
                  title="Perbesar Gambar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 hover:bg-white rounded transition-colors text-slate-700 cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stimulus Toolbar & Viewer if Stimulus Image exists */}
            {currentQ.stimulusImage && (
              <div className="mb-3 shrink-0">
                {/* View Mode Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 p-1 bg-slate-100 rounded-xl text-xs border border-slate-200">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setStimulusMode('split')}
                      className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        stimulusMode === 'split'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                      title="Tampilkan Wacana (kotak gulir) dan Soal bersamaan"
                    >
                      <Split className="w-3.5 h-3.5" />
                      <span>Wacana & Soal</span>
                    </button>

                    <button
                      onClick={() => setStimulusMode('question_only')}
                      className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        stimulusMode === 'question_only'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                      title="Sembunyikan wacana untuk fokus membaca soal"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Fokus Soal</span>
                    </button>

                    <button
                      onClick={() => setStimulusMode('stimulus_only')}
                      className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        stimulusMode === 'stimulus_only'
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                      title="Baca wacana secara penuh tanpa batas tinggi kotak"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Wacana Penuh</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setModalImage(currentQ.stimulusImage)}
                    className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer ml-auto"
                    title="Perbesar wacana ke layar penuh"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Layar Penuh</span>
                  </button>
                </div>

                {/* Stimulus Mode: SPLIT (Bounded Height with Inner Scroll - Default) */}
                {stimulusMode === 'split' && (
                  <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-700">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Wacana / Teks Stimulus</span>
                        <span className="text-[11px] font-normal text-slate-500 normal-case hidden sm:inline ml-1">
                          (Gulir kotak ini untuk membaca wacana)
                        </span>
                      </div>
                      <button
                        onClick={() => setStimulusMode('question_only')}
                        className="text-slate-500 hover:text-slate-700 text-[11px] flex items-center gap-0.5 cursor-pointer font-medium"
                        title="Tutup wacana untuk fokus pada soal"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Sembunyikan</span>
                      </button>
                    </div>

                    <div className="overflow-y-auto max-h-[32vh] sm:max-h-[36vh] border border-slate-200 rounded-lg bg-white p-2 shadow-inner">
                      <div className="overflow-x-auto flex justify-center">
                        <img
                          src={currentQ.stimulusImage}
                          alt="Wacana Stimulus"
                          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                          className="max-w-full h-auto transition-transform duration-150"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Stimulus Mode: QUESTION ONLY (Collapsed Banner) */}
                {stimulusMode === 'question_only' && (
                  <div 
                    onClick={() => setStimulusMode('split')}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-blue-800 cursor-pointer transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Wacana sedang disembunyikan agar Anda dapat fokus membaca soal. Klik di sini untuk membukanya kembali.</span>
                    </div>
                    <span className="font-bold underline text-blue-700 shrink-0 ml-2">Buka Wacana</span>
                  </div>
                )}

                {/* Stimulus Mode: STIMULUS FULL HEIGHT */}
                {stimulusMode === 'stimulus_only' && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-700">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Wacana / Teks Stimulus (Mode Penuh)</span>
                      </div>
                      <button
                        onClick={() => setStimulusMode('split')}
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold cursor-pointer"
                      >
                        Kembali ke Wacana & Soal
                      </button>
                    </div>
                    <div className="overflow-x-auto flex justify-center bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <img
                        src={currentQ.stimulusImage}
                        alt="Wacana Stimulus"
                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                        className="max-w-full h-auto transition-transform duration-150"
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => setStimulusMode('split')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <span>Lihat Pertanyaan Soal No. {currentQ.number}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Question Title Header if Stimulus is Present */}
            {currentQ.stimulusImage && (
              <div className="w-full flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>PERTANYAAN SOAL NOMOR {currentQ.number}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {currentQ.type === 'complex_table' ? 'Tabel Pernyataan' : currentQ.type === 'short_answer' ? 'Isian Singkat' : 'Pilihan Ganda'}
                </span>
              </div>
            )}

            {/* Question Image */}
            <div className="flex-1 flex flex-col items-center justify-start overflow-x-auto p-1">
              {currentQ.image ? (
                <div className="w-full flex justify-center">
                  <img
                    src={currentQ.image}
                    alt={`Soal Nomor ${currentQ.number}`}
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                    className="max-w-full h-auto object-contain transition-transform duration-150"
                    onClick={() => setModalImage(currentQ.image)}
                    title="Klik untuk melihat ukuran penuh"
                  />
                </div>
              ) : (
                <div className="text-center text-slate-400 py-12">
                  Memuat soal...
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Lembar Jawaban Interaktif */}
          <div className="w-full md:w-80 lg:w-96 bg-slate-50/70 p-3.5 sm:p-5 flex flex-col justify-between overflow-y-auto shrink-0">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
                  Lembar Jawaban
                </h3>
                {isCurrentQAnswered() && (
                  <button
                    onClick={handleClearAnswer}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title="Hapus jawaban terpilih"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>

              {/* Status Jawaban Saat Ini */}
              <div className="mb-3.5 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Pilihan Terpilih:</span>
                <span className="font-bold font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 max-w-[200px] truncate text-right">
                  {formatDisplaySelected()}
                </span>
              </div>

              {/* Pilihan Ganda */}
              {currentQ.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {((currentQ.options && currentQ.options.length > 0) ? currentQ.options : ['A', 'B', 'C', 'D', 'E']).map((opt) => {
                    const isSelected = currentAnswer === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => onSaveAnswer(currentQ.number, opt)}
                        className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs translate-x-1'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-white text-blue-600'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {opt}
                          </span>
                          <span className="text-xs sm:text-sm">Pilihan {opt}</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-mono hidden sm:inline">
                          [{opt}]
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Isian Singkat (khusus soal isian angka PK / PM) */}
              {currentQ.type === 'short_answer' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <label className="text-xs text-slate-600 font-medium block">
                    Ketikkan jawaban berupa angka bilangan:
                  </label>
                  <input
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => onSaveAnswer(currentQ.number, e.target.value.trim())}
                    placeholder="Contoh: 48"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-lg font-bold text-slate-900 focus:outline-blue-500 focus:border-blue-500 text-center bg-slate-50"
                  />
                  <div className="text-[11px] text-slate-400 text-center">
                    Jawaban otomatis tersimpan saat Anda mengetik
                  </div>
                </div>
              )}

              {/* Tabel Pernyataan Kompleks (Benar/Salah, Didukung/Tidak Didukung, dll) */}
              {currentQ.type === 'complex_table' && (
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Penilaian Pernyataan
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Tentukan pilihan untuk setiap baris:
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {getTableAnswers().filter(Boolean).length}/{tableRowCount} Terisi
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-0.5">
                    {Array.from({ length: tableRowCount }).map((_, idx) => {
                      const rowVal = getTableAnswers()[idx] || '';
                      return (
                        <div 
                          key={idx} 
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span>Pernyataan {idx + 1}</span>
                            </span>
                            {rowVal ? (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                rowVal.toLowerCase().includes('benar') || (rowVal.toLowerCase().includes('didukung') && !rowVal.toLowerCase().includes('tidak'))
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {rowVal}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Belum dipilih
                              </span>
                            )}
                          </div>

                          <div className={`grid gap-2 ${tableColumns.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                            {tableColumns.map((col) => {
                              const isSelected = rowVal === col;
                              const isPositive = col.toLowerCase().includes('benar') || (col.toLowerCase().includes('didukung') && !col.toLowerCase().includes('tidak'));
                              const isNegative = col.toLowerCase().includes('salah') || col.toLowerCase().includes('tidak');
                              
                              let btnStyle = "bg-white text-slate-700 border-slate-300 hover:bg-slate-100";
                              if (isSelected) {
                                if (isPositive) {
                                  btnStyle = "bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300";
                                } else if (isNegative) {
                                  btnStyle = "bg-red-600 text-white border-red-600 shadow-xs ring-2 ring-red-300";
                                } else {
                                  btnStyle = "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300";
                                }
                              }

                              return (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => handleSelectTableRow(idx, col)}
                                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${btnStyle}`}
                                >
                                  <span>{col}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-100 leading-tight">
                    *Penilaian IRT: Jika salah 1 pernyataan, maka seluruh nomor dianggap salah (Kode IRT: 0).
                  </div>
                </div>
              )}

            </div>

            {/* Petunjuk Keyboard */}
            <div className="pt-3 text-center text-[10px] text-slate-400 hidden lg:block border-t border-slate-200 mt-3">
              Tips: Tekan <span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300 text-slate-600 font-bold">A</span>-<span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300 text-slate-600 font-bold">E</span> untuk menjawab, <span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300 text-slate-600 font-bold">←</span> / <span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-300 text-slate-600 font-bold">→</span> untuk navigasi.
            </div>

          </div>

        </div>
      </main>

      {/* Bottom Footer Navigation (shrink-0) */}
      <Footer
        currentIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmitSubtest={() => setIsConfirmOpen(true)}
        isLastSubtest={isLastSubtest}
      />

      {/* Modal Daftar Soal (Palet Nomor) */}
      <QuestionPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        totalQuestions={questions.length}
        currentIndex={currentQuestionIndex}
        answers={answers}
        onSelectQuestion={onSelectQuestion}
        subtestName={subtest.name}
      />

      {/* Modal Konfirmasi Selesai Subtes */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          onSubmitSubtest();
        }}
        subtestName={subtest.name}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        isLastSubtest={isLastSubtest}
      />

      {/* Fullscreen Image Preview Modal */}
      {modalImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setModalImage(null)}
        >
          <div className="bg-white p-2 rounded-2xl max-w-4xl max-h-[90vh] overflow-auto">
            <img src={modalImage} alt="Preview Soal" className="max-w-full h-auto" />
          </div>
        </div>
      )}

    </div>
  );
}
