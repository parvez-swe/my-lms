import { getDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { AboutMeDocument } from "@/models/AboutMe";
import { Collection, ObjectId } from "mongodb";

const getAboutMeCollection = async (): Promise<Collection<AboutMeDocument>> => {
  const db = await getDatabase();
  return db.collection<AboutMeDocument>("about-me");
};

export async function GET() {
  try {
    const collection = await getAboutMeCollection();
    // There should only be one document
    const aboutMe = await collection.findOne({});
    if (!aboutMe) {
      const defaultAboutMe: Omit<AboutMeDocument, "_id"> = {
        name: "Parvez Musharaf",
        title: "Full Stack Engineer & Content Creator",
        location: "Dhaka, Bangladesh",
        bio: "Hi, I'm Parvez. I am a Top-Rated Freelancer and a final-year Software Engineering student at Daffodil International University. Specializing in the MERN Stack and Next.js, I build scalable web applications and SaaS solutions.",
        mission:
          "I created this platform to share my industry experience—teaching you not just how to code, but how to build professional-grade applications and succeed as a freelancer.",
        image: "/images/front-pages/team1.jpg",
        stats: [
          { _id: new ObjectId(), label: "YouTube Subs", value: "13.4K+" },
          { _id: new ObjectId(), label: "Upwork Status", value: "Top Rated" },
          { _id: new ObjectId(), label: "Job Success", value: "100%" },
        ],
        socials: {
          youtube: "https://www.youtube.com/@parvezmusharafswe",
          website: "https://parvezmusharaf.vercel.app",
          github: "https://github.com/parvezmusharaf",
          linkedin: "https://www.linkedin.com/",
        },
      };
      const result = await collection.insertOne(
        defaultAboutMe as AboutMeDocument
      );
      const newAboutMe = await collection.findOne({ _id: result.insertedId });
      return NextResponse.json(newAboutMe, { status: 200 });
    }
    return NextResponse.json(aboutMe, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve about me section:", error);
    return NextResponse.json(
      { message: "Failed to retrieve about me section" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const collection = await getAboutMeCollection();
    const body: Partial<AboutMeDocument> = await req.json();

    // Ensure no one can update the _id
    delete body._id;

    if (body.stats) {
      body.stats = body.stats.map((stat) => ({
        ...stat,
        _id: stat._id ? new ObjectId(stat._id) : new ObjectId(),
      }));
    }

    const result = await collection.updateOne(
      {},
      { $set: body },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      const updatedAboutMe = await collection.findOne({});
      return NextResponse.json(updatedAboutMe, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "No changes were made" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Failed to update about me section:", error);
    return NextResponse.json(
      { message: "Failed to update about me section" },
      { status: 500 }
    );
  }
}
