export const BASES_RIOJACAR = [
  { id: "logrono", name: "Logroño", lat: 42.4627, lon: -2.4449 },
  { id: "haro", name: "Haro", lat: 42.5763, lon: -2.8476 },
  { id: "najera", name: "Nájera", lat: 42.4182, lon: -2.7338 }
];

export const KNOWN_PLACES = [
  ...BASES_RIOJACAR.map(b => ({ name: b.name, lat: b.lat, lon: b.lon })),
  { name: "San Vicente de la Sonsierra", lat: 42.5639, lon: -2.7600 },
  { name: "Briones", lat: 42.5432, lon: -2.7856 },
  { name: "Cenicero", lat: 42.4813, lon: -2.6440 },
  { name: "Fuenmayor", lat: 42.4684, lon: -2.5616 },
  { name: "Santo Domingo de la Calzada", lat: 42.4407, lon: -2.9537 },
  { name: "Valgañón", lat: 42.3176, lon: -3.0670 },
  { name: "Ezcaray", lat: 42.3253, lon: -3.0139 },
  { name: "Cuzcurrita de Río Tirón", lat: 42.5414, lon: -2.9646 },
  { name: "Casalarreina", lat: 42.5492, lon: -2.9098 },
  { name: "Ollauri", lat: 42.5421, lon: -2.8349 },
  { name: "Anguciana", lat: 42.5749, lon: -2.9010 },
  { name: "Cihuri", lat: 42.5658, lon: -2.9230 },
  { name: "Cillaperlata", lat: 42.7807, lon: -3.3584 },
  { name: "Quintana Martín Galíndez", lat: 42.7779, lon: -3.3940 },
  { name: "Villalba de Rioja", lat: 42.6090, lon: -2.8860 },
  { name: "Briñas", lat: 42.6022, lon: -2.8310 },
  { name: "Labastida", lat: 42.5906, lon: -2.7957 },
  { name: "Ábalos", lat: 42.5704, lon: -2.7096 },
  { name: "San Asensio", lat: 42.4968, lon: -2.7506 },
  { name: "Hormilla", lat: 42.4386, lon: -2.7758 },
  { name: "Hormilleja", lat: 42.4547, lon: -2.7307 },
  { name: "Tricio", lat: 42.4017, lon: -2.7194 },
  { name: "Baños de Río Tobía", lat: 42.3358, lon: -2.7608 },
  { name: "Uruñuela", lat: 42.4432, lon: -2.7079 },
  { name: "Alesanco", lat: 42.4148, lon: -2.8168 },
  { name: "Azofra", lat: 42.4243, lon: -2.8002 },
  { name: "Hervías", lat: 42.4470, lon: -2.8870 },
  { name: "Grañón", lat: 42.4492, lon: -3.0270 },
  { name: "Zarratón", lat: 42.5169, lon: -2.8813 },
  { name: "Tirgo", lat: 42.5455, lon: -2.9490 },
  { name: "Leiva", lat: 42.5035, lon: -3.0476 },
  { name: "Tormantos", lat: 42.4949, lon: -3.0749 },
  { name: "Belorado", lat: 42.4203, lon: -3.1919 }
];

export const INITIAL_DRIVERS = [
  { id:"drv-jose-manuel-calvo", full_name:"José Manuel Calvo", base:"Logroño", default_vehicle_id:"veh-153" },
  { id:"drv-jose-collar", full_name:"José Collar", base:"Logroño" },
  { id:"drv-jose-maria", full_name:"José María", base:"Logroño" },
  { id:"drv-lukasz", full_name:"Lukasz", base:"Logroño" },
  { id:"drv-mikel", full_name:"Mikel", base:"Logroño" },
  { id:"drv-diko", full_name:"Diko Borislavov Dikov", base:"Haro", default_vehicle_id:"veh-141" },
  { id:"drv-jose-manuel-villar", full_name:"José Manuel Villar", base:"Haro" },
  { id:"drv-imanol-villar", full_name:"Imanol Villar", base:"Haro" },
  { id:"drv-thomas-hampl", full_name:"Thomas Hampl", base:"Haro" },
  { id:"drv-alfredo", full_name:"Alfredo", base:"Nájera", default_vehicle_id:"veh-131" },
  { id:"drv-jose-manuel-ceniceros", full_name:"José Manuel Ceniceros", base:"Nájera" },
  { id:"drv-alberto-salinas", full_name:"Alberto Salinas", base:"Nájera" },
  { id:"drv-jose-antonio-pena", full_name:"José Antonio Peña", base:"Nájera" }
];

export const INITIAL_VEHICLES = [
  { id:"veh-153", bus_number:"153", plate:"", brand:"", model:"", bodywork:"", seats:55, vehicle_group:"autobus", pmr:"no", pmr_count:0, base:"Logroño" },
  { id:"veh-132", bus_number:"132", plate:"", brand:"", model:"", bodywork:"", seats:59, vehicle_group:"autobus_3_ejes", pmr:"no", pmr_count:0, base:"Logroño" },
  { id:"veh-133", bus_number:"133", plate:"", brand:"", model:"", bodywork:"", seats:55, vehicle_group:"autobus", pmr:"no", pmr_count:0, base:"Logroño" },
  { id:"veh-148", bus_number:"148", plate:"", brand:"", model:"", bodywork:"", seats:55, vehicle_group:"autobus", pmr:"no", pmr_count:0, base:"Logroño" },
  { id:"veh-145", bus_number:"145", plate:"", brand:"", model:"", bodywork:"", seats:28, vehicle_group:"microbus", pmr:"no", pmr_count:0, base:"Logroño" },
  { id:"veh-141", bus_number:"141", plate:"", brand:"", model:"", bodywork:"", seats:55, vehicle_group:"autobus", pmr:"no", pmr_count:0, base:"Haro" },
  { id:"veh-130", bus_number:"130", plate:"", brand:"", model:"", bodywork:"", seats:55, vehicle_group:"autobus", pmr:"no", pmr_count:0, base:"Haro" },
  { id:"veh-122", bus_number:"122", plate:"", brand:"", model:"", bodywork:"", seats:28, vehicle_group:"microbus", pmr:"no", pmr_count:0, base:"Haro" },
  { id:"veh-116", bus_number:"116", plate:"", brand:"", model:"", bodywork:"", seats:28, vehicle_group:"microbus", pmr:"no", pmr_count:0, base:"Haro" },
  { id:"veh-131", bus_number:"131", plate:"", brand:"", model:"", bodywork:"", seats:55, vehicle_group:"autobus", pmr:"no", pmr_count:0, base:"Nájera" },
  { id:"veh-114", bus_number:"114", plate:"", brand:"", model:"", bodywork:"", seats:59, vehicle_group:"autobus_3_ejes", pmr:"no", pmr_count:0, base:"Nájera" },
  { id:"veh-142", bus_number:"142", plate:"", brand:"", model:"", bodywork:"", seats:24, vehicle_group:"microbus", pmr:"no", pmr_count:0, base:"Nájera" },
  { id:"veh-113", bus_number:"113", plate:"", brand:"", model:"", bodywork:"", seats:50, vehicle_group:"autobus", pmr:"no", pmr_count:0, base:"Nájera" },
  { id:"veh-turismo-1", bus_number:"T1", plate:"", brand:"", model:"", bodywork:"Turismo", seats:5, vehicle_group:"turismo", pmr:"no", pmr_count:0, base:"Logroño" }
];

export const INITIAL_MONITORS = [
  { id:"mon-maria-jose", full_name:"Maria Jose", base:"Logroño" },
  { id:"mon-ana-amo", full_name:"Ana Amo", base:"Logroño" },
  { id:"mon-neli", full_name:"Neli", base:"Logroño" },
  { id:"mon-pilar-cantabrana", full_name:"Pilar Cantabrana", phone:"676007674", email:"", base:"Haro" },
  { id:"mon-cristina-ortega", full_name:"Cristina Ortega", phone:"628245067", email:"cristina@mybusops.local", base:"Haro" },
  { id:"mon-catalina-davila", full_name:"Catalina Dávila", base:"Haro" },
  { id:"mon-luzma", full_name:"Luzma", base:"Nájera" },
  { id:"mon-pilar-acha", full_name:"Pilar Acha", base:"Nájera" },
  { id:"mon-marga-moral", full_name:"Marga Moral", base:"Nájera" }
];

export const INITIAL_SIGN_CODES = [
  { id: "sc1", service_type: "instituto", name: "Transporte escolar Gobierno de La Rioja", code: "9000", origin: "", destination: "", line_number: "", itinerary: "", is_default: true },
  { id: "sc2", service_type: "linea", name: "Nájera - Valgañón", code: "350", origin: "Nájera", destination: "Valgañón", line_number: "350", itinerary: "Nájera - Valgañón", is_default: true },
  { id: "sc3", service_type: "discrecional", name: "Discrecional", code: "2", origin: "", destination: "", line_number: "", itinerary: "", is_default: true }
];
