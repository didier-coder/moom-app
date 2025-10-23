import React, { useMemo, useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Restaurants from "./pages/Restaurants";

/**
 * MOOM – Admin Shell v1
 * - Sidebar + Topbar layout
 * - Routes: Dashboard, Restaurants, Hours, Closures, Tables, Reservations, Payments, Settings, Widget
 * - Pure React + minimal inline CSS (aucune dépendance CSS externe requise)
 * - Composants de formulaire prêts à brancher (placeholders de sauvegarde)
 *
 * Intégration:
 *   1) Place ce fichier sous: src/admin/Admin.jsx
 *   2) Dans App.js, utilise <Route path="/admin" element={<Admin />} />
 *   3) Plus tard, remplace les mocks `save()` par des appels à ton backend (/api/admin/*) ou Supabase
 */

// --------- Styles compacts (scopés au layout admin) ---------
const css = {
  app: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gridTemplateRows: "64px 1fr",
    gridTemplateAreas: '"sidebar topbar" "sidebar main"',
    minHeight: "100vh",
    background: "#f5f7f8",
    color: "#111",
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  sidebar: {
    gridArea: "sidebar",
    background: "#101418",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "16px 12px",
    gap: 8,
  },
  brand: { display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", marginBottom: 12 },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "linear-gradient(135deg,#bad5b7,#6bb06d)",
    boxShadow: "0 2px 8px rgba(0,0,0,.25)",
  },
  link: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: active ? "#0f172a" : "#cbd5e1",
    background: active ? "#e2e8f0" : "transparent",
    fontWeight: 600,
  }),
  topbar: {
    gridArea: "topbar",
    background: "#ffffffcc",
    backdropFilter: "saturate(140%) blur(6px)",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
  },
  main: { gridArea: "main", padding: 20 },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 4px 16px rgba(0,0,0,.06)",
  },
  h1: { fontSize: 20, margin: "0 0 12px" },
  h2: { fontSize: 16, margin: "0 0 10px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    background: "#fff",
    fontSize: 14,
    outline: "none",
  },
  label: { fontSize: 12, color: "#475569", fontWeight: 600, marginBottom: 6 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  actions: { display: "flex", gap: 10 },
  btn: (kind = "primary") => ({
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid",
    cursor: "pointer",
    fontWeight: 700,
    background: kind === "primary" ? "#bad5b7" : "#fff",
    color: kind === "primary" ? "#0b2810" : "#111",
    borderColor: kind === "primary" ? "#8fbc8f" : "#e2e8f0",
  }),
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    overflow: "hidden",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
  },
  th: { textAlign: "left", padding: 12, borderBottom: "1px solid #e5e7eb", background: "#f8fafc", fontSize: 12 },
  td: { padding: 12, borderBottom: "1px solid #f1f5f9", fontSize: 14 },
  badge: (c) => ({ display: "inline-block", padding: "4px 8px", borderRadius: 999, background: c, color: "#0b2810", fontWeight: 700 }),
};

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} end style={({ isActive }) => css.link(isActive)}>
    <span style={{ width: 18 }}>{icon}</span>
    {label}
  </NavLink>
);

// --------- Pages ---------
const Dashboard = () => {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={css.card}>
        <h2 style={css.h2}>Aujourd'hui</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <Stat label="Réservations" value="18" />
          <Stat label="Couverts" value="52" />
          <Stat label="Taux d'occupation" value="74%" />
          <Stat label="No‑shows" value="1" />
        </div>
      </div>
      <div style={css.card}>
        <h2 style={css.h2}>À venir</h2>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>Service du midi – 12:00, 12:15, 12:30 (10 tables)</li>
          <li>Service du soir – 18:00 à 22:00 (15 tables)</li>
        </ul>
      </div>
    </div>
  );
};


const Hours = () => {
  const days = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
  const [grid, setGrid] = useState(days.map(()=>({ lunch: { from: "12:00", to: "14:30", enabled: true }, dinner: { from: "18:00", to: "22:00", enabled: true } })));
  const save = () => alert("✅ Horaires enregistrés (mock). Brancher /api/admin/hours.");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={css.card}>
        <h2 style={css.h2}>Jours & Heures d'ouverture</h2>
        <table style={css.table}>
          <thead>
            <tr>
              <th style={css.th}>Jour</th>
              <th style={css.th}>Midi</th>
              <th style={css.th}>Soir</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((d, i)=> (
              <tr key={i}>
                <td style={css.td}>{days[i]}</td>
                <td style={css.td}>
                  <Toggle value={d.lunch.enabled} onChange={(v)=>updateGrid(setGrid,i,"lunch","enabled",v)} label="Actif"/>
                  <TimeRange value={d.lunch} onChange={(obj)=>updateGrid(setGrid,i,"lunch",null,obj)} />
                </td>
                <td style={css.td}>
                  <Toggle value={d.dinner.enabled} onChange={(v)=>updateGrid(setGrid,i,"dinner","enabled",v)} label="Actif"/>
                  <TimeRange value={d.dinner} onChange={(obj)=>updateGrid(setGrid,i,"dinner",null,obj)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12 }}>
          <button style={css.btn("primary")} onClick={save}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

const Closures = () => {
  const [list, setList] = useState([]);
  const [item, setItem] = useState({ from: "", to: "", note: "Congé annuel" });
  const add = () => { if(!item.from) return alert("Choisir une date"); setList([...list, item]); setItem({ from: "", to: "", note: "" }); };
  const remove = (i) => setList(list.filter((_,idx)=> idx!==i));
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={css.card}>
        <h2 style={css.h2}>Fermetures / Congés</h2>
        <div style={css.row}>
          <Field label="Du">
            <input style={css.input} type="date" value={item.from} onChange={(e)=>setItem({ ...item, from: e.target.value })} />
          </Field>
          <Field label="Au (facultatif)">
            <input style={css.input} type="date" value={item.to} onChange={(e)=>setItem({ ...item, to: e.target.value })} />
          </Field>
          <Field label="Note">
            <input style={css.input} value={item.note} onChange={(e)=>setItem({ ...item, note: e.target.value })} />
          </Field>
        </div>
        <div style={{ marginTop: 10, ...css.actions }}>
          <button style={css.btn("primary")} onClick={add}>Ajouter</button>
        </div>
      </div>

      <div style={css.card}>
        <h2 style={css.h2}>Liste</h2>
        <table style={css.table}>
          <thead>
            <tr><th style={css.th}>Du</th><th style={css.th}>Au</th><th style={css.th}>Note</th><th style={css.th}>Actions</th></tr>
          </thead>
          <tbody>
            {list.length===0 && (<tr><td style={css.td} colSpan={4}>Aucune fermeture pour l'instant.</td></tr>)}
            {list.map((it, i)=> (
              <tr key={i}>
                <td style={css.td}>{it.from}</td>
                <td style={css.td}>{it.to || "—"}</td>
                <td style={css.td}>{it.note || "—"}</td>
                <td style={css.td}><button style={css.btn("ghost")} onClick={()=>remove(i)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Tables = () => {
  const [tables, setTables] = useState([{ number: 1, capacity: 2 }, { number: 2, capacity: 4 }]);
  const [newT, setNewT] = useState({ number: 3, capacity: 2 });
  const add = () => setTables([...tables, newT]);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={css.card}>
        <h2 style={css.h2}>Tables</h2>
        <div style={css.row}>
          <Field label="N° table"><input style={css.input} type="number" value={newT.number} onChange={(e)=>setNewT({ ...newT, number: Number(e.target.value) })}/></Field>
          <Field label="Capacité"><input style={css.input} type="number" value={newT.capacity} onChange={(e)=>setNewT({ ...newT, capacity: Number(e.target.value) })}/></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <button style={css.btn("primary")} onClick={add}>Ajouter</button>
        </div>
      </div>

      <div style={css.card}>
        <table style={css.table}>
          <thead><tr><th style={css.th}>Table</th><th style={css.th}>Capacité</th></tr></thead>
          <tbody>
            {tables.map((t,i)=>(<tr key={i}><td style={css.td}>#{t.number}</td><td style={css.td}>{t.capacity}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Reservations = () => {
  // Placeholder: à brancher sur Supabase/Backend
  const rows = [
    { id: 1, date: "2025-10-23", service: "dinner", hour: "19:30", name: "Dupont", covers: 2, status: "confirmée" },
    { id: 2, date: "2025-10-23", service: "lunch", hour: "12:15", name: "Martin", covers: 4, status: "en attente" },
  ];
  return (
    <div style={css.card}>
      <h2 style={css.h2}>Réservations</h2>
      <table style={css.table}>
        <thead>
          <tr><th style={css.th}>Date</th><th style={css.th}>Service</th><th style={css.th}>Heure</th><th style={css.th}>Nom</th><th style={css.th}>Couverts</th><th style={css.th}>Statut</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td style={css.td}>{r.date}</td>
              <td style={css.td}>{r.service}</td>
              <td style={css.td}>{r.hour}</td>
              <td style={css.td}>{r.name}</td>
              <td style={css.td}>{r.covers}</td>
              <td style={css.td}><span style={css.badge(r.status === "confirmée" ? "#c6f6d5" : "#fde68a")}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Payments = () => {
  const [cfg, setCfg] = useState({ depositEnabled: false, depositType: "fixed", depositValue: 20, cardHold: true, provider: "stripe" });
  const save = () => alert("✅ Paiements enregistrés (mock). Brancher /api/admin/payments.");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={css.card}>
        <h2 style={css.h2}>Acompte / Empreinte</h2>
        <div style={css.row}>
          <Field label="Activer l'acompte">
            <Toggle value={cfg.depositEnabled} onChange={(v)=>setCfg({ ...cfg, depositEnabled: v })} label={cfg.depositEnabled?"Activé":"Désactivé"} />
          </Field>
          <Field label="Type d'acompte">
            <select style={css.input} value={cfg.depositType} onChange={(e)=>setCfg({ ...cfg, depositType: e.target.value })}>
              <option value="fixed">Montant fixe (€)</option>
              <option value="percent">Pourcentage (%)</option>
            </select>
          </Field>
          <Field label={cfg.depositType === "fixed" ? "Montant (€)" : "Pourcentage (%)"}>
            <input style={css.input} type="number" value={cfg.depositValue} onChange={(e)=>setCfg({ ...cfg, depositValue: Number(e.target.value) })} />
          </Field>
          <Field label="Empreinte de carte (no-show)">
            <Toggle value={cfg.cardHold} onChange={(v)=>setCfg({ ...cfg, cardHold: v })} label={cfg.cardHold?"Oui":"Non"} />
          </Field>
          <Field label="Fournisseur de paiement">
            <select style={css.input} value={cfg.provider} onChange={(e)=>setCfg({ ...cfg, provider: e.target.value })}>
              <option value="stripe">Stripe</option>
              <option value="mollie">Mollie</option>
            </select>
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <button style={css.btn("primary")} onClick={save}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const [cfg, setCfg] = useState({ reminder24h: true, waitlist: true, staffEmails: "reservations@moom.be", timezone: "Europe/Brussels" });
  const save = () => alert("✅ Paramètres enregistrés (mock). Brancher /api/admin/settings.");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={css.card}>
        <h2 style={css.h2}>Notifications & Général</h2>
        <div style={css.row}>
          <Field label="Rappel client 24h avant">
            <Toggle value={cfg.reminder24h} onChange={(v)=>setCfg({ ...cfg, reminder24h: v })} label={cfg.reminder24h?"Activé":"Désactivé"} />
          </Field>
          <Field label="Liste d'attente">
            <Toggle value={cfg.waitlist} onChange={(v)=>setCfg({ ...cfg, waitlist: v })} label={cfg.waitlist?"Activée":"Désactivée"} />
          </Field>
          <Field label="E-mails staff (séparés par virgule)">
            <input style={css.input} value={cfg.staffEmails} onChange={(e)=>setCfg({ ...cfg, staffEmails: e.target.value })} />
          </Field>
          <Field label="Fuseau horaire">
            <input style={css.input} value={cfg.timezone} onChange={(e)=>setCfg({ ...cfg, timezone: e.target.value })} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <button style={css.btn("primary")} onClick={save}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

const Widget = () => {
  const [theme, setTheme] = useState({ color: "#bad5b7", mode: "light" });
  const sampleSrc = useMemo(()=> `https://app.moom.be/widget?restaurant=1&color=${encodeURIComponent(theme.color)}&mode=${theme.mode}`, [theme]);
  const code = `<iframe src="${sampleSrc}" style="border:0;width:100%;height:600px"></iframe>`;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={css.card}>
        <h2 style={css.h2}>Widget / iFrame</h2>
        <div style={css.row}>
          <Field label="Couleur principale">
            <input style={css.input} type="color" value={theme.color} onChange={(e)=>setTheme({ ...theme, color: e.target.value })} />
          </Field>
          <Field label="Mode">
            <select style={css.input} value={theme.mode} onChange={(e)=>setTheme({ ...theme, mode: e.target.value })}>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field label="Code iFrame">
            <textarea readOnly value={code} style={{ ...css.input, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", height: 120 }} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <iframe title="preview" src={sampleSrc} style={{ width: "100%", height: 380, border: 0, borderRadius: 12, background: "#fff" }} />
        </div>
      </div>
    </div>
  );
};

// --------- building blocks ---------
const Field = ({ label, children }) => (
  <div style={css.field}>
    {label && <label style={css.label}>{label}</label>}
    {children}
  </div>
);

const Toggle = ({ value, onChange, label }) => (
  <button onClick={()=>onChange(!value)} style={{ ...css.btn(value?"primary":"ghost"), minWidth: 120 }}>{label}</button>
);

const TimeRange = ({ value, onChange }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
    <input style={css.input} type="time" value={value.from} onChange={(e)=>onChange({ ...value, from: e.target.value })} />
    <input style={css.input} type="time" value={value.to} onChange={(e)=>onChange({ ...value, to: e.target.value })} />
  </div>
);

const Stat = ({ label, value }) => (
  <div style={{ ...css.card, padding: 12 }}>
    <div style={{ fontSize: 12, color: "#475569" }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
  </div>
);

function updateGrid(setter, idx, key, subKey, val){
  setter(prev => prev.map((row,i)=> i!==idx ? row : (subKey ? { ...row, [key]: { ...row[key], [subKey]: val } } : { ...row, [key]: val })));
}

// --------- Layout principal Admin ---------
const Shell = ({ children }) => {
  const navigate = useNavigate();
  return (
    <div style={css.app}>
      <aside style={css.sidebar}>
        <div style={css.brand}>
          <div style={css.brandBadge} />
          <div style={{ fontWeight: 900, letterSpacing: .5 }}>MOOM Admin</div>
        </div>
        <nav style={{ display: "grid", gap: 6 }}>
          <NavItem to="/admin" label="Tableau de bord" icon="📊" />
          <NavItem to="/admin/restaurants" label="Restaurants" icon="🏷️" />
          <NavItem to="/admin/hours" label="Heures" icon="🕒" />
          <NavItem to="/admin/closures" label="Fermetures" icon="🚪" />
          <NavItem to="/admin/tables" label="Tables" icon="🍽️" />
          <NavItem to="/admin/reservations" label="Réservations" icon="📖" />
          <NavItem to="/admin/payments" label="Paiements" icon="💳" />
          <NavItem to="/admin/settings" label="Paramètres" icon="⚙️" />
          <NavItem to="/admin/widget" label="Widget" icon="🧩" />
        </nav>
        <div style={{ marginTop: "auto", fontSize: 12, opacity: .7 }}>v1 • prêt à brancher</div>
      </aside>
      <header style={css.topbar}>
        <div style={{ fontWeight: 800 }}>Panneau d’administration</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={css.btn("ghost")} onClick={()=>navigate("/")}>↩︎ Retour au site</button>
          <button style={css.btn("primary")}>+ Nouvelle réservation</button>
        </div>
      </header>
      <main style={css.main}>{children}</main>
    </div>
  );
};

// --------- Entrée Admin ---------
export default function Admin(){
  return (   
      <Shell>
        <Routes>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/restaurants" element={<Restaurants />} />
          <Route path="/admin/hours" element={<Hours />} />
          <Route path="/admin/closures" element={<Closures />} />
          <Route path="/admin/tables" element={<Tables />} />
          <Route path="/admin/reservations" element={<Reservations />} />
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/widget" element={<Widget />} />       
          {/* Fallback */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Shell>  
  );
}
