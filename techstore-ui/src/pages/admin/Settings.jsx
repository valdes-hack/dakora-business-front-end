import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import baseApi from '../../api/axiosConfig';
import {
    Save, Loader, Settings as SettingsIcon, Image as ImageIcon,
    X, Upload, PhoneCall, CheckCircle2,
    AlertCircle, Eye, Globe, Mail, MapPin, Phone, Bell, Flame,
    LayoutGrid, PackagePlus, Lock, ChevronDown, Layers,
    ChevronRight, Store, Hash, FileText, Share2, Search, Sliders, Shield,
    AlertTriangle, ExternalLink, Server, Clock, BarChart3,
    Video, Users, ShoppingCart
} from 'lucide-react';

// Icône "en attente/chargement" inline pour la stat pending
const Loader2_ = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>;
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useStockConfig } from '../../context/StockConfigContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════
// CATEGORIES DU PANNEAU DROIT
// ═══════════════════════════════════════════
const CATEGORIES = [
    {
        id: 'identity', icon: Store, label: 'Boutique & Identité',
        desc: 'Personnalisez l\'identité de votre boutique', color: '#6366f1',
        subsections: [
            { id: 'identity.name',    label: 'Nom et logo de la boutique' },
            { id: 'identity.desc',    label: 'Description et slogan' },
            { id: 'identity.contact', label: 'Informations de contact' },
            { id: 'identity.social',  label: 'Réseaux sociaux' },
            { id: 'identity.meta',    label: 'Favicon et métadonnées' },
        ],
    },
    {
        id: 'stock', icon: PackagePlus, label: 'Gestion des stocks',
        desc: 'Gérez vos stocks et variantes', color: '#f59e0b',
        subsections: [
            { id: 'stock.mode',   label: 'Mode de gestion' },
            { id: 'stock.alerts', label: 'Alertes de stock faible' },
        ],
    },
    {
        id: 'banners', icon: ImageIcon, label: 'Bannières',
        desc: 'Accueil, Promotions, Collections', color: '#8b5cf6',
        subsections: [
            { id: 'banners.home',        label: 'Bannière d\'accueil (slider + vidéo)' },
            { id: 'banners.promotions',  label: 'Bannière Promotions' },
            { id: 'banners.collections', label: 'Bannière Collections (défaut)' },
        ],
    },
    {
        id: 'contact', icon: PhoneCall, label: 'Contact & Support',
        desc: 'Vos moyens de contact', color: '#10b981',
        subsections: [
            { id: 'contact.info',    label: 'Email, téléphone & WhatsApp' },
            { id: 'contact.address', label: 'Adresse physique' },
            { id: 'contact.hours',   label: 'Horaires de disponibilité' },
        ],
    },
    {
        id: 'bento', icon: LayoutGrid, label: 'Cartes Bento',
        desc: 'Organisez vos cartes d\'accueil', color: '#06b6d4',
        subsections: [
            { id: 'bento.config', label: 'Configuration des 4 cartes' },
        ],
    },
    {
        id: 'alerts', icon: Bell, label: 'Alertes & Actions',
        desc: 'Configurez vos alertes', color: '#ef4444',
        subsections: [
            { id: 'alerts.admin',  label: 'Notifications administrateur' },
            { id: 'alerts.client', label: 'Notifications clients' },
        ],
    },
    {
        id: 'promotions', icon: Flame, label: 'Promos & Remises',
        desc: 'Comportement des offres', color: '#f97316',
        subsections: [
            { id: 'promotions.settings', label: 'Paramètres des promotions' },
        ],
    },
    {
        id: 'seo', icon: Search, label: 'SEO & Référencement',
        desc: 'Optimisez votre boutique', color: '#a855f7',
        subsections: [
            { id: 'seo.basic',  label: 'Titre & description SEO' },
            { id: 'seo.social', label: 'Image de partage (OG)' },
        ],
    },
    {
        id: 'collections', icon: LayoutGrid, label: 'Paramètres Collections',
        desc: "Contrôlez l'affichage et la bannière des collections", color: '#3b82f6',
        subsections: [
            { id: 'collections.display', label: 'Affichage & Mode grille' },
            { id: 'collections.banner',  label: 'Bannière des collections' },
            { id: 'collections.cards',   label: 'Cartes & Éléments visibles' },
            { id: 'collections.filters', label: 'Filtres & Tri par défaut' },
        ],
    },
    {
        id: 'advanced', icon: Sliders, label: 'Avancées',
        desc: 'Options avancées', color: '#6b7280',
        subsections: [
            { id: 'advanced.maintenance', label: 'Mode maintenance' },
            { id: 'advanced.security',    label: 'Sécurité & Sessions' },
        ],
    },
];

// ═══════════════════════════════════════════
// COMPOSANTS UI RÉUTILISABLES
// (utilisent les classes Tailwind dark/light du projet)
// ═══════════════════════════════════════════

const SLabel = ({ children }) => (
    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
        {children}
    </label>
);

const SInput = ({ icon: Icon, ...props }) => (
    <div className="relative">
        {Icon && <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
            {...props}
            className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                rounded-xl py-3 ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-sm font-medium
                text-slate-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-600
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all`}
        />
    </div>
);

const STextarea = (props) => (
    <textarea
        {...props}
        rows={3}
        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
            rounded-xl py-3 px-4 text-sm font-medium text-slate-900 dark:text-white
            outline-none placeholder-gray-400 dark:placeholder-gray-600 resize-none
            focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
    />
);

const Toggle = ({ value, onChange, label, desc, color = '#6366f1' }) => (
    <div className="flex items-center justify-between p-4 rounded-xl gap-4
        bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/5">
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
            {desc && <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{desc}</p>}
        </div>
        <button type="button" onClick={() => onChange(!value)}
            style={{ background: value ? color : undefined }}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0
                ${value ? '' : 'bg-gray-300 dark:bg-white/20'}`}>
            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform"
                style={{ transform: value ? 'translateX(26px)' : 'translateX(2px)' }} />
        </button>
    </div>
);

const SectionTitle = ({ title, desc, icon: Icon, color = '#6366f1' }) => (
    <div className="mb-5 pb-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2.5 mb-1">
            {Icon && <Icon size={18} style={{ color }} />}
            <h3 className="text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">{title}</h3>
        </div>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>}
    </div>
);

// Bouton upload fichier + input caché
const UploadBtn = ({ label, onUpload, loading, inputRef, accept = 'image/*' }) => (
    <>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onUpload} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider
                border border-dashed border-indigo-500 text-indigo-500
                hover:bg-indigo-500/10 transition-all disabled:opacity-50">
            {loading ? <Loader size={13} className="animate-spin" /> : <Upload size={13} />}
            {loading ? 'Envoi...' : label}
        </button>
    </>
);

const ImagePreview = ({ url, label, onRemove }) => {
    if (!url) return null;
    return (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
            <img src={getFullImageUrl(url)} alt={label} className="w-full h-36 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 justify-between">
                <span className="text-white text-[10px] font-black uppercase tracking-wider">{label}</span>
                {onRemove && (
                    <button type="button" onClick={onRemove}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors">
                        <X size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════
// STAT CARD  (couleurs du projet)
// ═══════════════════════════════════════════
const StatCard = ({ icon: Icon, value, label, change, color }) => (
    <div className="bg-white dark:bg-[#161926] border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl" style={{ background: `${color}22` }}>
                <Icon size={20} style={{ color }} />
            </div>
            {change && <span className="text-xs font-black text-emerald-500">{change}</span>}
        </div>
        <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{value}</div>
            <div className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{label}</div>
        </div>
    </div>
);

// ═══════════════════════════════════════════
// FORMULAIRES PAR SOUS-SECTION
// ═══════════════════════════════════════════

// ── IDENTITÉ ──────────────────────────────
const FormIdentityName = ({ formData, setFormData, uploadingFile, setUploadingFile, showToast }) => {
    const logoRef = useRef(null);
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleLogoUpload = async (e) => {
        if (!e.target.files?.[0]) return;
        setUploadingFile(true);
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        try {
            const r = await baseApi.post('/settings/upload-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormData(p => ({ ...p, logoUrl: r.data.data }));
            showToast('success', 'Logo mis à jour !');
        } catch { showToast('error', 'Erreur upload logo'); }
        finally { setUploadingFile(false); if (e.target) e.target.value = null; }
    };
    return (
        <div className="space-y-5">
            <SectionTitle title="Nom et Logo" desc="Apparaissent dans la navbar, le footer et les factures." icon={Store} color="#6366f1" />
            <div>
                <SLabel>Nom officiel du site *</SLabel>
                <SInput name="siteName" value={formData.siteName} onChange={h} placeholder="PEOC (Petit Éleveur de l'Ouest Cameroun)" />
            </div>
            <div>
                <SLabel>Sous-titre / Accroche</SLabel>
                <SInput name="siteSubtitle" value={formData.siteSubtitle || ''} onChange={h} placeholder="Votre partenaire élevage au Cameroun" />
            </div>
            <div>
                <SLabel>Logo de la boutique</SLabel>
                <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border border-indigo-500/20 bg-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.logoUrl
                            ? <img src={getFullImageUrl(formData.logoUrl)} alt="Logo" className="w-full h-full object-contain" />
                            : <span className="text-2xl font-black text-indigo-500">{(formData.siteName || 'P')[0]}</span>}
                    </div>
                    <div className="flex-1 space-y-2">
                        <SInput name="logoUrl" value={formData.logoUrl || ''} onChange={h} placeholder="https://..." />
                        <div className="flex items-center gap-3">
                            <UploadBtn label="Uploader" onUpload={handleLogoUpload} loading={uploadingFile} inputRef={logoRef} />
                            {formData.logoUrl && (
                                <button type="button" onClick={() => setFormData(p => ({ ...p, logoUrl: '' }))}
                                    className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors">
                                    Supprimer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormIdentityDesc = ({ formData, setFormData }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-5">
            <SectionTitle title="Description & Slogan" desc="Présentez votre boutique aux visiteurs." icon={FileText} color="#6366f1" />
            <div><SLabel>Description courte</SLabel><STextarea name="siteDescription" value={formData.siteDescription || ''} onChange={h} placeholder="Votre boutique spécialisée en équipements d'élevage..." /></div>
            <div><SLabel>Slogan</SLabel><SInput name="siteSlogan" value={formData.siteSlogan || ''} onChange={h} placeholder="Qualité · Innovation · Confiance" /></div>
        </div>
    );
};

const FormIdentityContact = ({ formData, setFormData }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-5">
            <SectionTitle title="Informations de contact" icon={PhoneCall} color="#10b981" />
            <div><SLabel>Email de contact *</SLabel><SInput icon={Mail} type="email" name="contactEmail" value={formData.contactEmail} onChange={h} placeholder="contact@peoc.cm" /></div>
            <div><SLabel>Téléphone / WhatsApp *</SLabel><SInput icon={Phone} name="contactPhone" value={formData.contactPhone} onChange={h} placeholder="+237 686 669 222" /></div>
            <div><SLabel>Adresse physique</SLabel><SInput icon={MapPin} name="contactAddress" value={formData.contactAddress} onChange={h} placeholder="Bafoussam, Ouest — Cameroun" /></div>
        </div>
    );
};

const FormIdentitySocial = ({ formData, setFormData }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-5">
            <SectionTitle title="Réseaux sociaux" icon={Share2} color="#6366f1" />
            {[
                { name: 'facebookUrl', label: 'Facebook' },
                { name: 'instagramUrl', label: 'Instagram' },
                { name: 'twitterUrl', label: 'Twitter / X' },
                { name: 'youtubeUrl', label: 'YouTube' },
                { name: 'whatsappNumber', label: 'WhatsApp' },
            ].map(s => (
                <div key={s.name}><SLabel>{s.label}</SLabel><SInput icon={Globe} name={s.name} value={formData[s.name] || ''} onChange={h} placeholder="https://..." /></div>
            ))}
        </div>
    );
};

const FormIdentityMeta = ({ formData, setFormData, uploadingFile, setUploadingFile, showToast }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const favRef = useRef(null);
    const handleFavUpload = async (e) => {
        if (!e.target.files?.[0]) return;
        setUploadingFile(true);
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        try {
            const r = await baseApi.post('/settings/upload-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormData(p => ({ ...p, faviconUrl: r.data.data }));
            showToast('success', 'Favicon mis à jour !');
        } catch { showToast('error', 'Erreur upload favicon'); }
        finally { setUploadingFile(false); if (e.target) e.target.value = null; }
    };
    return (
        <div className="space-y-5">
            <SectionTitle title="Favicon & Métadonnées" icon={Hash} color="#6366f1" />
            <div>
                <SLabel>URL du Favicon</SLabel>
                <SInput name="faviconUrl" value={formData.faviconUrl || ''} onChange={h} placeholder="https://..." />
                <div className="flex items-center gap-3 mt-2">
                    <UploadBtn label="Uploader favicon" onUpload={handleFavUpload} loading={uploadingFile} inputRef={favRef} />
                    {formData.faviconUrl && <img src={getFullImageUrl(formData.faviconUrl)} alt="favicon" className="w-8 h-8 rounded object-contain border border-gray-200 dark:border-white/10" />}
                </div>
            </div>
            <div><SLabel>Titre SEO</SLabel><SInput name="seoTitle" value={formData.seoTitle || ''} onChange={h} placeholder="PEOC — Équipements d'élevage au Cameroun" /></div>
            <div><SLabel>Description meta</SLabel><STextarea name="seoDescription" value={formData.seoDescription || ''} onChange={h} placeholder="Boutique spécialisée en poussins, couveuses..." /></div>
        </div>
    );
};

// ── STOCK ─────────────────────────────────
const FormStockMode = ({ stockConfig, updateStockConfig, showToast }) => (
    <div className="space-y-5">
        <SectionTitle title="Mode de gestion des stocks" desc="Canaux autorisés pour entrer du stock." icon={PackagePlus} color="#f59e0b" />
        <Toggle value={stockConfig.manageStockViaSupply} label="Gérer via Ravitaillement"
            desc="Enregistrer les arrivages via bons fournisseurs." color="#6366f1"
            onChange={v => {
                if (!v && !stockConfig.manageStockDirectly) { showToast('error', 'Gardez au moins un mode actif.'); return; }
                updateStockConfig({ manageStockViaSupply: v });
                showToast(v ? 'success' : 'error', v ? 'Ravitaillement activé !' : 'Ravitaillement bloqué !');
            }} />
        <Toggle value={stockConfig.manageStockDirectly} label="Saisie directe dans la fiche produit"
            desc="Saisir le stock dans le formulaire produit." color="#10b981"
            onChange={v => {
                if (!v && !stockConfig.manageStockViaSupply) { showToast('error', 'Gardez au moins un mode actif.'); return; }
                updateStockConfig({ manageStockDirectly: v });
                showToast('success', v ? 'Saisie directe activée !' : 'Saisie directe désactivée !');
            }} />
        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-gray-500 dark:text-gray-400">
            ⚡ Les changements prennent effet instantanément dans toute l'application.
        </div>
    </div>
);

const FormStockAlerts = ({ formData, setFormData }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-5">
            <SectionTitle title="Alertes de stock faible" desc="Alerte quand le stock passe sous un seuil." icon={AlertTriangle} color="#f59e0b" />
            <div>
                <SLabel>Seuil minimum de stock</SLabel>
                <SInput type="number" name="stockAlertThreshold" value={formData.stockAlertThreshold || 5} onChange={h} placeholder="5" />
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Alerte si un produit passe en dessous de ce seuil.</p>
            </div>
        </div>
    );
};

// ── BANNIÈRES ─────────────────────────────
// Bloc réutilisable pour une bannière (photo + vidéo)
const BannerBlock = ({ title, imageKey, videoKey, formData, setFormData, uploadingFile, setUploadingFile, showToast }) => {
    const imgRef = useRef(null);
    const vidRef = useRef(null);
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleUpload = async (e, key, successMsg) => {
        if (!e.target.files?.[0]) return;
        const isVideo = e.target.files[0].type.startsWith('video');
        setUploadingFile(true);
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        try {
            const r = await baseApi.post('/settings/upload-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormData(p => ({ ...p, [key]: r.data.data }));
            showToast('success', successMsg);
        } catch { showToast('error', 'Erreur upload'); }
        finally { setUploadingFile(false); if (e.target) e.target.value = null; }
    };

    return (
        <div className="space-y-5 p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#161926]">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-500">{title}</p>

            {/* IMAGE */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <ImageIcon size={14} className="text-gray-400 dark:text-gray-500" />
                    <SLabel>Photo / Image de bannière</SLabel>
                </div>
                <SInput name={imageKey} value={formData[imageKey] || ''} onChange={h} placeholder="https://... ou coller une URL d'image" />
                <div className="flex gap-3 items-center flex-wrap">
                    <UploadBtn label="📷 Uploader une photo" onUpload={e => handleUpload(e, imageKey, 'Photo mise à jour !')} loading={uploadingFile} inputRef={imgRef} accept="image/*" />
                    {formData[imageKey] && (
                        <button type="button" onClick={() => setFormData(p => ({ ...p, [imageKey]: '' }))}
                            className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors">
                            Supprimer la photo
                        </button>
                    )}
                </div>
                <ImagePreview url={formData[imageKey]} label={`Aperçu — ${title}`} onRemove={() => setFormData(p => ({ ...p, [imageKey]: '' }))} />
            </div>

            {/* VIDÉO */}
            {videoKey && (
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <Video size={14} className="text-gray-400 dark:text-gray-500" />
                        <SLabel>Vidéo de bannière (optionnel)</SLabel>
                    </div>
                    <SInput name={videoKey} value={formData[videoKey] || ''} onChange={h} placeholder="https://... ou coller une URL vidéo MP4" />
                    <div className="flex gap-3 items-center flex-wrap">
                        <UploadBtn label="🎬 Uploader une vidéo" onUpload={e => handleUpload(e, videoKey, 'Vidéo mise à jour !')} loading={uploadingFile} inputRef={vidRef} accept="video/*" />
                        {formData[videoKey] && (
                            <button type="button" onClick={() => setFormData(p => ({ ...p, [videoKey]: '' }))}
                                className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors">
                                Supprimer la vidéo
                            </button>
                        )}
                    </div>
                    {formData[videoKey] && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 flex items-center gap-2">
                            <CheckCircle2 size={13} /> Vidéo définie — elle aura la priorité sur la photo.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Bannière accueil : slider images + vidéo séparés
const FormBannersHome = ({ heroImagesUrls, setHeroImagesUrls, heroVideoUrl, setHeroVideoUrl, uploadingFile, setUploadingFile, showToast }) => {
    const [newLink, setNewLink] = useState('');
    const imgRef = useRef(null);
    const vidRef = useRef(null);

    const handleAddLink = () => {
        if (newLink.trim()) { setHeroImagesUrls(p => [...p, newLink.trim()]); setNewLink(''); showToast('success', 'Image ajoutée !'); }
    };

    const handleImgUpload = async (e) => {
        if (!e.target.files?.[0]) return;
        setUploadingFile(true);
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        try {
            const r = await baseApi.post('/settings/upload-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setHeroImagesUrls(p => [...p, r.data.data]);
            showToast('success', 'Image ajoutée au slider !');
        } catch { showToast('error', 'Erreur upload'); }
        finally { setUploadingFile(false); if (e.target) e.target.value = null; }
    };

    const handleVidUpload = async (e) => {
        if (!e.target.files?.[0]) return;
        setUploadingFile(true);
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        try {
            const r = await baseApi.post('/settings/upload-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setHeroVideoUrl(r.data.data);
            showToast('success', 'Vidéo mise à jour !');
        } catch { showToast('error', 'Erreur upload'); }
        finally { setUploadingFile(false); if (e.target) e.target.value = null; }
    };

    return (
        <div className="space-y-6">
            <SectionTitle title="Bannière d'accueil" desc="Slider d'images + vidéo de présentation." icon={ImageIcon} color="#8b5cf6" />

            {/* Images slider */}
            <div className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#161926] space-y-4">
                <div className="flex items-center gap-2">
                    <ImageIcon size={14} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Photos / Images du slider ({heroImagesUrls.length})
                    </span>
                </div>

                {heroImagesUrls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {heroImagesUrls.map((url, i) => (
                            <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-gray-200 dark:border-white/10">
                                <img src={getFullImageUrl(url)} alt={`Slide ${i+1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" onClick={() => setHeroImagesUrls(p => p.filter((_, idx) => idx !== i))}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                                        <X size={14} />
                                    </button>
                                </div>
                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-black px-2 py-0.5 rounded">#{i+1}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 p-6 text-center">
                        <ImageIcon size={28} className="mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                        <p className="text-xs text-gray-400">Aucune image — ajoutez-en ci-dessous</p>
                    </div>
                )}

                <div className="flex gap-2">
                    <SInput value={newLink} onChange={e => setNewLink(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                        placeholder="https://... (URL d'image)" />
                    <button type="button" onClick={handleAddLink}
                        className="px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-colors whitespace-nowrap">
                        + Ajouter
                    </button>
                </div>
                <UploadBtn label="📷 Uploader une photo" onUpload={handleImgUpload} loading={uploadingFile} inputRef={imgRef} accept="image/*" />
            </div>

            {/* Vidéo hero */}
            <div className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#161926] space-y-4">
                <div className="flex items-center gap-2">
                    <Video size={14} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Vidéo d'accueil (prioritaire sur les images)
                    </span>
                </div>
                <SInput value={heroVideoUrl} onChange={e => setHeroVideoUrl(e.target.value)} placeholder="https://... (URL vidéo MP4)" />
                <div className="flex gap-3 items-center flex-wrap">
                    <UploadBtn label="🎬 Uploader une vidéo" onUpload={handleVidUpload} loading={uploadingFile} inputRef={vidRef} accept="video/*" />
                    {heroVideoUrl && (
                        <button type="button" onClick={() => setHeroVideoUrl('')}
                            className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors">
                            Supprimer la vidéo
                        </button>
                    )}
                </div>
                {heroVideoUrl && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 flex items-center gap-2">
                        <CheckCircle2 size={13} /> Vidéo définie — elle s'affiche en premier dans le slider.
                    </div>
                )}
                <p className="text-xs text-gray-400">💡 Si une vidéo est définie, elle apparaît avant les photos dans le slider.</p>
            </div>
        </div>
    );
};

const FormBannersPromotions = ({ formData, setFormData, uploadingFile, setUploadingFile, showToast }) => (
    <div className="space-y-5">
        <SectionTitle title="Bannière Promotions" desc="Image et vidéo affichées en haut de la page Promotions." icon={Flame} color="#f97316" />
        <BannerBlock title="Bannière de la page Promotions" imageKey="promoBannerUrl" videoKey="promoBannerVideoUrl"
            formData={formData} setFormData={setFormData} uploadingFile={uploadingFile} setUploadingFile={setUploadingFile} showToast={showToast} />
    </div>
);

const FormBannersCollections = ({ formData, setFormData, uploadingFile, setUploadingFile, showToast }) => (
    <div className="space-y-5">
        <SectionTitle title="Bannière Collections (défaut)" desc="Utilisée pour les collections sans bannière personnalisée." icon={Layers} color="#8b5cf6" />
        <BannerBlock title="Bannière par défaut des collections" imageKey="defaultCollectionBannerUrl" videoKey="collectionBannerVideoUrl"
            formData={formData} setFormData={setFormData} uploadingFile={uploadingFile} setUploadingFile={setUploadingFile} showToast={showToast} />
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <p className="text-sm font-bold text-indigo-400">Bannières par collection individuelle</p>
                <p className="text-xs text-gray-400 mt-0.5">Chaque collection peut avoir sa propre bannière (photo + vidéo) depuis le module Collections.</p>
            </div>
            <a href="/admin/collections" className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-colors whitespace-nowrap">
                Gérer →
            </a>
        </div>
    </div>
);

// ── CONTACT ───────────────────────────────
const FormContactInfo = ({ formData, setFormData }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-5">
            <SectionTitle title="Email, Téléphone & WhatsApp" icon={PhoneCall} color="#10b981" />
            <div><SLabel>Email de contact *</SLabel><SInput icon={Mail} type="email" name="contactEmail" value={formData.contactEmail} onChange={h} placeholder="contact@peoc.cm" /></div>
            <div><SLabel>Téléphone *</SLabel><SInput icon={Phone} name="contactPhone" value={formData.contactPhone} onChange={h} placeholder="+237 686 669 222" /></div>
            <div><SLabel>Numéro WhatsApp</SLabel><SInput name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={h} placeholder="+237 686 669 222" /></div>
        </div>
    );
};

const FormContactAddress = ({ formData, setFormData }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-5">
            <SectionTitle title="Adresse physique" icon={MapPin} color="#10b981" />
            <div><SLabel>Adresse complète</SLabel><SInput icon={MapPin} name="contactAddress" value={formData.contactAddress} onChange={h} placeholder="Bafoussam, Ouest — Cameroun" /></div>
            <div><SLabel>Ville</SLabel><SInput name="contactCity" value={formData.contactCity || ''} onChange={h} placeholder="Bafoussam" /></div>
        </div>
    );
};

const FormContactHours = ({ formData, setFormData }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-5">
            <SectionTitle title="Horaires de disponibilité" icon={Clock} color="#10b981" />
            <div><SLabel>Horaires (texte libre)</SLabel><STextarea name="businessHours" value={formData.businessHours || ''} onChange={h} placeholder="Lun–Sam : 8h00–18h00 / Dim : 10h–14h" /></div>
        </div>
    );
};

// ── BENTO ─────────────────────────────────
const BentoCardRow = ({ card, formData, setFormData, uploadingFile, setUploadingFile, showToast }) => {
    const imgRef = useRef(null);
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleUpload = async (e) => {
        if (!e.target.files?.[0]) return;
        setUploadingFile(true);
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        try {
            const r = await baseApi.post('/settings/upload-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormData(p => ({ ...p, [card.imageKey]: r.data.data }));
            showToast('success', 'Image mise à jour !');
        } catch { showToast('error', 'Erreur upload'); }
        finally { setUploadingFile(false); if (e.target) e.target.value = null; }
    };
    return (
        <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3 space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-white">{card.label}</p>
            <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shrink-0 bg-gray-100 dark:bg-white/5">
                    {formData[card.imageKey]
                        ? <img src={getFullImageUrl(formData[card.imageKey])} alt={card.label} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-gray-400" /></div>}
                </div>
                <div className="flex-1 space-y-2">
                    <SInput name={card.imageKey} value={formData[card.imageKey] || ''} onChange={h} placeholder="https://..." />
                    <UploadBtn label="📷 Uploader" onUpload={handleUpload} loading={uploadingFile} inputRef={imgRef} accept="image/*" />
                </div>
            </div>
        </div>
    );
};

const FormBentoConfig = ({ formData, setFormData, uploadingFile, setUploadingFile, showToast }) => {
    const cards = [
        { key: 'bentoPoultry', imageKey: 'bentoPoultryImageUrl', label: 'Carte 1 — Volailles & Poussins' },
        { key: 'bentoIncubator', imageKey: 'bentoIncubatorImageUrl', label: 'Carte 2 — Couveuses Auto' },
        { key: 'bentoFeed', imageKey: 'bentoFeedImageUrl', label: 'Carte 3 — Aliments & Granulés' },
        { key: 'bentoHealth', imageKey: 'bentoHealthImageUrl', label: 'Carte 4 — Soins Vétérinaires' },
    ];
    return (
        <div className="space-y-5">
            <SectionTitle title="Configuration des 4 Cartes Bento" desc="Les cartes visuelles sous la bannière d'accueil." icon={LayoutGrid} color="#06b6d4" />
            {cards.map(c => (
                <BentoCardRow key={c.key} card={c} formData={formData} setFormData={setFormData}
                    uploadingFile={uploadingFile} setUploadingFile={setUploadingFile} showToast={showToast} />
            ))}
        </div>
    );
};

// ── ALERTES ───────────────────────────────
const FormAlertsAdmin = ({ notificationConfig, updateNotificationConfig }) => (
    <div className="space-y-5">
        <SectionTitle title="Notifications administrateur" icon={Bell} color="#ef4444" />
        <Toggle value={notificationConfig?.order ?? true} label="Alertes nouvelles commandes" onChange={v => updateNotificationConfig({ order: v })} />
        <Toggle value={notificationConfig?.supply ?? true} label="Alertes stock / ravitaillement" color="#f59e0b" onChange={v => updateNotificationConfig({ supply: v })} />
        <Toggle value={notificationConfig?.create ?? true} label="Alertes création de ressource" color="#10b981" onChange={v => updateNotificationConfig({ create: v })} />
        <Toggle value={notificationConfig?.enabled ?? true} label="Notifications globales activées" onChange={v => updateNotificationConfig({ enabled: v })} />
    </div>
);

const FormAlertsClient = ({ notificationConfig, updateNotificationConfig }) => (
    <div className="space-y-5">
        <SectionTitle title="Notifications clients" desc="Emails envoyés automatiquement aux acheteurs." icon={Bell} color="#ef4444" />
        <Toggle value={notificationConfig?.sendOrderConfirmation ?? true} label="Confirmation de commande" onChange={v => updateNotificationConfig({ sendOrderConfirmation: v })} />
        <Toggle value={notificationConfig?.sendShippingUpdate ?? true} label="Mise à jour livraison" onChange={v => updateNotificationConfig({ sendShippingUpdate: v })} />
        <Toggle value={notificationConfig?.sendReviewRequest ?? false} label="Demande d'avis après livraison" onChange={v => updateNotificationConfig({ sendReviewRequest: v })} />
    </div>
);

// ── PROMOTIONS ────────────────────────────
const FormPromotionsSettings = ({ promoSettings, updatePromoSettings }) => {
    return (
        <div className="space-y-5">
            <SectionTitle title="Paramètres des promotions" desc="Badges, timers et remises." icon={Flame} color="#f97316" />
            <Toggle value={promoSettings.autoBadge} label="Badges promotionnels automatiques" desc="Affiche -X% sur les produits en promotion." onChange={v => updatePromoSettings({ autoBadge: v })} />
            <Toggle value={promoSettings.bannerEnabled} label="Bannière promotions activée" onChange={v => updatePromoSettings({ bannerEnabled: v })} />
            <div>
                <SLabel>Remise minimum pour afficher le badge (%)</SLabel>
                <SInput type="number" value={promoSettings.minDiscountPercent} onChange={e => updatePromoSettings({ minDiscountPercent: Number(e.target.value) })} placeholder="5" />
            </div>
            <div>
                <SLabel>Durée timer vente flash (heures)</SLabel>
                <SInput type="number" value={promoSettings.flashSaleTimerHours} onChange={e => updatePromoSettings({ flashSaleTimerHours: Number(e.target.value) })} placeholder="24" />
            </div>
        </div>
    );
};

// ── SEO ───────────────────────────────────
const FormSeoBasic = ({ formData, setFormData }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-5">
            <SectionTitle title="SEO & Référencement" desc="Optimisez votre visibilité sur les moteurs de recherche." icon={Search} color="#a855f7" />
            <div><SLabel>Titre SEO</SLabel><SInput name="seoTitle" value={formData.seoTitle || ''} onChange={h} placeholder="PEOC — Équipements d'élevage..." /></div>
            <div><SLabel>Description SEO</SLabel><STextarea name="seoDescription" value={formData.seoDescription || ''} onChange={h} placeholder="Boutique spécialisée..." /></div>
            <div><SLabel>Mots-clés (séparés par virgules)</SLabel><SInput name="seoKeywords" value={formData.seoKeywords || ''} onChange={h} placeholder="élevage, couveuse, poussins, cameroun" /></div>
        </div>
    );
};

const FormSeoSocial = ({ formData, setFormData, uploadingFile, setUploadingFile, showToast }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const ogRef = useRef(null);
    const handleUpload = async (e) => {
        if (!e.target.files?.[0]) return;
        setUploadingFile(true);
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        try {
            const r = await baseApi.post('/settings/upload-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormData(p => ({ ...p, ogImageUrl: r.data.data }));
            showToast('success', 'Image OG mise à jour !');
        } catch { showToast('error', 'Erreur upload'); }
        finally { setUploadingFile(false); if (e.target) e.target.value = null; }
    };
    return (
        <div className="space-y-5">
            <SectionTitle title="Image de partage (Open Graph)" desc="Image affichée quand vous partagez votre site." icon={Share2} color="#a855f7" />
            <div>
                <SLabel>URL de l'image OG</SLabel>
                <SInput name="ogImageUrl" value={formData.ogImageUrl || ''} onChange={h} placeholder="https://..." />
                <div className="mt-2"><UploadBtn label="📷 Uploader" onUpload={handleUpload} loading={uploadingFile} inputRef={ogRef} /></div>
            </div>
            <ImagePreview url={formData.ogImageUrl} label="Aperçu image de partage" onRemove={() => setFormData(p => ({ ...p, ogImageUrl: '' }))} />
        </div>
    );
};

// ── AVANCÉES ──────────────────────────────
const FormAdvancedMaintenance = ({ formData, setFormData }) => {
    const h = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-5">
            <SectionTitle title="Mode Maintenance" desc="Rend la boutique inaccessible aux visiteurs." icon={Shield} color="#6b7280" />
            <Toggle value={formData.maintenanceMode || false} label="Activer le mode maintenance"
                desc="Affiche une page d'entretien aux visiteurs. L'admin reste accessible." color="#ef4444"
                onChange={v => setFormData(p => ({ ...p, maintenanceMode: v }))} />
            <div>
                <SLabel>Message de maintenance</SLabel>
                <STextarea name="maintenanceMessage" value={formData.maintenanceMessage || ''} onChange={h} placeholder="Site en maintenance. Retour dans quelques minutes." />
            </div>
        </div>
    );
};

const FormAdvancedSecurity = ({ formData, setFormData }) => (
    <div className="space-y-5">
        <SectionTitle title="Sécurité & Sessions" icon={Shield} color="#6b7280" />
        <Toggle value={formData.enforceHttps || false} label="Forcer HTTPS" onChange={v => setFormData(p => ({ ...p, enforceHttps: v }))} />
        <Toggle value={formData.allowRegistration ?? true} label="Autoriser les inscriptions publiques" onChange={v => setFormData(p => ({ ...p, allowRegistration: v }))} />
    </div>
);

// ═══════════════════════════════════════════
// ROUTEUR DE FORMULAIRE
// ═══════════════════════════════════════════

// ── COLLECTIONS & RAYONS ───────────────────
const FormCollectionsDisplay = ({ formData, setFormData }) => (
    <div className="space-y-5">
        <SectionTitle title="Affichage des Collections" desc="Contrôlez la disposition et le nombre d'éléments sur la vitrine." icon={LayoutGrid} color="#3b82f6" />
        <Toggle
            label="Activer la section Collections sur la boutique"
            desc="Permet aux clients d'accéder à la page des collections et de parcourir les rayons."
            value={formData.collectionsEnabled !== false}
            onChange={(v) => setFormData(p => ({ ...p, collectionsEnabled: v }))}
            color="#3b82f6"
        />
        <div>
            <SLabel>Mode de présentation</SLabel>
            <select
                value={formData.collectionsMode || 'GRID'}
                onChange={(e) => setFormData(p => ({ ...p, collectionsMode: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white"
            >
                <option value="GRID">Grille moderne (Cartes)</option>
                <option value="BENTO">Style Bento Box</option>
                <option value="COMPACT">Liste compacte</option>
            </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
            <div>
                <SLabel>Nombre de colonnes (Desktop)</SLabel>
                <select
                    value={formData.collectionsColumns || 4}
                    onChange={(e) => setFormData(p => ({ ...p, collectionsColumns: parseInt(e.target.value) }))}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white"
                >
                    <option value={2}>2 colonnes</option>
                    <option value={3}>3 colonnes</option>
                    <option value={4}>4 colonnes (Recommandé)</option>
                </select>
            </div>
            <div>
                <SLabel>Nombre de collections par page</SLabel>
                <input
                    type="number"
                    value={formData.collectionsPerPage || 12}
                    onChange={(e) => setFormData(p => ({ ...p, collectionsPerPage: parseInt(e.target.value) || 12 }))}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white"
                />
            </div>
        </div>
    </div>
);

const FormCollectionsBanner = ({ formData, setFormData, uploadingFile, setUploadingFile, showToast }) => {
    const bannerRef = useRef(null);
    const handleUpload = async (e) => {
        if (!e.target.files?.[0]) return;
        setUploadingFile(true);
        const fd = new FormData(); fd.append('file', e.target.files[0]);
        try {
            const r = await baseApi.post('/settings/upload-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormData(p => ({ ...p, collectionsBannerImage: r.data.data }));
            showToast('success', 'Bannière uploadée !');
        } catch { showToast('error', 'Erreur upload bannière'); }
        finally { setUploadingFile(false); if (e.target) e.target.value = null; }
    };
    return (
        <div className="space-y-5">
            <SectionTitle title="Bannière des Collections" desc="Titre, description et image d'accroche sur la page vitrine." icon={ImageIcon} color="#3b82f6" />
            <Toggle
                label="Afficher la grande bannière d'accroche"
                desc="Affiche le bandeau bleu stylisé en tête de la page /collections"
                value={formData.collectionsBannerEnabled !== false}
                onChange={(v) => setFormData(p => ({ ...p, collectionsBannerEnabled: v }))}
                color="#3b82f6"
            />
            <div>
                <SLabel>Titre principal</SLabel>
                <SInput
                    value={formData.collectionsBannerTitle || 'Découvrez nos collections exceptionnelles'}
                    onChange={(e) => setFormData(p => ({ ...p, collectionsBannerTitle: e.target.value }))}
                    placeholder="Découvrez nos collections exceptionnelles"
                />
            </div>
            <div>
                <SLabel>Description commerciale</SLabel>
                <STextarea
                    value={formData.collectionsBannerDesc || 'Une sélection soigneuse de produits pour tous vos besoins, à des prix imbattables.'}
                    onChange={(e) => setFormData(p => ({ ...p, collectionsBannerDesc: e.target.value }))}
                />
            </div>
            <div>
                <SLabel>Image d'arrière-plan ou composition</SLabel>
                <div className="flex gap-3">
                    <SInput
                        value={formData.collectionsBannerImage || ''}
                        onChange={(e) => setFormData(p => ({ ...p, collectionsBannerImage: e.target.value }))}
                        placeholder="https://..."
                    />
                    <UploadBtn label="Uploader" onUpload={handleUpload} loading={uploadingFile} inputRef={bannerRef} />
                </div>
            </div>
        </div>
    );
};

const FormCollectionsCards = ({ formData, setFormData }) => (
    <div className="space-y-5">
        <SectionTitle title="Cartes des Collections" desc="Choisissez quels éléments afficher sur chaque carte de collection." icon={LayoutGrid} color="#3b82f6" />
        <Toggle
            label="Afficher les photos / images de couverture"
            desc="Affiche l'illustration ou la photo d'arrière-plan de la collection."
            value={formData.collectionsShowImages !== false}
            onChange={(v) => setFormData(p => ({ ...p, collectionsShowImages: v }))}
            color="#3b82f6"
        />
        <Toggle
            label="Afficher la description courte"
            desc="Affiche le texte explicatif sous le titre de chaque collection."
            value={formData.collectionsShowDescriptions !== false}
            onChange={(v) => setFormData(p => ({ ...p, collectionsShowDescriptions: v }))}
            color="#3b82f6"
        />
        <Toggle
            label="Afficher le compteur de produits"
            desc="Indique en temps réel le nombre de produits disponibles dans le rayon."
            value={formData.collectionsShowCount !== false}
            onChange={(v) => setFormData(p => ({ ...p, collectionsShowCount: v }))}
            color="#3b82f6"
        />
        <Toggle
            label="Afficher les badges marketing (Nouveau, Top vente...)"
            desc="Ajoute un badge coloré en haut à gauche de chaque carte."
            value={formData.collectionsShowBadges !== false}
            onChange={(v) => setFormData(p => ({ ...p, collectionsShowBadges: v }))}
            color="#3b82f6"
        />
    </div>
);

const FormCollectionsFilters = ({ formData, setFormData }) => (
    <div className="space-y-5">
        <SectionTitle title="Comportement & Filtres" desc="Tri par défaut et options de navigation pour les clients." icon={Sliders} color="#3b82f6" />
        <div>
            <SLabel>Tri par défaut sur la boutique</SLabel>
            <select
                value={formData.collectionsDefaultSort || 'popular'}
                onChange={(e) => setFormData(p => ({ ...p, collectionsDefaultSort: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white"
            >
                <option value="popular">Plus populaires (Ordre admin)</option>
                <option value="name">Nom alphabétique (A-Z)</option>
                <option value="products">Nombre de produits (décroissant)</option>
            </select>
        </div>
        <Toggle
            label="Permettre l'ajout aux favoris sur les collections"
            desc="Affiche l'icône de cœur sur les cartes pour sauvegarder les rayons préférés."
            value={formData.collectionsAllowFavorites !== false}
            onChange={(v) => setFormData(p => ({ ...p, collectionsAllowFavorites: v }))}
            color="#3b82f6"
        />
        <Toggle
            label="Afficher le carrousel des catégories en haut de page"
            desc="Présente les raccourcis vers les différentes catégories au-dessus des collections."
            value={formData.collectionsShowCategoriesBar !== false}
            onChange={(v) => setFormData(p => ({ ...p, collectionsShowCategoriesBar: v }))}
            color="#3b82f6"
        />
    </div>
);

const FORM_MAP = {
    'collections.display': FormCollectionsDisplay,
    'collections.banner':  FormCollectionsBanner,
    'collections.cards':   FormCollectionsCards,
    'collections.filters': FormCollectionsFilters,
    'identity.name':          FormIdentityName,
    'identity.desc':          FormIdentityDesc,
    'identity.contact':       FormIdentityContact,
    'identity.social':        FormIdentitySocial,
    'identity.meta':          FormIdentityMeta,
    'stock.mode':             FormStockMode,
    'stock.alerts':           FormStockAlerts,
    'banners.home':           FormBannersHome,
    'banners.promotions':     FormBannersPromotions,
    'banners.collections':    FormBannersCollections,
    'contact.info':           FormContactInfo,
    'contact.address':        FormContactAddress,
    'contact.hours':          FormContactHours,
    'bento.config':           FormBentoConfig,
    'alerts.admin':           FormAlertsAdmin,
    'alerts.client':          FormAlertsClient,
    'promotions.settings':    FormPromotionsSettings,
    'seo.basic':              FormSeoBasic,
    'seo.social':             FormSeoSocial,
    'advanced.maintenance':   FormAdvancedMaintenance,
    'advanced.security':      FormAdvancedSecurity,
};

const ActiveForm = (props) => {
    const Form = FORM_MAP[props.active];
    if (!Form) return (
        <div className="text-center py-16">
            <SettingsIcon size={40} className="mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="font-black text-lg text-slate-900 dark:text-white">Sélectionnez une rubrique</p>
            <p className="text-sm mt-1 text-gray-500">Choisissez une catégorie dans le panneau de droite</p>
        </div>
    );
    return <Form {...props} />;
};

// ═══════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════
const Settings = () => {
    const { settings: currentSettings, reloadSettings } = useAppContext();
    const { theme } = useTheme();
    const { notificationConfig, updateNotificationConfig } = useToast();
    const { stockConfig, updateStockConfig } = useStockConfig();
    const isDark = theme === 'dark';

    const [activeSection, setActiveSection]   = useState('identity.name');
    const [openCategories, setOpenCategories] = useState({ identity: true });
    const [isDirty, setIsDirty]               = useState(false);
    const [loading, setLoading]               = useState(false);
    const [uploadingFile, setUploadingFile]   = useState(false);
    const [toast, setToast]                   = useState(null);
    const [sysInfo, setSysInfo]               = useState(null);
    const [dashStats, setDashStats]           = useState(null);
    const [dashLoading, setDashLoading]       = useState(true);

    const [formData, setFormDataRaw] = useState({
        siteName: '', siteSubtitle: '', siteSlogan: '', siteDescription: '',
        contactEmail: '', contactPhone: '', contactAddress: '', contactCity: '',
        whatsappNumber: '', businessHours: '',
        logoUrl: '', faviconUrl: '',
        defaultCollectionBannerUrl: '', collectionBannerVideoUrl: '',
        promoBannerUrl: '', promoBannerVideoUrl: '',
        bentoPoultryImageUrl: '', bentoIncubatorImageUrl: '',
        bentoFeedImageUrl: '', bentoHealthImageUrl: '',
        seoTitle: '', seoDescription: '', seoKeywords: '', ogImageUrl: '',
        facebookUrl: '', instagramUrl: '', twitterUrl: '', youtubeUrl: '',
        maintenanceMode: false, maintenanceMessage: '',
        enforceHttps: false, allowRegistration: true,
        stockAlertThreshold: 5,
    });

    const [heroImagesUrls, setHeroImagesUrlsRaw] = useState([]);
    const [heroVideoUrl, setHeroVideoUrlRaw]     = useState('');

    const setFormData = useCallback((updater) => {
        setFormDataRaw(updater);
        setIsDirty(true);
    }, []);
    const setHeroImagesUrls = useCallback((v) => { setHeroImagesUrlsRaw(v); setIsDirty(true); }, []);
    const setHeroVideoUrl   = useCallback((v) => { setHeroVideoUrlRaw(v); setIsDirty(true); }, []);

    const [promoSettings, setPromoSettingsRaw] = useState(() => {
        try { const s = localStorage.getItem('techstore_promo_settings'); return s ? JSON.parse(s) : { autoBadge: true, bannerEnabled: true, flashSaleTimerHours: 24, minDiscountPercent: 5 }; }
        catch { return { autoBadge: true, bannerEnabled: true, flashSaleTimerHours: 24, minDiscountPercent: 5 }; }
    });
    const updatePromoSettings = useCallback((patch) => {
        setPromoSettingsRaw(prev => {
            const updated = { ...prev, ...patch };
            try { localStorage.setItem('techstore_promo_settings', JSON.stringify(updated)); } catch {}
            return updated;
        });
        setIsDirty(true);
    }, []);

    // Chargement initial
    useEffect(() => {
        if (currentSettings) {
            setFormDataRaw(p => ({
                ...p,
                siteName:                   currentSettings.siteName || '',
                siteSubtitle:               currentSettings.siteSubtitle || '',
                contactEmail:               currentSettings.contactEmail || '',
                contactPhone:               currentSettings.contactPhone || '',
                contactAddress:             currentSettings.contactAddress || '',
                logoUrl:                    currentSettings.logoUrl || '',
                defaultCollectionBannerUrl: currentSettings.defaultCollectionBannerUrl || '',
                bentoPoultryImageUrl:       currentSettings.bentoPoultryImageUrl || '',
                bentoIncubatorImageUrl:     currentSettings.bentoIncubatorImageUrl || '',
                bentoFeedImageUrl:          currentSettings.bentoFeedImageUrl || '',
                bentoHealthImageUrl:        currentSettings.bentoHealthImageUrl || '',
            }));
            setHeroImagesUrlsRaw(currentSettings.heroImagesUrls || []);
            setHeroVideoUrlRaw(currentSettings.heroVideoUrl || '');
        }
    }, [currentSettings]);

    // Info système + stats dashboard
    useEffect(() => {
        // /settings/info n'existe pas — on retire cet appel
        setSysInfo({ database: 'MySQL (Aiven)', server: 'Tomcat 10.1', lastUpdate: new Date().toLocaleDateString('fr-FR') });
        // Stats dynamiques depuis /admin/dashboard
        baseApi.get('/admin/dashboard')
            .then(r => { setDashStats(r.data?.data || r.data); })
            .catch(() => setDashStats(null))
            .finally(() => setDashLoading(false));
    }, []);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await baseApi.put('/settings', { ...formData, heroImagesUrls, heroVideoUrl });
            await reloadSettings();
            setIsDirty(false);
            showToast('success', 'Paramètres enregistrés avec succès !');
        } catch (err) {
            console.error(err);
            showToast('error', 'Erreur lors de l\'enregistrement.');
        } finally { setLoading(false); }
    };

    const toggleCategory = (id) => setOpenCategories(p => ({ ...p, [id]: !p[id] }));

    const activeCat = CATEGORIES.find(c => c.subsections.some(s => s.id === activeSection));

    // Formulaire actif : props communs
    const formProps = {
        active: activeSection,
        formData, setFormData,
        heroImagesUrls, setHeroImagesUrls,
        heroVideoUrl, setHeroVideoUrl,
        uploadingFile, setUploadingFile,
        showToast,
        stockConfig, updateStockConfig,
        notificationConfig, updateNotificationConfig,
        promoSettings, updatePromoSettings,
    };

    return (
        <AdminLayout filters={null}>
            {/* Toast flottant */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        className={`fixed top-20 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold
                            ${toast.type === 'success'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                                : 'bg-red-500/10 border border-red-500/30 text-red-500'}`}>
                        {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col h-full min-h-0">

                {/* ── BANNIÈRE ── */}
                <div className={`relative overflow-hidden rounded-2xl mx-0 mb-5 ${isDark ? 'bg-[#111421]' : 'bg-gradient-to-r from-indigo-50 to-indigo-100'} border ${isDark ? 'border-white/5' : 'border-indigo-200'}`} style={{ minHeight: 100 }}>
                    <div className={`absolute inset-0 opacity-30 ${isDark ? 'block' : 'hidden'}`}
                        style={{ background: 'radial-gradient(circle at 70% 50%, #6366f1 0%, transparent 60%)' }} />
                    <div className="relative z-10 p-6 flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-indigo-500/10 border border-indigo-200'}`}>
                            <SettingsIcon size={30} className="text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Paramètres</h1>
                            <p className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">Configurez votre boutique selon vos besoins</p>
                        </div>
                    </div>
                    <div className={`absolute right-10 top-3 opacity-10 ${isDark ? 'block' : 'hidden'}`}>
                        <SettingsIcon size={80} className="text-white" />
                    </div>
                </div>

                {/* ── STATS ── */}
                <div className={`rounded-2xl p-5 mb-5 border ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={16} className="text-indigo-500" />
                        <span className="font-black text-sm text-slate-900 dark:text-white">Vue d'ensemble</span>
                        <span className="text-xs ml-2 text-gray-500">Gérez tous les paramètres de votre plateforme</span>
                    </div>
                    {dashLoading ? (
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className={`rounded-2xl p-4 border animate-pulse h-24 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'}`} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                            <StatCard icon={ShoppingCart}
                                value={dashStats?.totalOrdersCount != null ? dashStats.totalOrdersCount.toLocaleString('fr-FR') : '—'}
                                label="Commandes total" color="#6366f1" />
                            <StatCard icon={Loader2_}
                                value={dashStats?.pendingOrdersCount != null ? dashStats.pendingOrdersCount.toLocaleString('fr-FR') : '—'}
                                label="Commandes en attente" color="#f59e0b" />
                            <StatCard icon={Users}
                                value={dashStats?.totalCustomersCount != null ? dashStats.totalCustomersCount.toLocaleString('fr-FR') : '—'}
                                label="Clients inscrits" color="#10b981" />
                            <StatCard icon={AlertTriangle}
                                value={dashStats?.lowStockProductsCount != null ? dashStats.lowStockProductsCount.toLocaleString('fr-FR') : '—'}
                                label="Produits stock critique" color="#ef4444" />
                        </div>
                    )}
                </div>

                {/* ── APERÇU + SYSTÈME ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                    <div className={`rounded-2xl p-5 border ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Eye size={15} className="text-indigo-500" />
                            <span className="font-black text-sm text-slate-900 dark:text-white">Aperçu de votre boutique</span>
                            <span className="text-xs text-gray-500">Visualisez rapidement votre boutique en ligne</span>
                        </div>
                        <div className={`rounded-xl mb-3 h-24 flex items-center justify-center border ${isDark ? 'bg-[#0b0e14] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                            <span className="text-xs text-gray-400">Votre boutique en ligne</span>
                        </div>
                        <a href="/" target="_blank" rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all
                                ${isDark ? 'border-white/10 text-gray-400 hover:border-indigo-500 hover:text-white' : 'border-gray-200 text-gray-500 hover:border-indigo-500 hover:text-indigo-600'}`}>
                            <ExternalLink size={13} /> Voir la boutique
                        </a>
                    </div>

                    <div className={`rounded-2xl p-5 border ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Server size={15} className="text-indigo-500" />
                                <span className="font-black text-sm text-slate-900 dark:text-white">Informations système</span>
                            </div>
                            <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> En ligne
                            </span>
                        </div>
                        <div className="space-y-2 mb-3">
                            {[
                                { label: 'Base de données', value: sysInfo?.database || 'MySQL (Aiven)' },
                                { label: 'Serveur', value: sysInfo?.server || 'Tomcat 10.1' },
                                { label: 'Dernière mise à jour', value: new Date().toLocaleDateString('fr-FR') },
                            ].map(({ label, value }) => (
                                <div key={label} className={`flex items-center justify-between py-1.5 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                    <span className="text-xs text-gray-500">{label}</span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 flex items-center gap-2">
                            <CheckCircle2 size={13} /> Tous les systèmes fonctionnent parfaitement !
                        </div>
                    </div>
                </div>

                {/* ── ZONE PRINCIPALE : FORMULAIRE + PANNEAU DROIT ── */}
                <div className="flex gap-4" style={{ minHeight: 500 }}>

                    {/* FORMULAIRE CENTRAL */}
                    <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar" style={{ maxHeight: 600 }}>
                        <div className={`rounded-2xl p-6 border min-h-full ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                            {/* Breadcrumb */}
                            {activeCat && (
                                <div className="flex items-center gap-2 mb-5 text-xs">
                                    {React.createElement(activeCat.icon, { size: 13, style: { color: activeCat.color } })}
                                    <span className="text-gray-400">{activeCat.label}</span>
                                    <ChevronRight size={11} className="text-gray-400" />
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {activeCat.subsections.find(s => s.id === activeSection)?.label}
                                    </span>
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                <motion.div key={activeSection}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                                    <ActiveForm {...formProps} />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* ── PANNEAU ACCORDÉON DROIT ── */}
                    <div className="hidden lg:flex flex-col w-72 shrink-0" style={{ maxHeight: 600 }}>
                        <div className={`rounded-2xl border flex flex-col overflow-hidden ${isDark ? 'bg-[#111421] border-white/5' : 'bg-white border-gray-200 shadow-sm'}`} style={{ height: '100%' }}>
                            {/* En-tête */}
                            <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'} shrink-0`}>
                                <div className="flex items-center gap-2">
                                    <SettingsIcon size={15} className="text-indigo-500" />
                                    <span className="font-black text-sm text-slate-900 dark:text-white">Paramètres</span>
                                </div>
                                <p className="text-xs mt-0.5 text-gray-500">Choisissez une catégorie à configurer</p>
                            </div>

                            {/* Liste avec scrollbar visible */}
                            <div className="overflow-y-auto p-2 space-y-0.5 custom-scrollbar" style={{ flex: 1, minHeight: 0 }}>
                                {CATEGORIES.map(cat => {
                                    const CatIcon = cat.icon;
                                    const isOpen = !!openCategories[cat.id];
                                    const isCatActive = activeCat?.id === cat.id;

                                    return (
                                        <div key={cat.id}>
                                            <button type="button" onClick={() => toggleCategory(cat.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group
                                                    ${isCatActive
                                                        ? isDark ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-200'
                                                        : isDark ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-gray-50 border border-transparent'
                                                    }`}>
                                                <div className="p-2 rounded-lg shrink-0" style={{ background: `${cat.color}20` }}>
                                                    <CatIcon size={15} style={{ color: cat.color }} />
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{cat.label}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{cat.desc}</p>
                                                </div>
                                                <ChevronDown size={13} className="text-gray-400 shrink-0 transition-transform duration-200"
                                                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                            </button>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                                                        <div className="pl-4 py-1 space-y-0.5">
                                                            {cat.subsections.map(sub => {
                                                                const isActive = activeSection === sub.id;
                                                                return (
                                                                    <button key={sub.id} type="button" onClick={() => setActiveSection(sub.id)}
                                                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all
                                                                            ${isActive
                                                                                ? 'text-white font-bold'
                                                                                : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-slate-800 hover:bg-gray-50'
                                                                            }`}
                                                                        style={{ background: isActive ? cat.color : undefined }}>
                                                                        <span className="w-1.5 h-1.5 rounded-full shrink-0"
                                                                            style={{ background: isActive ? '#fff' : cat.color }} />
                                                                        <span className="text-xs truncate">{sub.label}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── BARRE DE SAUVEGARDE (footer) ── */}
                <div className={`mt-4 px-5 py-3 rounded-2xl flex items-center justify-between gap-4 border ${isDark ? 'bg-[#111421] border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
                            <span className="text-xs font-black text-indigo-500">PEOC v1.0.0</span>
                        </div>
                        <span className="text-xs text-gray-500 hidden sm:inline">Tableau de bord d'administration</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isDirty ? (
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-xs font-bold text-orange-400">Non enregistré</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="text-emerald-500" />
                                <span className="text-xs text-gray-500">
                                    Dernière sauvegarde : {new Date().toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}
                        <button type="button" onClick={handleSave} disabled={loading || uploadingFile || !isDirty}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all
                                bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20">
                            {loading ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </div>

                {/* Mobile : bouton flottant pour ouvrir le panneau droit */}
                <div className="lg:hidden">
                    <MobileSettingsPanel
                        categories={CATEGORIES}
                        openCategories={openCategories}
                        toggleCategory={toggleCategory}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        activeCat={activeCat}
                        isDark={isDark}
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

// ── Panneau mobile (drawer) ──────────────
const MobileSettingsPanel = ({ categories, openCategories, toggleCategory, activeSection, setActiveSection, activeCat, isDark }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30">
                <SettingsIcon size={20} />
            </button>
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
                            className={`fixed right-0 top-0 h-full w-72 z-[160] flex flex-col ${isDark ? 'bg-[#111421]' : 'bg-white'} shadow-2xl`}>
                            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                <span className="font-black text-sm text-slate-900 dark:text-white">Paramètres</span>
                                <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
                                {categories.map(cat => {
                                    const CatIcon = cat.icon;
                                    const isOpen = !!openCategories[cat.id];
                                    const isCatActive = activeCat?.id === cat.id;
                                    return (
                                        <div key={cat.id}>
                                            <button type="button" onClick={() => toggleCategory(cat.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isCatActive ? 'bg-indigo-500/15' : isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                                <div className="p-2 rounded-lg" style={{ background: `${cat.color}20` }}>
                                                    <CatIcon size={14} style={{ color: cat.color }} />
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{cat.label}</p>
                                                </div>
                                                <ChevronDown size={12} className="text-gray-400 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                            </button>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                        <div className="pl-4 py-1 space-y-0.5">
                                                            {cat.subsections.map(sub => {
                                                                const isActive = activeSection === sub.id;
                                                                return (
                                                                    <button key={sub.id} type="button"
                                                                        onClick={() => { setActiveSection(sub.id); setOpen(false); }}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all"
                                                                        style={{ background: isActive ? cat.color : undefined, color: isActive ? '#fff' : undefined }}>
                                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? '#fff' : cat.color }} />
                                                                        {sub.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Settings;
