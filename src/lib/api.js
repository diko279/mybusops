import { supabase, supabaseConfigured } from "./supabase";
import { INITIAL_DRIVERS, INITIAL_VEHICLES, INITIAL_MONITORS, INITIAL_SIGN_CODES } from "./seedData";

const demoUsers = [
  { id: "demo-admin", email: "admin@mybusops.local", password: "1234", full_name: "Administrador", role: "admin", phone: "", base: "Haro" },
  { id: "demo-jefe", email: "jefe@mybusops.local", password: "1234", full_name: "Jefe de tráfico", role: "jefe", phone: "", base: "Haro" },
  { id: "drv-diko", email: "diko@mybusops.local", password: "1234", full_name: "Diko Borislavov Dikov", role: "conductor", phone: "664251081", base: "Haro" },
  { id: "mon-cristina-ortega", email: "cristina@mybusops.local", password: "1234", full_name: "Cristina Ortega", role: "monitor", phone: "", base: "Haro" }
];

let demoSessionProfile = (() => {
  try {
    const saved = localStorage.getItem("mybusops_profile");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

const demo = {
  profile: null,
  profiles: demoUsers.map(({ password, ...u }) => u),
  conductores: INITIAL_DRIVERS.map(x => ({
    phone: "", email: "", license_expiry: "", cap_expiry: "", tachograph_card_expiry: "", photo_url: "", authorized_vehicle_ids: [], status: "activo", ...x
  })),
  vehiculos: INITIAL_VEHICLES.map(x => ({
    plate: "", brand: "", model: "", bodywork: "", insurance_expiry: "", itv_expiry: "", photo_url: "", status: "activo", ...x
  })),
  monitores: INITIAL_MONITORS.map(x => ({
    phone: "", email: "", status: "activo", ...x
  })),
  sign_codes: INITIAL_SIGN_CODES,
  vacation_requests: [],
  communications: [],
  payslips: [],
  servicios: [
    {
      id: "pdf-s1",
      service_date: "2026-05-18",
      start_time: "07:35",
      origin: "Haro",
      destination: "Foncea-Tirgo",
      nearest_base: "Haro",
      service_type: "instituto",
      has_return: "no",
      seats_required: null,
      sign_code: "9000",
      line_number: null,
      itinerary: null,
      md5: "95cd425933cbab49fc347f3746d0bddb-1",
      status: "pendiente",
      driver_id: "drv-diko",
      vehicle_id: "veh-116",
      monitor_id: "mon-cristina-ortega",
      notes: "7.35H. RECOGER A CRISTINA - 7.55 FONCEA Diego 663385675 // 8:08 TIRGO PASAMOS A BUS"
    },
    {
      id: "pdf-s2",
      service_date: "2026-05-18",
      start_time: "08:17",
      origin: "Cellorigo",
      destination: "Foncea-Fonzaleche-Haro",
      nearest_base: "Haro",
      service_type: "instituto",
      has_return: "no",
      seats_required: null,
      sign_code: "6106",
      line_number: null,
      itinerary: null,
      md5: "95cd425933cbab49fc347f3746d0bddb-2",
      status: "pendiente",
      driver_id: "drv-diko",
      vehicle_id: "veh-116",
      monitor_id: "mon-cristina-ortega",
      notes: "OJO SILLAS BEBE. 08:17 CELLORIGO (JULIA 747485181)-8:27 FONCEA 3 pax (ALMUDENA 618488940)-8:32 FONZALECHE (DYLAN 699/266703 - VIVIANE - JOAQUIN Y SOFIA)"
    },
    {
      id: "pdf-s3",
      service_date: "2026-05-18",
      start_time: "14:00",
      origin: "Haro",
      destination: "Casalarreina-Tirgo-Cuzcurrita-Treviana",
      nearest_base: "Haro",
      service_type: "instituto",
      has_return: "no",
      seats_required: null,
      sign_code: "6103",
      line_number: null,
      itinerary: null,
      md5: "95cd425933cbab49fc347f3746d0bddb-3",
      status: "pendiente",
      driver_id: "drv-diko",
      vehicle_id: "veh-141",
      monitor_id: "mon-cristina-ortega",
      notes: "IES HARO - 14:10 CASALARREINA (38 pax) // 14:20 TIRGO (7 pax) // 14:30 CUZCURRITA (8 pax) 14:40H. TREVIANA"
    },
    {
      id: "pdf-s4",
      service_date: "2026-05-18",
      start_time: "16:00",
      origin: "Haro",
      destination: "Fonzaleche-Cellorigo-Foncea",
      nearest_base: "Haro",
      service_type: "instituto",
      has_return: "no",
      seats_required: null,
      sign_code: "4",
      line_number: null,
      itinerary: null,
      md5: "95cd425933cbab49fc347f3746d0bddb-4",
      status: "pendiente",
      driver_id: "drv-diko",
      vehicle_id: "veh-116",
      monitor_id: "mon-pilar-cantabrana",
      notes: "FONZALECHE 4 - FONCEA 3 pax Y 1 CELLORIGO"
    },
    {
      id: "pdf-s5",
      service_date: "2026-05-18",
      start_time: "17:00",
      origin: "Labastida",
      destination: "San Vicente-Abalos-Villabuena-Samaniego",
      nearest_base: "Haro",
      service_type: "instituto",
      has_return: "si",
      seats_required: null,
      sign_code: "",
      line_number: null,
      itinerary: null,
      md5: "95cd425933cbab49fc347f3746d0bddb-5",
      status: "pendiente",
      driver_id: "drv-diko",
      vehicle_id: "veh-141",
      monitor_id: null,
      notes: "BUS 2. 17:00 LABASTIDA (P. Bus) - 17:10 SAN VICENTE (P.bus) - 17:15 ABALOS (P.Bus) - 17:20 VILLABUENA (P.Bus) -17:25 SAMANIEGO CAMPO DE FUTBOL // REGRESO 19:00H."
    }
  ]
};

export async function getSession() {
  if (!supabaseConfigured) return { session: null, profile: demoSessionProfile, demo: true };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { session: null, profile: null, demo: false };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) throw error;
  return { session, profile, demo: false };
}

export async function signIn(email, password) {
  if (!supabaseConfigured) {
    const user = demoUsers.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
    if (!user) throw new Error("Usuario o contraseña incorrectos.");
    const { password: _password, ...profile } = user;
    demoSessionProfile = profile;
    localStorage.setItem("mybusops_profile", JSON.stringify(profile));
    return { profile, demo: true };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return getSession();
}

export async function signOut() {
  if (!supabaseConfigured) {
    demoSessionProfile = null;
    localStorage.removeItem("mybusops_profile");
    localStorage.removeItem("mybusops_tab");
    return;
  }
  await supabase.auth.signOut();
}

export async function listTable(table) {
  if (!supabaseConfigured) return demo[table] || [];
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertRow(table, payload) {
  if (!supabaseConfigured) {
    const item = { ...payload, id: crypto.randomUUID?.() || String(Date.now()) };
    demo[table] = [item, ...(demo[table] || [])];
    return item;
  }
  const { data, error } = await supabase.from(table).insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateRow(table, id, payload) {
  if (!supabaseConfigured) {
    demo[table] = (demo[table] || []).map(x => x.id === id ? { ...x, ...payload } : x);
    return demo[table].find(x => x.id === id);
  }
  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table, id) {
  if (!supabaseConfigured) {
    demo[table] = (demo[table] || []).filter(x => x.id !== id);
    return;
  }
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}


export async function createAuthUser(payload) {
  if (!supabaseConfigured) {
    const id = (crypto.randomUUID?.() || String(Date.now()));
    const profile = {
      id,
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone || "",
      role: payload.role,
      base: payload.base || "",
      disabled: false
    };

    demo.profiles = [profile, ...(demo.profiles || [])];

    if (payload.create_person_record && payload.role === "conductor") {
      demo.conductores = [{
        id: "drv-" + id,
        user_id: id,
        full_name: payload.full_name,
        phone: payload.phone || "",
        email: payload.email,
        base: payload.base || "",
        status: "activo",
        authorized_vehicle_ids: []
      }, ...(demo.conductores || [])];
    }

    if (payload.create_person_record && payload.role === "monitor") {
      demo.monitores = [{
        id: "mon-" + id,
        user_id: id,
        full_name: payload.full_name,
        phone: payload.phone || "",
        email: payload.email,
        base: payload.base || "",
        status: "activo"
      }, ...(demo.monitores || [])];
    }

    return { demo: true, profile };
  }

  const { data, error } = await supabase.functions.invoke("create-user", {
    body: payload
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
