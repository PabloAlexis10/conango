import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      plan,
      type = "pro",
      itemId,
      potionId,
      packId,
      gemsCount,
      title: customTitle,
      priceClp: customPrice,
      userId,
      userEmail,
    } = body;

    let title = "ConanGo - Adquisición Táctica";
    let description = "Compra oficial en ConanGo para preparación militar ALCPT.";
    let price = 990;
    let successUrlParam = "";

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://conango.vercel.app";

    if (type === "diamonds") {
      title = customTitle || `Pack de ${gemsCount || 150} Diamantes Tácticos`;
      description = `Adquisición de ${gemsCount || 150} diamantes para adquirir pociones y potenciadores en ConanGo.`;
      price = customPrice || 990;
      successUrlParam = `${origin}/shop?payment=success&type=diamonds&gems=${gemsCount || 150}&packId=${packId || itemId || "diamonds"}`;
    } else if (type === "potion") {
      title = customTitle || "Poción Mágica Táctica";
      description = "Poción mágica oficial de ConanGo para entrenamiento ALCPT.";
      price = customPrice || 990;
      successUrlParam = `${origin}/shop?payment=success&type=potion&itemId=${potionId || itemId || "potion"}`;
    } else {
      // Suscripción Conan PRO
      const isYearly = plan === "yearly";
      title = isYearly
        ? "Conan PRO - Plan Anual (Vidas Infinitas & Sin Ads)"
        : "Conan PRO - Plan Mensual (Vidas Infinitas & Sin Ads)";
      price = isYearly ? 39900 : 4990;
      description = "Suscripción oficial a Conan PRO para preparación ALCPT militar.";
      successUrlParam = `${origin}/?payment=success&gateway=mercadopago&plan=${plan || "monthly"}`;
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    // Si el usuario configuró su Access Token de Mercado Pago, generamos el Checkout Pro oficial
    if (accessToken) {
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
                id: itemId || potionId || packId || `conan-pro-${plan || "sub"}`,
                title: title,
                description: description,
                picture_url: `${origin}/conan-mascot.png`,
                quantity: 1,
                unit_price: price,
                currency_id: "CLP",
              },
            ],
            payer: {
              email: userEmail || "usuario@conango.com",
            },
            back_urls: {
              success: successUrlParam,
              pending: `${origin}/shop?payment=pending`,
              failure: `${origin}/shop?payment=failure`,
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
