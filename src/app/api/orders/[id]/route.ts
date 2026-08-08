import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { getAuthPayload } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const payload = await getAuthPayload();

    // Fetch the order first to verify ownership
    const order = await OrderModel.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Branch scoping validation
    if (payload && payload.role === "waiter") {
      const waitRestId = payload.restaurantId || "default-restaurant";
      const waitBranchId = payload.branchId || "default-branch";
      if (order.restaurantId !== waitRestId || order.branchId !== waitBranchId) {
        return NextResponse.json({ error: "You are not authorized to access this branch." }, { status: 403 });
      }
    }

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
    const payload = await getAuthPayload();

    const order = await OrderModel.findOne({ id });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Branch scoping validation
    if (payload && payload.role === "waiter") {
      const waitRestId = payload.restaurantId || "default-restaurant";
      const waitBranchId = payload.branchId || "default-branch";
      if (order.restaurantId !== waitRestId || order.branchId !== waitBranchId) {
        return NextResponse.json({ error: "You are not authorized to access this branch." }, { status: 403 });
      }
    }

    await OrderModel.deleteOne({ id });
    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("Delete order API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
