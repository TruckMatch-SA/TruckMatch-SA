import { useState, useEffect } from "react";

// ─── SUPABASE CONFIG ───────────────────────────────────────────────
const SUPABASE_URL = "https://zkttukbtthfmxgtizxkb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdHR1a2J0dGhmbXhndGl6eGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTIzNDYsImV4cCI6MjA5MjMyODM0Nn0.O6ktyDUjSMMQaYYi1py993yoolUq7b-jdti2JGIS1dw";

const supa = async (path, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
};

const supaAuth = async (endpoint, body) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
};

// ─── THEME ─────────────────────────────────────────────────────────
const C = {
  navy: "#0A1628",
  navyMid: "#112240",
  navyLight: "#1B3461",
  navyBorder: "#1E3A5F",
  white: "#FFFFFF",
  offWhite: "#F0F4F8",
  muted: "#8899AA",
  accent: "#1E90FF",
  accentHover: "#1470CC",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F97316",
  gold: "#F59E0B",
};

const COMMISSION = 0.035;
const ADMIN_EMAIL = "muhammedsaadmahomed@gmail.com";

// ─── HELPERS ───────────────────────────────────────────────────────
const fmt = (n) => `R${Number(n).toLocaleString("en-ZA")}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

// ─── SMALL COMPONENTS ──────────────────────────────────────────────
function Avatar({ name = "?", size = 40 }) {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = [C.accent, C.green, C.orange, "#A855F7", "#EC4899"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, color: "#fff", flexShrink: 0, fontFamily: "'Barlow', sans-serif" }}>
      {initials}
    </div>
  );
}

function Badge({ children, color = C.accent }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>{children}</span>;
}

function Btn({ children, onClick, color = C.accent, outline = false, fullWidth = false, small = false, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: outline ? "transparent" : (disabled ? C.muted : color),
      border: `2px solid ${disabled ? C.muted : color}`,
      color: outline ? color : "#fff",
      borderRadius: 8, padding: small ? "6px 14px" : "11px 22px",
      fontWeight: 700, fontSize: small ? 13 : 15,
      cursor: disabled ? "not-allowed" : "pointer",
      width: fullWidth ? "100%" : "auto",
      fontFamily: "'Barlow', sans-serif",
      transition: "all 0.18s",
      letterSpacing: "0.03em",
    }}>{children}</button>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", color: C.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        width: "100%", background: C.navyMid, border: `1px solid ${C.navyBorder}`,
        borderRadius: 8, padding: "11px 14px", color: C.white, fontSize: 14,
        outline: "none", boxSizing: "border-box", fontFamily: "'Barlow', sans-serif",
      }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", color: C.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", background: C.navyMid, border: `1px solid ${C.navyBorder}`,
        borderRadius: 8, padding: "11px 14px", color: C.white, fontSize: 14,
        outline: "none", boxSizing: "border-box", colorScheme: "dark",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: wide ? 700 : 480, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg, type = "success" }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 999, background: type === "success" ? C.green : C.red, color: "#fff", padding: "12px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14, boxShadow: "0 4px 20px #0008" }}>
      {type === "success" ? "✓ " : "✗ "}{msg}
    </div>
  );
}

function StatCard({ label, value, color = C.accent, icon }) {
  return (
    <div style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ color, fontWeight: 800, fontSize: 26, fontFamily: "'Barlow Condensed', sans-serif" }}>{value}</div>
      <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ─── AUTH SCREEN ───────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("shipper");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        const data = await supaAuth("token?grant_type=password", { email, password });
        if (data.error) throw new Error(data.error_description || data.error);
        const profile = await supa(`profiles?email=eq.${encodeURIComponent(email)}&select=*`);
        onAuth({ ...data.user, ...profile[0], access_token: data.access_token });
      } else {
        const data = await supaAuth("signup", { email, password });
        if (data.error) throw new Error(data.error_description || data.error);
        await supa("profiles", {
          method: "POST",
          body: JSON.stringify({ id: data.user?.id, email, full_name: name, role, phone }),
        });
        setMode("login");
        setError("Account created! Please log in.");
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🚛</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 36, color: C.white, margin: 0, letterSpacing: "0.02em" }}>
            TRUCK<span style={{ color: C.accent }}>MATCH</span> SA
          </h1>
          <p style={{ color: C.muted, marginTop: 6, fontSize: 14 }}>South Africa's Freight Matching Platform</p>
        </div>

        <div style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 16, padding: 28 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: C.navy, padding: 4, borderRadius: 10 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, background: mode === m ? C.accent : "transparent",
                border: "none", color: mode === m ? "#fff" : C.muted,
                borderRadius: 7, padding: "9px", cursor: "pointer",
                fontWeight: 700, fontSize: 14, fontFamily: "'Barlow', sans-serif",
                textTransform: "capitalize",
              }}>{m === "login" ? "Log In" : "Sign Up"}</button>
            ))}
          </div>

          {mode === "signup" && (
            <>
              <Input label="Full Name" value={name} onChange={setName} placeholder="e.g. Sipho Dlamini" required />
              <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="e.g. 0821234567" />
              <Select label="I am a..." value={role} onChange={setRole} options={[
                { value: "shipper", label: "📦 Shipper — I need to move cargo" },
                { value: "trucker", label: "🚛 Trucker — I have space on my truck" },
              ]} />
            </>
          )}
          <Input label="Email Address" type="email" value={email} onChange={setEmail} placeholder="your@email.com" required />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

          {error && <div style={{ color: error.includes("created") ? C.green : C.red, fontSize: 13, marginBottom: 14, padding: "10px 14px", background: (error.includes("created") ? C.green : C.red) + "18", borderRadius: 8 }}>{error}</div>}

          <Btn onClick={handleSubmit} fullWidth disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log In →" : "Create Account →"}
          </Btn>

          <p style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 16 }}>
            By continuing you agree to TruckMatch SA's Terms & Conditions
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── POST TRUCK ROUTE FORM ─────────────────────────────────────────
function PostRouteForm({ user, onClose, onSuccess }) {
  const [f, setF] = useState({ from_city: "", to_city: "", departure_date: "", departure_time: "", arrival_time: "", available_tons: "", price_per_ton: "", truck_type: "", special_tags: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = k => v => setF(p => ({ ...p, [k]: v }));
  const commission = f.price_per_ton ? Math.round(Number(f.price_per_ton) * Number(f.available_tons || 1) * COMMISSION) : 0;

  const submit = async () => {
    if (!f.from_city || !f.to_city || !f.departure_date || !f.price_per_ton || !f.available_tons) { setError("Please fill in all required fields."); return; }
    setLoading(true); setError("");
    try {
      await supa("truck_routes", {
        method: "POST",
        body: JSON.stringify({ ...f, user_id: user.id, trucker_name: user.full_name, trucker_phone: user.phone, status: "active", available_tons: Number(f.available_tons), price_per_ton: Number(f.price_per_ton) }),
      });
      onSuccess("Route posted successfully!");
      onClose();
    } catch (e) { setError("Failed to post route. Please try again."); }
    setLoading(false);
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="From City *" value={f.from_city} onChange={upd("from_city")} placeholder="e.g. Durban" />
        <Input label="To City *" value={f.to_city} onChange={upd("to_city")} placeholder="e.g. Johannesburg" />
        <Input label="Departure Date *" type="date" value={f.departure_date} onChange={upd("departure_date")} />
        <Input label="Departure Time" type="time" value={f.departure_time} onChange={upd("departure_time")} />
        <Input label="Est. Arrival Time" type="time" value={f.arrival_time} onChange={upd("arrival_time")} />
        <Input label="Available Space (tons) *" type="number" value={f.available_tons} onChange={upd("available_tons")} placeholder="e.g. 8" />
      </div>
      <Input label="Price Per Ton (ZAR) *" type="number" value={f.price_per_ton} onChange={upd("price_per_ton")} placeholder="e.g. 4500" />
      <Input label="Truck Type" value={f.truck_type} onChange={upd("truck_type")} placeholder="e.g. 34-ton Interlink, 8-ton Closed Body" />
      <Input label="Special Capabilities" value={f.special_tags} onChange={upd("special_tags")} placeholder="e.g. Refrigerated, Hazmat, Flatdeck" />
      <Input label="Additional Notes" value={f.notes} onChange={upd("notes")} placeholder="Any other info for shippers..." />
      {commission > 0 && (
        <div style={{ background: C.navy, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: C.muted }}>TruckMatch SA commission (3.5%): </span>
          <span style={{ color: C.accent, fontWeight: 700 }}>{fmt(commission)}</span>
          <span style={{ color: C.muted }}> deducted from your payout on booking</span>
        </div>
      )}
      {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <Btn onClick={submit} fullWidth disabled={loading}>{loading ? "Posting..." : "Post My Route →"}</Btn>
    </>
  );
}

// ─── POST CARGO FORM ───────────────────────────────────────────────
function PostCargoForm({ user, onClose, onSuccess }) {
  const [f, setF] = useState({ from_city: "", to_city: "", required_date: "", weight_tons: "", cargo_type: "", budget: "", urgency: "flexible", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = k => v => setF(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!f.from_city || !f.to_city || !f.required_date || !f.weight_tons || !f.budget) { setError("Please fill in all required fields."); return; }
    setLoading(true); setError("");
    try {
      await supa("cargo_requests", {
        method: "POST",
        body: JSON.stringify({ ...f, user_id: user.id, shipper_name: user.full_name, shipper_phone: user.phone, status: "open", weight_tons: Number(f.weight_tons), budget: Number(f.budget) }),
      });
      onSuccess("Cargo request posted!");
      onClose();
    } catch (e) { setError("Failed to post cargo. Please try again."); }
    setLoading(false);
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Pickup City *" value={f.from_city} onChange={upd("from_city")} placeholder="e.g. Durban Port" />
        <Input label="Delivery City *" value={f.to_city} onChange={upd("to_city")} placeholder="e.g. Pretoria" />
        <Input label="Date Needed *" type="date" value={f.required_date} onChange={upd("required_date")} />
        <Input label="Weight (tons) *" type="number" value={f.weight_tons} onChange={upd("weight_tons")} placeholder="e.g. 5" />
      </div>
      <Input label="Cargo Type *" value={f.cargo_type} onChange={upd("cargo_type")} placeholder="e.g. Perishables, Furniture, Machinery" />
      <Input label="Your Budget (ZAR total) *" type="number" value={f.budget} onChange={upd("budget")} placeholder="e.g. 25000" />
      <Select label="Urgency" value={f.urgency} onChange={upd("urgency")} options={[
        { value: "flexible", label: "Flexible — within a few days" },
        { value: "urgent", label: "⚡ Urgent — same day / next day" },
        { value: "fixed", label: "Fixed date — exact date required" },
      ]} />
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", color: C.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Description</label>
        <textarea value={f.description} onChange={e => upd("description")(e.target.value)} rows={3} placeholder="Describe your cargo, fragile items, special handling needed..." style={{ width: "100%", background: C.navy, border: `1px solid ${C.navyBorder}`, borderRadius: 8, padding: "11px 14px", color: C.white, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'Barlow', sans-serif" }} />
      </div>
      {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <Btn onClick={submit} fullWidth disabled={loading}>{loading ? "Posting..." : "Post My Cargo →"}</Btn>
    </>
  );
}

// ─── BOOKING MODAL ─────────────────────────────────────────────────
function BookingModal({ route, user, onClose, onSuccess }) {
  const [tons, setTons] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const totalFreight = Number(tons) * route.price_per_ton;
  const commission = Math.round(totalFreight * COMMISSION);
  const truckerPayout = totalFreight - commission;

  const submit = async () => {
    setLoading(true);
    try {
      await supa("bookings", {
        method: "POST",
        body: JSON.stringify({
          route_id: route.id, shipper_id: user.id, trucker_id: route.user_id,
          shipper_name: user.full_name, trucker_name: route.trucker_name,
          from_city: route.from_city, to_city: route.to_city,
          departure_date: route.departure_date, tons_booked: Number(tons),
          price_per_ton: route.price_per_ton, total_freight: totalFreight,
          commission_amount: commission, trucker_payout: truckerPayout,
          shipper_notes: notes, status: "pending_payment",
          payment_status: "pending",
        }),
      });
      onSuccess("Booking created! Proceed to payment.");
      onClose();
    } catch (e) { alert("Booking failed. Please try again."); }
    setLoading(false);
  };

  return (
    <>
      <div style={{ background: C.navy, borderRadius: 10, padding: 16, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 14 }}>
          <div><span style={{ color: C.muted }}>Trucker:</span><br /><span style={{ color: C.white, fontWeight: 600 }}>{route.trucker_name}</span></div>
          <div><span style={{ color: C.muted }}>Route:</span><br /><span style={{ color: C.white, fontWeight: 600 }}>{route.from_city} → {route.to_city}</span></div>
          <div><span style={{ color: C.muted }}>Date:</span><br /><span style={{ color: C.white, fontWeight: 600 }}>{fmtDate(route.departure_date)}</span></div>
          <div><span style={{ color: C.muted }}>Rate:</span><br /><span style={{ color: C.accent, fontWeight: 700 }}>{fmt(route.price_per_ton)}/ton</span></div>
        </div>
      </div>
      <Input label="How many tons do you need?" type="number" value={tons} onChange={setTons} placeholder="e.g. 3" />
      <Input label="Notes for trucker (optional)" value={notes} onChange={setNotes} placeholder="Any special instructions..." />
      <div style={{ borderTop: `1px solid ${C.navyBorder}`, paddingTop: 16, marginBottom: 18 }}>
        {[
          ["Total freight value", fmt(totalFreight), C.white],
          ["TruckMatch SA commission (3.5%)", `– ${fmt(commission)}`, C.orange],
          ["Trucker receives", fmt(truckerPayout), C.green],
        ].map(([label, val, color]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
            <span style={{ color: C.muted }}>{label}</span>
            <span style={{ color, fontWeight: 700 }}>{val}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.navyBorder}` }}>
          <span style={{ color: C.white }}>You pay to trucker</span>
          <span style={{ color: C.white }}>{fmt(totalFreight)}</span>
        </div>
        <div style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>Commission is deducted from trucker's payout automatically via PayFast.</div>
      </div>
      <Btn onClick={submit} fullWidth disabled={loading}>{loading ? "Creating booking..." : `Confirm Booking → Pay ${fmt(totalFreight)}`}</Btn>
      <div style={{ marginTop: 10 }}>
        <Btn onClick={onClose} fullWidth outline color={C.muted}>Cancel</Btn>
      </div>
    </>
  );
}

// ─── ROUTE CARD ────────────────────────────────────────────────────
function RouteCard({ route, user, onBook, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isOwner = user?.id === route.user_id;
  return (
    <div style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 14, padding: 20, marginBottom: 14, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.navyBorder}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Avatar name={route.trucker_name || "T"} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: C.white, fontFamily: "'Barlow', sans-serif" }}>{route.trucker_name}</span>
            <Badge color={C.green}>✓ Active</Badge>
            {route.truck_type && <Badge color={C.accent}>{route.truck_type}</Badge>}
          </div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>{route.trucker_phone}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: C.accent, fontWeight: 800, fontSize: 24, fontFamily: "'Barlow Condensed', sans-serif" }}>{fmt(route.price_per_ton)}</div>
          <div style={{ color: C.muted, fontSize: 12 }}>per ton</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16, background: C.navy, borderRadius: 8, padding: 14 }}>
        <div>
          <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Route</div>
          <div style={{ color: C.white, fontWeight: 600, fontSize: 14, marginTop: 3 }}>{route.from_city} → {route.to_city}</div>
        </div>
        <div>
          <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Departure</div>
          <div style={{ color: C.white, fontWeight: 600, fontSize: 14, marginTop: 3 }}>{fmtDate(route.departure_date)}{route.departure_time ? ` @ ${route.departure_time}` : ""}</div>
        </div>
        <div>
          <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Space Available</div>
          <div style={{ color: C.green, fontWeight: 700, fontSize: 14, marginTop: 3 }}>{route.available_tons} tons</div>
        </div>
      </div>
      {route.special_tags && (
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {route.special_tags.split(",").map(t => <Badge key={t} color={C.navyLight}>{t.trim()}</Badge>)}
        </div>
      )}
      {expanded && route.notes && (
        <div style={{ marginTop: 12, background: C.navy, borderRadius: 8, padding: 12, color: C.muted, fontSize: 13 }}>{route.notes}</div>
      )}
      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <Btn small outline color={C.muted} onClick={() => setExpanded(!expanded)}>{expanded ? "Less ▲" : "Details ▼"}</Btn>
        {isOwner ? (
          <Btn small color={C.red} outline onClick={() => onDelete(route.id)}>Delete Route</Btn>
        ) : (
          <button onClick={() => onBook(route)} style={{ flex: 1, background: C.accent, border: "none", color: "#fff", borderRadius: 8, padding: "9px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
            Book This Space →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── CARGO CARD ────────────────────────────────────────────────────
function CargoCard({ cargo, user, onContact, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isOwner = user?.id === cargo.user_id;
  const urgencyColor = cargo.urgency === "urgent" ? C.red : cargo.urgency === "fixed" ? C.orange : C.green;
  return (
    <div style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 14, padding: 20, marginBottom: 14, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.navyBorder}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Avatar name={cargo.shipper_name || "S"} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: C.white, fontFamily: "'Barlow', sans-serif" }}>{cargo.shipper_name}</span>
            <Badge color={urgencyColor}>{cargo.urgency === "urgent" ? "⚡ Urgent" : cargo.urgency === "fixed" ? "📅 Fixed Date" : "✓ Flexible"}</Badge>
          </div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>{cargo.cargo_type}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: C.green, fontWeight: 800, fontSize: 24, fontFamily: "'Barlow Condensed', sans-serif" }}>{fmt(cargo.budget)}</div>
          <div style={{ color: C.muted, fontSize: 12 }}>budget</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16, background: C.navy, borderRadius: 8, padding: 14 }}>
        <div>
          <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Route</div>
          <div style={{ color: C.white, fontWeight: 600, fontSize: 14, marginTop: 3 }}>{cargo.from_city} → {cargo.to_city}</div>
        </div>
        <div>
          <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Date Needed</div>
          <div style={{ color: C.white, fontWeight: 600, fontSize: 14, marginTop: 3 }}>{fmtDate(cargo.required_date)}</div>
        </div>
        <div>
          <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Weight</div>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 14, marginTop: 3 }}>{cargo.weight_tons} tons</div>
        </div>
      </div>
      {expanded && cargo.description && (
        <div style={{ marginTop: 12, background: C.navy, borderRadius: 8, padding: 12, color: C.muted, fontSize: 13 }}>{cargo.description}</div>
      )}
      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <Btn small outline color={C.muted} onClick={() => setExpanded(!expanded)}>{expanded ? "Less ▲" : "Details ▼"}</Btn>
        {isOwner ? (
          <Btn small color={C.red} outline onClick={() => onDelete(cargo.id)}>Delete</Btn>
        ) : (
          <button onClick={() => onContact(cargo)} style={{ flex: 1, background: C.gold, border: "none", color: C.navy, borderRadius: 8, padding: "9px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
            Contact Shipper →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MY BOOKINGS ───────────────────────────────────────────────────
function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await supa(`bookings?or=(shipper_id.eq.${user.id},trucker_id.eq.${user.id})&order=created_at.desc&select=*`);
        setBookings(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchBookings();
  }, [user.id]);

  if (loading) return <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading bookings...</div>;
  if (!bookings.length) return (
    <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 16 }}>No bookings yet</div>
    </div>
  );

  return (
    <div>
      {bookings.map(b => (
        <div key={b.id} style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 16 }}>{b.from_city} → {b.to_city}</div>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{fmtDate(b.departure_date)} · {b.tons_booked} tons · {b.shipper_id === user.id ? `Trucker: ${b.trucker_name}` : `Shipper: ${b.shipper_name}`}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: C.accent, fontWeight: 800, fontSize: 20 }}>{fmt(b.total_freight)}</div>
              <Badge color={b.status === "confirmed" ? C.green : b.status === "pending_payment" ? C.orange : C.muted}>
                {b.status?.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
          {b.shipper_id === user.id && b.status === "pending_payment" && (
            <div style={{ marginTop: 12, padding: 12, background: C.navy, borderRadius: 8, fontSize: 13, color: C.muted }}>
              💳 <strong style={{ color: C.white }}>Payment pending.</strong> PayFast integration coming soon — your trucker has been notified.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, routes: 0, cargo: 0, bookings: 0, revenue: 0 });
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [u, r, c, b] = await Promise.all([
          supa("profiles?select=*"),
          supa("truck_routes?select=*"),
          supa("cargo_requests?select=*"),
          supa("bookings?select=*&order=created_at.desc"),
        ]);
        const revenue = b.reduce((acc, bk) => acc + (bk.commission_amount || 0), 0);
        setStats({ users: u.length, routes: r.length, cargo: c.length, bookings: b.length, revenue });
        setBookings(b);
        setUsers(u);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading admin data...</div>;

  return (
    <div>
      <div style={{ marginBottom: 20, padding: "12px 16px", background: C.navyLight, borderRadius: 10, borderLeft: `4px solid ${C.gold}` }}>
        <span style={{ color: C.gold, fontWeight: 700 }}>👑 Admin View</span>
        <span style={{ color: C.muted, fontSize: 13, marginLeft: 8 }}>Only visible to muhammedsaadmahomed@gmail.com</span>
      </div>

      {/* Sub tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["overview", "bookings", "users"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? C.accent : C.navyMid, border: `1px solid ${tab === t ? C.accent : C.navyBorder}`,
            color: tab === t ? "#fff" : C.muted, borderRadius: 8, padding: "8px 18px",
            cursor: "pointer", fontWeight: 700, fontSize: 13, textTransform: "capitalize",
            fontFamily: "'Barlow', sans-serif",
          }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
            <StatCard icon="💰" label="Total Commission Earned" value={fmt(stats.revenue)} color={C.green} />
            <StatCard icon="📋" label="Total Bookings" value={stats.bookings} color={C.accent} />
            <StatCard icon="🚛" label="Active Routes" value={stats.routes} color={C.gold} />
            <StatCard icon="👥" label="Registered Users" value={stats.users} color="#A855F7" />
          </div>
          <div style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 12, padding: 16 }}>
            <div style={{ color: C.white, fontWeight: 700, marginBottom: 12 }}>Revenue Breakdown</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: C.muted }}>Cargo requests posted</span>
              <span style={{ color: C.white, fontWeight: 600 }}>{stats.cargo}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: C.muted }}>Avg commission per booking</span>
              <span style={{ color: C.green, fontWeight: 600 }}>{stats.bookings ? fmt(Math.round(stats.revenue / stats.bookings)) : "R0"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.muted }}>Projected monthly (×30)</span>
              <span style={{ color: C.accent, fontWeight: 700 }}>{fmt(stats.revenue * 30)}</span>
            </div>
          </div>
        </>
      )}

      {tab === "bookings" && (
        <div>
          {bookings.length === 0 ? <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>No bookings yet</div> : bookings.map(b => (
            <div key={b.id} style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ color: C.white, fontWeight: 600 }}>{b.from_city} → {b.to_city}</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{b.shipper_name} → {b.trucker_name} · {fmtDate(b.departure_date)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.white }}>{fmt(b.total_freight)}</div>
                  <div style={{ color: C.green, fontWeight: 700 }}>+{fmt(b.commission_amount)} commission</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div>
          {users.map(u => (
            <div key={u.id} style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={u.full_name || u.email} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ color: C.white, fontWeight: 600 }}>{u.full_name || "—"}</div>
                <div style={{ color: C.muted, fontSize: 12 }}>{u.email} · {u.phone || "no phone"}</div>
              </div>
              <Badge color={u.role === "trucker" ? C.accent : C.gold}>{u.role === "trucker" ? "🚛 Trucker" : "📦 Shipper"}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("marketplace");
  const [routes, setRoutes] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [marketTab, setMarketTab] = useState("routes");
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        supa("truck_routes?status=eq.active&order=created_at.desc&select=*"),
        supa("cargo_requests?status=eq.open&order=created_at.desc&select=*"),
      ]);
      setRoutes(r);
      setCargos(c);
    } catch (e) { console.error("Load error:", e); }
    setLoading(false);
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const deleteRoute = async (id) => {
    if (!confirm("Delete this route?")) return;
    await supa(`truck_routes?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" });
    loadData(); showToast("Route deleted.");
  };

  const deleteCargo = async (id) => {
    if (!confirm("Delete this cargo request?")) return;
    await supa(`cargo_requests?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" });
    loadData(); showToast("Cargo request deleted.");
  };

  const filteredRoutes = routes.filter(r =>
    (!searchFrom || r.from_city?.toLowerCase().includes(searchFrom.toLowerCase())) &&
    (!searchTo || r.to_city?.toLowerCase().includes(searchTo.toLowerCase()))
  );
  const filteredCargos = cargos.filter(c =>
    (!searchFrom || c.from_city?.toLowerCase().includes(searchFrom.toLowerCase())) &&
    (!searchTo || c.to_city?.toLowerCase().includes(searchTo.toLowerCase()))
  );

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!user) return <AuthScreen onAuth={u => { setUser(u); }} />;

  const navItems = [
    { id: "marketplace", icon: "🏠", label: "Marketplace" },
    { id: "bookings", icon: "📋", label: "My Bookings" },
    { id: "profile", icon: "👤", label: "Profile" },
    ...(isAdmin ? [{ id: "admin", icon: "👑", label: "Admin" }] : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.navy}; font-family: 'Barlow', sans-serif; }
        input, select, textarea { color-scheme: dark; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.navy}; }
        ::-webkit-scrollbar-thumb { background: ${C.navyBorder}; border-radius: 3px; }
      `}</style>

      {/* Top Nav */}
      <div style={{ background: C.navyMid, borderBottom: `1px solid ${C.navyBorder}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🚛</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: C.white, letterSpacing: "0.04em" }}>
            TRUCK<span style={{ color: C.accent }}>MATCH</span> SA
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={user.full_name || user.email} size={34} />
          <span style={{ color: C.muted, fontSize: 13, display: "none" }}>{user.full_name}</span>
          <button onClick={() => setUser(null)} style={{ background: "none", border: `1px solid ${C.navyBorder}`, color: C.muted, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 80px" }}>

        {/* Page Nav */}
        <div style={{ display: "flex", gap: 4, padding: "14px 0", overflowX: "auto" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              background: page === n.id ? C.accent : "transparent",
              border: `1px solid ${page === n.id ? C.accent : C.navyBorder}`,
              color: page === n.id ? "#fff" : C.muted,
              borderRadius: 8, padding: "8px 16px", cursor: "pointer",
              fontWeight: 600, fontSize: 13, whiteSpace: "nowrap",
              fontFamily: "'Barlow', sans-serif",
            }}>{n.icon} {n.label}</button>
          ))}
        </div>

        {/* ── MARKETPLACE ─────────────────────────────────── */}
        {page === "marketplace" && (
          <>
            {/* Hero banner */}
            <div style={{ background: `linear-gradient(135deg, ${C.navyLight} 0%, ${C.navyMid} 100%)`, border: `1px solid ${C.navyBorder}`, borderRadius: 14, padding: "24px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: 0.06 }}>🚛</div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: C.white, marginBottom: 6 }}>
                Fill Every Load.<br /><span style={{ color: C.accent }}>Eliminate Empty Trips.</span>
              </h2>
              <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Connect with truckers and shippers across South Africa.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {user.role === "trucker" || isAdmin ? (
                  <Btn onClick={() => setModal("postRoute")}>+ Post My Route</Btn>
                ) : null}
                {user.role === "shipper" || isAdmin ? (
                  <Btn color={C.gold} onClick={() => setModal("postCargo")}>+ Post My Cargo</Btn>
                ) : null}
                {user.role === "trucker" && (
                  <Btn outline color={C.gold} onClick={() => setModal("postCargo")}>+ Post Cargo Too</Btn>
                )}
                {user.role === "shipper" && (
                  <Btn outline onClick={() => setModal("postRoute")}>+ Post Route Too</Btn>
                )}
              </div>
            </div>

            {/* Search */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <input value={searchFrom} onChange={e => setSearchFrom(e.target.value)} placeholder="🔍 From city..." style={{ width: "100%", background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 8, padding: "10px 14px", color: C.white, fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <input value={searchTo} onChange={e => setSearchTo(e.target.value)} placeholder="📍 To city..." style={{ width: "100%", background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 8, padding: "10px 14px", color: C.white, fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={loadData} style={{ background: C.accent, border: "none", color: "#fff", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Refresh</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 18, background: C.navyMid, padding: 4, borderRadius: 10, border: `1px solid ${C.navyBorder}`, width: "fit-content" }}>
              {[
                { id: "routes", label: `🚛 Available Routes (${filteredRoutes.length})` },
                { id: "cargo", label: `📦 Cargo Requests (${filteredCargos.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setMarketTab(t.id)} style={{
                  background: marketTab === t.id ? (t.id === "routes" ? C.accent : C.gold) : "transparent",
                  border: "none", color: marketTab === t.id ? (t.id === "routes" ? "#fff" : C.navy) : C.muted,
                  borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13,
                  fontFamily: "'Barlow', sans-serif",
                }}>{t.label}</button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: C.muted }}>Loading listings...</div>
            ) : marketTab === "routes" ? (
              filteredRoutes.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🚛</div>
                  <div>No routes found. Be the first to post one!</div>
                </div>
              ) : filteredRoutes.map(r => (
                <RouteCard key={r.id} route={r} user={user} onBook={route => { setSelectedRoute(route); setModal("booking"); }} onDelete={deleteRoute} />
              ))
            ) : (
              filteredCargos.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                  <div>No cargo requests yet. Post yours!</div>
                </div>
              ) : filteredCargos.map(c => (
                <CargoCard key={c.id} cargo={c} user={user} onContact={cargo => { setSelectedCargo(cargo); setModal("contact"); }} onDelete={deleteCargo} />
              ))
            )}
          </>
        )}

        {/* ── BOOKINGS ────────────────────────────────────── */}
        {page === "bookings" && (
          <>
            <h2 style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 18 }}>My Bookings</h2>
            <MyBookings user={user} />
          </>
        )}

        {/* ── PROFILE ─────────────────────────────────────── */}
        {page === "profile" && (
          <div>
            <h2 style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 20 }}>My Profile</h2>
            <div style={{ background: C.navyMid, border: `1px solid ${C.navyBorder}`, borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <Avatar name={user.full_name || user.email} size={64} />
                <div>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 20, fontFamily: "'Barlow Condensed', sans-serif" }}>{user.full_name || "—"}</div>
                  <div style={{ color: C.muted, fontSize: 14 }}>{user.email}</div>
                  <div style={{ marginTop: 6 }}><Badge color={user.role === "trucker" ? C.accent : C.gold}>{user.role === "trucker" ? "🚛 Trucker" : "📦 Shipper"}</Badge></div>
                </div>
              </div>
              {[
                ["Email", user.email],
                ["Phone", user.phone || "Not provided"],
                ["Account type", user.role === "trucker" ? "Trucker" : "Shipper"],
                ["Member since", user.created_at ? fmtDate(user.created_at) : "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.navyBorder}`, fontSize: 14 }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ color: C.white, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: 16, background: C.navy, borderRadius: 10 }}>
                <div style={{ color: C.gold, fontWeight: 700, marginBottom: 8 }}>💳 PayFast Integration</div>
                <div style={{ color: C.muted, fontSize: 13 }}>Your PayFast merchant account is being verified. Once approved, all commission payments will be processed automatically.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN ───────────────────────────────────────── */}
        {page === "admin" && isAdmin && (
          <>
            <h2 style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 18 }}>Admin Dashboard</h2>
            <AdminDashboard />
          </>
        )}
      </div>

      {/* ── MODALS ──────────────────────────────────────── */}
      {modal === "postRoute" && (
        <Modal title="Post Your Truck Route" onClose={() => setModal(null)}>
          <PostRouteForm user={user} onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadData(); }} />
        </Modal>
      )}
      {modal === "postCargo" && (
        <Modal title="Post Your Cargo Request" onClose={() => setModal(null)}>
          <PostCargoForm user={user} onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); loadData(); }} />
        </Modal>
      )}
      {modal === "booking" && selectedRoute && (
        <Modal title="Confirm Booking" onClose={() => setModal(null)}>
          <BookingModal route={selectedRoute} user={user} onClose={() => setModal(null)} onSuccess={msg => { showToast(msg); setPage("bookings"); }} />
        </Modal>
      )}
      {modal === "contact" && selectedCargo && (
        <Modal title="Contact Shipper" onClose={() => setModal(null)}>
          <div style={{ fontSize: 14 }}>
            <div style={{ background: C.navy, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{selectedCargo.shipper_name}</div>
              {[
                ["Route", `${selectedCargo.from_city} → ${selectedCargo.to_city}`],
                ["Date needed", fmtDate(selectedCargo.required_date)],
                ["Weight", `${selectedCargo.weight_tons} tons`],
                ["Budget", fmt(selectedCargo.budget)],
                ["Cargo type", selectedCargo.cargo_type],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ color: C.white, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            {selectedCargo.description && (
              <div style={{ background: C.navy, borderRadius: 8, padding: 12, marginBottom: 16, color: C.muted, fontSize: 13 }}>{selectedCargo.description}</div>
            )}
            <div style={{ background: C.navyLight, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ color: C.gold, fontWeight: 700, marginBottom: 6 }}>📞 Shipper Contact</div>
              <div style={{ color: C.white, fontSize: 16, fontWeight: 700 }}>{selectedCargo.shipper_phone || "Contact via app messaging (coming soon)"}</div>
            </div>
            <Btn onClick={() => setModal(null)} fullWidth>Close</Btn>
          </div>
        </Modal>
      )}

      <Toast msg={toast.msg} type={toast.type} />
    </>
  );
}

