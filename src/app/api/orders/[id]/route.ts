import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const body = await request.json();
    
    const updateObj: any = {};
    if (body.status !== undefined) updateObj.status = body.status;
    if (body.paymentStatus !== undefined) updateObj.paymentStatus = body.paymentStatus;
    if (body.paymentId !== undefined) updateObj.paymentId = body.paymentId;
    if (body.paymentOrderId !== undefined) updateObj.paymentOrderId = body.paymentOrderId;
    if (body.paymentSignature !== undefined) updateObj.paymentSignature = body.paymentSignature;
    if (body.items !== undefined) updateObj.items = body.items;
    if (body.subtotal !== undefined) updateObj.subtotal = body.subtotal;
    if (body.gst !== undefined) updateObj.gst = body.gst;
    if (body.total !== undefined) updateObj.total = body.total;
    if (body.notes !== undefined) updateObj.notes = body.notes;
    
    if (Object.keys(updateObj).length === 0) {
      return NextResponse.json({ error: "No fields provided to update." }, { status: 400 });
    }
    
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { id },
      { $set: updateObj },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deletedOrder = await OrderModel.findOneAndDelete({ id });
    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("Delete order API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
