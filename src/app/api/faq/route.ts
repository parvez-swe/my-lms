import { getDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { FaqDocument, FaqItem } from "@/models/Faq";
import { Collection, ObjectId } from "mongodb";
import { serializeDocument } from "@/lib/serialize"; // Import serializeDocument

const getFaqCollection = async (): Promise<Collection<FaqDocument>> => {
  const db = await getDatabase();
  return db.collection<FaqDocument>("faq");
};

export async function GET() {
  try {
    const collection = await getFaqCollection();
    // There should only be one document
    let faq = await collection.findOne({});
    if (!faq) {
      const defaultFaq: Omit<FaqDocument, "_id"> = {
        title: "FAQ's",
        subtitle: "Common Questions About The Course & Mentorship",
        faqs: [
          {
            _id: new ObjectId(),
            question: "Who is the instructor?",
            answer:
              "I am Parvez Musharaf, a final-year Software Engineering student at Daffodil International University and a Top-Rated Full Stack Developer on Upwork. I combine academic knowledge with real-world freelancing experience to teach you industry-standard coding.",
          },
          {
            _id: new ObjectId(),
            question: "What technologies will I learn here?",
            answer:
              "My primary focus is the MERN Stack (MongoDB, Express, React, Node.js) and Next.js. I also cover essential tools like TypeScript, Tailwind CSS, Prisma, and PostgreSQL to help you build modern, scalable web applications.",
          },
        ],
      };
      const result = await collection.insertOne(defaultFaq as FaqDocument);
      faq = await collection.findOne({ _id: result.insertedId }); // Re-fetch to get _id as ObjectId
      return NextResponse.json(serializeDocument(faq), { status: 200 }); // Serialize before sending
    }
    return NextResponse.json(serializeDocument(faq), { status: 200 }); // Serialize before sending
  } catch (error) {
    console.error("Failed to retrieve faq section:", error);
    return NextResponse.json(
      { message: "Failed to retrieve faq section" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const collection = await getFaqCollection();
    const body: Partial<FaqDocument> = await req.json();

    // The _id for the main FaqDocument should not be set by the client for update, remove it
    if (body._id) {
      delete body._id;
    }

    // Convert string _id from client to ObjectId for nested faqs
    if (body.faqs) {
      body.faqs = body.faqs.map((faqItem: FaqItem) => ({
        ...faqItem,
        // Ensure _id is an ObjectId for DB operations. If it's a string from client, convert.
        // If it's undefined (new item), create new ObjectId. If it's already an ObjectId, keep it.
        _id: typeof faqItem._id === 'string'
             ? new ObjectId(faqItem._id)
             : (faqItem._id || new ObjectId()),
      }));
    }

    const result = await collection.updateOne(
      {},
      { $set: body },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      const updatedFaq = await collection.findOne({});
      return NextResponse.json(serializeDocument(updatedFaq), { status: 200 }); // Serialize before sending
    } else {
      return NextResponse.json(
        { message: "No changes were made" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Failed to update faq section:", error);
    return NextResponse.json(
      { message: "Failed to update faq section" },
      { status: 500 }
    );
  }
}
