// File: app/api/contact/faq/route.ts (Next.js 13+ with TypeScript)

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
    return NextResponse.json(contactPage.faqs);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { question, answer } = await req.json();
    if (!question || !answer) {
      return NextResponse.json({ message: "Question and answer are required" }, { status: 400 });
    }

    let contactPage = await ContactPage.findOne();
    if (!contactPage) {
      contactPage = new ContactPage();
    }

    contactPage.faqs.push({ question, answer });
    await contactPage.save();

    return NextResponse.json(
      { message: "FAQ added successfully", faq: contactPage.faqs.at(-1) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 });
  }
}
