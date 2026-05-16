import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bus, CalendarDays, Car, ClipboardList, IdCard, LayoutDashboard, LogOut, Users, UserRoundCog, AlertTriangle, Image, Settings , UserPlus, ShieldCheck } from "lucide-react";
import { getSession, signIn, signOut, listTable, insertRow, updateRow, deleteRow, createAuthUser } from "./lib/api";
import { supabaseConfigured } from "./lib/supabase";
import { BASES_RIOJACAR, KNOWN_PLACES, INITIAL_DRIVERS, INITIAL_VEHICLES, INITIAL_MONITORS, INITIAL_SIGN_CODES } from "./lib/seedData";
import "./styles/app.css";
import logoUrl from "./assets/logo.png";


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("MyBusOps error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="login-screen">
          <div className="login-card">
            <h1>Error al abrir MyBusOps</h1>
            <div className="error">{String(this.state.error?.message || this.state.error)}</div>
            <p style={{fontSize:13,lineHeight:1.5,color:"rgba(255,255,255,.72)"}}>
              No abras esta app con doble clic sobre index.html. Abre la carpeta, ejecuta iniciar_app.bat y entra en http://localhost:5173
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const iconMap = {
  dashboard: LayoutDashboard,
  conductores: Users,
  vehiculos: Bus,
  monitores: UserRoundCog,
  servicios: ClipboardList,
  codigos: ClipboardList,
  bases: LayoutDashboard,
  caducidades: AlertTriangle,
  perfil: IdCard,
  ajustes: Settings,
};

const navByRole = {
  admin: ["dashboard", "conductores", "vehiculos", "monitores", "servicios", "caducidades", "ajustes"],
  jefe: ["dashboard", "perfil", "usuarios", "conductores", "vehiculos", "monitores", "servicios", "codigos", "bases", "caducidades"],
  conductor: ["dashboard", "perfil", "servicios", "caducidades"],
  monitor: ["dashboard", "perfil", "servicios"]
};

const labels = {
  dashboard: "Inicio",
  conductores: "Conductores",
  vehiculos: "Vehículos",
  monitores: "Monitores",
  servicios: "Servicios",
  codigos: "Códigos letrero",
  bases: "Bases",
  caducidades: "Caducidades",
  perfil: "Mi perfil",
  ajustes: "Ajustes"
};

async function generateServiceMd5(payload) {
  // WebCrypto no soporta MD5 en navegadores modernos.
  // Generamos un identificador estable de 32 caracteres hexadecimales compatible con el campo md5.
  const clean = JSON.stringify(payload, Object.keys(payload).sort()) + "|" + Date.now() + "|" + Math.random();
  const data = new TextEncoder().encode(clean);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}


function isExpiring(date) {
  if (!date) return false;
  const days = (new Date(date) - new Date()) / 86400000;
  return days <= 60;
}

function ClockHeader() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fecha = now.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const hora = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  return (
    <div className="login-clock">
      <strong>{fecha}</strong>
      <span>{hora}</span>
    </div>
  );
}

const defaultBackgrounds = [
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=1800&q=80"
];

function Login({ onLogin }) {
  const [email, setEmail] = useState("jefe@mybusops.local");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");
  const [bgIndex, setBgIndex] = useState(0);
  const backgrounds = JSON.parse(localStorage.getItem("fleetops_login_backgrounds") || "null") || defaultBackgrounds;

  useEffect(() => {
    const id = setInterval(() => setBgIndex(i => (i + 1) % backgrounds.length), 6500);
    return () => clearInterval(id);
  }, [backgrounds.length]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const result = await signIn(email, password);
      onLogin(result.profile);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-screen">
      {backgrounds.map((bg, i) => (
        <div
          key={bg + i}
          className={"login-bg " + (i === bgIndex ? "active" : "")}
          style={{ backgroundImage: `url("${bg}")` }}
        />
      ))}
      <div className="login-overlay" />
      <ClockHeader />

      <form className="login-card glass" onSubmit={submit}>
        <div className="login-logo-wrap">
          <img src={logoUrl} className="login-logo" />
        </div>

        <div className="login-title">
          <h1>Riojacar MyBusOps</h1>
          <p>Acceso seguro de flota y servicios</p>
        </div>

        {!supabaseConfigured && (
          <div className="notice">
            Modo demo: añade las claves de Supabase en <b>.env</b> cuando quieras conectar la base online.
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div className="field">
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="jefe@empresa.com"/>
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña"/>
        </div>

        <button className="btn full">Entrar</button>
      </form>
    </div>
  );
}

function Shell({ profile, onProfileUpdate, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState({ conductores: [], vehiculos: [], monitores: [], servicios: [], sign_codes: [], profiles: [], bases: BASES_RIOJACAR });
  const [loading, setLoading] = useState(false);
  const nav = navByRole[profile.role] || navByRole.conductor;

  async function load() {
    setLoading(true);
    try {
      const [conductoresRaw, vehiculosRaw, monitoresRaw, servicios, sign_codes, profiles] = await Promise.all([
        listTable("conductores"),
        listTable("vehiculos"),
        listTable("monitores"),
        listTable("servicios"),
        listTable("sign_codes"),
        listTable("profiles")
      ]);
      const conductores = mergeInitialRows(conductoresRaw, INITIAL_DRIVERS);
      const vehiculos = mergeInitialRows(vehiculosRaw, INITIAL_VEHICLES);
      const monitores = mergeInitialRows(monitoresRaw, INITIAL_MONITORS);
      setData({ conductores, vehiculos, monitores, servicios, sign_codes, profiles, bases: BASES_RIOJACAR });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function logout() {
    await signOut();
    onLogout();
  }

  const PageIcon = iconMap[tab] || LayoutDashboard;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <img src={logoUrl} className="topbar-logo" alt="Riojacar"/>
          <div className="topbar-title">Gestión</div>
        </div>
        <div className="user-pill">
          <span>{profile.full_name || profile.email} · {profile.role}</span>
          <button className="btn small secondary" onClick={logout}><LogOut size={15}/>Salir</button>
        </div>
      </header>

      <div className="shell">
        <aside className="sidebar">
          {nav.map(id => {
            const Icon = iconMap[id] || CalendarDays;
            return <button key={id} className={"navbtn " + (tab===id ? "active" : "")} onClick={()=>setTab(id)}><Icon size={18}/>{labels[id]}</button>
          })}
        </aside>

        <main className="main">
          <div className="page-head">
            <div>
              <h2><PageIcon size={24}/> {labels[tab]}</h2>
              <p>{loading ? "Cargando datos..." : "Datos sincronizados con la base online cuando Supabase esté configurado."}</p>
            </div>
          </div>

          {tab === "dashboard" && <Dashboard data={data}/>}
          {tab === "conductores" && <Conductores data={data} reload={load}/>}
          {tab === "vehiculos" && <Vehiculos data={data} reload={load}/>}
          {tab === "monitores" && <Monitores data={data} reload={load}/>}
          {tab === "servicios" && <Servicios data={data} reload={load} profile={profile}/>}
          {tab === "codigos" && <CodigosLetrero data={data} reload={load}/>}
          {tab === "bases" && <BasesPanel/>}
          {tab === "caducidades" && <Caducidades data={data}/>}
          {tab === "inicio" && <PortalInicio profile={profile} data={data}/>}
          {tab === "perfil" && <Perfil profile={profile} data={data} onProfileUpdate={onProfileUpdate}/>}
          {tab === "ajustes" && <AjustesLogin />}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ data }) {
  const warnings = data.conductores.filter(c => isExpiring(c.license_expiry) || isExpiring(c.cap_expiry) || isExpiring(c.tachograph_card_expiry));
  return (
    <div className="grid">
      <Stat label="Conductores" value={data.conductores.length}/>
      <Stat label="Vehículos" value={data.vehiculos.length}/>
      <Stat label="Monitores" value={data.monitores.length}/>
      <Stat label="Servicios" value={data.servicios.length}/>
      <Stat label="Códigos letrero" value={(data.sign_codes || []).length}/>
      <Stat label="Caducidades próximas" value={warnings.length}/>
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="card stat"><strong>{value}</strong><span>{label}</span></div>;
}

function FormCard({ title, fields, onSave }) {
  const [form, setForm] = useState({});
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="form-grid">
        {fields.map(f => (
          <div className="field" key={f.name}>
            <label>{f.label}</label>
            <input type={f.type || "text"} value={form[f.name] || ""} onChange={e=>setForm({...form,[f.name]:e.target.value})}/>
          </div>
        ))}
      </div>
      <button className="btn full" onClick={async()=>{await onSave(form); setForm({});}}>Guardar</button>
    </div>
  );
}

function Conductores({ data, reload }) {
  const fields = [
    {name:"full_name",label:"Nombre completo"},
    {name:"phone",label:"Teléfono"},
    {name:"email",label:"Email"},
    {name:"license_expiry",label:"Caducidad carnet de conducir",type:"date"},
    {name:"cap_expiry",label:"Caducidad CAP",type:"date"},
    {name:"tachograph_card_expiry",label:"Caducidad tarjeta tacógrafo",type:"date"},
    
  ];

  return (
    <>
      <EditableFormCard
        title="Añadir conductor"
        fields={fields}
        table="conductores"
        extraFields={(form,setForm)=>(
          <>
            <BaseSelect value={form.base} set={v=>setForm({...form,base:v})}/>
        <VehicleGroupSelect value={form.vehicle_group} set={v=>setForm({...form,vehicle_group:v})}/>
            <DefaultVehicleSelect value={form.default_vehicle_id} set={v=>setForm({...form,default_vehicle_id:v})} vehiculos={data.vehiculos || []}/>
            <PhotoUploader label="Foto" value={form.photo_url} set={v=>setForm({...form,photo_url:v})}/>
            <MultiVehicleSelect value={form.authorized_vehicle_ids || []} set={v=>setForm({...form,authorized_vehicle_ids:v})} vehiculos={data.vehiculos || []}/>
          </>
        )}
        normalize={f=>({...f,status:"activo",authorized_vehicle_ids:f.authorized_vehicle_ids || []})}
        reload={reload}
      />

      <EditableList
        title="Conductores"
        items={data.conductores || []}
        table="conductores"
        reload={reload}
        fields={fields}
        renderExtraEdit={(form,setForm)=>(
          <>
            <BaseSelect value={form.base} set={v=>setForm({...form,base:v})}/>
            <DefaultVehicleSelect value={form.default_vehicle_id} set={v=>setForm({...form,default_vehicle_id:v})} vehiculos={data.vehiculos || []}/>
            <PhotoUploader label="Foto" value={form.photo_url} set={v=>setForm({...form,photo_url:v})}/>
            <MultiVehicleSelect value={form.authorized_vehicle_ids || []} set={v=>setForm({...form,authorized_vehicle_ids:v})} vehiculos={data.vehiculos || []}/>
          </>
        )}
        primary={c=>c.full_name}
        meta={c=>{ const dv=(data.vehiculos || []).find(v=>v.id===c.default_vehicle_id); return `Base: ${c.base || "-"} · Bus defecto: ${dv ? getVehicleLabel(dv) : "-"} · Tel: ${c.phone || "-"} · Carnet: ${c.license_expiry || "-"} · CAP: ${c.cap_expiry || "-"} · Tacógrafo: ${c.tachograph_card_expiry || "-"} · Vehículos autorizados: ${(c.authorized_vehicle_ids || []).length || "todos/no definido"}`; }}
      />
    </>
  );
}


function Vehiculos({ data, reload }) {
  const fields = [
    {name:"bus_number",label:"Número de bus"},
    {name:"plate",label:"Matrícula"},
    {name:"brand",label:"Marca"},
    {name:"model",label:"Modelo"},
    {name:"bodywork",label:"Carrocería"},
    
    {name:"seats",label:"Núm. plazas",type:"number"},
    {name:"pmr_count",label:"Número de PMR",type:"number"},
    {name:"insurance_expiry",label:"Caducidad seguro",type:"date"},
    {name:"itv_expiry",label:"Caducidad ITV",type:"date"},
    
  ];

  function extra(form,setForm) {
    return (
      <>
        <div className="field">
          <label>PMR</label>
          <select value={form.pmr || "no"} onChange={e=>setForm({...form,pmr:e.target.value,pmr_count:e.target.value==="si"?form.pmr_count:"0"})}>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </div>
        <BaseSelect value={form.base} set={v=>setForm({...form,base:v})}/>
        <PhotoUploader label="Foto del vehículo" value={form.photo_url} set={v=>setForm({...form,photo_url:v})}/>
      </>
    );
  }

  return (
    <>
      <EditableFormCard
        title="Añadir vehículo"
        fields={fields}
        table="vehiculos"
        extraFields={extra}
        normalize={f=>({...f,seats:Number(f.seats || 0),pmr_count:Number(f.pmr_count || 0),status:"activo"})}
        reload={reload}
      />

      <EditableList
        title="Vehículos"
        items={data.vehiculos || []}
        table="vehiculos"
        reload={reload}
        fields={fields}
        renderExtraEdit={extra}
        primary={v=>`Bus ${v.bus_number || "-"} · ${v.plate || "sin matrícula"}`}
        meta={v=>`Base: ${v.base || "-"} · Grupo: ${v.vehicle_group === "autobus" ? "Autobuses" : v.vehicle_group === "microbus" ? "Microbuses" : v.vehicle_group === "autobus_3_ejes" ? "Autobús 3 ejes" : v.vehicle_group === "turismo" ? "Turismos" : "-"} · ${v.brand || ""} ${v.model || ""} · Carrocería: ${v.bodywork || "-"} · Plazas: ${v.seats || "-"} · PMR: ${v.pmr === "si" ? `Sí (${v.pmr_count || 0})` : "No"} · Seguro: ${v.insurance_expiry || "-"} · ITV: ${v.itv_expiry || "-"}`}
      />
    </>
  );
}


function Monitores({ data, reload }) {
  const fields = [
    {name:"full_name",label:"Nombre completo"},
    {name:"phone",label:"Teléfono"},
    {name:"email",label:"Email"},
  ];

  return (
    <>
      <EditableFormCard
        title="Añadir monitor"
        fields={fields}
        table="monitores"
        extraFields={(form,setForm)=><BaseSelect value={form.base} set={v=>setForm({...form,base:v})}/>}
        normalize={f=>({...f,status:"activo"})}
        reload={reload}
      />

      <EditableList
        title="Monitores"
        items={data.monitores || []}
        table="monitores"
        reload={reload}
        fields={fields}
        renderExtraEdit={(form,setForm)=><BaseSelect value={form.base} set={v=>setForm({...form,base:v})}/>}
        primary={m=>m.full_name}
        meta={m=>`Base: ${m.base || "-"} · Tel: ${m.phone || "-"} · Email: ${m.email || "-"}`}
      />
    </>
  );
}


function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .trim();
}


function levenshtein(a, b) {
  a = normalizeText(a);
  b = normalizeText(b);
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function similarityScore(input, candidate) {
  const a = normalizeText(input);
  const b = normalizeText(candidate);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.92;

  const aTokens = a.split(/\\s+/).filter(Boolean);
  const bTokens = b.split(/\\s+/).filter(Boolean);
  const shared = aTokens.filter(t => bTokens.includes(t)).length;
  const tokenScore = shared / Math.max(aTokens.length, bTokens.length, 1);

  const maxLen = Math.max(a.length, b.length, 1);
  const levScore = 1 - (levenshtein(a, b) / maxLen);

  return Math.max(tokenScore * 0.9, levScore);
}

function expandPlaceAliases(input) {
  const n = normalizeText(input);
  const aliases = {
    "najera": "Nájera",
    "nagera": "Nájera",
    "valganon": "Valgañón",
    "valgañon": "Valgañón",
    "santo domingo": "Santo Domingo de la Calzada",
    "sto domingo": "Santo Domingo de la Calzada",
    "sanvi": "San Vicente de la Sonsierra",
    "san vicente": "San Vicente de la Sonsierra",
    "sv sonsierra": "San Vicente de la Sonsierra",
    "quintana": "Quintana Martín Galíndez",
    "quintana martin": "Quintana Martín Galíndez",
    "quintana m galindez": "Quintana Martín Galíndez",
    "cilla": "Cillaperlata",
    "cillapelarta": "Cillaperlata",
    "cillaperlata": "Cillaperlata",
    "logrono": "Logroño",
    "logroño": "Logroño"
  };
  return aliases[n] || input;
}

function distanceKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function findPlaceByName(name) {
  const expanded = expandPlaceAliases(name);
  const n = normalizeText(expanded);
  if (!n) return null;

  const exact = KNOWN_PLACES.find(p => normalizeText(p.name) === n);
  if (exact) return exact;

  const contains = KNOWN_PLACES.find(p => {
    const pn = normalizeText(p.name);
    return n.includes(pn) || pn.includes(n);
  });
  if (contains) return contains;

  const ranked = KNOWN_PLACES
    .map(p => ({ place: p, score: similarityScore(n, p.name) }))
    .sort((a,b) => b.score - a.score);

  if (ranked[0]?.score >= 0.62) return ranked[0].place;
  return null;
}

function nearestBaseFromOrigin(origin) {
  const place = findPlaceByName(origin);
  if (!place) return { base: null, distance: null, place: null };
  const ranked = BASES_RIOJACAR
    .map(base => ({ base, distance: distanceKm(place, base) }))
    .sort((a,b) => a.distance - b.distance);
  return { base: ranked[0].base, distance: ranked[0].distance, place };
}

function mergeInitialRows(current, initialRows) {
  const existingNames = new Set((current || []).map(x => normalizeText(x.full_name || x.bus_number || x.id)));
  const existingIds = new Set((current || []).map(x => x.id));
  const missing = initialRows.filter(x => !existingIds.has(x.id) && !existingNames.has(normalizeText(x.full_name || x.bus_number || x.id)));
  return [...(current || []), ...missing];
}


function getVehicleGroup(v) {
  const explicit = normalizeText(v.vehicle_group || v.group || "");
  if (explicit.includes("turismo") || explicit.includes("coche")) return "turismo";
  if (explicit.includes("3") || explicit.includes("ejes")) return "autobus_3_ejes";
  if (explicit.includes("micro")) return "microbus";
  if (explicit.includes("auto")) return "autobus";

  const seats = Number(v.seats || 0);
  if (seats > 0 && seats <= 9) return "turismo";
  if (seats <= 30) return "microbus";
  if (seats >= 59) return "autobus_3_ejes";
  return "autobus";
}

const VEHICLE_GROUPS = [
  { id: "autobus", label: "Autobuses" },
  { id: "microbus", label: "Microbuses" },
  { id: "autobus_3_ejes", label: "Autobús 3 ejes" },
  { id: "turismo", label: "Turismos" }
];

function getVehicleLabel(v) {
  return `Bus ${v.bus_number || v.plate || v.id}${v.seats ? ` · ${v.seats} plazas` : ""}${v.base ? ` · ${v.base}` : ""}`;
}

const DEFAULT_SIGN_CODES = INITIAL_SIGN_CODES;

function getAllSignCodes(data) {
  const custom = data?.sign_codes || [];
  const byKey = new Map();
  [...DEFAULT_SIGN_CODES, ...custom].forEach(item => {
    const key = item.id || `${item.service_type}-${item.code}-${item.name}`;
    byKey.set(key, item);
  });
  return Array.from(byKey.values());
}

function findAutomaticSignCode(form, data) {
  if (form.manual_sign_code === "si") return form.sign_code || "";

  if (form.service_type === "discrecional") return "2";

  const codes = getAllSignCodes(data).filter(c => c.service_type === form.service_type);
  const line = String(form.line_number || "").trim().toLowerCase();
  const origin = String(form.origin || "").trim().toLowerCase();
  const destination = String(form.destination || "").trim().toLowerCase();
  const itinerary = String(form.itinerary || "").trim().toLowerCase();

  const exact = codes.find(c =>
    (line && String(c.line_number || "").trim().toLowerCase() === line) ||
    (itinerary && String(c.itinerary || "").trim().toLowerCase() === itinerary) ||
    (origin && destination &&
      String(c.origin || "").trim().toLowerCase() === origin &&
      String(c.destination || "").trim().toLowerCase() === destination)
  );

  const fallback = exact || codes.find(c => c.is_default) || codes[0];
  return fallback?.code ? String(fallback.code) : "";
}

function SignCodePreview({ form, data }) {
  const autoCode = findAutomaticSignCode(form, data);
  const manual = form.manual_sign_code === "si";
  return (
    <div className="notice">
      Código letrero: <b>{manual ? (form.sign_code || "manual sin indicar") : (autoCode || "sin configurar")}</b>
      {!manual && <span> · automático según tipo/ruta</span>}
    </div>
  );
}


function getDriverById(data, id) {
  return (data.conductores || []).find(x => x.id === id);
}

function getVehicleById(data, id) {
  return (data.vehiculos || []).find(x => x.id === id);
}

function getMonitorById(data, id) {
  return (data.monitores || []).find(x => x.id === id);
}

function serviceTypeLabelGlobal(type) {
  return {
    instituto: "Instituto",
    linea: "Línea",
    fabrica: "Fábrica",
    discrecional: "Discrecional"
  }[type] || type || "-";
}

function serviceToPdfHtml(service, data) {
  const driver = getDriverById(data, service.driver_id);
  const vehicle = getVehicleById(data, service.vehicle_id);
  const monitor = getMonitorById(data, service.monitor_id);
  const bus = vehicle?.bus_number || vehicle?.plate || "-";
  const phone = driver?.phone || "-";
  const title = `${bus} BUS -> ${driver?.full_name || "-"}`;
  const route = `${service.start_time || ""} ${service.origin || ""} - ${service.destination || ""}${service.has_return === "si" ? " Y REGRESO" : ""}`;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Servicio ${service.md5 || ""}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;margin:26px;color:#111}
  .sheet{border:1px solid #ddd;padding:18px;max-width:900px;margin:auto}
  .top{display:flex;justify-content:space-between;gap:12px;font-size:13px}
  h1{font-size:18px;margin:10px 0}
  .line{border-top:1px solid #222;margin:8px 0}
  .big{font-size:16px;font-weight:700;margin:12px 0}
  .muted{color:#555;font-size:12px}
  .notes{white-space:pre-wrap;border:1px solid #ddd;padding:10px;margin-top:10px}
  @media print{button{display:none} body{margin:0}.sheet{border:0}}
</style>
</head>
<body>
<div class="sheet">
  <div class="top">
    <div><b>${title}</b></div>
    <div>${service.service_date || ""} · Tf:${phone}</div>
  </div>
  <div class="line"></div>
  <h1>${route}</h1>
  <div class="big">Tipo: ${serviceTypeLabelGlobal(service.service_type)} · Código letrero: ${service.sign_code || "-"}</div>
  ${service.service_type === "linea" ? `<div>Línea: <b>${service.line_number || "-"}</b> · Itinerario: ${service.itinerary || "-"}</div>` : ""}
  <div>Vehículo: <b>${getVehicleLabel(vehicle || {})}</b></div>
  <div>Conductor: <b>${driver?.full_name || "-"}</b></div>
  ${monitor ? `<div>Monitor: <b>${monitor.full_name}</b></div>` : ""}
  <div>Plazas: ${service.seats_required || "-"} · Regreso: ${service.has_return === "si" ? "Sí" : "No"}</div>
  <div>Base sugerida: ${service.nearest_base || "-"} ${service.nearest_base_km ? `(${service.nearest_base_km} km)` : ""}</div>
  <div class="notes"><b>Notas:</b><br/>${service.notes || "-"}</div>
  <div class="muted" style="margin-top:14px">MD5=${service.md5 || "-"}</div>
  <div class="muted">Estado: ${service.status || "pendiente"} · Visto: ${service.seen_at || "-"} · Inicio: ${service.started_at || "-"} · Final: ${service.ended_at || "-"}</div>
  <button onclick="window.print()">Imprimir / guardar PDF</button>
</div>
</body>
</html>`;
}

function openServicePdf(service, data) {
  const w = window.open("", "_blank");
  if (!w) {
    alert("El navegador ha bloqueado la ventana del PDF. Permite ventanas emergentes para esta app.");
    return;
  }
  w.document.open();
  w.document.write(serviceToPdfHtml(service, data));
  w.document.close();
}

function openEmailDraft(service, data, senderProfile) {
  const driver = getDriverById(data, service.driver_id);
  const email = driver?.email || "";
  const subject = encodeURIComponent(`Servicio ${service.service_date || ""} ${service.origin || ""} - ${service.destination || ""}`);
  const fromLine = senderProfile?.email ? `\n\nEnviado por: ${senderProfile.email}` : "";
  const body = encodeURIComponent(`Tienes un nuevo servicio asignado.\n\nFecha: ${service.service_date}\nHora: ${service.start_time}\nOrigen: ${service.origin}\nDestino: ${service.destination}\nCódigo letrero: ${service.sign_code}\nMD5: ${service.md5}${fromLine}\n\nAbre MyBusOps para confirmarlo.`);
  if (!email) {
    alert("El conductor no tiene email configurado. Se generará el PDF/parte, pero no se puede abrir correo dirigido.");
    return;
  }
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}


async function sendServiceEmailViaGmail(service, data, senderProfile) {
  const driver = getDriverById(data, service.driver_id);
  const vehicle = getVehicleById(data, service.vehicle_id);
  const monitor = getMonitorById(data, service.monitor_id);

  if (!driver?.email) {
    throw new Error("El conductor no tiene email configurado.");
  }

  const response = await fetch("http://localhost:8787/api/send-service-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, driver, vehicle, monitor, senderProfile })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "No se pudo enviar el email.");
  }
  return result;
}


async function sendDailyGrouped(date, data, profile) {
  const services = (data.servicios || []).filter(s => s.service_date === date);

  const response = await fetch("http://localhost:8787/api/send-daily-grouped", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({
      date,
      services,
      drivers: data.conductores || [],
      vehicles: data.vehiculos || [],
      monitors: data.monitores || [],
      senderProfile: profile
    })
  });

  const result = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(result.error || "Error enviando agrupado");
  return result;
}

function Servicios({ data, reload, profile }) {
  const emptyForm = {
    service_date: "",
    start_time: "",
    origin: "",
    destination: "",
    has_return: "no",
    service_type: "linea",
    seats_required: "",
    vehicle_id: "",
    driver_id: "",
    monitor_id: "",
    manual_sign_code: "no",
    sign_code: "",
    line_number: "",
    itinerary: "",
    notes: "",
    status: "pendiente",
    base_override: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [suggestion, setSuggestion] = useState(null);
  const [incidentDrafts, setIncidentDrafts] = useState({});
  const [copyDrafts, setCopyDrafts] = useState({});
  const [dailySendDate, setDailySendDate] = useState("");
  const canEdit = ["admin","jefe"].includes(profile.role);
  const isDriver = profile.role === "conductor";
  const isMonitor = profile.role === "monitor";
  const visibles = data.servicios || [];

  const selectedType = form.service_type || "linea";
  const showReturn = ["instituto","discrecional"].includes(selectedType);
  const showSeats = ["instituto","fabrica","discrecional"].includes(selectedType);
  const showMonitor = selectedType === "instituto";
  const showLineFields = selectedType === "linea";
  const manualSignCode = form.manual_sign_code === "si";

  const requiredByType = {
    instituto: "Instituto: fecha y hora, origen, destino, regreso sí/no, plazas, vehículo, conductor, monitor, código automático y notas.",
    linea: "Línea: fecha y hora, origen, destino, número de línea, itinerario, vehículo, conductor, código automático y notas.",
    fabrica: "Fábrica: fecha y hora, origen, destino, plazas, vehículo, conductor, código automático y notas.",
    discrecional: "Discrecional: fecha y hora, origen, destino, regreso sí/no, plazas, vehículo, conductor, código fijo 2 y notas."
  };

  function computeSuggestion(nextForm=form) {
    const nearest = nextForm.base_override
      ? { base: BASES_RIOJACAR.find(b => b.name === nextForm.base_override), distance: 0, place: { name: "Base manual" } }
      : nearestBaseFromOrigin(nextForm.origin);
    const baseName = nearest.base?.name;
    if (!baseName) {
      setSuggestion({ error: "No reconozco el origen. Elige una base manual o escribe una localidad más concreta." });
      return null;
    }

    const seatsNeeded = Number(nextForm.seats_required || 0);
    const vehicles = (data.vehiculos || [])
      .filter(v => normalizeText(v.base) === normalizeText(baseName))
      .filter(v => !seatsNeeded || Number(v.seats || 0) >= seatsNeeded)
      .sort((a,b) => Number(a.seats || 999) - Number(b.seats || 999));

    const drivers = (data.conductores || [])
      .filter(c => normalizeText(c.base) === normalizeText(baseName));

    const selectedDriver = drivers[0] || null;

    const defaultVehicle = selectedDriver?.default_vehicle_id
      ? vehicles.find(v => v.id === selectedDriver.default_vehicle_id)
      : null;

    const selectedVehicle = defaultVehicle || vehicles[0] || null;

    const filteredDrivers = drivers.filter(c => {
      const auth = c.authorized_vehicle_ids || [];
      return !selectedVehicle || !auth.length || auth.includes(selectedVehicle.id);
    });

    const monitors = (data.monitores || [])
      .filter(m => normalizeText(m.base) === normalizeText(baseName));

    const selectedMonitor = showMonitor ? (monitors[0] || null) : null;

    const result = {
      base: baseName,
      distance: nearest.distance,
      place: nearest.place?.name,
      vehicle: selectedVehicle,
      driver: selectedDriver,
      monitor: selectedMonitor,
      vehicles,
      drivers: filteredDrivers,
      monitors
    };
    setSuggestion(result);
    return result;
  }

  function applySuggestion() {
    const s = computeSuggestion();
    if (!s || s.error) return;
    setForm(prev => ({
      ...prev,
      vehicle_id: s.vehicle?.id || prev.vehicle_id,
      driver_id: s.driver?.id || prev.driver_id,
      monitor_id: showMonitor ? (s.monitor?.id || prev.monitor_id) : prev.monitor_id
    }));
  }

  function update(name, value) {
    const next = { ...form, [name]: value };

    if (name === "service_type") {
      if (!["instituto","discrecional"].includes(value)) next.has_return = "no";
      if (!["instituto","fabrica","discrecional"].includes(value)) next.seats_required = "";
      if (value !== "instituto") next.monitor_id = "";
      if (value !== "linea") {
        next.line_number = "";
        next.itinerary = "";
      }
      if (value === "discrecional") {
        next.manual_sign_code = "no";
        next.sign_code = "";
      }
    }

    setForm(next);
    if (["origin","seats_required","service_type"].includes(name)) {
      setTimeout(() => computeSuggestion(next), 0);
    }
  }

  function validate() {
    const baseRequired = ["service_date","start_time","origin","destination","vehicle_id","driver_id"];
    const required = [...baseRequired];

    if (showSeats) required.push("seats_required");
    if (showMonitor) required.push("monitor_id");
    if (showLineFields) required.push("line_number","itinerary");
    if (manualSignCode) required.push("sign_code");

    const finalCode = manualSignCode ? form.sign_code : findAutomaticSignCode(form, data);

    const missing = required.filter(k => !String(form[k] || "").trim());
    if (missing.length) {
      alert("Faltan campos obligatorios: " + missing.join(", "));
      return false;
    }

    if (!String(finalCode || "").trim()) {
      alert("No hay código de letrero configurado para este servicio. Activa código manual o crea una regla en Códigos letrero.");
      return false;
    }

    if (!/^\d+$/.test(String(finalCode))) {
      alert("El código de letrero debe ser numérico.");
      return false;
    }

    return true;
  }

  async function buildServicePayload() {
    const finalSignCode = manualSignCode ? form.sign_code.trim() : findAutomaticSignCode(form, data);
    const nearest = form.base_override
      ? { base: BASES_RIOJACAR.find(b => b.name === form.base_override), distance: 0, place: { name: "Base manual" } }
      : nearestBaseFromOrigin(form.origin);

    const basePayload = {
      service_date: form.service_date,
      start_time: form.start_time,
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      nearest_base: nearest.base?.name || null,
      nearest_base_km: nearest.distance ? Number(nearest.distance.toFixed(1)) : null,
      has_return: showReturn ? form.has_return : "no",
      service_type: form.service_type,
      seats_required: showSeats ? Number(form.seats_required || 0) : null,
      vehicle_id: form.vehicle_id,
      driver_id: form.driver_id,
      monitor_id: showMonitor ? form.monitor_id : null,
      manual_sign_code: manualSignCode,
      sign_code: finalSignCode,
      line_number: showLineFields ? form.line_number.trim() : null,
      itinerary: showLineFields ? form.itinerary.trim() : null,
      notes: form.notes.trim(),
      status: "pendiente",
      sent_at: null,
      seen_at: null,
      started_at: null,
      ended_at: null,
      incident_notes: "",
      incident_photos: []
    };

    const md5 = await generateServiceMd5(basePayload);
    return { ...basePayload, md5 };
  }

  async function save(send=false) {
    try {
      if (!validate()) return;

      const payload = await buildServicePayload();
      const finalPayload = send ? { ...payload, sent_at: new Date().toISOString(), status: "enviado" } : payload;
      const saved = await insertRow("servicios", finalPayload);

      if (send) {
        try {
          await sendServiceEmailViaGmail(saved, data, profile);
          await updateRow("servicios", saved.id, { sent_at: new Date().toISOString(), status: "enviado" });
          alert("Servicio enviado por Gmail con PDF adjunto al conductor y, si tiene email, también al monitor.");
        } catch (err) {
          openServicePdf(saved, data);
          openEmailDraft(saved, data, profile);
          alert("No se pudo enviar automáticamente: " + err.message + "\nSe abre el PDF/parte y el borrador manual como respaldo.");
        }
      } else {
        alert("Servicio guardado correctamente.");
      }

      setForm(emptyForm);
      setSuggestion(null);
      await reload();
    } catch (err) {
      console.error(err);
      alert("Error al guardar/enviar el servicio: " + (err.message || err));
    }
  }

  async function updateService(service, patch) {
    await updateRow("servicios", service.id, patch);
    await reload();
  }

  async function startService(service) {
    await updateService(service, { started_at: new Date().toISOString(), status: "iniciado" });
  }

  async function finishService(service) {
    const draft = incidentDrafts[service.id] || {};
    await updateService(service, {
      ended_at: new Date().toISOString(),
      status: "realizado",
      incident_notes: draft.notes || service.incident_notes || "",
      incident_photos: draft.photos || service.incident_photos || []
    });
  }

  function setIncidentNotes(serviceId, notes) {
    setIncidentDrafts(prev => ({ ...prev, [serviceId]: { ...(prev[serviceId] || {}), notes } }));
  }

  async function addIncidentPhoto(serviceId, file) {
    if (!file) return;
    const dataUrl = await readImageAsDataUrl(file);
    setIncidentDrafts(prev => {
      const current = prev[serviceId] || {};
      return { ...prev, [serviceId]: { ...current, photos: [...(current.photos || []), dataUrl] } };
    });
  }




  async function sendGroupedDay() {
    try {
      if (!dailySendDate) {
        alert("Selecciona una fecha.");
        return;
      }

      await sendDailyGrouped(dailySendDate, data, profile);

      alert("Servicios agrupados enviados correctamente.");
    } catch(err) {
      console.error(err);
      alert("Error enviando agrupado: " + (err.message || err));
    }
  }

  async function resendExistingService(service) {
    try {
      await sendServiceEmailViaGmail(service, data, profile);
      await updateRow("servicios", service.id, {
        sent_at: new Date().toISOString(),
        status: "reenviado"
      });
      alert("Servicio reenviado correctamente.");
      await reload();
    } catch (err) {
      console.error(err);
      alert("Error reenviando servicio: " + (err.message || err));
    }
  }

  async function duplicateService(service) {
    const targetDate = copyDrafts[service.id];
    if (!targetDate) {
      alert("Indica la fecha a la que quieres copiar el servicio.");
      return;
    }

    const copyBase = {
      ...service,
      service_date: targetDate,
      status: "pendiente",
      sent_at: null,
      seen_at: null,
      started_at: null,
      ended_at: null,
      incident_notes: "",
      incident_photos: [],
      copied_from_md5: service.md5 || null
    };

    delete copyBase.id;
    delete copyBase.created_at;
    delete copyBase.updated_at;

    const md5 = await generateServiceMd5(copyBase);
    await insertRow("servicios", { ...copyBase, md5 });

    setCopyDrafts(prev => ({ ...prev, [service.id]: "" }));
    await reload();
  }

  function serviceTypeLabel(type) {
    return serviceTypeLabelGlobal(type);
  }

  return (
    <>
      {canEdit && <div className="card">
        <div className="form-title-row">
          <img src={logoUrl} className="section-logo" alt="Riojacar"/>
          <div>
            <h3>Añadir servicio</h3>
            <p className="meta">{requiredByType[selectedType]}</p>
          </div>
        </div>

        <div className="form-grid">
          <Field label="Fecha" type="date" value={form.service_date} set={v=>update("service_date",v)}/>
          <Field label="Hora" type="time" value={form.start_time} set={v=>update("start_time",v)}/>

          <div className="field">
            <label>Tipo de servicio</label>
            <select value={form.service_type} onChange={e=>update("service_type",e.target.value)}>
              <option value="instituto">Instituto</option>
              <option value="linea">Línea</option>
              <option value="fabrica">Fábrica</option>
              <option value="discrecional">Discrecional</option>
            </select>
          </div>

          <Field label="Origen" value={form.origin} set={v=>update("origin",v)}/>
          <Field label="Destino" value={form.destination} set={v=>update("destination",v)}/>

          <div className="field">
            <label>Base manual si no reconoce el origen</label>
            <select value={form.base_override || ""} onChange={e=>update("base_override",e.target.value)}>
              <option value="">Automática por origen</option>
              {BASES_RIOJACAR.map(b=><option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>

          {showReturn && (
            <div className="field">
              <label>Regreso</label>
              <select value={form.has_return} onChange={e=>update("has_return",e.target.value)}>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </div>
          )}

          {showSeats && <Field label="Número de plazas" type="number" value={form.seats_required} set={v=>update("seats_required",v)}/>}

          {showLineFields && <Field label="Número de línea" value={form.line_number} set={v=>update("line_number",v)}/>}
          {showLineFields && <Field label="Itinerario" value={form.itinerary} set={v=>update("itinerary",v)}/>}

          <Select label="Vehículo" value={form.vehicle_id} set={v=>update("vehicle_id",v)} options={(data.vehiculos || []).map(v=>[v.id, getVehicleLabel(v)])}/>
          <Select label="Conductor" value={form.driver_id} set={v=>update("driver_id",v)} options={(data.conductores || []).map(c=>[c.id, `${c.full_name}${c.base ? ` · ${c.base}` : ""}`])}/>

          {showMonitor && <Select label="Monitor" value={form.monitor_id} set={v=>update("monitor_id",v)} options={(data.monitores || []).map(m=>[m.id, `${m.full_name}${m.base ? ` · ${m.base}` : ""}`])}/>}

          {selectedType !== "discrecional" && (
            <div className="field">
              <label>Código letrero especial/manual</label>
              <select value={form.manual_sign_code} onChange={e=>update("manual_sign_code",e.target.value)}>
                <option value="no">No, usar automático</option>
                <option value="si">Sí, introducir manualmente</option>
              </select>
            </div>
          )}

          {manualSignCode && <Field label="Código manual numérico" value={form.sign_code} set={v=>update("sign_code",v.replace(/\D/g,""))}/>}
        </div>

        <SuggestionBox suggestion={suggestion} onApply={applySuggestion} onRefresh={()=>computeSuggestion()}/>

        <SignCodePreview form={form} data={data}/>

        <div className="field">
          <label>Notas de escritura libre</label>
          <textarea rows="4" value={form.notes || ""} onChange={e=>update("notes",e.target.value)} placeholder="Aclaraciones, punto exacto de salida, instrucciones para conductor/monitor, incidencias previstas..."/>
        </div>

        <div className="service-actions">
          <button type="button" className="btn" onClick={()=>save(false)}>Guardar servicio y generar MD5</button>
          <button type="button" className="btn secondary" onClick={()=>save(true)}>Enviar servicio</button>
        </div>
      </div>}

      
      {canEdit && (
        <div className="card" style={{marginBottom:"12px"}}>
          <h3>Envío agrupado diario</h3>
          <p className="meta">Cada conductor y monitor recibirá un único PDF diario con todos sus servicios.</p>
          <div className="copy-service-row">
            <input type="date" value={dailySendDate || ""} onChange={e=>setDailySendDate(e.target.value)} />
            <button type="button" className="btn secondary" onClick={sendGroupedDay}>Enviar PDF diario agrupado</button>
          </div>
        </div>
      )}

      <div className="list">
        {visibles.map(s => {
          const c = (data.conductores || []).find(x=>x.id===s.driver_id);
          const v = (data.vehiculos || []).find(x=>x.id===s.vehicle_id);
          const m = (data.monitores || []).find(x=>x.id===s.monitor_id);
          const draft = incidentDrafts[s.id] || {};

          return (
            <div className="item" key={s.id}>
              <div>
                <h3>{s.service_date} · {s.start_time} · {s.origin} → {s.destination}</h3>
                <div className="meta">
                  Tipo: {serviceTypeLabel(s.service_type)} · Base sugerida: {s.nearest_base || "-"} · Regreso: {s.has_return === "si" ? "Sí" : "No"} · Plazas: {s.seats_required || "-"}
                </div>
                {s.service_type === "linea" && (
                  <div className="meta">Línea: {s.line_number || "-"} · Itinerario: {s.itinerary || "-"}</div>
                )}
                <div className="meta">
                  Vehículo: {v ? getVehicleLabel(v) : "-"} · Conductor: {c?.full_name || "-"} · Monitor: {m?.full_name || "-"}
                </div>
                <div className="meta">Código letrero: {s.sign_code || "-"} {s.manual_sign_code ? "(manual)" : "(auto)"} · MD5: {s.md5 || "-"}</div>
                <div className="meta">Enviado: {s.sent_at || "-"} · Visto: {s.seen_at || "-"} · Inicio: {s.started_at || "-"} · Final: {s.ended_at || "-"}</div>
                {s.notes && <div className="meta">Notas: {s.notes}</div>}

                {canEdit && (
                  <div className="copy-service-box">
                    <label>Copiar este servicio a otra fecha</label>
                    <div className="copy-service-row">
                      <input
                        type="date"
                        value={copyDrafts[s.id] || ""}
                        onChange={e=>setCopyDrafts(prev=>({...prev,[s.id]:e.target.value}))}
                      />
                      <button className="btn small ghost" onClick={()=>duplicateService(s)}>Copiar servicio</button>
                      <button className="btn small secondary" onClick={()=>resendExistingService(s)}>Reenviar email</button>
                    </div>
                  </div>
                )}

                {(isDriver || isMonitor) && (
                  <div className="driver-workflow">
                    {!s.seen_at && <button className="btn small" onClick={()=>confirmSeen(s)}>Confirmar visto</button>}
                    {!s.started_at && <button className="btn small" onClick={()=>startService(s)}>Iniciar servicio</button>}
                    {s.started_at && !s.ended_at && <button className="btn small secondary" onClick={()=>finishService(s)}>Finalizar servicio</button>}
                    <button className="btn small ghost" onClick={()=>openServicePdf(s, data)}>Ver PDF/parte</button>

                    <div className="field">
                      <label>Notas o incidencias durante el servicio</label>
                      <textarea rows="3" value={draft.notes ?? s.incident_notes ?? ""} onChange={e=>setIncidentNotes(s.id,e.target.value)} placeholder="Incidencias, retrasos, observaciones del servicio..."/>
                    </div>

                    <div className="field">
                      <label>Fotos de incidencia</label>
                      <input type="file" accept="image/*" onChange={e=>addIncidentPhoto(s.id,e.target.files?.[0])}/>
                      <div className="incident-photos">
                        {((draft.photos || s.incident_photos || [])).map((p,i)=><img key={i} src={p} alt="incidencia"/>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className={"badge " + (s.status==="realizado" ? "green" : "red")}>{s.status}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function CodigosLetrero({ data, reload }) {
  const empty = { service_type: "linea", name: "", code: "", origin: "", destination: "", line_number: "", itinerary: "" };
  const [form, setForm] = useState(empty);
  const allCodes = getAllSignCodes(data);

  function update(name, value) {
    if (name === "code") value = value.replace(/\D/g,"");
    setForm({ ...form, [name]: value });
  }

  async function save() {
    if (!form.name.trim() || !form.code.trim()) {
      alert("Nombre y código son obligatorios.");
      return;
    }
    if (!/^\d+$/.test(form.code)) {
      alert("El código debe ser numérico.");
      return;
    }
    await insertRow("sign_codes", {
      service_type: form.service_type,
      name: form.name.trim(),
      code: form.code.trim(),
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      line_number: form.line_number.trim(),
      itinerary: form.itinerary.trim(),
      is_default: false
    });
    setForm(empty);
    await reload();
  }

  return (
    <>
      <div className="card">
        <div className="form-title-row">
          <img src={logoUrl} className="section-logo" alt="Riojacar"/>
          <div>
            <h3>Configurar códigos de letrero</h3>
            <p className="meta">Los servicios regulares usan código automático. Discrecional usa siempre 2 salvo cambio futuro de regla. Los códigos son numéricos.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Tipo</label>
            <select value={form.service_type} onChange={e=>update("service_type",e.target.value)}>
              <option value="instituto">Instituto</option>
              <option value="linea">Línea</option>
              <option value="fabrica">Fábrica</option>
              <option value="discrecional">Discrecional</option>
            </select>
          </div>
          <Field label="Nombre de regla" value={form.name} set={v=>update("name",v)}/>
          <Field label="Código numérico" value={form.code} set={v=>update("code",v)}/>
          <Field label="Origen opcional" value={form.origin} set={v=>update("origin",v)}/>
          <Field label="Destino opcional" value={form.destination} set={v=>update("destination",v)}/>
          <Field label="Número de línea opcional" value={form.line_number} set={v=>update("line_number",v)}/>
          <Field label="Itinerario opcional" value={form.itinerary} set={v=>update("itinerary",v)}/>
        </div>

        <button className="btn full" onClick={save}>Guardar regla de código</button>
      </div>

      <div className="list">
        {allCodes.map(c => (
          <div className="item" key={c.id || `${c.service_type}-${c.code}-${c.name}`}>
            <div>
              <h3>{c.name} · Código {c.code}</h3>
              <div className="meta">Tipo: {c.service_type} · Línea: {c.line_number || "-"} · Itinerario: {c.itinerary || "-"}</div>
              <div className="meta">Origen: {c.origin || "-"} · Destino: {c.destination || "-"} {c.is_default ? "· Regla inicial" : ""}</div>
            </div>
            <span className="badge">{c.code}</span>
          </div>
        ))}
      </div>
    </>
  );
}



function BasesPanel() {
  return (
    <div className="grid">
      {BASES_RIOJACAR.map(b=>(
        <div className="card" key={b.id}>
          <h3>{b.name}</h3>
          <p className="meta">Coordenadas: {b.lat}, {b.lon}</p>
        </div>
      ))}
    </div>
  );
}

function SuggestionBox({ suggestion, onApply, onRefresh }) {
  if (!suggestion) {
    return <div className="notice">Indica el origen para sugerir automáticamente base, conductor y vehículo. Si no reconoce el pueblo, puedes elegir la base manualmente.</div>;
  }
  if (suggestion.error) {
    return <div className="error">{suggestion.error}</div>;
  }
  return (
    <div className="notice">
      <b>Sugerencia automática:</b> base {suggestion.base} ({suggestion.distance?.toFixed(1)} km desde {suggestion.place}).
      <br/>
      Conductor: <b>{suggestion.driver?.full_name || "sin conductor disponible"}</b> · Vehículo: <b>{suggestion.vehicle ? getVehicleLabel(suggestion.vehicle) : "sin vehículo disponible"}</b>{suggestion.monitor ? <> · Monitor: <b>{suggestion.monitor.full_name}</b></> : null}
      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
        <button className="btn small" onClick={onApply}>Aplicar sugerencia</button>
        <button className="btn small ghost" onClick={onRefresh}>Recalcular</button>
      </div>
    </div>
  );
}


function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo debe ser una imagen."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function PhotoUploader({ label="Foto", value, set }) {
  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      set(dataUrl);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="field" style={{gridColumn:"1/-1"}}>
      <label>{label}</label>
      <div className="upload-row">
        <input type="file" accept="image/*" onChange={handleFile}/>
        {value && <button type="button" className="btn small ghost" onClick={()=>set("")}>Quitar foto</button>}
      </div>
      {value && <img src={value} className="photo-preview" alt="vista previa"/>}
      <div className="meta">Se guarda como imagen integrada en el registro. Para producción con Supabase, después la moveremos a Storage.</div>
    </div>
  );
}


function BaseSelect({ value, set }) {
  return (
    <div className="field">
      <label>Base</label>
      <select value={value || ""} onChange={e=>set(e.target.value)}>
        <option value="">Seleccionar base</option>
        {BASES_RIOJACAR.map(b=><option key={b.id} value={b.name}>{b.name}</option>)}
      </select>
    </div>
  );
}



function VehicleGroupSelect({ value, set }) {
  return (
    <div className="field">
      <label>Grupo de vehículo</label>
      <select value={value || ""} onChange={e=>set(e.target.value)}>
        <option value="">Seleccionar grupo</option>
        <option value="autobus">Autobuses</option>
        <option value="microbus">Microbuses</option>
        <option value="autobus_3_ejes">Autobús 3 ejes</option>
        <option value="turismo">Turismos</option>
      </select>
    </div>
  );
}

function DefaultVehicleSelect({ value, set, vehiculos }) {
  return (
    <div className="field">
      <label>Bus asignado por defecto</label>
      <select value={value || ""} onChange={e=>set(e.target.value)}>
        <option value="">Sin bus por defecto</option>
        {(vehiculos || []).map(v => (
          <option key={v.id} value={v.id}>{getVehicleLabel(v)}</option>
        ))}
      </select>
    </div>
  );
}

function MultiVehicleSelect({ value, set, vehiculos }) {
  const selected = value || [];

  function toggle(id) {
    set(selected.includes(id) ? selected.filter(x=>x!==id) : [...selected,id]);
  }

  function selectGroup(groupId) {
    const ids = (vehiculos || []).filter(v => getVehicleGroup(v) === groupId).map(v => v.id);
    set(Array.from(new Set([...selected, ...ids])));
  }

  function clearGroup(groupId) {
    const ids = new Set((vehiculos || []).filter(v => getVehicleGroup(v) === groupId).map(v => v.id));
    set(selected.filter(id => !ids.has(id)));
  }

  function isGroupFullySelected(groupId) {
    const ids = (vehiculos || []).filter(v => getVehicleGroup(v) === groupId).map(v => v.id);
    return ids.length > 0 && ids.every(id => selected.includes(id));
  }

  return (
    <div className="field" style={{gridColumn:"1/-1"}}>
      <label>Vehículos autorizados</label>

      <div className="group-actions">
        {VEHICLE_GROUPS.map(g => (
          <div className="group-chip" key={g.id}>
            <span>{g.label}</span>
            <button type="button" className="btn small" onClick={()=>selectGroup(g.id)}>
              Seleccionar grupo
            </button>
            <button type="button" className="btn small ghost" onClick={()=>clearGroup(g.id)}>
              Quitar grupo
            </button>
            {isGroupFullySelected(g.id) && <b className="group-ok">Seleccionado</b>}
          </div>
        ))}
      </div>

      <div className="check-grid">
        {VEHICLE_GROUPS.map(g => {
          const groupVehicles = (vehiculos || []).filter(v => getVehicleGroup(v) === g.id);
          if (!groupVehicles.length) return null;

          return (
            <div className="vehicle-group-block" key={g.id}>
              <div className="vehicle-group-title">{g.label}</div>
              {groupVehicles.map(v=>(
                <label key={v.id} className="check-item">
                  <input type="checkbox" checked={selected.includes(v.id)} onChange={()=>toggle(v.id)}/>
                  {getVehicleLabel(v)}
                </label>
              ))}
            </div>
          );
        })}
      </div>

      <div className="meta">
        Puedes seleccionar un grupo completo y después desmarcar manualmente el vehículo que no interese.
      </div>
    </div>
  );
}

function EditableFormCard({ title, fields, table, extraFields, normalize, reload }) {
  const [form, setForm] = useState({});
  async function save() {
    const payload = normalize ? normalize(form) : form;
    await insertRow(table, payload);
    setForm({});
    await reload();
  }
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="form-grid">
        {fields.map(f=>(
          <Field key={f.name} label={f.label} type={f.type || "text"} value={form[f.name] || ""} set={v=>setForm({...form,[f.name]:v})}/>
        ))}
        {extraFields?.(form,setForm)}
      </div>
      <button className="btn full" onClick={save}>Guardar</button>
    </div>
  );
}

function EditableList({ title, items, table, reload, fields, renderExtraEdit, primary, meta }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  const editingItem = (items || []).find(x => x.id === editingId);

  function startEdit(item) {
    setEditingId(item.id);
    setDraft({
      ...item,
      authorized_vehicle_ids: Array.isArray(item.authorized_vehicle_ids) ? item.authorized_vehicle_ids : []
    });

    setTimeout(() => {
      document.getElementById("edit-panel-clean")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({});
  }

  function setDraftField(name, value) {
    setDraft(prev => ({ ...prev, [name]: value }));
  }

  async function saveEdit() {
    if (!editingId) return;
    await updateRow(table, editingId, draft);
    cancelEdit();
    await reload();
  }

  return (
    <>
      <h3 style={{marginTop:16}}>{title}</h3>

      {editingId && (
        <div id="edit-panel-clean" className="card edit-card-clean">
          <h3>Editar: {editingItem ? primary(editingItem) : "registro"}</h3>
          <p className="meta">Modifica los campos y pulsa guardar. Este panel está separado de la lista para evitar bloqueos de edición.</p>

          <div className="form-grid edit-form-clean">
            {fields.map(f=>(
              <div className="field" key={f.name}>
                <label>{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={draft[f.name] ?? ""}
                  onChange={e=>setDraftField(f.name, e.target.value)}
                  autoComplete="off"
                />
              </div>
            ))}

            {renderExtraEdit?.(draft, setDraft)}
          </div>

          <div className="table-actions" style={{marginTop:12}}>
            <button className="btn small" type="button" onClick={saveEdit}>Guardar cambios</button>
            <button className="btn small ghost" type="button" onClick={cancelEdit}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="list">
        {(items || []).map(item=>(
          <div className={"item " + (editingId === item.id ? "selected-edit-row" : "")} key={item.id}>
            <div>
              <h3>{primary(item)}</h3>
              <div className="meta">{meta(item)}</div>
              {item.photo_url && <img src={item.photo_url} className="thumb" alt="foto"/>}
            </div>
            <div className="table-actions">
              <button className="btn small ghost" type="button" onClick={()=>startEdit(item)}>
                {editingId === item.id ? "Editando" : "Editar"}
              </button>
              <button className="btn small ghost" type="button" onClick={async()=>{await deleteRow(table,item.id); await reload();}}>Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}



function PortalInicio({ profile, data }) {
  const person = getCurrentPerson(profile, data);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));

  const myServices = (data.servicios || []).filter(s => {
    if (profile.role === "conductor") return s.driver_id === person?.id;
    if (profile.role === "monitor") return s.monitor_id === person?.id;
    return false;
  });

  const myNotices = (data.communications || []).filter(c =>
    c.to_role === "todos" || c.to_role === profile.role || c.profile_id === profile.id
  );

  function servicesForDay(day) {
    if (!day) return [];
    const iso = day.toISOString().slice(0,10);
    return myServices.filter(s => s.service_date === iso);
  }

  return (
    <>
      <div className="card">
        <h3>Inicio · {profile.full_name}</h3>
        <p className="meta">Calendario de servicios y avisos de oficina.</p>
      </div>

      <div className="card">
        <h3 style={{textTransform:"capitalize"}}>{monthName}</h3>
        <div className="calendar-grid">
          {["L","M","X","J","V","S","D"].map(x=><div className="calendar-head" key={x}>{x}</div>)}
          {days.map((day, i) => {
            const list = servicesForDay(day);
            return (
              <div className={"calendar-day " + (list.length ? "has-service" : "")} key={i}>
                <b>{day ? day.getDate() : ""}</b>
                {list.slice(0,3).map(s=><span key={s.id}>{s.start_time} {s.origin}</span>)}
                {list.length > 3 && <em>+{list.length-3} más</em>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3>Avisos de oficina</h3>
        <div className="list">
          {!myNotices.length && <div className="item"><div className="meta">No hay avisos.</div></div>}
          {myNotices.map(n=>(
            <div className="item" key={n.id}>
              <div>
                <h3>{n.from_name || "Oficina"}</h3>
                <div className="meta">{n.created_at || ""}</div>
                <div>{n.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}



function Usuarios({ profile, data, reload }) {
  const empty = {
    full_name: "",
    email: "",
    phone: "",
    password: "1234",
    role: "conductor",
    base: "Haro",
    create_person_record: true
  };

  const [form, setForm] = useState(empty);
  const isStaff = ["admin","jefe"].includes(profile.role);

  if (!isStaff) {
    return <div className="card"><h3>Sin permiso</h3><p className="meta">Solo jefe/admin puede gestionar usuarios.</p></div>;
  }

  function set(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function createUser() {
    try {
      if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
        alert("Nombre, email y contraseña son obligatorios.");
        return;
      }

      const result = await createAuthUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        base: form.base,
        create_person_record: form.create_person_record
      });

      alert(result.demo
        ? "Usuario creado en modo demo/local."
        : "Usuario creado correctamente en Supabase Auth.");

      setForm(empty);
      await reload();
    } catch (err) {
      console.error(err);
      alert("Error creando usuario: " + (err.message || err));
    }
  }

  async function toggleProfile(p) {
    await updateRow("profiles", p.id, { disabled: !p.disabled });
    await reload();
  }

  const people = data.profiles || [];

  return (
    <>
      <div className="card">
        <div className="form-title-row">
          <UserPlus size={34}/>
          <div>
            <h3>Crear usuario</h3>
            <p className="meta">Crea acceso para jefe, conductor o monitor. En Supabase real se usa una Edge Function segura.</p>
          </div>
        </div>

        <div className="form-grid">
          <Field label="Nombre completo" value={form.full_name} set={v=>set("full_name",v)}/>
          <Field label="Email" type="email" value={form.email} set={v=>set("email",v)}/>
          <Field label="Teléfono" value={form.phone} set={v=>set("phone",v)}/>
          <Field label="Contraseña inicial" type="text" value={form.password} set={v=>set("password",v)}/>

          <div className="field">
            <label>Rol</label>
            <select value={form.role} onChange={e=>set("role",e.target.value)}>
              <option value="jefe">Jefe de tráfico</option>
              <option value="conductor">Conductor</option>
              <option value="monitor">Monitor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <BaseSelect value={form.base} set={v=>set("base",v)}/>

          <div className="field">
            <label>Crear ficha asociada</label>
            <select value={form.create_person_record ? "si" : "no"} onChange={e=>set("create_person_record", e.target.value === "si")}>
              <option value="si">Sí, crear conductor/monitor si corresponde</option>
              <option value="no">No, solo usuario</option>
            </select>
          </div>
        </div>

        <button className="btn full" type="button" onClick={createUser}>Crear usuario</button>

        <div className="notice">
          <b>Importante:</b> en producción esta acción necesita la Edge Function <code>create-user</code>. En modo demo se simula localmente.
        </div>
      </div>

      <div className="card">
        <div className="form-title-row">
          <ShieldCheck size={32}/>
          <div>
            <h3>Usuarios existentes</h3>
            <p className="meta">Listado de perfiles creados. Puedes activar/desactivar el acceso lógico desde aquí.</p>
          </div>
        </div>

        <div className="list">
          {!people.length && <div className="item"><div className="meta">Todavía no hay perfiles reales cargados.</div></div>}
          {people.map(p => (
            <div className="item" key={p.id}>
              <div>
                <h3>{p.full_name}</h3>
                <div className="meta">{p.email || "-"} · Rol: {p.role} · Base: {p.base || "-"} · Estado: {p.disabled ? "desactivado" : "activo"}</div>
              </div>
              <button className="btn small ghost" type="button" onClick={()=>toggleProfile(p)}>
                {p.disabled ? "Activar" : "Desactivar"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}


function Field({label,type="text",value="",set}) {
  return <div className="field"><label>{label}</label><input type={type} value={value||""} onChange={e=>set(e.target.value)}/></div>
}
function Select({label,value="",set,options}) {
  return <div className="field"><label>{label}</label><select value={value||""} onChange={e=>set(e.target.value)}><option value="">Seleccionar</option>{options.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></div>
}

function Caducidades({ data }) {
  const rows = data.conductores.flatMap(c => [
    {name:c.full_name, type:"Carnet", date:c.license_expiry},
    {name:c.full_name, type:"CAP", date:c.cap_expiry},
    {name:c.full_name, type:"Tarjeta tacógrafo", date:c.tachograph_card_expiry}
  ]).filter(x => x.date).sort((a,b)=>new Date(a.date)-new Date(b.date));

  return <div className="list">
    {rows.map((r,i)=><div key={i} className={"item " + (isExpiring(r.date) ? "expiry-warning" : "")}>
      <div><h3>{r.name}</h3><div className="meta">{r.type} caduca el {r.date}</div></div>
      {isExpiring(r.date) && <span className="badge red">Revisar</span>}
    </div>)}
  </div>
}

function Perfil({ profile, data, onProfileUpdate }) {
  const isStaff = ["admin","jefe"].includes(profile.role);
  const driver = (data.conductores || []).find(c => c.user_id === profile.id) || (!isStaff ? (data.conductores || [])[0] : null);
  const monitor = (data.monitores || []).find(m => m.user_id === profile.id) || null;

  const initial = {
    id: profile.id || "demo-jefe",
    full_name: profile.full_name || "",
    email: profile.email || (isStaff ? "elpaseosanvicente@gmail.com" : ""),
    phone: profile.phone || "",
    role: profile.role || "jefe",
    base: profile.base || driver?.base || monitor?.base || "",
    photo_url: profile.photo_url || "",
    license_expiry: driver?.license_expiry || "",
    cap_expiry: driver?.cap_expiry || "",
    tachograph_card_expiry: driver?.tachograph_card_expiry || "",
  };

  const [form, setForm] = useState(initial);

  function set(name, value) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function saveProfile() {
    const payload = {
      id: form.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      base: form.base,
      photo_url: form.photo_url
    };

    if (profile.id) {
      await updateRow("profiles", profile.id, payload);
    } else {
      await insertRow("profiles", payload);
    }

    onProfileUpdate?.({ ...profile, ...payload });
    alert("Perfil guardado.");
  }

  return (
    <div className="card">
      <div className="form-title-row">
        <img src={logoUrl} className="section-logo" alt="Riojacar"/>
        <div>
          <h3>Mi perfil</h3>
          <p className="meta">Datos personales y de contacto. En el jefe de tráfico, este email será el usado como remitente configurado para los envíos.</p>
        </div>
      </div>

      <div className="form-grid">
        <Field label="Nombre completo" value={form.full_name} set={v=>set("full_name",v)}/>
        <Field label="Email" type="email" value={form.email} set={v=>set("email",v)}/>
        <Field label="Teléfono" value={form.phone} set={v=>set("phone",v)}/>

        <div className="field">
          <label>Rol</label>
          <select value={form.role} onChange={e=>set("role",e.target.value)}>
            <option value="admin">Admin</option>
            <option value="jefe">Jefe de tráfico</option>
            <option value="conductor">Conductor</option>
            <option value="monitor">Monitor</option>
          </select>
        </div>

        <BaseSelect value={form.base} set={v=>set("base",v)}/>
        <PhotoUploader label="Foto" value={form.photo_url} set={v=>set("photo_url",v)}/>

        {profile.role === "conductor" && (
          <>
            <Field label="Caducidad carnet conducir" type="date" value={form.license_expiry} set={v=>set("license_expiry",v)}/>
            <Field label="Caducidad CAP" type="date" value={form.cap_expiry} set={v=>set("cap_expiry",v)}/>
            <Field label="Caducidad tarjeta tacógrafo" type="date" value={form.tachograph_card_expiry} set={v=>set("tachograph_card_expiry",v)}/>
          </>
        )}
      </div>

      <button className="btn full" onClick={saveProfile}>Guardar mi perfil</button>

      {isStaff && (
        <div className="notice">
          Email actual del jefe/remitente: <b>{form.email || "sin configurar"}</b>
        </div>
      )}
    </div>
  );
}

function List({ items, title, meta, table, reload }) {
  return <div className="list">
    {items.map(item => <div className="item" key={item.id}>
      <div><h3>{title(item)}</h3><div className="meta">{meta(item)}</div></div>
      <div className="table-actions"><button className="btn small ghost" onClick={async()=>{await deleteRow(table,item.id); await reload();}}>Borrar</button></div>
    </div>)}
  </div>
}

function AjustesLogin() {
  const [items, setItems] = useState(() => {
    return JSON.parse(localStorage.getItem("fleetops_login_backgrounds") || "null") || defaultBackgrounds;
  });
  const [url, setUrl] = useState("");

  function save(next) {
    setItems(next);
    localStorage.setItem("fleetops_login_backgrounds", JSON.stringify(next));
  }

  return (
    <div className="card">
      <h3>Fondo de pantalla inicial</h3>
      <p className="meta">El administrador puede configurar aquí las imágenes de la transición del login. De momento se guardan en este navegador; después lo conectaremos a Supabase.</p>
      <div className="field">
        <label>URL de imagen</label>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..."/>
      </div>
      <button className="btn full" onClick={() => {
        if (!url.trim()) return;
        save([...items, url.trim()]);
        setUrl("");
      }}>Añadir imagen al fondo</button>

      <div className="list">
        {items.map((bg, i) => (
          <div className="item" key={bg + i}>
            <div>
              <h3>Imagen {i + 1}</h3>
              <div className="meta">{bg}</div>
            </div>
            <button className="btn small ghost" onClick={() => save(items.filter((_,idx)=>idx!==i))}>Quitar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSession().then(r => setProfile(r.profile)).finally(()=>setChecking(false));
  }, []);

  if (checking) return <div className="login-screen"><div className="login-card">Cargando...</div></div>;
  if (!profile) return <Login onLogin={setProfile}/>;
  return <Shell profile={profile} onProfileUpdate={setProfile} onLogout={()=>setProfile(null)}/>;
}

createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);
