"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PRICES = { LEAGUE: 70, TOURNAMENT: 29.99 } as const;

type CompetitionType = keyof typeof PRICES;

export default function RegistrationForm() {
  const [competitionType, setCompetitionType] = useState<CompetitionType>("LEAGUE");
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainContact, setCaptainContact] = useState("");
  const [players, setPlayers] = useState<string[]>(["", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "paying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const price = PRICES[competitionType];
  const validPlayers = players.map((p) => p.trim()).filter(Boolean);
  const rosterValid = validPlayers.length >= 5 && validPlayers.length <= 6;
  const formValid =
    teamName.trim() && captainName.trim() && captainContact.trim() && rosterValid && acceptedTerms;

  function updatePlayer(index: number, value: string) {
    setPlayers((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  function addPlayerSlot() {
    if (players.length < 6) setPlayers((prev) => [...prev, ""]);
  }

  function removePlayerSlot(index: number) {
    if (players.length > 5) setPlayers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleApprove(orderId: string) {
    setStatus("paying");
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionType,
          teamName,
          captainName,
          captainContact,
          playerNames: validPlayers,
          paypalOrderId: orderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la inscripción.");
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  if (status === "success") {
    return (
      <div style={card}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontWeight: 900, fontSize: 20, textTransform: "uppercase", margin: 0 }}>
          Inscripción recibida
        </h2>
        <p style={{ color: "#9A999F", marginTop: 10, lineHeight: 1.5 }}>
          Hemos recibido el pago de <strong>{teamName}</strong>. La revisaremos y, en cuanto la confirmemos
          (normalmente en menos de 24h), te enviaremos por Discord el código del canal privado de tu equipo.
        </p>
      </div>
    );
  }

  return (
    <div style={card}>
      <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase", margin: 0 }}>
        Inscribe tu <span style={{ color: "#C9A227" }}>equipo</span>
      </h1>
      <p style={{ color: "#9A999F", fontSize: 13, marginTop: 6, marginBottom: 24 }}>
        Rellena los datos de tu equipo. El pago se hace con PayPal y tu plaza queda confirmada en cuanto la revisemos.
      </p>

      {/* Selector de competición */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {(["LEAGUE", "TOURNAMENT"] as CompetitionType[]).map((type) => (
          <button
            key={type}
            onClick={() => setCompetitionType(type)}
            style={{
              flex: 1,
              padding: "14px 12px",
              borderRadius: 8,
              border: `1px solid ${competitionType === type ? "#C9A227" : "#242327"}`,
              backgroundColor: competitionType === type ? "#151109" : "#0A0A0B",
              color: competitionType === type ? "#C9A227" : "#F2F1ED",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase" }}>
              {type === "LEAGUE" ? "Liga (1,5 meses)" : "Torneo de fin de semana"}
            </div>
            <div style={{ fontSize: 12, color: "#9A999F", marginTop: 2 }}>
              {PRICES[type]}€ por equipo
            </div>
          </button>
        ))}
      </div>

      <Field label="Nombre del equipo" value={teamName} onChange={setTeamName} placeholder="ej. Wolves" />
      <Field label="Tu nombre (capitán)" value={captainName} onChange={setCaptainName} placeholder="ej. Adriano Severini" />
      <Field
        label="Tu contacto (Discord o email)"
        value={captainContact}
        onChange={setCaptainContact}
        placeholder="ej. adriano#1234 o tu@email.com"
      />

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={labelStyle}>Jugadores del equipo (5 o 6)</label>
          {players.length < 6 && (
            <button onClick={addPlayerSlot} style={smallBtn}>+ Añadir jugador</button>
          )}
        </div>
        {players.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input
              value={p}
              onChange={(e) => updatePlayer(i, e.target.value)}
              placeholder={`Jugador ${i + 1}`}
              style={{ ...inputStyle, flex: 1 }}
            />
            {players.length > 5 && (
              <button onClick={() => removePlayerSlot(i)} style={{ ...smallBtn, color: "#D9756E" }}>Quitar</button>
            )}
          </div>
        ))}
        {!rosterValid && (
          <p style={{ fontSize: 11, color: "#D9756E", marginTop: 6 }}>
            Introduce entre 5 y 6 nombres de jugador.
          </p>
        )}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 0", borderTop: "1px solid #242327", marginTop: 16, marginBottom: 16,
      }}>
        <span style={{ fontSize: 13, color: "#9A999F", textTransform: "uppercase", fontWeight: 700 }}>Total a pagar</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#C9A227" }}>{price.toFixed(2)}€</span>
      </div>

      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          style={{ marginTop: 3, accentColor: "#C9A227", width: 15, height: 15, flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: "#9A999F", lineHeight: 1.5 }}>
          He leído y acepto los{" "}
          <a href="/legal/terminos" target="_blank" style={{ color: "#C9A227" }}>términos y condiciones</a>
          {" "}y la{" "}
          <a href="/legal/privacidad" target="_blank" style={{ color: "#C9A227" }}>política de privacidad</a>.
        </span>
      </label>

      {!formValid ? (
        <p style={{ fontSize: 12, color: "#9A999F", textAlign: "center" }}>
          {!acceptedTerms && teamName.trim() && captainName.trim() && captainContact.trim() && rosterValid
            ? "Acepta los términos y condiciones para poder pagar."
            : "Completa todos los campos para poder pagar."}
        </p>
      ) : (
        <PayPalScriptProvider
          options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
            currency: "EUR",
          }}
        >
          <PayPalButtons
            style={{ layout: "vertical", color: "gold", label: "pay" }}
            disabled={status === "paying"}
            createOrder={(_, actions) =>
              actions.order.create({
                intent: "CAPTURE",
                purchase_units: [{ amount: { value: price.toFixed(2), currency_code: "EUR" } }],
              })
            }
            onApprove={async (_, actions) => {
              await actions.order?.capture();
              const orderId = (await actions.order?.get())?.id;
              if (orderId) await handleApprove(orderId);
            }}
          />
        </PayPalScriptProvider>
      )}

      {status === "error" && (
        <p style={{ fontSize: 12, color: "#D9756E", marginTop: 10, textAlign: "center" }}>{errorMsg}</p>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

const card: React.CSSProperties = {
  maxWidth: 480,
  margin: "40px auto",
  backgroundColor: "#0A0A0B",
  border: "1px solid #242327",
  borderRadius: 14,
  padding: 28,
  color: "#F2F1ED",
  fontFamily: "Inter, system-ui, sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: "#9A999F",
  fontWeight: 700,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0D0D0F",
  border: "1px solid #242327",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#F2F1ED",
  fontSize: 13,
  boxSizing: "border-box",
};

const smallBtn: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  background: "none",
  border: "none",
  color: "#C9A227",
  cursor: "pointer",
};
