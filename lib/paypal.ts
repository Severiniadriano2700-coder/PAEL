// Conexión con la API de PayPal desde el servidor.
// Nunca confiamos en lo que dice el navegador sobre si un pago se
// completó — siempre lo volvemos a comprobar aquí, con las claves
// secretas, antes de guardar nada como "pagado".

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"; // sandbox = modo de pruebas, sin dinero real

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("No se pudo autenticar con PayPal");
  const data = await res.json();
  return data.access_token;
}

// Comprueba en los servidores de PayPal que un pedido (order) existe,
// está completado ("COMPLETED") y que el importe coincide con el
// precio real que esperábamos cobrar (evita que alguien manipule el
// precio desde el navegador).
export async function verifyPayPalOrder(orderId: string, expectedAmount: number) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Pedido de PayPal no encontrado");
  const order = await res.json();

  const paidAmount = parseFloat(order?.purchase_units?.[0]?.amount?.value ?? "0");
  const isCompleted = order.status === "COMPLETED";
  const amountMatches = Math.abs(paidAmount - expectedAmount) < 0.01;

  return { valid: isCompleted && amountMatches, order };
}
