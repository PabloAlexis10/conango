// Configuración oficial de pagos seguros para ConanGO
// Permite vincular Mercado Pago (Webpay Plus, CuentaRUT, Débito, Crédito) y Stripe
// sin exponer en ningún momento tus datos personales, RUT ni cuenta bancaria al comprador.

export interface PaymentGatewayConfig {
  mercadopago: {
    monthlyUrl: string;
    yearlyUrl: string;
    storeName: string;
  };
  stripe: {
    monthlyUrl: string;
    yearlyUrl: string;
  };
}

export const PAYMENT_CONFIG: PaymentGatewayConfig = {
  mercadopago: {
    // Si tienes tus links de pago creados en mercadopago.cl, puedes colocarlos aquí
    // o definirlos en las variables de entorno de Vercel (NEXT_PUBLIC_MP_MONTHLY_URL y NEXT_PUBLIC_MP_YEARLY_URL)
    monthlyUrl:
      process.env.NEXT_PUBLIC_MP_MONTHLY_URL ||
      "https://www.mercadopago.cl",
    yearlyUrl:
      process.env.NEXT_PUBLIC_MP_YEARLY_URL ||
      "https://www.mercadopago.cl",
    storeName: "ConanGO - Preparación ALCPT Oficial",
  },
  stripe: {
    monthlyUrl:
      process.env.NEXT_PUBLIC_STRIPE_MONTHLY_URL ||
      "https://stripe.com",
    yearlyUrl:
      process.env.NEXT_PUBLIC_STRIPE_YEARLY_URL ||
      "https://stripe.com",
  },
};

/**
 * Obtiene la URL directa de pago para el plan y pasarela seleccionados.
 */
export function getCheckoutUrl(
  gateway: "mercadopago" | "stripe",
  plan: "monthly" | "yearly"
): string {
  if (gateway === "mercadopago") {
    return plan === "yearly"
      ? PAYMENT_CONFIG.mercadopago.yearlyUrl
      : PAYMENT_CONFIG.mercadopago.monthlyUrl;
  }
  return plan === "yearly"
    ? PAYMENT_CONFIG.stripe.yearlyUrl
    : PAYMENT_CONFIG.stripe.monthlyUrl;
}

/**
 * Verifica si los parámetros de la URL actual indican un pago aprobado por Mercado Pago (Webpay) o Stripe.
 * Mercado Pago envía parámetros como:
 * ?collection_status=approved&status=approved&payment_id=XXXXX
 */
export function checkReturnPaymentStatus(): {
  isApproved: boolean;
  gateway: "mercadopago" | "stripe" | null;
  paymentId: string | null;
} {
  if (typeof window === "undefined") {
    return { isApproved: false, gateway: null, paymentId: null };
  }

  const params = new URLSearchParams(window.location.search);

  // Mercado Pago return params
  const mpStatus = params.get("collection_status") || params.get("status");
  const mpPaymentId = params.get("payment_id") || params.get("collection_id");

  if (mpStatus === "approved") {
    return {
      isApproved: true,
      gateway: "mercadopago",
      paymentId: mpPaymentId,
    };
  }

  // Parámetro genérico de éxito configurado en el Link de Pago
  const genericSuccess = params.get("payment");
  if (genericSuccess === "success" || genericSuccess === "approved") {
    return {
      isApproved: true,
      gateway: "mercadopago",
      paymentId: params.get("id") || "SUCCESS-" + Date.now(),
    };
  }

  // Stripe return params (?session_id=cs_live_... o ?stripe_status=success)
  const stripeStatus = params.get("stripe_status");
  const stripeSession = params.get("session_id");
  if (stripeStatus === "success" || (stripeSession && stripeSession.startsWith("cs_"))) {
    return {
      isApproved: true,
      gateway: "stripe",
      paymentId: stripeSession || "STRIPE-" + Date.now(),
    };
  }

  return { isApproved: false, gateway: null, paymentId: null };
}

/**
 * Limpia los parámetros de pago de la URL sin recargar la página
 */
export function clearPaymentQueryParams() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("collection_status");
  url.searchParams.delete("status");
  url.searchParams.delete("payment_id");
  url.searchParams.delete("collection_id");
  url.searchParams.delete("payment");
  url.searchParams.delete("stripe_status");
  url.searchParams.delete("session_id");
  url.searchParams.delete("preference_id");
  window.history.replaceState({}, document.title, url.pathname);
}
