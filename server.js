require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const { ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN } = process.env;

// ---------- Replies (edit these with your real details) ----------
const MENU = `Welcome to *Naintara Creations* 💜
Handmade jewelry made with love.

Reply with a number:
1️⃣ Pendants
2️⃣ Earrings
3️⃣ Rings
4️⃣ Bracelets
5️⃣ Hand cuffs
6️⃣ How to order
7️⃣ Talk to a person`;

const REPLIES = {
  "1": "💜 *Pendants*\nDelicate handmade pendants.\nPrice: Rs. ____\nSend *6* to learn how to order.",
  "2": "💜 *Earrings*\nStuds, drops and more.\nPrice: Rs. ____\nSend *6* to learn how to order.",
  "3": "💜 *Rings*\nStylish handmade rings.\nPrice: Rs. ____\nSend *6* to learn how to order.",
  "4": "💜 *Bracelets*\nBeautiful handmade bracelets.\nPrice: Rs. ____\nSend *6* to learn how to order.",
  "5": "💜 *Hand cuffs*\nStatement hand cuffs.\nPrice: Rs. ____\nSend *6* to learn how to order.",
  "6": "🛍️ *How to order*\n1. Tell us the item and quantity\n2. Send your name, address and city\n3. We confirm the total and delivery time\n\nSend *menu* to go back.",
  "7": "Thank you! A team member will reply to you here soon. 💜"
};

const KEYWORDS = [
  { words: ["pendant", "locket", "necklace"], key: "1" },
  { words: ["earring", "studs", "jhumka"], key: "2" },
  { words: ["ring"], key: "3" },
  { words: ["bracelet"], key: "4" },
  { words: ["cuff"], key: "5" },
  { words: ["order", "buy", "price", "delivery"], key: "6" },
  { words: ["human", "person", "agent", "help"], key: "7" }
];

function getReply(text) {
  const t = (text || "").trim().toLowerCase();
  if (!t || ["hi", "hello", "salam", "assalam o alaikum", "menu", "start"].includes(t)) return MENU;
  if (REPLIES[t]) return REPLIES[t];
  for (const k of KEYWORDS) {
    if (k.words.some((w) => t.includes(w))) return REPLIES[k.key];
  }
  return "Sorry, I didn't understand that.\n\n" + MENU;
}

// ---------- Z-API: send a text message ----------
async function sendText(phone, message) {
  const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`;
  const headers = { "Content-Type": "application/json" };
  if (ZAPI_CLIENT_TOKEN) headers["Client-Token"] = ZAPI_CLIENT_TOKEN;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone, message })
  });
  if (!res.ok) {
    console.error("Z-API send failed:", res.status, await res.text());
  }
}

// ---------- Routes ----------
app.get("/", (req, res) => res.send("Naintara WhatsApp chatbot is running 💜"));

// Put this URL in Z-API as "When receiving": https://YOUR-SERVICE.onrender.com/webhook
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // answer Z-API immediately

  try {
    const body = req.body || {};
    if (body.fromMe || body.isGroup) return; // ignore own and group messages

    const phone = body.phone;
    const text = body.text && body.text.message;
    if (!phone || !text) return; // ignore images, stickers, etc.

    await sendText(phone, getReply(text));
  } catch (err) {
    console.error("Webhook error:", err);
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
