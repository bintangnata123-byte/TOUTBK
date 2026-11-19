import React, { useState } from 'react';
import { SUBTESTS, TOTAL_EXAM_QUESTIONS, TOTAL_EXAM_DURATION_MINUTES } from '../data/tryoutConfig';
import { 
  User, FileText, ShieldCheck, 
  ArrowRight, RotateCcw, KeyRound, AlertCircle, Check
} from 'lucide-react';

const REQUIRED_TOKEN = 'TOSUSULANUTBK';

export default function StartScreen({ onStartExam, hasSavedProgress, onResumeExam, onResetExam }) {
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isTokenMatch = token.trim().toUpperCase() === REQUIRED_TOKEN;
  const isFormValid = name.trim().length > 0 && className.trim().length > 0 && isTokenMatch && agreed;

  const handleStartClick = () => {
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Nama Lengkap Peserta wajib diisi.');
      return;
    }
    if (!className.trim()) {
      setErrorMessage('Kelas wajib diisi.');
      return;
    }
    if (!token.trim()) {
      setErrorMessage('Kode Masuk / Token Ujian wajib diisi.');
      return;
    }
    if (!isTokenMatch) {
      setErrorMessage(`Kode token "${token.trim()}" tidak valid! Gunakan token resmi: ${REQUIRED_TOKEN}`);
      return;
    }
    if (!agreed) {
      setErrorMessage('Anda harus menyetujui tata tertib pengerjaan ujian.');
      return;
    }

    onStartExam(name.trim(), className.trim());
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between py-6 px-3 sm:px-6 select-none">
      
      {/* Top Banner */}
      <div className="max-w-4xl mx-auto w-full mb-6">
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-xl tracking-wider shadow-md text-white border border-blue-400/30">
              UTBK
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-blue-400 font-bold">
                SIMULASI CBT RESMI
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                TRYOUT UTBK-SNBT
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Sistem Ujian Tertulis Berbasis Komputer Standar Balai Pengelolaan Pengujian Pendidikan (BPPP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60 text-xs sm:text-sm">
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Total Alokasi Waktu:</span>
              <span className="font-bold text-emerald-400 text-sm sm:text-base">{TOTAL_EXAM_DURATION_MINUTES} Menit (3 Jam 15 Mnt)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full space-y-6">

        {/* Saved Progress Alert if any */}
        {hasSavedProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Ditemukan Progres Ujian Sebelumnya</h4>
                <p className="text-xs text-slate-600">
                  Anda memiliki pengerjaan yang belum diselesaikan. Anda dapat melanjutkannya sekarang.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onResetExam}
                className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Ulang dari Awal
              </button>
              <button
                onClick={onResumeExam}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Lanjutkan Ujian</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Card Data Peserta: Nama dan Kelas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Konfirmasi Data Peserta Ujian</span>
          </div>
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5">
                Nama Lengkap Peserta <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-blue-600 focus:bg-white transition-colors"
                  placeholder="Masukkan Nama Lengkap Anda"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1.5">
                Kelas <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={className}
                  onChange={(e) => {
                    setClassName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-blue-600 focus:bg-white transition-colors"
                  placeholder="Contoh: XII MIPA 1 atau Alumni"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Kode Masuk / Token Tryout */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Kode Masuk / Token Akses Tryout</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-normal">Wajib diisi</span>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            <label className="text-slate-700 font-semibold text-xs sm:text-sm block">
              Masukkan Token Akses Ujian: <span className="text-red-500">*</span>
            </label>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value.toUpperCase());
                    if (errorMessage) setErrorMessage('');
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl font-mono text-base sm:text-lg font-bold tracking-wider uppercase transition-colors ${
                    token.trim() === ''
                      ? 'border-slate-300 text-slate-800 focus:bg-white focus:outline-blue-600'
                      : isTokenMatch
                      ? 'border-emerald-500 text-emerald-800 bg-emerald-50/50 focus:outline-emerald-600'
                      : 'border-red-400 text-red-700 bg-red-50/30 focus:outline-red-500'
                  }`}
                  placeholder="Ketikkan kode token..."
                />
              </div>

              {/* Token Status Badge */}
              <div className="shrink-0 flex items-center">
                {token.trim() === '' ? (
                  <span className="text-xs text-slate-400 italic px-2">
                    Token akses: <strong className="font-mono text-slate-600">TOSUSULANUTBK</strong>
                  </span>
                ) : isTokenMatch ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Token Valid!</span>
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 border border-red-300 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Token Salah</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              * Hubungi pengawas jika Anda belum memiliki token. Kode akses untuk tryout susulan ini adalah: <strong className="font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">TOSUSULANUTBK</strong>
            </p>
          </div>
        </div>

        {/* Rincian 7 Subtes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Daftar 7 Subtes Ujian ({TOTAL_EXAM_QUESTIONS} Soal)</span>
            </div>
            <span className="text-xs text-slate-500 font-normal">Mode Simulasi Resmi</span>
          </div>

          <div className="p-4 sm:p-5 divide-y divide-slate-100">
            {SUBTESTS.map((sub, idx) => (
              <div key={sub.id} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800">{sub.name}</div>
                    <div className="text-slate-400 text-xs">{sub.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium text-xs">
                    {sub.totalQuestions} Soal
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md font-bold text-xs font-mono">
                    {sub.duration / 60} Menit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tata Tertib & Persetujuan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tata Tertib Pengerjaan CBT UTBK</span>
          </div>

          <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc list-inside leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            <li>Ujian berjalan dalam <strong>Mode Simulasi Resmi</strong> dengan total 7 subtes teratur.</li>
            <li>Alokasi waktu dihitung <strong>per subtes</strong>. Bila waktu subtes habis, sistem secara otomatis beralih ke subtes berikutnya.</li>
            <li>Sesuai peraturan resmi UTBK, peserta <strong>tidak dapat kembali</strong> ke subtes yang telah selesai.</li>
            <li>Nomor soal yang sudah dijawab akan ditandai dengan <strong>warna hijau</strong> pada palet nomor soal.</li>
            <li>Pilihan jawaban tersimpan secara otomatis setiap kali Anda memilih opsi.</li>
            <li>Setelah menyelesaikan subtes ke-7, hasil evaluasi dan data kode respons IRT (1 untuk jawaban benar, 0 untuk salah/kosong) akan langsung ditampilkan.</li>
          </ul>

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (errorMessage) setErrorMessage('');
              }}
              className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-700 font-medium">
              Saya telah membaca, memahami, dan menyetujui seluruh ketentuan tata tertib pelaksanaan simulasi UTBK di atas.
            </span>
          </label>

          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-xs sm:text-sm text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={handleStartClick}
            disabled={!isFormValid}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all ${
              isFormValid
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer shadow-blue-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <span>MULAI UJIAN SEKARANG</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 mt-6">
        Simulasi Mandiri CBT Tryout UTBK SNBT • Powered by React & Tailwind CSS
      </div>

    </div>
  );
}
