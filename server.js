/**
 * Think'AI — Backend Node.js
 * Serveur Express qui reçoit les soumissions et envoie un e-mail HTML stylisé.
 *
 * ─── CONFIGURATION ────────────────────────────────────────
 * Copiez le fichier .env.example en .env et remplissez les valeurs :
 *
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=votre.adresse@gmail.com
 *   SMTP_PASS=votre_mot_de_passe_application   ← Mot de passe d'application Gmail
 *   MAIL_FROM="Think'AI <votre.adresse@gmail.com>"
 *   MAIL_TO=mohamedsaizonou86@gmail.com
 *   PORT=3001
 *
 * Pour Gmail : activez la validation en 2 étapes puis créez un
 * "Mot de passe d'application" sur https://myaccount.google.com/apppasswords
 * ──────────────────────────────────────────────────────────
 */

"use strict";

require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────────────────────
app.use(cors()); // autorise les appels depuis le front
app.use(express.json());
app.use(express.static(".")); // sert index.html + script.js localement

// ─── TRANSPORTER SMTP ────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── HELPER: ICÔNE PNG via CDN public (Iconify API) ──────────────────
// Les PNG sont servis par api.iconify.design, compatibles avec tous les
// clients mail (Gmail, Outlook, Apple Mail, webmails…).
// La couleur %23600503 = #600503 encodé pour l'URL.
function faIcon(type) {
  const base = "https://api.iconify.design/fa-solid";
  const color600 = "%23600503"; // #600503
  const color7a6 = "%237a6060"; // #7a6060

  const icons = {
    user: `<img src="${base}/user.svg?color=${color600}&width=16&height=16"     width="16" height="16" alt="utilisateur" style="display:inline-block;vertical-align:middle;border:0;"/>`,
    tag: `<img src="${base}/tag.svg?color=${color600}&width=16&height=16"      width="16" height="16" alt="tag"          style="display:inline-block;vertical-align:middle;border:0;"/>`,
    building: `<img src="${base}/building.svg?color=${color600}&width=16&height=16" width="16" height="16" alt="entreprise"  style="display:inline-block;vertical-align:middle;border:0;"/>`,
    envelope: `<img src="${base}/envelope.svg?color=${color600}&width=16&height=16" width="16" height="16" alt="email"       style="display:inline-block;vertical-align:middle;border:0;"/>`,
    phone: `<img src="${base}/phone.svg?color=${color600}&width=16&height=16"    width="16" height="16" alt="téléphone"   style="display:inline-block;vertical-align:middle;border:0;"/>`,
    clock: `<img src="${base}/clock.svg?color=${color7a6}&width=14&height=14"    width="14" height="14" alt="horloge"     style="display:inline-block;vertical-align:middle;border:0;"/>`,
  };
  return icons[type] || "";
}

function fonctionBadge(fonction) {
  const map = {
    DG: { bg: "#600503", text: "#fcc901" },
    DGA: { bg: "#8a0705", text: "#fcc901" },
    PCA: { bg: "#1a0a09", text: "#fcc901" },
    "SECRETAIRE GENERALE": { bg: "#3d1a18", text: "#fcc901" },
  };
  const colors = map[fonction] || { bg: "#600503", text: "#fcc901" };
  return `<span style="display:inline-block;background:${colors.bg};color:${colors.text};
            padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;
            letter-spacing:0.08em;text-transform:uppercase;">${fonction}</span>`;
}

// ─── HELPER: LIGNE DE DONNÉES ─────────────────────────────
function dataRow(iconType, label, value) {
  return `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #f0e8e8;width:44px;vertical-align:middle;">
        <div style="width:36px;height:36px;border-radius:8px;background:#fdf4f4;
                    display:table-cell;text-align:center;vertical-align:middle;font-size:16px;">
          ${faIcon(iconType)}
        </div>
      </td>
      <td style="padding:14px 8px;border-bottom:1px solid #f0e8e8;
                 font-size:11px;font-weight:700;color:#7a6060;text-transform:uppercase;
                 letter-spacing:0.08em;white-space:nowrap;vertical-align:middle;width:130px;">
        ${label}
      </td>
      <td style="padding:14px 20px 14px 8px;border-bottom:1px solid #f0e8e8;
                 font-size:14px;font-weight:500;color:#1a0a09;vertical-align:middle;">
        ${value}
      </td>
    </tr>`;
}

// ─── TEMPLATE HTML DE L'E-MAIL ────────────────────────────
function buildHtmlEmail(d) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Nouvelle adhésion Think'AI</title>
</head>
<body style="margin:0;padding:0;background:#f5f0f0;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:#f5f0f0;padding:40px 16px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="background:#ffffff;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(96,5,3,0.10);max-width:600px;width:100%;">

        <!-- ── HEADER ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#600503 0%,#8a0705 100%);
                     padding:36px 40px 32px;text-align:center;">

            <!-- Logo wordmark -->
            <div style="font-size:28px;font-weight:900;color:#ffffff;
                        letter-spacing:-0.01em;margin-bottom:6px;">
              Think<span style="color:#fcc901;">'AI</span>
            </div>
            <div style="width:36px;height:2px;background:#fcc901;
                        border-radius:2px;margin:10px auto 12px;"></div>
            <p style="font-size:11px;font-weight:300;letter-spacing:0.22em;
                      text-transform:uppercase;color:rgba(255,255,255,0.55);margin:0;">
              Explorer · Comprendre · Anticiper
            </p>

            <!-- Badge -->
            <div style="margin-top:24px;">
              <span style="display:inline-block;background:rgba(252,201,1,0.15);
                           border:1px solid rgba(252,201,1,0.4);
                           color:#fcc901;border-radius:20px;
                           padding:6px 18px;font-size:12px;font-weight:600;
                           letter-spacing:0.06em;text-transform:uppercase;">
                Nouvelle demande d'adhésion
              </span>
            </div>
          </td>
        </tr>

        <!-- ── INTRO ── -->
        <tr>
          <td style="padding:28px 40px 8px;">
            <p style="font-size:15px;color:#3d1a18;line-height:1.6;margin:0;">
              Une nouvelle demande d'adhésion vient d'être soumise via le formulaire Think'AI.
              Voici les informations du candidat :
            </p>
          </td>
        </tr>

        <!-- ── DONNÉES IDENTITÉ ── -->
        <tr>
          <td style="padding:16px 40px 0;">
            <p style="font-size:11px;font-weight:700;color:#600503;
                      text-transform:uppercase;letter-spacing:0.1em;
                      margin:0 0 10px;border-left:3px solid #fcc901;padding-left:10px;">
              Identité
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-radius:10px;overflow:hidden;border:1px solid #f0e8e8;">
              ${dataRow("user", "Nom", d.nom)}
              ${dataRow("user", "Prénom", d.prenom)}
              ${dataRow("tag", "Fonction", fonctionBadge(d.fonction))}
            </table>
          </td>
        </tr>

        <!-- ── DONNÉES CONTACT ── -->
        <tr>
          <td style="padding:20px 40px 0;">
            <p style="font-size:11px;font-weight:700;color:#600503;
                      text-transform:uppercase;letter-spacing:0.1em;
                      margin:0 0 10px;border-left:3px solid #fcc901;padding-left:10px;">
              Contact & Organisation
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-radius:10px;overflow:hidden;border:1px solid #f0e8e8;">
              ${dataRow("building", "Entreprise", d.entreprise)}
              ${dataRow(
                "envelope",
                "E-mail",
                `<a href="mailto:${d.email}" style="color:#600503;text-decoration:none;font-weight:600;">${d.email}</a>`,
              )}
              ${dataRow(
                "phone",
                "Téléphone",
                `<a href="tel:${d.telephone}" style="color:#600503;text-decoration:none;font-weight:600;">${d.telephone}</a>`,
              )}
            </table>
          </td>
        </tr>

        <!-- ── MÉTADONNÉES ── -->
        <tr>
          <td style="padding:20px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#fdf8f8;border-radius:10px;padding:16px;border:1px solid #f0e8e8;">
              <tr>
                <td style="font-size:11px;color:#7a6060;padding:4px 8px;vertical-align:middle;">
                  ${faIcon("clock")} <strong style="margin-left:4px;">Date de soumission :</strong> ${d.date}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── CTA ── -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="mailto:${d.email}?subject=Think'AI%20-%20Confirmation%20d'adhésion"
               style="display:inline-block;background:#600503;color:#fcc901;
                      padding:14px 32px;border-radius:10px;font-weight:700;
                      font-size:14px;text-decoration:none;letter-spacing:0.05em;
                      text-transform:uppercase;">
              Répondre au candidat
            </a>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:#fdf8f8;border-top:1px solid #f0e8e8;
                     padding:20px 40px;text-align:center;">
            <p style="font-size:11px;color:#c4b5b5;margin:0;line-height:1.8;">
              Cet e-mail a été généré automatiquement par le système Think'AI.<br/>
              Ne pas répondre directement à cet e-mail.
            </p>
          </td>
        </tr>

      </table>

    </td></tr>
  </table>

</body>
</html>`;
}

// ─── ROUTE POST /send ─────────────────────────────────────
app.post("/send", async (req, res) => {
  const { nom, prenom, fonction, entreprise, email, telephone, date } =
    req.body;

  // Validation basique côté serveur
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const FONCTIONS_VALIDES = ["DG", "DGA", "PCA", "SECRETAIRE GENERALE"];

  if (!nom || !prenom || !fonction || !entreprise || !email || !telephone) {
    return res
      .status(400)
      .json({ message: "Tous les champs sont obligatoires." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Adresse e-mail invalide." });
  }
  if (!FONCTIONS_VALIDES.includes(fonction)) {
    return res.status(400).json({ message: "Fonction invalide." });
  }

  const data = {
    nom,
    prenom,
    fonction,
    entreprise,
    email,
    telephone,
    date:
      date ||
      new Date().toLocaleString("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }),
  };

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || `"Think'AI" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || "mohamedsaizonou86@gmail.com",
      replyTo: email,
      subject: `[Think'AI] Nouvelle adhésion – ${nom} ${prenom}`,
      html: buildHtmlEmail(data),
      // Version texte de secours
      text: `Nouvelle adhésion Think'AI\n\nNom : ${nom}\nPrénom : ${prenom}\nFonction : ${fonction}\nEntreprise : ${entreprise}\nE-mail : ${email}\nTéléphone : ${telephone}\nDate : ${data.date}`,
    });

    console.log(`✅ Mail envoyé pour ${prenom} ${nom} (${fonction})`);
    res.json({ ok: true, message: "Mail envoyé avec succès." });
  } catch (err) {
    console.error("❌ Erreur SMTP :", err);
    res.status(500).json({
      message: "Échec de l'envoi. Vérifiez la configuration SMTP.",
      detail: err.message,
    });
  }
});

// ─── DÉMARRAGE ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(
    `\x1b[41m\x1b[33m Think'AI \x1b[0m\x1b[43m\x1b[31m  Serveur démarré sur http://localhost:${PORT} \x1b[0m`,
  );
  if (!process.env.SMTP_USER) {
    console.warn(
      "⚠️  SMTP non configuré. Créez un fichier .env (voir .env.example).",
    );
  }
});
