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

    // Ensure Water Bottle and Cold Drinks exist
    const hasWaterBottle = dbMenu.some((m: any) => m.name === "Water Bottle");
    if (!hasWaterBottle) {
      const newWaterBottle = await MenuItemModel.create({
        name: "Water Bottle",
        price: 20,
        category: "Quick Add",
        veg: true,
        description: "Mineral Water Bottle",
        emoji: "🚰",
      });
      dbMenu.push(newWaterBottle);
    }

    const hasColdDrinks = dbMenu.some((m: any) => m.name === "Cold Drinks");
    if (!hasColdDrinks) {
      const newColdDrinks = await MenuItemModel.create({
        name: "Cold Drinks",
        price: 40,
        category: "Quick Add",
        veg: true,
        description: "Carbonated Cold Drink",
        emoji: "🥤",
      });
      dbMenu.push(newColdDrinks);
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
