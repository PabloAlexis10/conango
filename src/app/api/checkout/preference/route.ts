import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, userId, userEmail } = body;

    const isYearly = plan === "yearly";
    const title = isYearly
      ? "Conan PRO - Plan Anual (Vidas Infinitas & Sin Ads)"
      : "Conan PRO - Plan Mensual (Vidas Infinitas & Sin Ads)";
    const price = isYearly ? 39900 : 4990;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    // Si el usuario configuró su Access Token de Mercado Pago, generamos el Checkout Pro oficial
    if (accessToken) {
      const origin =
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://conango.vercel.app";

      const mpResponse = await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                id: `conan-pro-${plan}`,
                title: title,
                description: "Suscripción oficial a Conan PRO para preparación ALCPT militar.",
                picture_url: `${origin}/conan-mascot.png`,
                quantity: 1,
                unit_price: price,
                currency_id: "CLP",
              },
            ],
            payer: {
              email: userEmail || "piloto@conango.com",
            },
            back_urls: {
              success: `${origin}/?payment=success&gateway=mercadopago&plan=${plan}`,
              pending: `${origin}/?payment=pending&gateway=mercadopago&plan=${plan}`,
              failure: `${origin}/?payment=failure&gateway=mercadopago&plan=${plan}`,
            },
            auto_return: "approved",
            statement_descriptor: "CONANGO",
            external_reference: userId || `USER-${Date.now()}`,
          }),
        }
      );

      if (mpResponse.ok) {
        const data = await mpResponse.json();
        return NextResponse.json({
          success: true,
          initPoint: data.init_point,
          preferenceId: data.id,
        });
      }

      console.error("Error al crear preferencia en Mercado Pago:", await mpResponse.text());
    }

    // Fallback: usar el link oficial de cobro configurado
    const fallbackUrl =
      process.env.NEXT_PUBLIC_MP_MONTHLY_URL ||
      "https://link.mercadopago.cl/conango";

    return NextResponse.json({
      success: true,
      initPoint: fallbackUrl,
      fallback: true,
    });
  } catch (error: any) {
    console.error("Error en /api/checkout/preference:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al procesar pago" },
      { status: 500 }
    );
  }
}
