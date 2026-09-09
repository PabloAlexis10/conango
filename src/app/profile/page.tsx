"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import AuthModal from "@/components/AuthModal";
import AdBanner from "@/components/AdBanner";
import { ExamResult, SessionResult, UserProfile } from "@/lib/types";
import { getUserRankTitle } from "@/lib/accessories";
import {
  getCurrentUser,
  getExamHistory,
  getSessionHistory,
  logoutAccount,
  subscribeAuth,
  changePassword,
  getGuestUsageCount,
  GUEST_LIMIT,
  updateUserProfile,
  getUserMascotName,
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
  AlertCircle,
  Shield,
  KeyRound,
  Lock,
  Crown,
  Zap,
  Swords,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { getRankByXp } from "@/lib/accessories";
import ProSubscriptionModal from "@/components/ProSubscriptionModal";
import TacticalCertificateModal from "@/components/TacticalCertificateModal";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionResult[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [guestUsage, setGuestUsage] = useState<number>(0);
  const [selectedCertExam, setSelectedCertExam] = useState<ExamResult | null>(null);

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // Customization of user callsign and tactical mascot
  const [profileName, setProfileName] = useState("");
  const [profileMascot, setProfileMascot] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const loadData = () => {
    const cur = getCurrentUser();
    setUser(cur);
    if (cur) {
      setProfileName(cur.name || "");
      setProfileMascot(cur.mascotName || "Conan");
    }
    setGuestUsage(getGuestUsageCount());
    getExamHistory().then((data) => setExamHistory(data));
    getSessionHistory().then((data) => setSessionHistory(data));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileName.trim(), profileMascot.trim() || "Conan");
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (newPassword.length < 6) {
      setPwdError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Las nuevas contraseñas no coinciden.");
      return;
    }

    setPwdLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (!res.success) {
        setPwdError(res.error || "No se pudo actualizar la contraseña.");
      } else {
        setPwdSuccess("¡Contraseña actualizada exitosamente!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwdSuccess(""), 4000);
      }
    } catch {
      setPwdError("Error inesperado al cambiar la contraseña.");
    } finally {
      setPwdLoading(false);
    }
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
              {user?.isPro ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
                  <Crown className="w-3.5 h-3.5 text-yellow-200" />
                  <span>{getUserRankTitle(user?.xp || 0)} Conan PRO (Vidas ∞)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{user ? getUserRankTitle(user?.xp || 0) : "Modo Invitado (Prueba Limitada)"}</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-[#6B4423]">
                {user?.name || user?.email || getUserRankTitle(user?.xp || 0)}
              </h1>
              <p className="text-xs text-[#A67B5B] font-semibold mt-1">
                {user ? (
                  <>
                    Correo: <span className="font-mono text-[#6B4423]">{user.email}</span> &bull; Compañero:{" "}
                    <strong className="text-amber-700 font-bold">{getUserMascotName(user)} 🐾</strong> &bull; Medallas:{" "}
                    <strong className="text-[#F59E0B] font-black">{user.medals}</strong>
                  </>
                ) : (
                  <>
                    Has usado <strong className="text-[#6B4423]">{guestUsage} de {GUEST_LIMIT}</strong> lecciones gratuitas de prueba. Inicia sesión para tener acceso ilimitado.
                  </>
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
        {/* Rank and Gamification Stats */}
        <div className="bg-[#FAF6F0] p-5 rounded-3xl border-2 border-[#E5D5C5] mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getRankByXp(user?.xp || 0).currentRank.badge}</span>
              <div>
                <span className="text-xs font-black text-[#A67B5B] dark:text-slate-400 uppercase tracking-wider block">
                  Rango Oficial USAF
                </span>
                <h3 className="text-lg font-black text-[#6B4423] dark:text-white">
                  {getRankByXp(user?.xp || 0).currentRank.name} • {getRankByXp(user?.xp || 0).currentRank.abbr}
                </h3>
                {getRankByXp(user?.xp || 0).nextRank && (
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    Siguiente grado: <span className="font-black">{getRankByXp(user?.xp || 0).nextRank?.name}</span> ({getRankByXp(user?.xp || 0).nextRank?.abbr})
                  </p>
                )}
                <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-medium mt-1">
                  {getRankByXp(user?.xp || 0).currentRank.desc}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-[#E5D5C5] text-xs font-black text-orange-700 shadow-xs">
                <span>🔥</span>
                <span>{user?.streakDays || 1} Días</span>
              </div>
              {(user?.streakFreeze || 0) > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 rounded-xl border border-sky-200 text-xs font-black text-sky-700 shadow-xs">
                  <span>❄️</span>
                  <span>{user?.streakFreeze} Congelador</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-[#E5D5C5] text-xs font-black text-sky-600 shadow-xs">
                <span>💎</span>
                <span>{user?.gems ?? user?.coins ?? 50} Gemas</span>
              </div>
              <Link
                href="/shop"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-black shadow-xs transition-transform active:scale-95"
              >
                <span>🏪</span>
                <span>Tienda</span>
              </Link>
            </div>
          </div>

          <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#E5D5C5]">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500"
              style={{ width: `${getRankByXp(user?.xp || 0).progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#A67B5B] font-bold mt-1">
            <span>{user?.xp || 0} XP Acumulada</span>
            <span>Progreso: {getRankByXp(user?.xp || 0).progress}%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#E5D5C5]/60 flex items-center justify-between text-xs font-bold text-amber-900">
            {getRankByXp(user?.xp || 0).nextRank ? (
              <span>
                🎯 Te faltan <strong className="text-[#F59E0B] font-black">{Math.max(0, (getRankByXp(user?.xp || 0).nextRank?.minXp || 0) - (user?.xp || 0))} XP</strong> para ascender a <strong>{getRankByXp(user?.xp || 0).nextRank?.name} ({getRankByXp(user?.xp || 0).nextRank?.abbr})</strong>
              </span>
            ) : (
              <span className="text-emerald-700">🎖️ ¡Has alcanzado el Grado Supremo de General de la USAF!</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

        {/* Google Ads Placement in Profile */}
        <AdBanner
          className="mb-8"
          slotId="8765432109"
          sponsorTitle="Simulacros Oficiales con Certificación de Rendimiento ALCPT 🎖️"
          sponsorDescription="Valida tus resultados con informes oficiales de competencia militar y nivel de inglés OACI / ALCPT."
          sponsorCta="Ver Certificaciones"
        />

        {/* Pilot & Tactical Mascot Personalization */}
        {user && (
          <div className="bg-[#FAF6F0] rounded-3xl border-2 border-[#E5D5C5] p-6 sm:p-7 mb-8 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5D5C5]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🪖</span>
                <div>
                  <h3 className="font-black text-lg text-[#6B4423]">
                    Personaliza tu Base: Usuario y Mascota Táctica
                  </h3>
                  <p className="text-xs text-[#A67B5B] font-semibold">
                    Esta es tu aplicación de adiestramiento y tu compañero canino. Modifica tu nombre de usuario y el de tu mascota a tu gusto.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full hidden sm:inline-block">
                {getRankByXp(user.xp || 0).currentRank.abbr}
              </span>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
                    Tu Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Ej. Pablo, Alex, Carlos..."
                    required
                    className="w-full px-4 py-2 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-xs sm:text-sm bg-white text-[#6B4423] font-bold"
                  />
                  <p className="text-[10px] text-[#A67B5B] mt-1">
                    Aparecerá en tus diplomas oficiales y clasificaciones.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
                    Nombre de tu Mascota Táctica 🐾
                  </label>
                  <input
                    type="text"
                    value={profileMascot}
                    onChange={(e) => setProfileMascot(e.target.value)}
                    placeholder="Ej. Conan, Hunter, Zeus..."
                    required
                    className="w-full px-4 py-2 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-xs sm:text-sm bg-white text-[#6B4423] font-bold"
                  />
                  <p className="text-[10px] text-[#A67B5B] mt-1">
                    Tu fiel compañero canino en cada sesión y celebración.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-xs rounded-xl shadow-conan-btn transition-transform active:scale-95"
                >
                  Guardar Cambios
                </button>
                {profileSaved && (
                  <span className="text-xs font-bold text-green-700 animate-fade-in flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    ¡Datos de tu base actualizados con éxito!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Account Security & Password Section */}
        <div className="bg-[#FAF6F0] rounded-3xl border-2 border-[#E5D5C5] p-6 sm:p-7 mb-10 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#E5D5C5]">
            <Shield className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="font-black text-lg text-[#6B4423]">
              Seguridad de la Cuenta y Contraseña
            </h3>
          </div>

          {user ? (
            <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-3.5">
              <p className="text-xs text-[#A67B5B] font-semibold mb-3">
                Actualiza tu contraseña periódicamente para proteger tu historial y progreso.
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A67B5B] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-xs sm:text-sm bg-white text-[#6B4423]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#A67B5B] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-xs sm:text-sm bg-white text-[#6B4423]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#A67B5B] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva clave"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-xs sm:text-sm bg-white text-[#6B4423]"
                    />
                  </div>
                </div>
              </div>

              {pwdError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}

              {pwdSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-bold text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pwdLoading}
                className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-2 transition-transform active:scale-98"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{pwdLoading ? "Actualizando..." : "Cambiar Contraseña"}</span>
              </button>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#E5D5C5]">
              <div>
                <h4 className="text-sm font-black text-[#6B4423] mb-1">
                  Protege tu cuenta y desbloquea acceso ilimitado
                </h4>
                <p className="text-xs text-[#A67B5B] font-medium">
                  Crea una cuenta gratuita con contraseña para guardar tus medallas y seguir practicando sin límites de lecciones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-black rounded-xl shadow-sm whitespace-nowrap"
              >
                Crear Cuenta Gratis
              </button>
            </div>
          )}
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

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-lg font-black text-[#F59E0B]">
                          {exam.percentage}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCertExam(exam)}
                        className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1 shadow-2xs"
                        title="Ver Diploma Oficial de este examen"
                      >
                        <Award className="w-4 h-4 text-amber-700" />
                        <span className="hidden sm:inline text-[11px]">Diploma</span>
                      </button>
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

      {selectedCertExam && (
        <TacticalCertificateModal
          isOpen={!!selectedCertExam}
          onClose={() => setSelectedCertExam(null)}
          cadetName={user?.name || user?.email?.split("@")[0] || getUserRankTitle(user?.xp || 0)}
          percentage={selectedCertExam.percentage}
          correctAnswers={selectedCertExam.correct}
          formulaNumber={selectedCertExam.type || "Oficial"}
          dateStr={new Date(selectedCertExam.created_at).toLocaleDateString("es-CL", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      )}
    </div>
  );
}
