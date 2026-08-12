import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { MenuItemModel } from "@/models/MenuItem";
import { menuItems as seedMenu } from "@/data/menuData";

export async function GET() {
  try {
    await connectToDatabase();
    
    let dbMenu = await MenuItemModel.find().sort({ createdAt: -1 });
    
    if (dbMenu.length === 0) {
      const cleanSeedMenu = seedMenu.map(({ id, ...rest }) => rest);
      await MenuItemModel.insertMany(cleanSeedMenu);
      dbMenu = await MenuItemModel.find().sort({ createdAt: -1 });
    }
    
    return NextResponse.json(dbMenu);
  } catch (error: any) {
    console.error("Fetch menu items API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { name, price, halfPrice, category, veg, description, emoji } = await request.json();
    
    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { error: "Name, price, and category are required." },
        { status: 400 }
      );
    }
    
    const newItem = await MenuItemModel.create({
      name: name.trim(),
      price: Number(price),
      halfPrice: halfPrice !== undefined && halfPrice !== null && halfPrice !== "" ? Number(halfPrice) : null,
      category: category.trim(),
      veg: Boolean(veg),
      description: (description || "").trim(),
      emoji: (emoji || "🍽️").trim(),
    });
    
    return NextResponse.json(newItem);
  } catch (error: any) {
    console.error("Create menu item API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
