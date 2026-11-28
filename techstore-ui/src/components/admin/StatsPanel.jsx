import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * StatsPanel – Affiche les indicateurs (KPI) dynamiques de la page Collections.
 * Le composant attend un objet `stats` contenant les valeurs numériques et
 * un booléen `loading` qui indique si les données sont en cours de récupération.
 */
export default function StatsPanel({ stats, loading }) {
  const items = [
    { label: 'Collections', value: stats.total, icon: '🗂️' },
    { label: 'Actives',     value: stats.active, icon: '✅' },
    { label: 'Publiées',    value: stats.published, icon: '🚀' },
    { label: 'Produits',    value: stats.products, icon: '📦' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-3 p-4 bg-[#161926] rounded-2xl border border-white/5"
        >
          <span className="text-2xl">{it.icon}</span>
          <div className="flex-1">
            <p className="text-xs text-gray-400">{it.label}</p>
            {loading ? (
              <Loader2 className="animate-spin text-indigo-400 w-5 h-5" />
            ) : (
              <p className="text-lg font-bold text-white">{it.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
