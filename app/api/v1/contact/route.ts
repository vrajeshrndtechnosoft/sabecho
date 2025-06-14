
import { NextRequest, NextResponse } from "next/server";
import {connectDb} from "@/lib/db";
import ContactPage from "@/models/home/Contact";

export async function GET() {
  try {
    await connectDb();
    const contactPage = await ContactPage.findOne();
    if (!contactPage) {
      return NextResponse.json({ message: "Contact page not found" }, { status: 404 });
    }
    return NextResponse.json(contactPage.submissions);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ message: "Name, email, and message are required" }, { status: 400 });
    }

    let contactPage = await ContactPage.findOne();
    if (!contactPage) {
      contactPage = new ContactPage();
    }

    contactPage.submissions.push({ name, email, phone, message });
    await contactPage.save();

    return NextResponse.json(
      { message: "Contact submission added successfully", submission: contactPage.submissions.at(-1) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 });
  }
}
