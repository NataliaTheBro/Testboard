import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, Check, ChevronRight, Compass, Flame, Pencil } from "lucide-react";
import { storage } from "./lib/storage";

const PALETTE = ["#5B6E58", "#B9707B", "#C79A4B", "#5A7A8C", "#8A5A6B", "#6B6357"];

const DEFAULT_AREAS = [
  { id: "a1", name: "Morgenroutine", color: PALETTE[0], vision: "Ich starte in den Tag statt in den Tag hinein gezogen zu werden.", habits: [
    { id: "h1", name: "Meditation", freq: "daily", time: "morning", logs: {} },
    { id: "h2", name: "Zeit für mich selbst", freq: "daily", time: "morning", logs: {} },
    { id: "h3", name: "10 Min Spaziergang mit Kaffee (statt drinnen sitzen)", freq: "daily", time: "morning", logs: {} },
    { id: "h4", name: "30 Min ohne Handy", freq: "daily", time: "morning", logs: {} },
    { id: "h5", name: "Gesichtsroutine", freq: "daily", time: "morning", logs: {} },
    { id: "h6", name: "Nagelroutine", freq: "daily", time: "morning", logs: {} },
    { id: "h7", name: "Schick aus dem Haus gehen", freq: "daily", time: "morning", logs: {} },
  ]},
  { id: "a2", name: "Abendroutine", color: PALETTE[3], vision: "Der Abend bereitet den nächsten Tag vor, statt ihn zu verschlafen.", habits: [
    { id: "h8", name: "1h vor dem Schlafen: Handy weglegen", freq: "daily", time: "evening", logs: {} },
    { id: "h9", name: "Abend-Pflegeroutine (Gesicht)", freq: "daily", time: "evening", logs: {} },
    { id: "h10", name: "10 Min aufräumen", freq: "daily", time: "evening", logs: {} },
    { id: "h11", name: "Roller-Akku checken (falls Büro morgen)", freq: "daily", time: "evening", logs: {} },
    { id: "h12", name: "Duschen", freq: "daily", time: "evening", logs: {} },
    { id: "h13", name: "Haare waschen", freq: "every3", time: "evening", logs: {} },
  ]},
  { id: "a3", name: "Mentaler Glow", color: PALETTE[4], vision: "Ausstrahlung kommt von innen – ich gebe Freude weiter, statt sie zu horten.", habits: [
    { id: "h14", name: "Fremden Menschen zulächeln", freq: "daily", time: null, logs: {} },
  ]},
  { id: "a4", name: "Wochenende & Zuhause", color: PALETTE[2], vision: "Mein Zuhause und meine Woche sind aufgeräumt, bevor die nächste beginnt.", habits: [
    { id: "h15", name: "Blumen gießen", freq: "weekly", time: null, logs: {} },
    { id: "h16", name: "Bad putzen", freq: "weekly", time: null, logs: {} },
    { id: "h17", name: "Routinen reflektieren & anpassen", freq: "weekly", time: null, logs: {} },
    { id: "h19", name: "Foodprep oder Brot backen", freq: "weekly", time: null, logs: {} },
    { id: "h20", name: "1–2 To-Dos aus Reminders erledigt", freq: "weekly", time: null, logs: {} },
    { id: "h21", name: "Wochenplanung mit Claude (Events & Run Clubs Köln)", freq: "weekly", time: null, logs: {} },
  ]},
  { id: "a5", name: "Finanzen", color: PALETTE[5], vision: "Notgroschen aufgebaut, Altersvorsorge geklärt, ETF-Sparplan läuft – finanzielle Sicherheit und Unabhängigkeit, nicht abhängig von Zufällen.", habits: [
    { id: "h22", name: "Wochenausgaben checken: notwendig / Joy / unnütz?", freq: "weekly", time: null, logs: {} },
    { id: "h23", name: "Finanzplan durchgehen", freq: "weekly", time: null, logs: {} },
    { id: "h37", name: "Altersvorsorge-Check (gesetzlich/privat)", freq: "monthly", time: null, logs: {} },
    { id: "h38", name: "ETF-/Investment-Sparplan Review", freq: "monthly", time: null, logs: {} },
  ]},
  { id: "a6", name: "Job & Karriere", color: PALETTE[1], vision: "Führung oder Selbstständigkeit – ein Job, in dem ich gebraucht werde und wachse. Sichtbare Erfolge, mehr Mut.", habits: [
    { id: "h24", name: "Job-Fokuszeit (Bewerbungen & \"was macht mich glücklich\")", freq: "weekly", time: null, logs: {} },
    { id: "h25", name: "Freitag Fokus-Zeit im Café erledigt", freq: "weekly", time: null, logs: {} },
    { id: "h26", name: "Mutiger Schritt (Sichtbarkeit, Verhandlung, Nein sagen)", freq: "weekly", time: null, logs: {} },
    { id: "h39", name: "Ausbildung: Yoga-Video oder Pilates-Modul (2h Slot)", freq: "weekly", time: null, logs: {} },
  ]},
  { id: "a7", name: "Fitness & Halbmarathon", color: PALETTE[0], vision: "Halbmarathon gefinisht, stark und verletzungsfrei. Im Herbst/Winter: Laufpensum runter, mehr Richtung Yoga/Pilates/Indoor.", habits: [
    { id: "h27", name: "Lauftraining", freq: "weekly", time: null, logs: {} },
  ]},
  { id: "a8", name: "Beziehungen & Freundeskreis", color: PALETTE[4], vision: "Ein verlässlicher Freundeskreis in Köln. Grenzen kennen und halten, offen sein statt im alten toxischen Muster.", habits: [
    { id: "h28", name: "Freund:in aktiv kontaktieren/treffen", freq: "weekly", time: null, logs: {} },
    { id: "h29", name: "Neue Menschen / Community-Event (Köln)", freq: "weekly", time: null, logs: {} },
    { id: "h30", name: "Grenzen-Check: Wo war ich diese Woche klar, wo nicht?", freq: "weekly", time: null, logs: {} },
  ]},
  { id: "a9", name: "Gesundheit & Balance", color: PALETTE[5], vision: "Weniger Stress, mehr Energie, Dankbarkeit und Disziplin gegenüber mir selbst – Versprechen an mich halten.", habits: [
    { id: "h31", name: "3 Dinge Dankbarkeit", freq: "daily", time: null, logs: {} },
    { id: "h32", name: "Nägel nicht gekaut", freq: "daily", time: null, logs: {} },
    { id: "h33", name: "Atem-/Ruhemoment", freq: "daily", time: null, logs: {} },
    { id: "h34", name: "Oura: Readiness/Schlaf-Score", freq: "daily", time: "morning", type: "number", logs: {} },
    { id: "h35", name: "Musik bewusst gehört", freq: "daily", time: null, logs: {} },
  ]},
  { id: "a10", name: "Mein Fokus-Hobby", color: PALETTE[2], vision: "Sommer: Laufen & Tennis im Fokus. Herbst/Winter: Umstieg auf Yoga/Pilates/Indoor.", habits: [
    { id: "h36", name: "Tennis: Übungseinheit", freq: "weekly", time: null, logs: {} },
  ]},
];

function pad(n) { return String(n).padStart(2, "0"); }
function dayKey(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function weekKey(d) {
  const t = new Date(d); t.setHours(0,0,0,0);
  t.setDate(t.getDate() + 3 - ((t.getDay()+6)%7));
  const w1 = new Date(t.getFullYear(),0,4);
  const wk = 1 + Math.round(((t - w1) / 86400000 - 3 + ((w1.getDay()+6)%7)) / 7);
  return `${t.getFullYear()}-W${pad(wk)}`;
}
function monthKey(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; }
const EPOCH = Date.UTC(2024, 0, 1);
function every3Key(d) {
  const days = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / 86400000);
  return `e3-${Math.floor(days / 3)}`;
}
function periodKey(freq, d = new Date()) {
  if (freq === "daily") return dayKey(d);
  if (freq === "every3") return every3Key(d);
  if (freq === "weekly") return weekKey(d);
  return monthKey(d);
}
function recentKeys(freq, n) {
  const out = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const dt = new Date(d);
    if (freq === "daily") dt.setDate(d.getDate() - i);
    else if (freq === "every3") dt.setDate(d.getDate() - i*3);
    else if (freq === "weekly") dt.setDate(d.getDate() - i*7);
    else dt.setMonth(d.getMonth() - i);
    out.push(periodKey(freq, dt));
  }
  return out.reverse();
}
function habitRate(habit) {
  const n = habit.freq === "daily" ? 14 : habit.freq === "every3" ? 8 : habit.freq === "weekly" ? 8 : 6;
  const keys = recentKeys(habit.freq, n);
  const done = keys.filter(k => habit.logs[k]).length;
  return keys.length ? done/keys.length : 0;
}
function areaRate(area) {
  if (!area.habits.length) return 0;
  return area.habits.reduce((s,h) => s + habitRate(h), 0) / area.habits.length;
}
function todayHabits(areas) {
  return areas.flatMap(a => a.habits.filter(h => h.freq === "daily" || h.freq === "every3").map(h => ({...h, areaId:a.id, areaName:a.name, areaColor:a.color})));
}
function todayProgress(areas) {
  const items = todayHabits(areas).filter(h => h.type !== "number");
  if (!items.length) return { done: 0, total: 0, pct: 0 };
  const done = items.filter(h => !!h.logs[periodKey(h.freq)]).length;
  return { done, total: items.length, pct: done / items.length };
}
function streak(habit) {
  let s = 0, d = new Date();
  while (true) {
    const k = periodKey(habit.freq, d);
    if (!habit.logs[k]) break;
    s++;
    if (habit.freq === "daily") d.setDate(d.getDate()-1);
    else if (habit.freq === "every3") d.setDate(d.getDate()-3);
    else if (habit.freq === "weekly") d.setDate(d.getDate()-7);
    else d.setMonth(d.getMonth()-1);
  }
  return s;
}

function Ring({ pct, color, size = 64, stroke = 6, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E4E0D6" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c*(1-pct)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset .5s ease" }} />
      {children && <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle"
        style={{ font: "600 13px 'IBM Plex Mono', monospace", fill: "#2B2A28" }}>{children}</text>}
    </svg>
  );
}

function mergeAreas(stored, defaults) {
  const byId = new Map(stored.map(a => [a.id, a]));
  const merged = stored.map(a => ({...a}));
  for (const defArea of defaults) {
    const existing = byId.get(defArea.id);
    if (!existing) {
      merged.push(JSON.parse(JSON.stringify(defArea)));
    } else {
      const habitIds = new Set(existing.habits.map(h => h.id));
      const newHabits = defArea.habits.filter(h => !habitIds.has(h.id));
      if (newHabits.length) existing.habits = [...existing.habits, ...newHabits.map(h => ({...h}))];
    }
  }
  return merged;
}

export default function Dashboard() {
  const [areas, setAreas] = useState(null);
  const [tab, setTab] = useState("uebersicht");
  const [activeArea, setActiveArea] = useState(null);
  const [editingArea, setEditingArea] = useState(null);
  const [addingHabitTo, setAddingHabitTo] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("lebens-dashboard-data", false);
        if (res && res.value) setAreas(mergeAreas(JSON.parse(res.value), DEFAULT_AREAS));
        else setAreas(DEFAULT_AREAS);
      } catch { setAreas(DEFAULT_AREAS); }
      loaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current || areas === null) return;
    setSaveState("saving");
    const t = setTimeout(async () => {
      try {
        await storage.set("lebens-dashboard-data", JSON.stringify(areas), false);
        setSaveState("saved");
      } catch { setSaveState("error"); }
    }, 300);
    return () => clearTimeout(t);
  }, [areas]);

  if (areas === null) {
    return <div style={{fontFamily:"'Work Sans',sans-serif"}} className="min-h-screen flex items-center justify-center bg-[#F2F1EC] text-[#6B6357]">Lädt …</div>;
  }

  const updateArea = (id, fn) => setAreas(prev => prev.map(a => a.id === id ? fn(a) : a));
  const toggleHabit = (areaId, habitId) => {
    updateArea(areaId, a => ({
      ...a,
      habits: a.habits.map(h => {
        if (h.id !== habitId) return h;
        const k = periodKey(h.freq);
        const logs = { ...h.logs };
        if (logs[k]) delete logs[k]; else logs[k] = true;
        return { ...h, logs };
      })
    }));
  };
  const setNumberLog = (areaId, habitId, value) => {
    updateArea(areaId, a => ({
      ...a,
      habits: a.habits.map(h => {
        if (h.id !== habitId) return h;
        const k = periodKey(h.freq);
        const logs = { ...h.logs };
        if (value === "" || value === null) delete logs[k];
        else logs[k] = Number(value);
        return { ...h, logs };
      })
    }));
  };
  const addHabit = (areaId, name, freq, time) => {
    if (!name.trim()) return;
    updateArea(areaId, a => ({ ...a, habits: [...a.habits, { id: "h"+Date.now(), name: name.trim(), freq, time: time||null, logs: {} }] }));
    setAddingHabitTo(null);
  };
  const removeHabit = (areaId, habitId) => updateArea(areaId, a => ({ ...a, habits: a.habits.filter(h => h.id !== habitId) }));
  const addArea = () => {
    const id = "a"+Date.now();
    const color = PALETTE[areas.length % PALETTE.length];
    setAreas(prev => [...prev, { id, name: "Neuer Bereich", color, vision: "", habits: [] }]);
    setEditingArea(id);
    setActiveArea(id);
    setTab("bereich");
  };
  const removeArea = (id) => {
    setAreas(prev => prev.filter(a => a.id !== id));
    if (activeArea === id) { setActiveArea(null); setTab("uebersicht"); }
  };

  const area = areas.find(a => a.id === activeArea);

  return (
    <div style={{ fontFamily: "'Work Sans', sans-serif" }} className="min-h-screen bg-[#F2F1EC] text-[#2B2A28]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        .serif { font-family: 'Fraunces', serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <header className="px-6 pt-8 pb-6 max-w-4xl mx-auto flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#6B6357] mono text-xs uppercase tracking-wider mb-1">
            <Compass size={14} /> Jahres-Kompass
          </div>
          <h1 className="serif text-3xl" style={{ fontWeight: 600 }}>Mein Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setAreas(prev => mergeAreas(prev, DEFAULT_AREAS))}
            className="text-xs text-[#6B6357] hover:text-[#2B2A28] underline">Fehlende Bereiche nachladen</button>
          <span className="mono text-[11px] text-[#9B9484]">{saveState === "saving" ? "speichert…" : saveState === "error" ? "Speichern fehlgeschlagen" : "gespeichert"}</span>
        </div>
      </header>

      <nav className="px-6 max-w-4xl mx-auto flex gap-1 mb-6 border-b border-[#E4E0D6]">
        {[["uebersicht","Übersicht"],["checkin","Check-in"]].map(([k,l]) => (
          <button key={k} onClick={() => { setTab(k); }}
            className={`px-3 py-2 text-sm transition-colors ${tab===k ? "text-[#2B2A28] border-b-2 border-[#2B2A28] font-medium" : "text-[#9B9484] hover:text-[#6B6357]"}`}>
            {l}
          </button>
        ))}
      </nav>

      <main className="px-6 max-w-4xl mx-auto pb-16">
        {tab === "uebersicht" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {areas.map(a => {
              const pct = areaRate(a);
              return (
                <button key={a.id} onClick={() => { setActiveArea(a.id); setTab("bereich"); }}
                  className="text-left bg-white rounded-2xl p-5 border border-[#E4E0D6] hover:border-[#C9C3B4] transition-colors flex items-center gap-4">
                  <Ring pct={pct} color={a.color}>{Math.round(pct*100)}%</Ring>
                  <div className="flex-1 min-w-0">
                    <div className="serif text-lg mb-0.5" style={{ fontWeight: 600 }}>{a.name}</div>
                    <div className="text-sm text-[#6B6357] line-clamp-2">{a.vision || "Noch keine Vision festgelegt."}</div>
                    <div className="mono text-[11px] text-[#9B9484] mt-1">{a.habits.length} Gewohnheit{a.habits.length!==1?"en":""}</div>
                  </div>
                  <ChevronRight size={18} className="text-[#C9C3B4] shrink-0" />
                </button>
              );
            })}
            <button onClick={addArea}
              className="rounded-2xl p-5 border border-dashed border-[#C9C3B4] text-[#6B6357] hover:border-[#9B9484] hover:text-[#2B2A28] transition-colors flex items-center justify-center gap-2 min-h-[104px]">
              <Plus size={18} /> Lebensbereich hinzufügen
            </button>
          </div>
        )}

        {tab === "checkin" && (
          <div className="space-y-6">
            {(() => { const tp = todayProgress(areas); return tp.total > 0 && (
              <div className="bg-white rounded-2xl border border-[#E4E0D6] p-5 flex items-center gap-4">
                <Ring pct={tp.pct} color="#5B6E58" size={72} stroke={7}>{Math.round(tp.pct*100)}%</Ring>
                <div>
                  <div className="serif text-lg" style={{fontWeight:600}}>Heute erreicht</div>
                  <div className="mono text-xs text-[#9B9484]">{tp.done} von {tp.total} täglichen Punkten erledigt</div>
                </div>
              </div>
            );})()}
            {[
              {key:"morning", label:"Morgens", filter:h=>h.freq==="daily"&&h.time==="morning"},
              {key:"evening", label:"Abends", filter:h=>h.freq==="daily"&&h.time==="evening"},
              {key:"daily-any", label:"Täglich", filter:h=>h.freq==="daily"&&!h.time},
              {key:"every3", label:"Alle 2–3 Tage", filter:h=>h.freq==="every3"},
              {key:"weekly", label:"Diese Woche", filter:h=>h.freq==="weekly"},
              {key:"monthly", label:"Diesen Monat", filter:h=>h.freq==="monthly"},
            ].map(({key,label,filter}) => {
              const items = areas.flatMap(a => a.habits.filter(filter).map(h => ({...h, areaId:a.id, areaName:a.name, areaColor:a.color})));
              if (!items.length) return null;
              return (
                <div key={key}>
                  <div className="mono text-xs uppercase tracking-wider text-[#9B9484] mb-2">{label}</div>
                  <div className="space-y-2">
                    {items.map(h => {
                      const val = h.logs[periodKey(h.freq)];
                      const done = h.type === "number" ? (val !== undefined) : !!val;
                      const s = streak(h);
                      return (
                        <div key={h.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#E4E0D6] px-4 py-3">
                          {h.type === "number" ? (
                            <input type="number" defaultValue={val ?? ""} placeholder="—"
                              onBlur={e => setNumberLog(h.areaId, h.id, e.target.value)}
                              className="w-14 text-center text-sm bg-[#F7F5F0] rounded-lg border border-[#E4E0D6] py-1.5 shrink-0 focus:outline-none focus:border-[#5A7A8C]" />
                          ) : (
                            <button onClick={() => toggleHabit(h.areaId, h.id)}
                              className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                              style={{ borderColor: h.areaColor, background: done ? h.areaColor : "transparent" }}>
                              {done && <Check size={14} color="white" />}
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm" style={{ textDecoration: done && h.type!=="number" ? "line-through" : "none", opacity: done ? 1 : 0.85 }}>{h.name}</div>
                            <div className="mono text-[11px] text-[#9B9484]">{h.areaName}</div>
                          </div>
                          {s > 0 && <div className="flex items-center gap-1 mono text-xs text-[#C79A4B] shrink-0"><Flame size={13}/>{s}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {areas.every(a => !a.habits.length) && (
              <p className="text-sm text-[#6B6357]">Noch keine Gewohnheiten angelegt. Geh zu einem Lebensbereich und füge welche hinzu.</p>
            )}
          </div>
        )}

        {tab === "bereich" && area && (
          <div>
            <button onClick={() => setTab("uebersicht")} className="text-sm text-[#9B9484] hover:text-[#2B2A28] mb-4">← Übersicht</button>
            <div className="bg-white rounded-2xl border border-[#E4E0D6] p-6 mb-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                {editingArea === area.id ? (
                  <input autoFocus value={area.name} onChange={e => updateArea(area.id, a => ({...a, name: e.target.value}))}
                    onBlur={() => setEditingArea(null)} onKeyDown={e => e.key==="Enter" && setEditingArea(null)}
                    className="serif text-2xl bg-transparent border-b border-[#C9C3B4] focus:outline-none" style={{fontWeight:600}} />
                ) : (
                  <h2 className="serif text-2xl flex items-center gap-2" style={{fontWeight:600, color:area.color}}>
                    {area.name}
                    <button onClick={() => setEditingArea(area.id)} className="text-[#C9C3B4] hover:text-[#6B6357]"><Pencil size={15}/></button>
                  </h2>
                )}
                <button onClick={() => removeArea(area.id)} className="text-[#C9C3B4] hover:text-[#B9707B]"><Trash2 size={16}/></button>
              </div>
              <div className="flex gap-1.5 mb-4">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => updateArea(area.id, a => ({...a, color:c}))}
                    className="w-5 h-5 rounded-full" style={{ background:c, outline: area.color===c ? "2px solid #2B2A28" : "none", outlineOffset:2 }} />
                ))}
              </div>
              <label className="mono text-xs uppercase tracking-wider text-[#9B9484]">Vision fürs Jahresende</label>
              <textarea value={area.vision} onChange={e => updateArea(area.id, a => ({...a, vision: e.target.value}))}
                placeholder="In einem Jahr bin ich …" rows={2}
                className="w-full mt-1 text-sm bg-[#F7F5F0] rounded-lg p-3 border border-[#E4E0D6] focus:outline-none focus:border-[#9B9484] resize-none" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="mono text-xs uppercase tracking-wider text-[#9B9484]">Gewohnheiten</span>
              <button onClick={() => setAddingHabitTo(area.id)} className="text-sm text-[#6B6357] hover:text-[#2B2A28] flex items-center gap-1">
                <Plus size={14}/> hinzufügen
              </button>
            </div>

            <div className="space-y-2">
              {area.habits.map(h => {
                const pct = habitRate(h);
                const s = streak(h);
                const val = h.logs[periodKey(h.freq)];
                const done = h.type === "number" ? (val !== undefined) : !!val;
                return (
                  <div key={h.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#E4E0D6] px-4 py-3">
                    {h.type === "number" ? (
                      <input type="number" defaultValue={val ?? ""} placeholder="—"
                        onBlur={e => setNumberLog(area.id, h.id, e.target.value)}
                        className="w-14 text-center text-sm bg-[#F7F5F0] rounded-lg border border-[#E4E0D6] py-1.5 shrink-0 focus:outline-none focus:border-[#5A7A8C]" />
                    ) : (
                      <button onClick={() => toggleHabit(area.id, h.id)}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: area.color, background: done ? area.color : "transparent" }}>
                        {done && <Check size={14} color="white" />}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{h.name}</div>
                      <div className="mono text-[11px] text-[#9B9484]">{h.freq==="daily"?(h.time==="morning"?"täglich · morgens":h.time==="evening"?"täglich · abends":"täglich"):h.freq==="every3"?"alle 2–3 Tage":h.freq==="weekly"?"wöchentlich":"monatlich"} · {Math.round(pct*100)}%{s>0 && ` · ${s} Serie`}</div>
                    </div>
                    <button onClick={() => removeHabit(area.id, h.id)} className="text-[#C9C3B4] hover:text-[#B9707B] shrink-0"><X size={15}/></button>
                  </div>
                );
              })}
              {!area.habits.length && <p className="text-sm text-[#9B9484]">Noch keine Gewohnheiten.</p>}
            </div>

            {addingHabitTo === area.id && <AddHabitForm onAdd={(name,freq,time) => addHabit(area.id,name,freq,time)} onCancel={() => setAddingHabitTo(null)} />}
          </div>
        )}
      </main>
    </div>
  );
}

function AddHabitForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [freq, setFreq] = useState("daily");
  const [time, setTime] = useState(null);
  return (
    <div className="mt-3 bg-white rounded-xl border border-[#E4E0D6] p-4">
      <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="z. B. 20 Min lesen"
        className="w-full text-sm bg-[#F7F5F0] rounded-lg p-2.5 border border-[#E4E0D6] focus:outline-none focus:border-[#9B9484] mb-2" />
      <div className="flex flex-wrap gap-1.5 mb-2">
        {[["daily","täglich"],["every3","alle 2–3 Tage"],["weekly","wöchentlich"],["monthly","monatlich"]].map(([k,l]) => (
          <button key={k} onClick={()=>setFreq(k)}
            className={`px-2.5 py-1 rounded-full text-xs mono transition-colors ${freq===k ? "bg-[#2B2A28] text-white" : "bg-[#F2F1EC] text-[#6B6357]"}`}>{l}</button>
        ))}
      </div>
      {freq === "daily" && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[[null,"jederzeit"],["morning","morgens"],["evening","abends"]].map(([k,l]) => (
            <button key={l} onClick={()=>setTime(k)}
              className={`px-2.5 py-1 rounded-full text-xs mono transition-colors ${time===k ? "bg-[#5A7A8C] text-white" : "bg-[#F2F1EC] text-[#6B6357]"}`}>{l}</button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={()=>onAdd(name,freq,time)} className="px-3 py-1.5 rounded-lg bg-[#2B2A28] text-white text-sm">Hinzufügen</button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-sm text-[#6B6357]">Abbrechen</button>
      </div>
    </div>
  );
}
