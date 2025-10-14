import React, { useEffect, useState } from 'react';
import { supabase } from '../context/AuthContext';

type KPIs = {
  profiles_total: number;
  tutors_total: number;
  students_total: number;
  requests_total: number;
  messages_total: number;
  online_now: number;
};

const Admin: React.FC = () => {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [series, setSeries] = useState<Array<{ d: string; tutors: number; students: number; requests: number; messages: number }>>([]);
  const [flags, setFlags] = useState<Array<{ key: string; value: any }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        if (!supabase) { setLoading(false); return; }
        const { data: vk } = await supabase.from('view_admin_kpis').select('*').limit(1).single();
        setKpis(vk as any);
        const { data: ts } = await supabase.rpc('admin_timeseries_14d');
        setSeries((ts as any[]) || []);
        const { data: ff } = await supabase.from('app_feature_flags').select('key, value').order('key');
        setFlags((ff as any[]) || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div className="text-white/90">Loading admin…</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">tutlabs admin</h1>

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ['Profiles', kpis.profiles_total],
            ['Tutors', kpis.tutors_total],
            ['Students', kpis.students_total],
            ['Requests', kpis.requests_total],
            ['Messages', kpis.messages_total],
            ['Online now', kpis.online_now],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10 p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">{label as string}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{value as number}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-white/10 p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Feature flags</h2>
        {flags.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">No flags configured.</div>
        ) : (
          <ul className="space-y-2">
            {flags.map((f) => (
              <li key={f.key} className="flex items-center justify-between text-sm">
                <span className="text-gray-800 dark:text-gray-200">{f.key}</span>
                <code className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">{JSON.stringify(f.value)}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;
