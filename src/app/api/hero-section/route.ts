import { getDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { HeroSectionDocument } from "@/models/HeroSection";
import { Collection } from "mongodb";

const getHeroSectionCollection = async (): Promise<
  Collection<HeroSectionDocument>
> => {
  const db = await getDatabase();
  return db.collection<HeroSectionDocument>("hero-sections");
};

export async function GET() {
  try {
    const collection = await getHeroSectionCollection();
    // There should only be one hero section document
    const heroSection = await collection.findOne({});
    if (!heroSection) {
      // If no hero section is found, we can return a default one or a 404
      // For customization, it's better to have a default one created if it doesn't exist
      const defaultHeroSection: Omit<HeroSectionDocument, "_id"> = {
        title: "Learn What School",
        accentText: "Doesn't Teach You",
        subtitle:
          "At our Academy, you can gain practical knowledge and learn real-world skills that will help you transform your life at work, school and home.",
        ctaButtonText: "Explore Courses",
        ctaButtonLink: "#",
        mainImage: "/myimage.png",
        socialProof: {
          avatars: [
            "https://i.pravatar.cc/150?img=11",
            "https://i.pravatar.cc/150?img=12",
            "https://i.pravatar.cc/150?img=13",
            "https://i.pravatar.cc/150?img=14",
          ],
          happyLearners: "10,000+",
          rating: "4.8+",
          numberOfRatings: "600+",
        },
      };
      const result = await collection.insertOne(
        defaultHeroSection as HeroSectionDocument
      );
      const newHeroSection = await collection.findOne({
        _id: result.insertedId,
      });
      return NextResponse.json(newHeroSection, { status: 200 });
    }
    return NextResponse.json(heroSection, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve hero section:", error);
    return NextResponse.json(
      { message: "Failed to retrieve hero section" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const collection = await getHeroSectionCollection();
    const body: Partial<HeroSectionDocument> = await req.json();

    // Ensure no one can update the _id
    delete body._id;

    // There should only be one document, so we update it without a specific filter
    const result = await collection.updateOne(
      {},
      { $set: body },
      { upsert: true } // Creates the document if it doesn't exist
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      const updatedHeroSection = await collection.findOne({});
      return NextResponse.json(updatedHeroSection, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "No changes were made" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Failed to update hero section:", error);
    return NextResponse.json(
      { message: "Failed to update hero section" },
      { status: 500 }
    );
  }
}
