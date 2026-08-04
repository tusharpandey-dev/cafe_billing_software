import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params; // custom sequential ID e.g., 'ORD-1042'
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json({ error: "Order status is required." }, { status: 400 });
    }
    
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    );
    
    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    
    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Update order status API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
