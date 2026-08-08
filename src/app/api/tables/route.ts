import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TableModel } from "@/models/Table";
import { getAuthPayload } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const payload = await getAuthPayload();
    const restaurantId = payload?.restaurantId || "default-restaurant";
    const branchId = payload?.branchId || "default-branch";
    
    let dbTables = await TableModel.find({ restaurantId, branchId }).sort({ number: 1 });
    
    // Seed initial 12 tables if none exist in the database for this branch
    if (dbTables.length === 0) {
      const defaultTables = Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        capacity: (i + 1) % 3 === 0 ? 6 : 4,
        restaurantId,
        branchId,
      }));
      await TableModel.insertMany(defaultTables);
      dbTables = await TableModel.find({ restaurantId, branchId }).sort({ number: 1 });
    }
    
    return NextResponse.json(dbTables);
  } catch (error: any) {
    console.error("Fetch tables API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await getAuthPayload();
    const restaurantId = payload?.restaurantId || "default-restaurant";
    const branchId = payload?.branchId || "default-branch";
    
    const body = await request.json();
    const { number, capacity } = body;
    
    if (number === undefined || capacity === undefined) {
      return NextResponse.json({ error: "Table number and capacity are required." }, { status: 400 });
    }
    
    const tableNum = Number(number);
    const tableCap = Number(capacity);
    
    if (isNaN(tableNum) || tableNum <= 0) {
      return NextResponse.json({ error: "Table number must be a positive integer." }, { status: 400 });
    }
    if (isNaN(tableCap) || tableCap <= 0) {
      return NextResponse.json({ error: "Capacity must be a positive integer." }, { status: 400 });
    }
    
    // Check if table number already exists in this branch
    const existing = await TableModel.findOne({ number: tableNum, restaurantId, branchId });
    if (existing) {
      return NextResponse.json({ error: `Table number ${tableNum} already exists.` }, { status: 400 });
    }
    
    const created = await TableModel.create({
      number: tableNum,
      capacity: tableCap,
      restaurantId,
      branchId,
    });
    
    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Create table API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
