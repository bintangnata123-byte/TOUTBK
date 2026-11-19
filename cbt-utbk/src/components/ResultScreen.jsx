import React, { useState } from 'react';
import { SUBTESTS } from '../data/tryoutConfig';
import { 
  Trophy, CheckCircle2, XCircle, MinusCircle, 
  RotateCcw, Printer,
  Award, BarChart3, Binary, Copy, Check,
  Download, Table, User, GraduationCap
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetUrl';

export default function ResultScreen({
  allAnswers = {},
  questionsMeta = {},
  participantName = "Peserta Ujian",
  participantClass = "-",
  onResetExam
}) {
  const [selectedSubtestId, setSelectedSubtestId] = useState('PU');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  // Helper to normalize table answer values
  const normalizeVal = (val) => {
    if (!val) return '';
    const s = String(val).trim().toUpperCase();
    if (s === 'BENAR' || s === 'B') return 'B';
    if (s === 'SALAH' || s === 'S') return 'S';
    if (s.includes('TIDAK DIDUKUNG') || s === 'TD' || s.includes('T IDAK DIDUKUNG')) return 'TD';
    if (s === 'DIDUKUNG' || s === 'D') return 'D';
    if (s.includes('TIDAK MEMPERLEMAH') || s === 'TM' || s.includes('T IDAK MEMPERLEMAH')) return 'TM';
    if (s === 'MEMPERLEMAH' || s === 'M') return 'M';
    return s;
  };

  const isAnsEmpty = (ans) => {
    if (ans === undefined || ans === null) return true;
    if (Array.isArray(ans)) return !ans.some(Boolean);
    return String(ans).trim() === '';
  };

  // Helper to evaluate if question answer is correct
  // Sesuai aturan IRT: untuk complex_table, jika salah 1 maka dianggap salah untuk nomor tersebut (IRT: 0)
  const checkIsCorrect = (q, userAns) => {
    if (isAnsEmpty(userAns)) return false;

    if (q.type === 'complex_table') {
      const expArr = Array.isArray(q.key) ? q.key : String(q.key).split('-').map((s) => s.trim());
      const userArr = Array.isArray(userAns) ? userAns : String(userAns).split('-').map((s) => s.trim());
      
      if (userArr.length < expArr.length) return false;

      // Must match ALL statements 100%
      for (let i = 0; i < expArr.length; i++) {
        if (!userArr[i] || normalizeVal(userArr[i]) !== normalizeVal(expArr[i])) {
          return false;
        }
      }
      return true;
    }

    return String(userAns).trim().toUpperCase() === String(q.key).trim().toUpperCase();
  };

  const formatAnswerText = (ans, isKey = false) => {
    if (isAnsEmpty(ans)) return isKey ? '-' : '(Kosong)';
    if (Array.isArray(ans)) {
      return ans.map((a) => {
        if (!a) return '_';
        const s = a.toLowerCase();
        if (s.includes('tidak didukung')) return 'TD';
        if (s.includes('didukung')) return 'D';
        if (s.includes('tidak memperlemah')) return 'TM';
        if (s.includes('memperlemah')) return 'M';
        if (s.includes('benar')) return 'B';
        if (s.includes('salah')) return 'S';
        return a.slice(0, 1).toUpperCase();
      }).join(' - ');
    }
    return String(ans);
  };

  // Compute scores and IRT responses per subtest and overall
  // In IRT scoring: 1 = correct answer, 0 = wrong or empty answer
  const subtestScores = SUBTESTS.map((sub) => {
    const qList = questionsMeta[sub.id] || [];
    const subAnswers = allAnswers[sub.id] || {};
    
    let correct = 0;
    let wrong = 0;
    let empty = 0;
    const irtList = [];

    qList.forEach((q) => {
      const userAns = subAnswers[q.number];
      const correctKey = q.key;

      let isCorrect = false;
      if (isAnsEmpty(userAns)) {
        empty += 1;
      } else {
        isCorrect = checkIsCorrect(q, userAns);
        if (isCorrect) {
          correct += 1;
        } else {
          wrong += 1;
        }
      }

      irtList.push({
        number: q.number,
        type: q.type,
        tableConfig: q.tableConfig,
        key: correctKey,
        userAns: userAns || '',
        irtCode: isCorrect ? 1 : 0
      });
    });

    const accuracy = qList.length > 0 ? Math.round((correct / qList.length) * 100) : 0;
    const irtString = irtList.map((item) => item.irtCode).join('');

    return {
      subtest: sub,
      questions: qList,
      userAnswers: subAnswers,
      correct,
      wrong,
      empty,
      accuracy,
      irtList,
      irtString
    };
  });

  const totalCorrect = subtestScores.reduce((acc, s) => acc + s.correct, 0);
  const totalWrong = subtestScores.reduce((acc, s) => acc + s.wrong, 0);
  const totalEmpty = subtestScores.reduce((acc, s) => acc + s.empty, 0);
  const totalQuestions = subtestScores.reduce((acc, s) => acc + s.questions.length, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Full 160-digit IRT binary string
  const fullIrtString = subtestScores.map((s) => s.irtString).join('');

  const activeSubData = subtestScores.find((s) => s.subtest.id === selectedSubtestId) || subtestScores[0];
  const activeQuestions = activeSubData.questions;
  const currentReviewQ = activeQuestions[selectedQuestionIndex] || activeQuestions[0] || {};
  const currentReviewUserAns = activeSubData.userAnswers[currentReviewQ.number] ?? '';
  const isCurrentCorrect = checkIsCorrect(currentReviewQ, currentReviewUserAns);
  const isCurrentEmpty = isAnsEmpty(currentReviewUserAns);
  const currentIrtCode = isCurrentCorrect ? 1 : 0;

  // Copy to clipboard helper
  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
      }).catch(() => {
        fallbackCopy(text, key);
      });
    } else {
      fallbackCopy(text, key);
    }
  };

  const fallbackCopy = (text, key) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Generate Matrix CSV Row for psychometric analysis
  const handleCopyMatrixRow = () => {
    const headers = ['Nama', 'Kelas'];
    const values = [`"${participantName || 'Peserta'}"`, `"${participantClass || '-'}"`];

    subtestScores.forEach((s) => {
      s.irtList.forEach((item) => {
        headers.push(`${s.subtest.id}_${item.number}`);
        values.push(item.irtCode);
      });
    });

    const csvRow = `${headers.join(',')}\n${values.join(',')}`;
    handleCopy(csvRow, 'matrix');
  };

  // Download IRT CSV file
  const handleDownloadCsv = () => {
    let csv = 'No,Subtes,Nama Subtes,Nomor Soal,Jawaban Peserta,Kunci Jawaban,Status,Kode IRT (1/0)\n';
    let globalIndex = 1;

    subtestScores.forEach((s) => {
      s.irtList.forEach((item) => {
        const status = item.irtCode === 1 ? 'Benar' : (isAnsEmpty(item.userAns) ? 'Kosong' : 'Salah');
        csv += `${globalIndex},"${s.subtest.id}","${s.subtest.name}",${item.number},"${formatAnswerText(item.userAns)}","${formatAnswerText(item.key, true)}","${status}",${item.irtCode}\n`;
        globalIndex++;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (participantName || 'Peserta').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `data_irt_utbk_${cleanName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 select-none print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Hasil Ujian */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 print:bg-white print:text-black print:border-black">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-9 h-9" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                HASIL EVALUASI TRYOUT UTBK
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white print:text-black">
                Simulasi CBT UTBK-SNBT Selesai
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-300 print:text-slate-600 mt-1.5">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Nama: <strong className="text-white print:text-black">{participantName || 'Peserta Ujian'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kelas: <strong className="text-white print:text-black">{participantClass || '-'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* IRT Total Score Badge */}
          <div className="bg-slate-800/90 border border-slate-700/80 px-6 py-4 rounded-2xl text-center shrink-0 min-w-[210px] print:border-black">
            <span className="text-xs text-slate-400 font-medium block">Total Jawaban Benar (Skor 1):</span>
            <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                {totalCorrect}
              </span>
              <span className="text-slate-400 font-mono text-sm font-semibold">/ {totalQuestions}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Kode IRT: 1 = Benar, 0 = Salah</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 font-medium">
            Total {totalQuestions} Soal telah dievaluasi dengan kode respon IRT biner (1 untuk benar, 0 untuk salah/kosong).
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Hasil</span>
            </button>
            <button
              onClick={onResetExam}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Tryout</span>
            </button>
          </div>
        </div>

        {/* Grid Statistik Keseluruhan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block leading-tight">Jawaban Benar [1]</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600">{totalCorrect}</span>
              <span className="text-[10px] text-slate-400 block">soal</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block leading-tight">Jawaban Salah [0]</span>
              <span className="text-xl sm:text-2xl font-black text-red-600">{totalWrong}</span>
              <span className="text-[10px] text-slate-400 block">soal</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <MinusCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block leading-tight">Tidak Dijawab [0]</span>
              <span className="text-xl sm:text-2xl font-black text-slate-700">{totalEmpty}</span>
              <span className="text-[10px] text-slate-400 block">soal</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block leading-tight">Tingkat Akurasi</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600">{overallAccuracy}%</span>
              <span className="text-[10px] text-slate-400 block">dari {totalQuestions} soal</span>
            </div>
          </div>
        </div>

        {/* SECTION UTAMA: DATA RESPONS IRT (ITEM RESPONSE THEORY) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                <Binary className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Data Respons IRT (Item Response Theory)
                </h3>
                <p className="text-[11px] text-slate-300">
                  Data biner respon butir (1 = Benar, 0 = Salah/Kosong) siap diolah ke Excel, R (mirt/ltm), atau software IRT.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleCopy(fullIrtString, 'full')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Salin seluruh 160 digit biner (1/0)"
              >
                {copiedKey === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'full' ? 'Tersalin!' : 'Salin String IRT (160 Digit)'}</span>
              </button>

              <button
                onClick={handleCopyMatrixRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                title="Salin format baris matriks IRT (Nama, Kelas, 160 Butir Soal)"
              >
                {copiedKey === 'matrix' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Table className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'matrix' ? 'Tersalin!' : 'Salin Format CSV Matrix'}</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Unduh seluruh data butir dan respon dalam file CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV IRT</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Box Tampilan String 160 Digit Lengkap */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span>String Kode IRT Lengkap (160 Soal):</span>
                  <span className="text-[11px] font-normal text-slate-500 font-mono">
                    [{totalCorrect} angka 1 • {totalWrong + totalEmpty} angka 0]
                  </span>
                </span>
                <button
                  onClick={() => handleCopy(fullIrtString, 'full')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'full' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'full' ? 'Tersalin' : 'Salin String'}</span>
                </button>
              </div>
              <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs sm:text-sm tracking-widest break-all select-all shadow-inner leading-relaxed">
                {fullIrtString}
              </div>
            </div>

            {/* Rincian String IRT per Subtes */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-2.5">
                Rincian String Kode IRT per 7 Subtes:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subtestScores.map((s) => (
                  <div key={s.subtest.id} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{s.subtest.name}</span>
                        <span className="text-slate-400 font-normal ml-1">({s.questions.length} Soal)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 font-semibold font-mono text-[11px]">
                          {s.correct} Benar [1]
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          • {s.wrong + s.empty} Salah [0]
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider text-slate-800 overflow-x-auto select-all">
                        {s.irtString}
                      </div>
                      <button
                        onClick={() => handleCopy(s.irtString, s.subtest.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        title={`Salin string IRT ${s.subtest.shortName}`}
                      >
                        {copiedKey === s.subtest.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 text-[11px]">Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span className="text-[11px]">Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Tabel Evaluasi per 7 Subtes UTBK */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Rincian Hasil Evaluasi per 7 Subtes UTBK</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/75 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Subtes</th>
                  <th className="py-3 px-3 text-center">Jumlah Soal</th>
                  <th className="py-3 px-3 text-center text-emerald-600">Benar [1]</th>
                  <th className="py-3 px-3 text-center text-red-600">Salah [0]</th>
                  <th className="py-3 px-3 text-center text-slate-500">Kosong [0]</th>
                  <th className="py-3 px-3 text-center">Akurasi</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-700">Kode IRT (1/0)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subtestScores.map((s, idx) => (
                  <tr 
                    key={s.subtest.id} 
                    onClick={() => {
                      setSelectedSubtestId(s.subtest.id);
                      setSelectedQuestionIndex(0);
                    }}
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                      selectedSubtestId === s.subtest.id ? 'bg-blue-50/80 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{s.subtest.name}</div>
                      <div className="text-[11px] text-slate-400">{s.subtest.category}</div>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">{s.questions.length}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600 font-mono">{s.correct}</td>
                    <td className="py-3 px-3 text-center font-bold text-red-600 font-mono">{s.wrong}</td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">{s.empty}</td>
                    <td className="py-3 px-3 text-center font-mono font-medium">{s.accuracy}%</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                        <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                          {s.correct} [1] / {s.wrong + s.empty} [0]
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(s.irtString, `table_${s.subtest.id}`);
                          }}
                          className="text-slate-500 hover:text-blue-600 transition-colors p-0.5"
                          title="Salin string IRT subtes ini"
                        >
                          {copiedKey === `table_${s.subtest.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section Review Soal & Kunci Jawaban */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="bg-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-blue-400 uppercase tracking-widest font-bold">
                EVALUASI JAWABAN PESERTA & KODE IRT
              </div>
              <h3 className="font-bold text-base sm:text-lg">
                Review Soal: {activeSubData.subtest.name}
              </h3>
            </div>
            
            {/* Subtest Selector Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {SUBTESTS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubtestId(sub.id);
                    setSelectedQuestionIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedSubtestId === sub.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sub.shortName}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            
            {/* Grid Palet Nomor Soal Review */}
            <div>
              <div className="text-xs text-slate-500 font-medium mb-2.5 flex items-center justify-between">
                <span>Pilih nomor soal untuk memeriksa kunci & kode IRT:</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Kode 1 (Benar)
                  </span>
                  <span className="flex items-center gap-1 text-red-600 font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Kode 0 (Salah)
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 font-semibold">
                    <MinusCircle className="w-3.5 h-3.5" /> Kode 0 (Kosong)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2">
                {activeQuestions.map((q, idx) => {
                  const ans = activeSubData.userAnswers[q.number];
                  const isCor = checkIsCorrect(q, ans);
                  const isEmp = isAnsEmpty(ans);
                  const isAct = idx === selectedQuestionIndex;

                  let colorClass = "bg-slate-100 text-slate-600 border-slate-300";
                  if (isCor) {
                    colorClass = "bg-emerald-600 text-white border-emerald-600 font-bold";
                  } else if (!isEmp) {
                    colorClass = "bg-red-600 text-white border-red-600 font-bold";
                  }

                  if (isAct) {
                    colorClass += " ring-3 ring-blue-500 ring-offset-1 scale-105 z-10";
                  }

                  return (
                    <button
                      key={q.number}
                      onClick={() => setSelectedQuestionIndex(idx)}
                      className={`h-11 rounded-lg border text-xs flex flex-col items-center justify-center transition-all cursor-pointer relative ${colorClass}`}
                    >
                      <span className="text-[11px] leading-none">{q.number}</span>
                      <span className="text-[9px] font-mono mt-0.5 opacity-90 font-bold">
                        {isCor ? '[1]' : '[0]'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail Soal & Status Jawaban */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white font-bold text-xs px-3 py-1 rounded-md">
                    SOAL NO. {currentReviewQ.number}
                  </span>
                  {isCurrentCorrect ? (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Jawaban Benar</span>
                    </span>
                  ) : isCurrentEmpty ? (
                    <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tidak Dijawab</span>
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 border border-red-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Jawaban Salah</span>
                    </span>
                  )}
                </div>

                {/* Badges Jawaban, Kunci & Kode IRT */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono">
                  <div className="bg-white px-3 py-1 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-sans text-xs mr-1.5">Jawaban Anda:</span>
                    <strong className={isCurrentCorrect ? 'text-emerald-600' : !isCurrentEmpty ? 'text-red-600' : 'text-slate-400'}>
                      {formatAnswerText(currentReviewUserAns)}
                    </strong>
                  </div>
                  <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 text-emerald-800 font-bold">
                    <span className="text-emerald-700 font-sans text-xs mr-1.5">Kunci Jawaban:</span>
                    <span>{formatAnswerText(currentReviewQ.key, true)}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-lg border font-bold flex items-center gap-1 ${
                    currentIrtCode === 1
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-red-600 text-white border-red-600'
                  }`}>
                    <span className="font-sans text-xs">Kode IRT:</span>
                    <span className="text-base">{currentIrtCode}</span>
                  </div>
                </div>
              </div>

              {/* Rincian Evaluasi Khusus Soal Tabel Benar/Salah */}
              {currentReviewQ.type === 'complex_table' && (
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-bold">
                    <span className="text-slate-700 uppercase tracking-wider text-[11px]">
                      Hasil Evaluasi Setiap Pernyataan
                    </span>
                    <span className={isCurrentCorrect ? "text-emerald-700" : "text-red-700 font-semibold"}>
                      {isCurrentCorrect ? "✓ Semua Pernyataan Benar (Skor IRT: 1)" : "✗ Ada Pernyataan Salah/Kosong (Skor IRT: 0)"}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {Array.from({ length: currentReviewQ.tableConfig?.rowCount || (Array.isArray(currentReviewQ.key) ? currentReviewQ.key.length : 4) }).map((_, rIdx) => {
                      const uVal = Array.isArray(currentReviewUserAns) ? currentReviewUserAns[rIdx] : '';
                      const kVal = Array.isArray(currentReviewQ.key) ? currentReviewQ.key[rIdx] : '';
                      const isMatch = uVal && normalizeVal(uVal) === normalizeVal(kVal);

                      return (
                        <div 
                          key={rIdx} 
                          className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                            isMatch ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'
                          }`}
                        >
                          <span className="font-semibold text-slate-700">Pernyataan {rIdx + 1}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600">
                              Jawaban Anda: <strong className={isMatch ? 'text-emerald-700' : 'text-red-700'}>{uVal || '(Kosong)'}</strong>
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-emerald-800">
                              Kunci: <strong>{kVal}</strong>
                            </span>
                            {isMatch ? (
                              <span className="text-emerald-600 font-bold">✓</span>
                            ) : (
                              <span className="text-red-600 font-bold">✗</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!isCurrentCorrect && (
                    <div className="text-[11px] text-red-600 pt-1 italic font-medium">
                      *Sesuai aturan penilaian IRT: jika salah 1 pernyataan, maka seluruh nomor dianggap salah (Kode IRT: 0).
                    </div>
                  )}
                </div>
              )}

              {/* Wacana / Teks Stimulus jika ada */}
              {currentReviewQ.stimulusImage && (
                <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center">
                  <div className="w-full text-xs font-bold uppercase tracking-wider mb-2 text-blue-700 flex items-center gap-1.5">
                    <span>Wacana / Teks Stimulus</span>
                  </div>
                  <div className="overflow-x-auto w-full flex justify-center">
                    <img
                      src={getAssetUrl(currentReviewQ.stimulusImage)}
                      alt="Wacana Stimulus"
                      className="max-w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Tampilan Gambar Soal */}
              <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex justify-center overflow-x-auto">
                {currentReviewQ.image ? (
                  <img
                    src={getAssetUrl(currentReviewQ.image)}
                    alt={`Soal No ${currentReviewQ.number}`}
                    className="max-w-full h-auto object-contain"
                  />
                ) : (
                  <div className="text-slate-400 py-6">Gambar soal tidak tersedia</div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
