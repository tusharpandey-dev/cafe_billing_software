import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { categories as seedCats } from "@/data/menuData";

export async function GET() {
  try {
    await connectToDatabase();
    
    let dbCats = await Category.find().sort({ createdAt: 1 });
    
    if (dbCats.length === 0) {
      const defaultCats = seedCats.map((name) => ({ name }));
      await Category.insertMany(defaultCats);
      dbCats = await Category.find().sort({ createdAt: 1 });
    }
    
    const catNames = dbCats.map((c: any) => c.name);
    return NextResponse.json(catNames);
  } catch (error: any) {
    console.error("Fetch categories API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { name } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }
    
    const normalizedName = name.trim();
    
    // Check if category already exists
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${normalizedName}$`, "i") } });
    if (existing) {
      return NextResponse.json({ error: "Category already exists." }, { status: 400 });
    }
    
    const created = await Category.create({ name: normalizedName });
    return NextResponse.json({ name: created.name });
  } catch (error: any) {
    console.error("Create category API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
