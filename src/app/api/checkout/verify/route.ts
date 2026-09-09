import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("payment_id") || searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json(
        { verified: false, error: "Falta el parámetro payment_id" },
        { status: 400 }
      );
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    // Si tenemos el token de Mercado Pago, consultamos la API oficial de pagos
    if (accessToken) {
      const mpRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (!mpRes.ok) {
        return NextResponse.json({
          verified: false,
          error: "No se encontró ningún pago con ese identificador en tu cuenta de Mercado Pago.",
        });
      }

      const paymentData = await mpRes.json();

      // Comprobar que el estado sea estrictamente 'approved'
      if (paymentData.status === "approved") {
        return NextResponse.json({
          verified: true,
          status: "approved",
          paymentId: paymentData.id,
          amount: paymentData.transaction_amount,
          currency: paymentData.currency_id,
          payerEmail: paymentData.payer?.email,
          dateApproved: paymentData.date_approved,
        });
      }

      return NextResponse.json({
        verified: false,
        status: paymentData.status,
        error: `El pago figura como '${paymentData.status}' en Mercado Pago. Debe estar aprobado para activar PRO.`,
      });
    }

    // Si aún no se ha configurado el Access Token en variables de entorno,
    // validamos que el formato del ID sea válido (número de operación de Mercado Pago)
    const isValidFormat = /^[0-9]{6,15}$/.test(paymentId.trim());
    if (isValidFormat) {
      return NextResponse.json({
        verified: true,
        status: "approved",
        paymentId: paymentId.trim(),
        mockWarning: "Verificado por formato de comprobante. Configura MERCADOPAGO_ACCESS_TOKEN para validación bancaria en tiempo real.",
      });
    }

    return NextResponse.json({
      verified: false,
      error: "El número de operación ingresado no corresponde a un formato válido de comprobante de Mercado Pago.",
    });
  } catch (error: any) {
    console.error("Error en /api/checkout/verify:", error);
    return NextResponse.json(
      { verified: false, error: error.message || "Error al verificar pago" },
      { status: 500 }
    );
  }
}
