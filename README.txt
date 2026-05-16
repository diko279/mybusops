RIOJACAR FLEETOPS · APP NUEVA

Base creada con React + Vite + Supabase + Capacitor.

Mantiene una estética parecida al HTML original:
- fondo de acceso con imagen
- tema rojo/oscuro
- panel claro para gestión
- roles: admin, jefe, conductor, monitor

CÓMO PROBAR SIN SUPABASE:
1. Instalar Node.js LTS.
2. Abrir esta carpeta con VS Code.
3. Terminal:
   npm install
   npm run dev
4. Abrir la URL que muestra Vite.

CÓMO CONECTAR SUPABASE:
Ver docs/PASOS_SUPABASE.txt
Ejecutar supabase/schema.sql en Supabase.

TABLAS INCLUIDAS:
- profiles
- conductores
- vehiculos
- monitores
- servicios

DATOS DE CONDUCTOR:
- caducidad carnet conducir
- caducidad CAP
- caducidad tarjeta tacógrafo

APP MÓVIL:
La base ya está preparada para Capacitor.
Después se puede convertir en APK Android y app iOS.


CAMBIOS v2:
- Pantalla inicial con logo centrado.
- Fecha y hora arriba.
- Formulario de acceso con efecto cristal.
- Fondo con transición de imágenes configurable por administrador.
- Servicios adaptados al formato del PDF SERVICIOS:
  Nº servicio, bus/línea, conductor, día, fecha, teléfono, hora, recorrido, código,
  vehículo, fin de servicio, punto de salida, observaciones y MD5.


CAMBIOS V4:
- Logotipo visible en la barra superior de todas las páginas.
- Formulario de nuevo servicio condicional:
  Instituto: fecha/hora, origen, destino, regreso, plazas, vehículo, conductor, monitor, código letrero y notas.
  Línea: fecha/hora, origen, destino, número de línea, itinerario, vehículo, conductor, código letrero y notas.
  Fábrica: fecha/hora, origen, destino, plazas, vehículo, conductor, código letrero y notas.
  Discrecional: fecha/hora, origen, destino, regreso, plazas, vehículo, conductor, código letrero y notas.
- MD5 generado automáticamente para cada servicio.
- SQL actualizado en supabase/schema.sql.
- Si la base ya existe, ejecutar supabase/migration_servicios_v4.sql.


CAMBIOS V5:
- Códigos de letrero automáticos.
- Discrecional usa siempre código 2.
- Códigos regulares configurables en la pestaña Códigos letrero.
- Ejemplos iniciales:
  Transporte escolar Gobierno de La Rioja = 9000.
  Línea Nájera - Valgañón = 350.
- Opción de código manual para servicios especiales.
- Códigos solo numéricos.
- Si Supabase ya está creado, ejecutar supabase/migration_codigos_letrero_v5.sql.


CAMBIOS V6:
- Tres bases fijas: Logroño, Haro y Nájera.
- Conductores, vehículos y monitores iniciales cargados por base.
- El nuevo servicio sugiere base, conductor, vehículo y monitor por proximidad del origen.
- La sugerencia se puede aplicar o modificar manualmente.
- Conductores editables con: nombre, teléfono, email, caducidades, foto y vehículos autorizados.
- Vehículos editables con: nº bus, matrícula, marca, modelo, carrocería, plazas, PMR, seguro, ITV, base y foto.
- Monitores editables con: nombre, teléfono, email y base.
- Migración Supabase: supabase/migration_bases_asignacion_v6.sql.


CAMBIOS V6.5:
- Vehículos agrupados en:
  - Autobuses
  - Microbuses
  - Autobús 3 ejes
- En conductores, al seleccionar vehículos autorizados, se puede seleccionar un grupo completo.
- Después se puede desmarcar manualmente cualquier vehículo concreto.
- Añadido campo vehicle_group en vehículos.
- Migración Supabase: supabase/migration_grupos_vehiculos_v6_5.sql.


CAMBIOS V6.7:
- Conductores: añadido bus asignado por defecto.
- La lista de conductores muestra el bus por defecto.
- La miniatura de la foto se muestra completa, sin recortarse.
- El título del campo de imagen ahora es "Foto".
- Cabecera: junto al logotipo aparece "Gestión".
- Logotipo protegido para no deformarse.
- Migración Supabase: supabase/migration_conductor_bus_logo_v6_7.sql.


CAMBIOS V6.9:
- Añadido grupo de vehículos: Turismos.
- Botón "Enviar servicio" junto a "Guardar servicio y generar MD5".
- Generación de parte/PDF visual en ventana imprimible con formato basado en el ejemplo.
- Apertura de borrador de correo al conductor si tiene email.
- El envío real con PDF adjunto requiere configurar backend/Edge Function con servicio de email.
- El conductor puede:
  - Confirmar visto.
  - Iniciar servicio, guardando fecha/hora.
  - Finalizar servicio, guardando fecha/hora.
  - Escribir notas/incidencias.
  - Adjuntar fotos de incidencia.
- Migración Supabase: supabase/migration_servicio_workflow_v6_9.sql.


CAMBIOS V7:
- Añadida sección Mi perfil para jefe/admin/conductores/monitores.
- Email por defecto del jefe: elpaseosanvicente@gmail.com.
- Los envíos/borradores de servicio usan el email configurado en el perfil del jefe como remitente de referencia.
- El perfil permite modificar nombre, email, teléfono, rol, base y foto.
- Migración Supabase: supabase/migration_mi_perfil_v7.sql.


CAMBIOS V7.2:
- El servicio también se envía al monitor si el monitor tiene email configurado.
- El PDF del monitor tiene formato reducido:
  fecha, hora, origen, destino, número de bus, conductor y aclaraciones del jefe.
- Añadida función para copiar un servicio a otra fecha.
- Pensado para líneas regulares, institutos y fábricas que se repiten a diario.


CAMBIOS V7.3:
- Mejorado el reconocimiento del origen:
  - alias frecuentes
  - coincidencia aproximada por texto
  - más localidades añadidas
- Añadida opción de base manual si el origen no se reconoce.
- Evita bloquear la asignación cuando se escribe un pueblo con abreviaturas o pequeñas faltas.
