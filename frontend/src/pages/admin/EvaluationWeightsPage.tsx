import React, { useState, useEffect } from 'react';
import { adminApi, getErrorMessage } from '../../services/api';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { Sliders, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const EvaluationWeightsPage: React.FC = () => {
  const [weights, setWeights] = useState({
    technical_knowledge: 40,
    project_understanding: 25,
    communication: 15,
    problem_solving: 10,
    behavioral_and_soft_skills: 10,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const res = await adminApi.getWeights();
        if (res.data) {
          setWeights({
            technical_knowledge: res.data.technical_knowledge ?? 40,
            project_understanding: res.data.project_understanding ?? 25,
            communication: res.data.communication ?? 15,
            problem_solving: res.data.problem_solving ?? 10,
            behavioral_and_soft_skills: res.data.behavioral_and_soft_skills ?? 10,
          });
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchWeights();
  }, []);

  const total = 
    Number(weights.technical_knowledge) +
    Number(weights.project_understanding) +
    Number(weights.communication) +
    Number(weights.problem_solving) +
    Number(weights.behavioral_and_soft_skills);

  const isValidTotal = Math.abs(total - 100) < 0.01;

  const handleChange = (field: keyof typeof weights, val: number) => {
    setWeights((prev) => ({ ...prev, [field]: Math.max(0, Math.min(100, val)) }));
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTotal) {
      setError(`Total weight must equal exactly 100%. Current total is ${total.toFixed(1)}%.`);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await adminApi.updateWeights(weights);
      setSuccess('Evaluation criteria weights successfully updated and applied.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative space-y-8">
      <QuantumAuroraBackground />

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-pink-300 mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>Evaluation Engine Calibration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Evaluation Category Weights</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure the percentage distribution across the five core placement evaluation categories
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/25 space-y-8">
        
        {/* Total Meter */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Total Allocated Weight</h3>
            <p className="text-xs text-slate-400">Enforced non-negotiable rule: Must total exactly 100%</p>
          </div>
          <span className={`text-2xl font-black font-mono ${isValidTotal ? 'text-emerald-400' : 'text-rose-400'}`}>
            {total.toFixed(0)}%
          </span>
        </div>

        {/* 5 Sliders & Inputs */}
        <div className="space-y-6">
          {[
            {
              key: 'technical_knowledge',
              name: 'Technical Knowledge',
              desc: 'Core syntax, algorithms, systems, memory concepts, correctness',
              defaultWeight: 40,
            },
            {
              key: 'project_understanding',
              name: 'Project Understanding & Architecture',
              desc: 'Trade-off justification, personal code ownership, challenge resolution',
              defaultWeight: 25,
            },
            {
              key: 'communication',
              name: 'Communication & Delivery',
              desc: 'Vocal clarity, precision, composure, concise professional answers',
              defaultWeight: 15,
            },
            {
              key: 'problem_solving',
              name: 'Problem-Solving & Logic',
              desc: 'Analytical reasoning, structured decomposition, edge-case identification',
              defaultWeight: 10,
            },
            {
              key: 'behavioral_and_soft_skills',
              name: 'Behavioral & Soft Skills',
              desc: 'STAR scenario alignment, teamwork, adaptability, time management',
              defaultWeight: 10,
            },
          ].map((item) => {
            const currentVal = weights[item.key as keyof typeof weights];
            return (
              <div key={item.key} className="space-y-2 p-4 rounded-2xl bg-black/30 border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={currentVal}
                      onChange={(e) => handleChange(item.key as keyof typeof weights, parseFloat(e.target.value) || 0)}
                      className="w-16 text-center font-mono font-bold text-sm py-1 rounded-lg glass-input text-cyan-300"
                    />
                    <span className="text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={currentVal}
                  onChange={(e) => handleChange(item.key as keyof typeof weights, parseFloat(e.target.value) || 0)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            );
          })}
        </div>

        <div className="pt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              setWeights({
                technical_knowledge: 40,
                project_understanding: 25,
                communication: 15,
                problem_solving: 10,
                behavioral_and_soft_skills: 10,
              });
            }}
            className="text-xs text-slate-400 hover:text-white"
          >
            Reset to University Defaults (40 / 25 / 15 / 10 / 10)
          </button>

          <button
            type="submit"
            disabled={saving || !isValidTotal}
            className="px-8 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Evaluation Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
