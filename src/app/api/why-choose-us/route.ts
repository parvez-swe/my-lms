import { getDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { WhyChooseUsDocument } from "@/models/WhyChooseUs";
import { canManageCms } from "@/lib/rbac";
import { Collection, ObjectId } from "mongodb";

const getWhyChooseUsCollection = async (): Promise<
  Collection<WhyChooseUsDocument>
> => {
  const db = await getDatabase();
  return db.collection<WhyChooseUsDocument>("why-choose-us");
};

export async function GET() {
  try {
    const collection = await getWhyChooseUsCollection();
    // There should only be one document
    const whyChooseUs = await collection.findOne({});
    if (!whyChooseUs) {
      const defaultWhyChooseUs: Omit<WhyChooseUsDocument, "_id"> = {
        title: "Why Choose Us",
        subtitle: "The Best Learning Experience",
        features: [
          {
            _id: new ObjectId(),
            title: "Expert-Led Courses",
            description:
              "Learn from industry experts who are passionate about teaching and have real-world experience.",
            icon: "/images/front-pages/stacks.svg",
            bgColor: "bg-primary-100",
          },
          {
            _id: new ObjectId(),
            title: "Hands-On Projects",
            description:
              "Apply what you learn with hands-on projects and build a portfolio to showcase your skills.",
            icon: "/images/front-pages/code.svg",
            bgColor: "bg-purple-100",
          },
          {
            _id: new ObjectId(),
            title: "Community Support",
            description:
              "Join a vibrant community of learners and get help from your peers and instructors.",
            icon: "/images/front-pages/support_agent.svg",
            bgColor: "bg-orange-100",
          },
        ],
      };
      const result = await collection.insertOne(
        defaultWhyChooseUs as WhyChooseUsDocument
      );
      const newWhyChooseUs = await collection.findOne({
        _id: result.insertedId,
      });
      return NextResponse.json(newWhyChooseUs, { status: 200 });
    }
    return NextResponse.json(whyChooseUs, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve why choose us section:", error);
    return NextResponse.json(
      { message: "Failed to retrieve why choose us section" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  /* auth-guarded */
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageCms(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const collection = await getWhyChooseUsCollection();
    const body: Partial<WhyChooseUsDocument> = await req.json();

    // Ensure no one can update the _id
    delete body._id;

    if (body.features) {
      body.features = body.features.map((feature) => ({
        ...feature,
        _id: feature._id ? new ObjectId(feature._id) : new ObjectId(),
      }));
    }

    const result = await collection.updateOne(
      {},
      { $set: body },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      const updatedWhyChooseUs = await collection.findOne({});
      return NextResponse.json(updatedWhyChooseUs, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "No changes were made" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Failed to update why choose us section:", error);
    return NextResponse.json(
      { message: "Failed to update why choose us section" },
      { status: 500 }
    );
  }
}
