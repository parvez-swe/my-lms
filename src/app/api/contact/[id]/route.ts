import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { MessageDocument } from "@/models/Message";
import { Collection, ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

const getMessagesCollection = async (): Promise<Collection<MessageDocument>> => {
  const db = await getDatabase();
  return db.collection<MessageDocument>("messages");
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isRead } = body;

    if (typeof isRead !== "boolean") {
      return NextResponse.json(
        { message: "isRead must be a boolean" },
        { status: 400 }
      );
    }

    const messagesCollection = await getMessagesCollection();

    const result = await messagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isRead, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Message updated successfully" });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const messagesCollection = await getMessagesCollection();

    const result = await messagesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
