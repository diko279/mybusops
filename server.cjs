const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const PORT = process.env.MAIL_SERVER_PORT || 8787;

function createServicePdfBuffer({ service, driver, vehicle, monitor, senderProfile }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 42 });
      const chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const bus = vehicle?.bus_number || vehicle?.plate || "-";
      const driverName = driver?.full_name || "-";
      const phone = driver?.phone || "-";
      const route = `${service.start_time || ""} ${service.origin || ""} - ${service.destination || ""}${service.has_return === "si" ? " Y REGRESO" : ""}`;

      doc.fontSize(10).text(`${bus} BUS -> ${driverName}`, { continued: false });
      doc.text(`${service.service_date || ""}  Tf:${phone}`, { align: "right" });
      doc.moveDown(0.6);
      doc.moveTo(42, doc.y).lineTo(553, doc.y).stroke();
      doc.moveDown(0.8);

      doc.fontSize(15).font("Helvetica-Bold").text(route);
      doc.moveDown(0.6);

      doc.fontSize(11).font("Helvetica");
      doc.text(`Tipo de servicio: ${service.service_type || "-"}`);
      doc.text(`Código letrero: ${service.sign_code || "-"}`);
      if (service.service_type === "linea") {
        doc.text(`Línea: ${service.line_number || "-"}`);
        doc.text(`Itinerario: ${service.itinerary || "-"}`);
      }
      doc.text(`Vehículo: Bus ${bus}${vehicle?.seats ? " · " + vehicle.seats + " plazas" : ""}`);
      doc.text(`Conductor: ${driverName}`);
      if (monitor?.full_name) doc.text(`Monitor: ${monitor.full_name}`);
      doc.text(`Plazas: ${service.seats_required || "-"}`);
      doc.text(`Regreso: ${service.has_return === "si" ? "Sí" : "No"}`);
      doc.text(`Base sugerida: ${service.nearest_base || "-"}${service.nearest_base_km ? " (" + service.nearest_base_km + " km)" : ""}`);

      doc.moveDown(0.8);
      doc.font("Helvetica-Bold").text("Notas:");
      doc.font("Helvetica").text(service.notes || "-");

      doc.moveDown(1);
      doc.fontSize(9).fillColor("#555").text(`MD5=${service.md5 || "-"}`);
      doc.text(`Remitente configurado: ${senderProfile?.email || process.env.GMAIL_USER || "-"}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}


function createMonitorPdfBuffer({ service, driver, vehicle, monitor, senderProfile }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 42 });
      const chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const bus = vehicle?.bus_number || vehicle?.plate || "-";
      const driverName = driver?.full_name || "-";

      doc.fontSize(16).font("Helvetica-Bold").text("Servicio para monitor", { align: "center" });
      doc.moveDown(1);
      doc.fontSize(12).font("Helvetica");
      doc.text(`Fecha: ${service.service_date || "-"}`);
      doc.text(`Hora: ${service.start_time || "-"}`);
      doc.text(`Origen: ${service.origin || "-"}`);
      doc.text(`Destino: ${service.destination || "-"}`);
      doc.text(`Número de bus: ${bus}`);
      doc.text(`Conductor: ${driverName}`);
      doc.moveDown(1);
      doc.font("Helvetica-Bold").text("Aclaraciones del jefe:");
      doc.font("Helvetica").text(service.notes || "-");
      doc.moveDown(1);
      doc.fontSize(9).fillColor("#555").text(`MD5=${service.md5 || "-"}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}


function createOperationalDailyPdfBuffer({ services, driver, vehiclesById, monitorsById = {} }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 18 });
      const chunks = [];
      doc.on("data", c => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const logoPath = path.join(__dirname, "src", "assets", "logo.png");
      const date = services[0]?.service_date || "-";
      const md5 = services.map(s => s.md5).filter(Boolean).join(" | ");

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 18, 14, { width: 52 });
      }

      doc.font("Helvetica-Bold").fontSize(10)
        .text(`SERVICIOS DIARIOS CONDUCTOR -> ${String(driver?.full_name || "-").toUpperCase()}`, 78, 18);

      doc.font("Helvetica").fontSize(8)
        .text(`${date}  TEL:${driver?.phone || "-"}`, 78, 31);

      doc.moveDown(1.1);

      services
        .sort((a,b)=>String(a.start_time||"").localeCompare(String(b.start_time||"")))
        .forEach((s) => {
          const v = vehiclesById?.[s.vehicle_id] || {};
          const m = monitorsById?.[s.monitor_id] || {};

          const line1 =
            `${s.start_time || "-"}H. ${String(s.origin || "-").toUpperCase()}-${String(s.destination || "-").toUpperCase()}`
            + `${s.has_return==="si" ? " REGRESO" : ""}`
            + ` BUS ${v.bus_number || "-"}`
            + `${s.sign_code ? ` C-${s.sign_code}` : ""}`;

          const line2 =
            `${s.notes || "-"}`
            + `${m?.full_name ? ` [MONITOR: ${String(m.full_name).toUpperCase()} ${m.phone || ""}]` : ""}`;

          doc.font("Helvetica-Bold").fontSize(8.8).text(line1, { lineGap: 0 });
          doc.font("Helvetica").fontSize(8.1).text(line2, { lineGap: 0 });

          doc.moveDown(0.18);
        });

      doc.moveDown(0.2);
      doc.fontSize(6.8).fillColor("#666").text(`MD5 ${md5}`);
      doc.moveDown(0.1);
      doc.fontSize(6.8).fillColor("#666").text("MyBusOps · Creado por Diko Borislavov Dikov · Todos los derechos reservados.", { align:"center" });

      doc.end();
    } catch(e) { reject(e); }
  });
}

function createOperationalMonitorPdfBuffer({ services, monitor, vehiclesById, driversById }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 18 });
      const chunks = [];
      doc.on("data", c => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const logoPath = path.join(__dirname, "src", "assets", "logo.png");
      const date = services[0]?.service_date || "-";

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 18, 14, { width: 52 });
      }

      doc.font("Helvetica-Bold").fontSize(10)
        .text(`SERVICIOS DIARIOS MONITOR -> ${String(monitor?.full_name || "-").toUpperCase()}`, 78, 18);

      doc.font("Helvetica").fontSize(8)
        .text(`${date}`, 78, 31);

      doc.moveDown(1.1);

      services
        .sort((a,b)=>String(a.start_time||"").localeCompare(String(b.start_time||"")))
        .forEach((s) => {
          const v = vehiclesById?.[s.vehicle_id] || {};
          const d = driversById?.[s.driver_id] || {};

          const line1 =
            `${s.start_time || "-"}H. ${String(s.origin || "-").toUpperCase()}-${String(s.destination || "-").toUpperCase()}`
            + ` BUS ${v.bus_number || "-"}`
            + ` COND:${String(d.full_name || "-").toUpperCase()}`;

          doc.font("Helvetica-Bold").fontSize(8.8).text(line1, { lineGap: 0 });
          doc.font("Helvetica").fontSize(8.1).text(s.notes || "-", { lineGap: 0 });
          doc.moveDown(0.18);
        });

      doc.moveDown(0.2);
      doc.fontSize(6.8).fillColor("#666").text("MyBusOps · Creado por Diko Borislavov Dikov · Todos los derechos reservados.", { align:"center" });

      doc.end();
    } catch(e) { reject(e); }
  });
}

app.post("/api/send-daily-grouped", async (req, res) => {
  try {
    const { date, services, drivers, vehicles, monitors, senderProfile } = req.body || {};

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const vehiclesById = Object.fromEntries((vehicles || []).map(v => [v.id, v]));
    const driversById = Object.fromEntries((drivers || []).map(v => [v.id, v]));
    const monitorsById = Object.fromEntries((monitors || []).map(v => [v.id, v]));

    const sent = [];

    const groupedDrivers = {};
    for (const s of services) {
      if (!s.driver_id) continue;
      groupedDrivers[s.driver_id] ||= [];
      groupedDrivers[s.driver_id].push(s);
    }

    for (const driverId of Object.keys(groupedDrivers)) {
      const driver = driversById[driverId];
      if (!driver?.email) continue;

      const pdf = await createOperationalDailyPdfBuffer({
        services: groupedDrivers[driverId],
        driver,
        vehiclesById
      });

      await transporter.sendMail({
        from: `"MyBusOps" <${process.env.GMAIL_USER}>`,
        replyTo: senderProfile?.email || process.env.GMAIL_USER,
        to: driver.email,
        subject: `Servicios ${date}`,
        text: `Servicios agrupados del día ${date}`,
        attachments: [{
          filename: `servicios_${date}.pdf`,
          content: pdf,
          contentType: "application/pdf"
        }]
      });

      sent.push(driver.email);
    }

    const groupedMonitors = {};
    for (const s of services) {
      if (!s.monitor_id) continue;
      groupedMonitors[s.monitor_id] ||= [];
      groupedMonitors[s.monitor_id].push(s);
    }

    for (const monitorId of Object.keys(groupedMonitors)) {
      const monitor = monitorsById[monitorId];
      if (!monitor?.email) continue;

      const pdf = await createOperationalMonitorPdfBuffer({
        services: groupedMonitors[monitorId],
        monitor,
        vehiclesById,
        driversById
      });

      await transporter.sendMail({
        from: `"MyBusOps" <${process.env.GMAIL_USER}>`,
        replyTo: senderProfile?.email || process.env.GMAIL_USER,
        to: monitor.email,
        subject: `Servicios monitor ${date}`,
        text: `Servicios agrupados del día ${date}`,
        attachments: [{
          filename: `monitor_${date}.pdf`,
          content: pdf,
          contentType: "application/pdf"
        }]
      });
    }

    res.json({ ok:true, sent });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Error" });
  }
});

function assertConfig() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Faltan GMAIL_USER o GMAIL_APP_PASSWORD en el archivo .env");
  }
}

app.get("/api/mail/status", (req, res) => {
  res.json({
    ok: true,
    configured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    user: process.env.GMAIL_USER || null
  });
});

app.post("/api/send-service-email", async (req, res) => {
  try {
    assertConfig();

    const { service, driver, vehicle, monitor, senderProfile } = req.body || {};
    if (!service) return res.status(400).json({ error: "Falta service" });
    if (!driver?.email) return res.status(400).json({ error: "El conductor no tiene email configurado" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const pdfBuffer = await createServicePdfBuffer({ service, driver, vehicle, monitor, senderProfile });

    const subject = `Servicio ${service.service_date || ""} ${service.origin || ""} - ${service.destination || ""}`.trim();
    const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>Nuevo servicio asignado</h2>
        <p><b>Fecha:</b> ${service.service_date || "-"}</p>
        <p><b>Hora:</b> ${service.start_time || "-"}</p>
        <p><b>Origen:</b> ${service.origin || "-"}</p>
        <p><b>Destino:</b> ${service.destination || "-"}</p>
        <p><b>Código letrero:</b> ${service.sign_code || "-"}</p>
        <p><b>MD5:</b> ${service.md5 || "-"}</p>
        <p>Abre FleetOps para confirmar que has visto el servicio.</p>
      </div>
    `;

    const fromName = process.env.EMAIL_FROM_NAME || "Gestión Riojacar";
    const sent = [];

    const mail = await transporter.sendMail({
      from: `"${fromName}" <${process.env.GMAIL_USER}>`,
      replyTo: senderProfile?.email || process.env.GMAIL_USER,
      to: driver.email,
      subject,
      html,
      attachments: [
        {
          filename: `servicio_conductor_${service.md5 || Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    });
    sent.push({ role: "driver", to: driver.email, messageId: mail.messageId });

    if (monitor?.email) {
      const monitorPdf = await createMonitorPdfBuffer({ service, driver, vehicle, monitor, senderProfile });
      const monitorHtml = `
        <div style="font-family:Arial,sans-serif">
          <h2>Servicio asignado</h2>
          <p><b>Fecha:</b> ${service.service_date || "-"}</p>
          <p><b>Hora:</b> ${service.start_time || "-"}</p>
          <p><b>Origen:</b> ${service.origin || "-"}</p>
          <p><b>Destino:</b> ${service.destination || "-"}</p>
          <p><b>Bus:</b> ${vehicle?.bus_number || vehicle?.plate || "-"}</p>
          <p><b>Conductor:</b> ${driver?.full_name || "-"}</p>
          <p><b>Aclaraciones:</b> ${service.notes || "-"}</p>
        </div>
      `;

      const monitorMail = await transporter.sendMail({
        from: `"${fromName}" <${process.env.GMAIL_USER}>`,
        replyTo: senderProfile?.email || process.env.GMAIL_USER,
        to: monitor.email,
        subject: `Servicio monitor ${service.service_date || ""} ${service.origin || ""} - ${service.destination || ""}`.trim(),
        html: monitorHtml,
        attachments: [
          {
            filename: `servicio_monitor_${service.md5 || Date.now()}.pdf`,
            content: monitorPdf,
            contentType: "application/pdf"
          }
        ]
      });
      sent.push({ role: "monitor", to: monitor.email, messageId: monitorMail.messageId });
    }

    res.json({ ok: true, sent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Error enviando email" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de correo FleetOps activo en http://localhost:${PORT}`);
});
