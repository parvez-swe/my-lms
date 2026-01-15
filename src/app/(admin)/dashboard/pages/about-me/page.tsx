"use client";

import React, { useState, useEffect } from "react";
import { AboutMeDocument, Stat } from "@/models/AboutMe";
import Image from "next/image";

interface InstructorProps {
  data: Partial<AboutMeDocument>;
}

const Instructor: React.FC<InstructorProps> = ({ data }) => {
  return (
    <>
      <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1] py-[50px] lg:py-[90px]">
        {/* Section Header */}
        <div className="md:max-w-[500px] lg:max-w-[630px] mb-[35px] md:mb-[50px]">
          <div className="inline-block relative mt-[10px] mb-[20px]">
            <span className="absolute top-[4.5px] w-[5px] h-[5px] ltr:-left-[3.6px] rtl:-right-[3.6px] bg-purple-600 -rotate-[6.536deg]"></span>
            <span className="absolute -top-[9.5px] w-[5px] h-[5px] ltr:right-0 rtl:left-0 bg-purple-600 -rotate-[6.536deg]"></span>
            <span className="inline-block relative text-purple-600 border border-purple-600 py-[5.5px] px-[17.2px] -rotate-[6.536deg]">
              Meet the Instructor
            </span>
          </div>
          <h2 className="!mb-0 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2]">
            Learn from a Real-World Engineer
          </h2>
        </div>

        {/* Main Profile Card */}
        <div className="relative bg-white/[.26] dark:bg-black/[.54] border border-white/[.24] dark:border-black/[.24] backdrop-blur-[3.5999999046325684px] rounded-[15px] p-[20px] md:p-[40px] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[30px] items-center">
            {/* Column 1: Image */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="relative rounded-[10px] overflow-hidden border border-white/20 shadow-lg group">
                <Image
                  src={data.image || ""}
                  alt={data.name || ""}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  width={570}
                  height={650}
                />
              </div>
            </div>

            {/* Column 2: Details */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div>
                <span className="block text-purple-600 font-medium mb-2 tracking-wide uppercase text-sm">
                  {data.location}
                </span>
                <h3 className="text-[28px] md:text-[36px] font-bold mb-2 leading-tight">
                  {data.name}
                </h3>
                <p className="text-[18px] font-medium text-gray-600 dark:text-gray-300 mb-6">
                  {data.title}
                </p>

                <div className="w-full h-px bg-gradient-to-r from-purple-500/50 to-transparent mb-6"></div>

                <div className="space-y-4 text-gray-600 dark:text-gray-300 mb-8 text-[16px] leading-relaxed">
                  <p>{data.bio}</p>
                  <p>{data.mission}</p>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 md:gap-10 mb-8">
                  {(data.stats || []).map((stat, index) => (
                    <div key={index} className="flex flex-col">
                      <span className="text-[22px] font-bold text-primary-600">
                        {stat.value}
                      </span>
                      <span className="text-sm opacity-80 uppercase tracking-wider">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                {data.socials && (
                  <div className="flex items-center gap-[15px]">
                    <span className="font-semibold mr-2">Follow Me:</span>
                    <a
                      href={data.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 border border-red-600/20"
                    >
                      <i className="ri-youtube-fill text-xl"></i>
                    </a>
                    <a
                      href={data.socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 border border-purple-600/20"
                    >
                      <i className="ri-global-line text-xl"></i>
                    </a>
                    <a
                      href={data.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-gray-800/10 text-gray-800 dark:text-gray-200 hover:bg-gray-800 hover:text-white transition-all duration-300 border border-gray-800/20"
                    >
                      <i className="ri-github-fill text-xl"></i>
                    </a>
                    <a
                      href={data.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-blue-600/20"
                    >
                      <i className="ri-linkedin-fill text-xl"></i>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AboutPageCustomization = () => {
  const [data, setData] = useState<Partial<AboutMeDocument>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/about-me");
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prevData) => ({
          ...prevData,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatChange = (
    index: number,
    field: keyof Stat,
    value: string
  ) => {
    setData((prevData) => {
      const newStats = [...(prevData.stats || [])];
      newStats[index] = { ...newStats[index], [field]: value };
      return { ...prevData, stats: newStats };
    });
  };

  const addStat = () => {
    setData((prevData) => {
      const newStats = [
        ...(prevData.stats || []),
        {
          _id: new Date().getTime().toString(),
          label: "",
          value: "",
        } as unknown as Stat,
      ];
      return { ...prevData, stats: newStats };
    });
  };

  const removeStat = (index: number) => {
    setData((prevData) => {
      const newStats = [...(prevData.stats || [])];
      newStats.splice(index, 1);
      return { ...prevData, stats: newStats };
    });
  };

  const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      socials: {
        ...prevData.socials,
        youtube: "",
        website: "",
        github: "",
        linkedin: "",
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/about-me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update data");
      }
      const updatedData = await response.json();
      setData(updatedData);
      alert("About me section updated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      alert("Failed to update section.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Instructor data={data} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">
          Customize &quot;About Me&quot; Section
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            value={data.name || ""}
            onChange={handleInputChange}
            placeholder="Name"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <input
            type="text"
            name="title"
            value={data.title || ""}
            onChange={handleInputChange}
            placeholder="Title"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <input
            type="text"
            name="location"
            value={data.location || ""}
            onChange={handleInputChange}
            placeholder="Location"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <textarea
            name="bio"
            value={data.bio || ""}
            onChange={handleInputChange}
            placeholder="Bio"
            rows={3}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <textarea
            name="mission"
            value={data.mission || ""}
            onChange={handleInputChange}
            placeholder="Mission"
            rows={3}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />

          <div>
            <label>Profile Image</label>
            <input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>

          <h3 className="text-xl font-bold">Stats</h3>
          {(data.stats || []).map((stat, index) => (
            <div key={index} className="flex items-center gap-4">
              <input
                type="text"
                value={stat.label}
                onChange={(e) =>
                  handleStatChange(index, "label", e.target.value)
                }
                placeholder="Label"
                className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <input
                type="text"
                value={stat.value}
                onChange={(e) =>
                  handleStatChange(index, "value", e.target.value)
                }
                placeholder="Value"
                className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeStat(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStat}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
          >
            Add Stat
          </button>

          <h3 className="text-xl font-bold">Socials</h3>
          <input
            type="text"
            name="youtube"
            value={data.socials?.youtube || ""}
            onChange={handleSocialsChange}
            placeholder="YouTube URL"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <input
            type="text"
            name="website"
            value={data.socials?.website || ""}
            onChange={handleSocialsChange}
            placeholder="Website URL"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <input
            type="text"
            name="github"
            value={data.socials?.github || ""}
            onChange={handleSocialsChange}
            placeholder="GitHub URL"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <input
            type="text"
            name="linkedin"
            value={data.socials?.linkedin || ""}
            onChange={handleSocialsChange}
            placeholder="LinkedIn URL"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />

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

export default AboutPageCustomization;
