"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Editor,
  EditorProvider,
  ContentEditableEvent,
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import { Course } from "@/data/courses";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/lib/currency";
import ImageUpload from "@/components/ui/ImageUpload";
import InstructorSelect, {
  type InstructorOption,
} from "@/components/ui/InstructorSelect";

interface CreateCourseFormProps {
  redirectTo?: string;
  lockInstructor?: boolean;
}

const CreateCourseForm: React.FC<CreateCourseFormProps> = ({
  redirectTo = "/dashboard/courses/",
  lockInstructor = false,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Course>>({
    title: "",
    price: "",
    priceAmount: undefined,
    currency: DEFAULT_CURRENCY,
    pricingType: "paid",
    image: "/images/courses/course1.jpg",
    tutor: "",
    tutorImage: "/images/users/user1.jpg",
    instructorEmail: "",
    instructorId: "",
    students: 0,
    description: "",
    tutorBio: "",
    tutorSocials: [],
    modules: [],
    testimonials: [],
    successStories: [],
    faqs: [],
  });

  const handleInstructorSelect = (instructor: InstructorOption | null) => {
    if (!instructor) {
      setFormData((prev) => ({
        ...prev,
        instructorId: "",
        instructorEmail: "",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      instructorId: instructor.id,
      instructorEmail: instructor.email,
      tutor: instructor.name,
      tutorImage: instructor.image,
      tutorBio: instructor.bio || prev.tutorBio,
    }));
  };

  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (!lockInstructor || !session?.user) return;
    setFormData((prev) => ({
      ...prev,
      instructorId: session.user.id || "",
      instructorEmail: session.user.email || "",
      tutor: session.user.name || prev.tutor,
      tutorImage: session.user.image || prev.tutorImage,
    }));
  }, [lockInstructor, session?.user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePricingTypeChange = (value: "free" | "paid") => {
    setFormData((prev) => ({
      ...prev,
      pricingType: value,
      price: value === "free" ? "Free" : prev.price || "",
      priceAmount: value === "free" ? 0 : prev.priceAmount,
    }));
  };

  const handleDescriptionChange = (e: ContentEditableEvent) => {
    setDescription(e.target.value);
  };

  const updateModules = (
    updater: (
      modules: NonNullable<Course["modules"]>
    ) => NonNullable<Course["modules"]>
  ) => {
    setFormData((prev) => {
      const nextModules = updater([...(prev.modules || [])]);
      return { ...prev, modules: nextModules };
    });
  };

  const addModule = () => {
    updateModules((modules) => [
      ...modules,
      { title: "", lessons: [{ title: "", duration: "", videoType: "youtube", isPublic: false }] },
    ]);
  };

  const updateModule = (index: number, field: string, value: string) => {
    updateModules((modules) =>
      modules.map((module, idx) =>
        idx === index ? { ...module, [field]: value } : module
      )
    );
  };

  const addLesson = (moduleIndex: number) => {
    updateModules((modules) =>
      modules.map((module, idx) =>
        idx === moduleIndex
          ? {
              ...module,
              lessons: [
                ...(module.lessons || []),
                { title: "", duration: "", videoType: "youtube", isPublic: false },
              ],
            }
          : module
      )
    );
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: string,
    value: string | boolean | "youtube" | "cloudinary" | "url"
  ) => {
    updateModules((modules) =>
      modules.map((module, idx) => {
        if (idx !== moduleIndex) return module;
        const lessons = module.lessons || [];
        return {
          ...module,
          lessons: lessons.map((lesson, lIdx) =>
            lIdx === lessonIndex ? { ...lesson, [field]: value } : lesson
          ),
        };
      })
    );
  };

  const handleVideoUpload = async (
    moduleIndex: number,
    lessonIndex: number,
    file: File
  ) => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "course-videos");

      const response = await fetch("/api/upload/video", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        updateLesson(moduleIndex, lessonIndex, "videoType", "cloudinary");
        updateLesson(moduleIndex, lessonIndex, "videoUrl", result.data.url);
        updateLesson(
          moduleIndex,
          lessonIndex,
          "cloudinaryPublicId",
          result.data.publicId
        );
      } else {
        alert("Failed to upload video: " + result.error);
      }
    } catch (error) {
      console.error("Video upload error:", error);
      alert("Failed to upload video");
    }
  };

  const removeModule = (index: number) => {
    updateModules((modules) => modules.filter((_, idx) => idx !== index));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    updateModules((modules) =>
      modules.map((module, idx) =>
        idx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter((_, lIdx) => lIdx !== lessonIndex),
            }
          : module
      )
    );
  };

  const addResource = (moduleIndex: number, lessonIndex: number) => {
    updateModules((modules) =>
      modules.map((module, idx) => {
        if (idx !== moduleIndex) return module;
        return {
          ...module,
          lessons: module.lessons.map((lesson, lIdx) => {
            if (lIdx !== lessonIndex) return lesson;
            return {
              ...lesson,
              resources: [
                ...(lesson.resources || []),
                { name: "", url: "" },
              ],
            };
          }),
        };
      })
    );
  };

  const updateResource = (
    moduleIndex: number,
    lessonIndex: number,
    resourceIndex: number,
    field: "name" | "url",
    value: string
  ) => {
    updateModules((modules) =>
      modules.map((module, idx) => {
        if (idx !== moduleIndex) return module;
        return {
          ...module,
          lessons: module.lessons.map((lesson, lIdx) => {
            if (lIdx !== lessonIndex) return lesson;
            if (!lesson.resources) return lesson;
            return {
              ...lesson,
              resources: lesson.resources.map((resource, rIdx) =>
                rIdx === resourceIndex
                  ? { ...resource, [field]: value }
                  : resource
              ),
            };
          }),
        };
      })
    );
  };

  const removeResource = (
    moduleIndex: number,
    lessonIndex: number,
    resourceIndex: number
  ) => {
    updateModules((modules) =>
      modules.map((module, idx) => {
        if (idx !== moduleIndex) return module;
        return {
          ...module,
          lessons: module.lessons.map((lesson, lIdx) => {
            if (lIdx !== lessonIndex) return lesson;
            if (!lesson.resources) return lesson;
            return {
              ...lesson,
              resources: lesson.resources.filter(
                (_, rIdx) => rIdx !== resourceIndex
              ),
            };
          }),
        };
      })
    );
  };

  const addTutorSocial = () => {
    setFormData((prev) => ({
      ...prev,
      tutorSocials: [
        ...(prev.tutorSocials || []),
        { platform: "linkedin" as const, url: "" },
      ],
    }));
  };

  const updateTutorSocial = (
    index: number,
    field: string,
    value: string | "linkedin" | "twitter" | "github"
  ) => {
    setFormData((prev) => {
      const tutorSocials = [...(prev.tutorSocials || [])];
      tutorSocials[index] = { ...tutorSocials[index], [field]: value };
      return { ...prev, tutorSocials };
    });
  };

  const removeTutorSocial = (index: number) => {
    setFormData((prev) => {
      const tutorSocials = [...(prev.tutorSocials || [])];
      tutorSocials.splice(index, 1);
      return { ...prev, tutorSocials };
    });
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: "", answer: "" }],
    }));
  };

  const updateFaq = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    setFormData((prev) => {
      const faqs = [...(prev.faqs || [])];
      faqs[index] = { ...faqs[index], [field]: value };
      return { ...prev, faqs };
    });
  };

  const removeFaq = (index: number) => {
    setFormData((prev) => {
      const faqs = [...(prev.faqs || [])];
      faqs.splice(index, 1);
      return { ...prev, faqs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedPrice =
        formData.pricingType === "free"
          ? "Free"
          : formData.price ||
            `${formData.currency === "BDT" ? "৳" : "$"}${formData.priceAmount ?? 0}`;

      const courseData = {
        ...formData,
        price: normalizedPrice,
        priceAmount:
          formData.pricingType === "free" ? 0 : formData.priceAmount,
        currency: formData.currency || DEFAULT_CURRENCY,
        description: description || formData.description,
      };

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          result.message ||
            (lockInstructor
              ? "Course submitted for admin approval"
              : "Course created successfully")
        );
        router.push(redirectTo);
      } else {
        alert("Failed to create course: " + result.error);
      }
    } catch (error) {
      console.error("Failed to create course:", error);
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-[25px]">
          {/* Basic Information */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px]">
              <h5 className="!mb-0">Basic Information</h5>
            </div>

            <div className="trezo-card-content space-y-[20px]">
              <div>
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  placeholder="E.g. Zero to Hero UI/UX Design"
                />
              </div>

              <div>
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  Description *
                </label>
                <EditorProvider>
                  <Editor
                    value={description}
                    onChange={handleDescriptionChange}
                    style={{ minHeight: "200px" }}
                    className="rsw-editor"
                  >
                    <Toolbar>
                      <BtnUndo />
                      <BtnRedo />
                      <Separator />
                      <BtnBold />
                      <BtnItalic />
                      <BtnUnderline />
                      <BtnStrikeThrough />
                      <Separator />
                      <BtnNumberedList />
                      <BtnBulletList />
                      <Separator />
                      <BtnLink />
                      <BtnClearFormatting />
                      <HtmlButton />
                      <Separator />
                      <BtnStyles />
                    </Toolbar>
                  </Editor>
                </EditorProvider>
              </div>

              <div className="grid sm:grid-cols-2 gap-[25px]">
                <div>
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    Pricing Type *
                  </label>
                  <select
                    name="pricingType"
                    value={(formData.pricingType as "free" | "paid") || "paid"}
                    onChange={(e) =>
                      handlePricingTypeChange(e.target.value as "free" | "paid")
                    }
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all focus:border-primary-500"
                  >
                    <option value="paid">Paid Course</option>
                    <option value="free">Free Course</option>
                  </select>
                </div>

                <div>
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency || DEFAULT_CURRENCY}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currency: e.target.value as CurrencyCode,
                      }))
                    }
                    disabled={formData.pricingType === "free"}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all focus:border-primary-500 disabled:opacity-60"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    Price Amount{" "}
                    {formData.pricingType === "free" ? "(Free Course)" : "*"}
                  </label>
                  <input
                    type="number"
                    name="priceAmount"
                    min={0}
                    step="0.01"
                    value={formData.priceAmount ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priceAmount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required={formData.pricingType !== "free"}
                    disabled={formData.pricingType === "free"}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500 disabled:opacity-60"
                    placeholder="E.g. 4900"
                  />
                </div>

                <div>
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    Price Label (optional)
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={formData.pricingType === "free"}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500 disabled:opacity-60"
                    placeholder="Auto-generated from amount if empty"
                  />
                </div>
              </div>

              <div>
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  Students Enrolled
                </label>
                <input
                  type="number"
                  name="students"
                  value={formData.students}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      students: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  placeholder="0"
                />
              </div>

              <ImageUpload
                label="Course Cover Image"
                value={formData.image || ""}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, image: url }))
                }
                folder="course-covers"
                required
              />
            </div>
          </div>

          {/* Tutor Information */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px]">
              <h5 className="!mb-0">Tutor Information</h5>
            </div>

            <div className="trezo-card-content space-y-[20px]">
              {!lockInstructor && (
                <InstructorSelect
                  value={formData.instructorId}
                  onChange={handleInstructorSelect}
                  required
                />
              )}

              <div className="grid sm:grid-cols-2 gap-[25px]">
                <div>
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    Tutor Name *
                  </label>
                  <input
                    type="text"
                    name="tutor"
                    value={formData.tutor}
                    onChange={handleInputChange}
                    required
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder="E.g. John Doe"
                  />
                </div>

                <div>
                  <ImageUpload
                    label="Tutor Photo"
                    value={formData.tutorImage || ""}
                    onChange={(url) =>
                      setFormData((prev) => ({ ...prev, tutorImage: url }))
                    }
                    folder="instructor-avatars"
                  />
                </div>
              </div>

              <div>
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  Instructor Email
                </label>
                <input
                  type="email"
                  name="instructorEmail"
                  value={formData.instructorEmail || ""}
                  onChange={handleInputChange}
                  readOnly={!lockInstructor && Boolean(formData.instructorId)}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500 disabled:opacity-70"
                  placeholder="instructor@example.com"
                />
              </div>

              <div>
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  Tutor Bio
                </label>
                <textarea
                  name="tutorBio"
                  value={formData.tutorBio}
                  onChange={handleInputChange}
                  rows={4}
                  className="rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  placeholder="Brief bio about the tutor..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-[10px]">
                  <label className="text-black dark:text-white font-medium block">
                    Social Media Links
                  </label>
                  <button
                    type="button"
                    onClick={addTutorSocial}
                    className="text-primary-500 text-sm hover:underline"
                  >
                    + Add Social
                  </button>
                </div>
                {formData.tutorSocials?.map((social, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={social.platform}
                      onChange={(e) =>
                        updateTutorSocial(
                          index,
                          "platform",
                          e.target.value as "linkedin" | "twitter" | "github"
                        )
                      }
                      className="h-[40px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block outline-0"
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter</option>
                      <option value="github">GitHub</option>
                    </select>
                    <input
                      type="url"
                      value={social.url}
                      onChange={(e) =>
                        updateTutorSocial(index, "url", e.target.value)
                      }
                      className="flex-1 h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block outline-0"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => removeTutorSocial(index)}
                      className="text-danger-500 px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modules and Lessons */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <h5 className="!mb-0">Course Modules & Lessons</h5>
              <button
                type="button"
                onClick={addModule}
                className="text-primary-500 text-sm hover:underline"
              >
                + Add Module
              </button>
            </div>

            <div className="trezo-card-content space-y-[20px]">
              {formData.modules?.map((module, moduleIndex) => (
                <div
                  key={moduleIndex}
                  className="border border-gray-200 dark:border-[#172036] rounded-md p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) =>
                        updateModule(moduleIndex, "title", e.target.value)
                      }
                      placeholder="Module Title (e.g. Module 1: Introduction)"
                      className="flex-1 h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block outline-0 mr-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeModule(moduleIndex)}
                      className="text-danger-500 px-3"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="border border-gray-200 dark:border-[#172036] rounded-md p-4 space-y-3"
                      >
                        <div className="grid sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={lesson.title || ""}
                            onChange={(e) =>
                              updateLesson(
                                moduleIndex,
                                lessonIndex,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Lesson Title *"
                            required
                            className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block outline-0"
                          />
                          <input
                            type="text"
                            value={lesson.duration || ""}
                            onChange={(e) =>
                              updateLesson(
                                moduleIndex,
                                lessonIndex,
                                "duration",
                                e.target.value
                              )
                            }
                            placeholder="Duration (e.g. 10 min) *"
                            required
                            className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block outline-0"
                          />
                        </div>

                        {/* Video Type Selection */}
                        <div>
                          <label className="mb-2 text-sm text-black dark:text-white font-medium block">
                            Video Source
                          </label>
                          <select
                            value={lesson.videoType || "youtube"}
                            onChange={(e) =>
                              updateLesson(
                                moduleIndex,
                                lessonIndex,
                                "videoType",
                                e.target.value as
                                  | "youtube"
                                  | "cloudinary"
                                  | "url"
                              )
                            }
                            className="h-[40px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0"
                          >
                            <option value="youtube">YouTube URL</option>
                            <option value="cloudinary">
                              Upload Video (Cloudinary)
                            </option>
                            <option value="url">Direct Video URL</option>
                          </select>
                        </div>

                        {/* Video URL Input based on type */}
                        {lesson.videoType === "youtube" && (
                          <div>
                            <label className="mb-2 text-sm text-black dark:text-white font-medium block">
                              YouTube URL
                            </label>
                            <input
                              type="url"
                              value={lesson.videoUrl || ""}
                              onChange={(e) =>
                                updateLesson(
                                  moduleIndex,
                                  lessonIndex,
                                  "videoUrl",
                                  e.target.value
                                )
                              }
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0"
                            />
                          </div>
                        )}

                        {lesson.videoType === "url" && (
                          <div>
                            <label className="mb-2 text-sm text-black dark:text-white font-medium block">
                              Direct Video URL
                            </label>
                            <input
                              type="url"
                              value={lesson.videoUrl || ""}
                              onChange={(e) =>
                                updateLesson(
                                  moduleIndex,
                                  lessonIndex,
                                  "videoUrl",
                                  e.target.value
                                )
                              }
                              placeholder="https://example.com/video.mp4"
                              className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0"
                            />
                          </div>
                        )}

                        {lesson.videoType === "cloudinary" && (
                          <div>
                            <label className="mb-2 text-sm text-black dark:text-white font-medium block">
                              Upload Video File
                            </label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleVideoUpload(
                                    moduleIndex,
                                    lessonIndex,
                                    file
                                  );
                                }
                              }}
                              className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0"
                            />
                            {lesson.videoUrl && (
                              <p className="mt-2 text-xs text-green-600 break-all">
                                ✓ Video uploaded: {lesson.videoUrl}
                              </p>
                            )}
                            {lesson.cloudinaryPublicId && (
                              <p className="mt-1 text-xs text-gray-500 break-all">
                                Public ID: {lesson.cloudinaryPublicId}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Privacy Toggle */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`privacy-${moduleIndex}-${lessonIndex}`}
                            checked={lesson.isPublic || false}
                            onChange={(e) =>
                              updateLesson(
                                moduleIndex,
                                lessonIndex,
                                "isPublic",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <label
                            htmlFor={`privacy-${moduleIndex}-${lessonIndex}`}
                            className="text-sm text-black dark:text-white"
                          >
                            Make this lesson public (visible to non-enrolled
                            users)
                          </label>
                        </div>

                        {/* Resources */}
                        <div className="border-t border-gray-200 dark:border-[#172036] pt-3 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-black dark:text-white font-medium block">
                              Resources (PDFs, Documents, etc.)
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                addResource(moduleIndex, lessonIndex)
                              }
                              className="text-primary-500 text-xs hover:underline"
                            >
                              + Add Resource
                            </button>
                          </div>
                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="space-y-2">
                              {lesson.resources.map(
                                (resource, resourceIndex) => (
                                  <div
                                    key={resourceIndex}
                                    className="flex gap-2 items-center"
                                  >
                                    <input
                                      type="text"
                                      value={resource.name}
                                      onChange={(e) =>
                                        updateResource(
                                          moduleIndex,
                                          lessonIndex,
                                          resourceIndex,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Resource Name"
                                      className="flex-1 h-[35px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block outline-0 text-sm"
                                    />
                                    <input
                                      type="url"
                                      value={resource.url}
                                      onChange={(e) =>
                                        updateResource(
                                          moduleIndex,
                                          lessonIndex,
                                          resourceIndex,
                                          "url",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Resource URL"
                                      className="flex-1 h-[35px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block outline-0 text-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeResource(
                                          moduleIndex,
                                          lessonIndex,
                                          resourceIndex
                                        )
                                      }
                                      className="text-danger-500 px-2 text-sm"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeLesson(moduleIndex, lessonIndex)}
                          className="text-danger-500 text-sm hover:underline"
                        >
                          Remove Lesson
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLesson(moduleIndex)}
                      className="text-primary-500 text-sm hover:underline"
                    >
                      + Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <h5 className="!mb-0">Frequently Asked Questions</h5>
              <button
                type="button"
                onClick={addFaq}
                className="text-primary-500 text-sm hover:underline"
              >
                + Add FAQ
              </button>
            </div>

            <div className="trezo-card-content space-y-[20px]">
              {formData.faqs && formData.faqs.length > 0 ? (
                formData.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-[#172036] rounded-md p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white block mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) =>
                              updateFaq(index, "question", e.target.value)
                            }
                            placeholder="What will I learn from this course?"
                            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white block mb-1">
                            Answer
                          </label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) =>
                              updateFaq(index, "answer", e.target.value)
                            }
                            rows={3}
                            placeholder="Provide a brief, helpful answer..."
                            className="rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-[17px] block w-full outline-0"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFaq(index)}
                        className="text-danger-500 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No FAQs added yet. Use the button above to include common
                  questions for students.
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateCourseForm;
