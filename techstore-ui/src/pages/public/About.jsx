import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles, Target, Eye, ShieldCheck, Truck, Wrench,
    Award, Users, ArrowRight, HeartHandshake, Phone, Mail,
    MapPin, ChevronRight, CheckCircle2, Clock
} from 'lucide-react';
import AboutService from '../../services/about.service';

const About = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await AboutService.getPublic();
                if (res && (res.status === 'success' || res.data)) {
                    setData(res.data || res);
                }
            } catch (err) {
                console.error("Erreur chargement À Propos", err);
            } finally {
                setLoading(false);
            }
        };
        load();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const content = data?.content || {};
    const dynamicStats = data?.dynamicStats || {};
    const globalContact = data?.globalContact || {};

    let values = [];
    let team = [];
    let commitments = [];
    let gallery = [];

    try { values = JSON.parse(content.valuesJson || '[]'); } catch {}
    try { team = JSON.parse(content.teamJson || '[]'); } catch {}
    try { commitments = JSON.parse(content.commitmentsJson || '[]'); } catch {}
    try { gallery = JSON.parse(content.galleryJson || '[]'); } catch {}

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-pulse">
                <div className="h-64 bg-gray-100 dark:bg-[#121526] rounded-3xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-gray-100 dark:bg-[#121526] rounded-2xl" />
                    ))}
                </div>
                <div className="h-48 bg-gray-100 dark:bg-[#121526] rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 space-y-16">

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 1. HERO PRÉSENTATION DE L'ENTREPRISE                              */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#071330] via-[#0b2158] to-[#0d1636] border border-blue-500/20 shadow-2xl p-6 sm:p-12 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles size={13} className="text-blue-400" />
                        <span>{content.companyName || 'DAKORA BUSINESS'}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                        {content.mainTitle || "Leader en technologies et solutions pour l'élevage"}
                    </h1>

                    <p className="text-xs sm:text-sm text-blue-200/80 leading-relaxed font-medium">
                        {content.subtitle || "Votre partenaire de confiance pour des équipements modernes, des couveuses haute performance et un accompagnement de pointe."}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                        <Link
                            to={content.ctaUrl || '/collections'}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/40 transition-all active:scale-95"
                        >
                            <span>{content.ctaText || 'Explorer nos collections'}</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {content.mainImageUrl && (
                    <div className="relative z-10 w-full sm:w-80 h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0">
                        <img src={content.mainImageUrl} alt="DAKORA BUSINESS" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 2. STATISTIQUES DYNAMIQUES RÉELLES DE LA PLATEFORME               */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#121526] border border-white/5 text-center shadow-lg">
                    <p className="text-2xl sm:text-3xl font-black text-white">
                        {dynamicStats.totalProducts != null ? dynamicStats.totalProducts : '—'}
                    </p>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-1">Produits en Stock</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#121526] border border-white/5 text-center shadow-lg">
                    <p className="text-2xl sm:text-3xl font-black text-white">
                        {dynamicStats.totalCategories != null ? dynamicStats.totalCategories : '—'}
                    </p>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-1">Rayons & Spécialités</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#121526] border border-white/5 text-center shadow-lg">
                    <p className="text-2xl sm:text-3xl font-black text-white">
                        {dynamicStats.totalClients != null ? dynamicStats.totalClients : '—'}
                    </p>
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-1">Éleveurs Inscrits</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#121526] border border-white/5 text-center shadow-lg">
                    <p className="text-2xl sm:text-3xl font-black text-white">
                        +{dynamicStats.yearsExperience || 4} Ans
                    </p>
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">D'Expérience Terrain</p>
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 3. HISTOIRE DE L'ENTREPRISE                                       */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="p-6 sm:p-10 rounded-3xl bg-[#121526] border border-white/5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-wider">
                    <Clock size={16} />
                    <span>Depuis {content.historyYear || '2020'}</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                    {content.historyTitle || 'Notre Histoire & Genèse'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal whitespace-pre-line">
                    {content.historyText || content.generalDescription || "DAKORA BUSINESS est née d'une vision : moderniser l'élevage et l'aviculture en Afrique en fournissant du matériel fiable, durable et à la portée de chaque entrepreneur agricole."}
                </p>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 4. MISSION & VISION                                               */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="grid md:grid-cols-2 gap-6">
                {content.missionVisible !== false && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121526] to-[#0c1022] border border-blue-500/20 shadow-lg space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl">
                            <Target size={24} />
                        </div>
                        <h3 className="text-lg font-black text-white">Notre Mission</h3>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                            {content.missionText || "Démocratiser l'accès aux technologies d'élevage modernes afin d'accroître la productivité, la sécurité sanitaire et la rentabilité de chaque éleveur."}
                        </p>
                    </div>
                )}

                {content.visionVisible !== false && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121526] to-[#0c1022] border border-purple-500/20 shadow-lg space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl">
                            <Eye size={24} />
                        </div>
                        <h3 className="text-lg font-black text-white">Notre Vision</h3>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                            {content.visionText || "Devenir la référence incontournable du matériel d'élevage intelligent en Afrique Centrale d'ici 2030."}
                        </p>
                    </div>
                )}
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 5. NOS VALEURS                                                    */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {values.length > 0 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-white tracking-tight">Nos Valeurs</h2>
                        <p className="text-xs text-gray-400 mt-1">Les principes qui guident nos actions au quotidien</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {values.map((val, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-[#121526] border border-white/5 space-y-2 shadow-lg">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                                    <Sparkles size={18} />
                                </div>
                                <h3 className="text-sm font-black text-white">{val.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{val.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 6. NOS ENGAGEMENTS & GARANTIE SAV                                 */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {commitments.length > 0 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-white tracking-tight">Nos Engagements</h2>
                        <p className="text-xs text-gray-400 mt-1">Une garantie de qualité et un service après-vente permanent</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-5">
                        {commitments.map((c, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-[#121526] border border-white/5 space-y-2 shadow-lg">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                                    <CheckCircle2 size={18} />
                                </div>
                                <h3 className="text-sm font-black text-white">{c.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{c.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 7. NOTRE ÉQUIPE                                                   */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {team.length > 0 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-white tracking-tight">Notre Équipe</h2>
                        <p className="text-xs text-gray-400 mt-1">Des experts dévoués à votre réussite</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {team.filter(m => m.isVisible !== false).map((m, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-[#121526] border border-white/5 space-y-3 shadow-lg text-center">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-xl">
                                    <div className="w-full h-full rounded-full bg-[#121526] flex items-center justify-center font-black text-white text-xl overflow-hidden">
                                        {m.photoUrl ? (
                                            <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                                        ) : (
                                            (m.name?.[0] || 'D')
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">{m.name}</h3>
                                    <p className="text-xs text-blue-400 font-bold mt-0.5">{m.role}</p>
                                </div>
                                {m.bio && <p className="text-[11px] text-gray-400 leading-relaxed">{m.bio}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* 8. COORDONNÉES ET CONTACT                                         */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="p-8 rounded-3xl bg-[#121526] border border-white/5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-black text-white">Une question ? Un projet d'élevage ?</h2>
                    <p className="text-xs text-gray-400 mt-1">Notre équipe technique est disponible pour vous conseiller.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <a
                        href={`tel:${globalContact.phone || '+237686669222'}`}
                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center gap-2"
                    >
                        <Phone size={14} className="text-blue-400" />
                        <span>{globalContact.phone || '+237 686 669 222'}</span>
                    </a>
                    <a
                        href="https://wa.me/237686669222"
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                    >
                        <span>WhatsApp direct</span>
                    </a>
                </div>
            </div>

        </div>
    );
};

export default About;
