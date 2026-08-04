import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Fetch orders API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      tableNumber,
      customerName,
      notes,
      items,
      subtotal,
      gst,
      total,
      waiter,
      paymentId,
      paymentOrderId,
      paymentSignature,
    } = body;
    
    if (tableNumber === undefined || !customerName || !items || !waiter) {
      return NextResponse.json(
        { error: "Table number, customer name, items, and waiter are required." },
        { status: 400 }
      );
    }

    // Determine the next ORD-XXXX sequential order ID
    const lastOrder = await OrderModel.findOne().sort({ createdAt: -1 });
    let nextIdNum = 1043;
    if (lastOrder && lastOrder.id) {
      const match = lastOrder.id.match(/ORD-(\d+)/);
      if (match) {
        nextIdNum = parseInt(match[1], 10) + 1;
      }
    }
    const orderId = `ORD-${nextIdNum}`;

    const newOrder = await OrderModel.create({
      id: orderId,
      tableNumber: Number(tableNumber),
      customerName: customerName.trim(),
      notes: (notes || "").trim(),
      items,
      subtotal: Number(subtotal),
      gst: Number(gst),
      total: Number(total),
      status: "pending",
      waiter: waiter.trim(),
      createdAt: Date.now(),
      paymentId: paymentId || "",
      paymentOrderId: paymentOrderId || "",
      paymentSignature: paymentSignature || "",
      paymentStatus: paymentId ? "paid" : "pending",
    });

    return NextResponse.json(newOrder);
  } catch (error: any) {
    console.error("Create order API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
