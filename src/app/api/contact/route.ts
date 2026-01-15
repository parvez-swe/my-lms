import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { MessageDocument } from "@/models/Message";
import { Collection } from "mongodb";
import { auth } from "@/lib/auth";

const getMessagesCollection = async (): Promise<Collection<MessageDocument>> => {
  const db = await getDatabase();
  return db.collection<MessageDocument>("messages");
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const messagesCollection = await getMessagesCollection();

    const newMessage: Omit<MessageDocument, "_id"> = {
      name,
      email,
      phone,
      message,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await messagesCollection.insertOne(
      newMessage as MessageDocument
    );

    return NextResponse.json(
      { message: "Message sent successfully", messageId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const messagesCollection = await getMessagesCollection();
    const messages = await messagesCollection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
