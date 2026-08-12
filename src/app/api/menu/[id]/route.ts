import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { MenuItemModel } from "@/models/MenuItem";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const body = await request.json();
    
    const updatedItem = await MenuItemModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(body.name !== undefined && { name: body.name.trim() }),
          ...(body.price !== undefined && { price: Number(body.price) }),
          ...(body.halfPrice !== undefined && { halfPrice: body.halfPrice !== null && body.halfPrice !== "" ? Number(body.halfPrice) : null }),
          ...(body.category !== undefined && { category: body.category.trim() }),
          ...(body.veg !== undefined && { veg: Boolean(body.veg) }),
          ...(body.description !== undefined && { description: body.description.trim() }),
          ...(body.emoji !== undefined && { emoji: body.emoji.trim() }),
        },
      },
      { new: true }
    );
    
    if (!updatedItem) {
      return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
    }
    
    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error("Update menu item API error:", error);
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
    const deletedItem = await MenuItemModel.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Menu item deleted successfully." });
  } catch (error: any) {
    console.error("Delete menu item API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
