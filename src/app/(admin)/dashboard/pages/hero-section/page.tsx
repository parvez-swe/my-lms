"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import { HeroSectionDocument } from "@/models/HeroSection";

interface HeroBannerProps {
  data: Partial<HeroSectionDocument>;
}

function HeroBanner({ data }: HeroBannerProps) {
  const avatars = (data.socialProof?.avatars && data.socialProof.avatars.length > 0)
    ? data.socialProof.avatars
    : [
        "https://i.pravatar.cc/150?img=11",
        "https://i.pravatar.cc/150?img=12",
        "https://i.pravatar.cc/150?img=13",
        "https://i.pravatar.cc/150?img=14",
      ];

  return (
    <section className="relative bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-white overflow-hidden min-h-[600px] lg:min-h-[800px] flex items-center font-sans transition-colors duration-500">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        <div
          className="absolute inset-0 bg-repeat dark:invert transition-all duration-500"
          style={{
            backgroundImage:
              'url("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2560px-World_map_-_low_resolution.svg.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-[#111111] to-transparent transition-colors duration-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 lg:pt-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="flex flex-col items-start max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-[64px] leading-[1.1] font-extrabold uppercase tracking-tight mb-6 text-gray-900 dark:text-white transition-colors duration-500">
              {data.title}{" "}
              <span className="text-[#c0392b] dark:text-white transition-colors duration-500">
                {data.accentText}
              </span>
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl mb-10 leading-relaxed max-w-xl font-light transition-colors duration-500">
              {data.subtitle}
            </p>

            <a
              href={data.ctaButtonLink}
              className="inline-flex items-center justify-center px-8 py-4 
              bg-[#c0392b] text-white hover:bg-[#a93226] 
              dark:bg-white dark:text-[#c0392b] dark:hover:bg-gray-100 
              transition-all duration-300 rounded-full font-bold text-lg uppercase tracking-wide mb-12 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {data.ctaButtonText}
            </a>

            {data.socialProof && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 border-t border-gray-200 dark:border-gray-800 pt-8 w-full transition-colors duration-500">
                <div className="flex items-center">
                  <div className="flex -space-x-4">
                    {avatars.map((avatar, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full border-2 border-gray-50 dark:border-[#111] overflow-hidden relative z-0 bg-gray-300 dark:bg-gray-600 transition-colors duration-500"
                      >
                        <Image
                          src={avatar}
                          alt={`Student ${i}`}
                          height={500}
                          width={500}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-xl text-gray-900 dark:text-white transition-colors duration-500">
                      {data.socialProof.happyLearners}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-500">
                      Happy Learners
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-12 bg-emerald-500/50"></div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-xl mr-2 text-gray-900 dark:text-white transition-colors duration-500">
                      {data.socialProof.rating}
                    </span>
                    <div className="flex text-yellow-500 dark:text-yellow-400">
                      {[...Array(4)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          fill="currentColor"
                          className="text-yellow-500 dark:text-yellow-400"
                        />
                      ))}
                      <Star
                        size={20}
                        fill="currentColor"
                        className="text-yellow-500 dark:text-yellow-400 relative overflow-hidden"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-500">
                    ({data.socialProof.numberOfRatings} Ratings)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="relative lg:h-[800px] flex items-end justify-center lg:justify-end mt-10 lg:mt-0">
            <div className="absolute bottom-0 right-0 w-full h-[80%] bg-gradient-to-t from-gray-50 via-transparent to-transparent dark:from-black dark:via-transparent dark:to-transparent z-20 transition-colors duration-500"></div>
            {data.mainImage && (
              <Image
                src={data.mainImage}
                alt="Hero Instructor"
                width={500}
                height={500}
                className="relative z-10 max-h-[500px] lg:max-h-[85%] w-auto object-contain drop-shadow-2xl mask-image-gradient"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const HeroSectionCustomization = () => {
  const [data, setData] = useState<Partial<HeroSectionDocument>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/hero-section");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSocialProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      socialProof: {
        avatars: prevData.socialProof?.avatars || [],
        happyLearners: prevData.socialProof?.happyLearners || "",
        rating: prevData.socialProof?.rating || "",
        numberOfRatings: prevData.socialProof?.numberOfRatings || "",
        [name]: value,
      },
    }));
  };

  const handleAvatarChange = (index: number, value: string) => {
    setData((prevData) => {
      const newAvatars = [...(prevData.socialProof?.avatars || [])];
      newAvatars[index] = value;
      return {
        ...prevData,
        socialProof: {
          avatars: newAvatars,
          happyLearners: prevData.socialProof?.happyLearners || "",
          rating: prevData.socialProof?.rating || "",
          numberOfRatings: prevData.socialProof?.numberOfRatings || "",
        },
      };
    });
  };

  const removeAvatar = (index: number) => {
    setData((prevData) => {
      const socialProof = prevData.socialProof || { avatars: [], happyLearners: '', rating: '', numberOfRatings: '' };
      const newAvatars = [...socialProof.avatars];
      newAvatars.splice(index, 1);
      return {
        ...prevData,
        socialProof: {
          ...socialProof,
          avatars: newAvatars,
        }
      }
    });
  };

  const addAvatar = () => {
    setData((prevData) => {
      const socialProof = prevData.socialProof || { avatars: [], happyLearners: '', rating: '', numberOfRatings: '' };
      const newAvatars = [...socialProof.avatars, ''];
      return {
        ...prevData,
        socialProof: {
          ...socialProof,
          avatars: newAvatars,
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/hero-section", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update data");
      }
      const updatedData = await response.json();
      setData(updatedData);
      alert("Hero section updated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        alert("Failed to update hero section.");
      } else {
        setError("An unknown error occurred");
        alert("Failed to update hero section.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prevData) => ({
          ...prevData,
          mainImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAvatarChange(index, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !data.title) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="z-0">
      <HeroBanner data={data} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Customize Hero Section</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={data.title || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="accentText"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Accent Text
              </label>
              <input
                type="text"
                name="accentText"
                id="accentText"
                value={data.accentText || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="subtitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Subtitle
            </label>
            <textarea
              name="subtitle"
              id="subtitle"
              value={data.subtitle || ""}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="ctaButtonText"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                CTA Button Text
              </label>
              <input
                type="text"
                name="ctaButtonText"
                id="ctaButtonText"
                value={data.ctaButtonText || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="ctaButtonLink"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                CTA Button Link
              </label>
              <input
                type="text"
                name="ctaButtonLink"
                id="ctaButtonLink"
                value={data.ctaButtonLink || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="mainImage"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Main Image
            </label>
            <input
              type="file"
              name="mainImage"
              id="mainImage"
              onChange={handleImageUpload}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>

          <h3 className="text-xl font-bold mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            Social Proof
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="happyLearners"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Happy Learners
              </label>
              <input
                type="text"
                name="happyLearners"
                id="happyLearners"
                value={data.socialProof?.happyLearners || ""}
                onChange={handleSocialProofChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Rating
              </label>
              <input
                type="text"
                name="rating"
                id="rating"
                value={data.socialProof?.rating || ""}
                onChange={handleSocialProofChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="numberOfRatings"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Number of Ratings
              </label>
              <input
                type="text"
                name="numberOfRatings"
                id="numberOfRatings"
                value={data.socialProof?.numberOfRatings || ""}
                onChange={handleSocialProofChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Avatars
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {(data.socialProof?.avatars || []).map((avatar, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => handleAvatarChange(index, e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="file"
                    onChange={(e) => handleAvatarImageUpload(e, index)}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                  />
                  <button type="button" onClick={() => removeAvatar(index)} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addAvatar} className="mt-2 text-sm text-indigo-600 hover:text-indigo-900">Add Avatar</button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroSectionCustomization;
