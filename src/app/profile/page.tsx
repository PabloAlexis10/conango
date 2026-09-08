"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import AuthModal from "@/components/AuthModal";
import { ExamResult, SessionResult, UserProfile } from "@/lib/types";
import {
  getCurrentUser,
  getExamHistory,
  getSessionHistory,
  logoutAccount,
  subscribeAuth,
} from "@/lib/supabase";
import {
  Trophy,
  Award,
  BookOpen,
  Headphones,
  Calendar,
  Clock,
  LogOut,
  LogIn,
  Flame,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionResult[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const loadData = () => {
    const cur = getCurrentUser();
    setUser(cur);
    getExamHistory().then((data) => setExamHistory(data));
    getSessionHistory().then((data) => setSessionHistory(data));
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeAuth(() => {
      loadData();
    });
    return () => unsub();
  }, []);

  const totalExams = examHistory.length;
  const latestExam = examHistory[0];
  const avgPercentage =
    totalExams > 0
      ? Math.round(
          examHistory.reduce((acc, curr) => acc + curr.percentage, 0) / totalExams
        )
      : 0;

  const handleLogout = async () => {
    await logoutAccount();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header medals={user?.medals ?? 0} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* User Card */}
        <div className="bg-gradient-to-b from-[#FAF6F0] to-white rounded-3xl border-2 border-[#E5D5C5] shadow-conan-card p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <ConanMascot size="lg" mood="celebrate" animate={true} />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                {user ? "Cadete Registrado" : "Modo Invitado"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#6B4423]">
                {user?.name || user?.email || "Cadete Invitado"}
              </h1>
              <p className="text-xs text-[#A67B5B] font-semibold mt-1">
                {user ? (
                  <>
                    Correo: <span className="font-mono text-[#6B4423]">{user.email}</span> &bull; Medallas:{" "}
                    <strong className="text-[#F59E0B] font-black">{user.medals}</strong>
                  </>
                ) : (
                  "Inicia sesión para que tus medallas y notas queden guardadas en tu cuenta."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 border-2 border-[#E5D5C5] hover:border-[#A67B5B] rounded-xl text-xs font-bold text-red-600 bg-white hover:bg-red-50 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-conan-btn transition-transform active:translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión / Registrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border-2 border-[#E5D5C5] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-[#F59E0B]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#A67B5B] uppercase tracking-wider block">
                Exámenes de 100
              </span>
              <span className="text-2xl font-black text-[#6B4423]">{totalExams}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#E5D5C5] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-[#D97706]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#A67B5B] uppercase tracking-wider block">
                Último Porcentaje
              </span>
              <span className="text-2xl font-black text-[#F59E0B]">
                {latestExam ? `${latestExam.percentage}%` : "--"}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#E5D5C5] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#A67B5B] uppercase tracking-wider block">
                Promedio General
              </span>
              <span className="text-2xl font-black text-green-700">
                {avgPercentage > 0 ? `${avgPercentage}%` : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* Two Columns: Exam History & Session History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Exam History (100 Qs) */}
          <div className="bg-white rounded-3xl border-2 border-[#E5D5C5] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5D5C5]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                <h3 className="font-black text-lg text-[#6B4423]">
                  Historial de Exámenes (100 Qs)
                </h3>
              </div>
              <span className="text-xs font-bold text-[#A67B5B] bg-[#FAF6F0] px-2.5 py-1 rounded-full border">
                {examHistory.length} registros
              </span>
            </div>

            {examHistory.length === 0 ? (
              <div className="text-center py-8 text-[#A67B5B] text-sm">
                <p className="font-semibold mb-3">Aún no has rendido un examen oficial de 100 preguntas.</p>
                <Link
                  href="/practice?size=100"
                  className="inline-block px-4 py-2 bg-[#F59E0B] text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Rendir Examen de 100 Ahora
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {examHistory.map((exam, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#E5D5C5] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-[#6B4423]">
                          Examen Oficial {exam.type}
                        </span>
                        <span className="text-[10px] text-[#A67B5B]">
                          {new Date(exam.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs text-[#A67B5B] block mt-0.5">
                        {exam.correct} correctas / {exam.incorrect} incorrectas
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-[#F59E0B]">
                        {exam.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session History (10/30/50) */}
          <div className="bg-white rounded-3xl border-2 border-[#E5D5C5] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5D5C5]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-black text-lg text-[#6B4423]">
                  Quizzes Completados (10, 30, 50)
                </h3>
              </div>
              <span className="text-xs font-bold text-[#A67B5B] bg-[#FAF6F0] px-2.5 py-1 rounded-full border">
                {sessionHistory.length} registros
              </span>
            </div>

            {sessionHistory.length === 0 ? (
              <div className="text-center py-8 text-[#A67B5B] text-sm">
                <p className="font-semibold mb-3">No hay quizzes guardados aún.</p>
                <Link
                  href="/practice?size=10"
                  className="inline-block px-4 py-2 bg-[#F59E0B] text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Practicar Quiz de 10
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {sessionHistory.map((sess, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#E5D5C5] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-[#6B4423]">
                          Quiz {sess.size}Q ({sess.type})
                        </span>
                        <span className="text-[10px] text-[#A67B5B]">
                          {new Date(sess.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs text-[#A67B5B] block mt-0.5">
                        {sess.correct} correctas / {sess.incorrect} incorrectas
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-green-700">
                        {sess.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
