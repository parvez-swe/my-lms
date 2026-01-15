"use client";

import React, { useState, useEffect } from "react";
import { WhyChooseUsDocument, Feature } from "@/models/WhyChooseUs";
import Image from "next/image";

interface FeaturesProps {
  data: Partial<WhyChooseUsDocument>;
}

const Features: React.FC<FeaturesProps> = ({ data }) => {
  return (
    <>
      <div className="relative z-[1] py-[60px] md:py-[80px] lg:py-[100px] xl:py-[150px]">
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="mx-auto text-center md:max-w-[650px] lg:max-w-[810px] xl:max-w-[785px] mb-[35px] md:mb-[50px] lg:mb-[65px] xl:mb-[90px]">
            <div className="inline-block relative mt-[10px] mb-[20px]">
              <span className="absolute top-[4.5px] w-[5px] h-[5px] ltr:-left-[3.6px] rtl:-right-[3.6px] bg-purple-600 -rotate-[6.536deg]"></span>
              <span className="absolute -top-[9.5px] w-[5px] h-[5px] ltr:right-0 rtl:left-0 bg-purple-600 -rotate-[6.536deg]"></span>
              <span className="inline-block relative text-purple-600 border border-purple-600 py-[5.5px] px-[17.2px] -rotate-[6.536deg]">
                {data.title}
              </span>
            </div>
            <h2 className="!mb-0 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2]">
              {data.subtitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px]">
            {(data.features || []).map((feature, index) => (
              <div
                key={index}
                className="text-center ltr:lg:text-left rtl:lg:text-right"
              >
                <div
                  className={`flex items-center justify-center w-[80px] h-[80px] md:w-[85px] md:h-[85px] rounded-[10px] md:rounded-[17px] mb-[20px] lg:mb-[22px] mx-auto lg:mx-0 ${feature.bgColor}`}
                >
                  <Image
                    src={feature.icon}
                    width={50}
                    height={50}
                    className="inline-block"
                    alt={feature.title}
                  />
                </div>

                <h3 className="!text-lg md:!text-[20px] lg:!text-[22px] xl:!text-[24px] !mb-[10px] md:!mb-[12px] xl:!mb-[13px] !font-semibold !leading-[1.2]">
                  {feature.title}
                </h3>

                <p className="xl:max-w-[375px] leading-[1.6]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const WhyChooseUsSectionPage = () => {
  const [data, setData] = useState<Partial<WhyChooseUsDocument>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/why-choose-us");
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

  const handleFeatureChange = (
    index: number,
    field: keyof Feature,
    value: string
  ) => {
    setData((prevData) => {
      const newFeatures = [...(prevData.features || [])];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      return { ...prevData, features: newFeatures };
    });
  };

  const handleFeatureIconUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFeatureChange(index, "icon", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

const addFeature = () => {
    setData((prevData) => {
      const newFeatures = [
        ...(prevData.features || []),
        { _id: new Date().getTime().toString(), title: "", description: "", icon: "", bgColor: "" } as unknown as Feature,
      ];
      return { ...prevData, features: newFeatures };
    });
  };

  const removeFeature = (index: number) => {
    setData((prevData) => {
      const newFeatures = [...(prevData.features || [])];
      newFeatures.splice(index, 1);
      return { ...prevData, features: newFeatures };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/why-choose-us", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update data");
      }
      const updatedData = await response.json();
      setData(updatedData);
      alert('"Why Choose Us" section updated successfully!');
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
      <Features data={data} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">
          Customize &quot;Why Choose Us&quot; Section
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              htmlFor="subtitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              id="subtitle"
              value={data.subtitle || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <h3 className="text-xl font-bold mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            Features
          </h3>
          <div className="space-y-4">
            {(data.features || []).map((feature, index) => (
              <div
                key={index}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={feature.title}
                    onChange={(e) =>
                      handleFeatureChange(index, "title", e.target.value)
                    }
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={feature.description}
                    onChange={(e) =>
                      handleFeatureChange(index, "description", e.target.value)
                    }
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Background Color"
                    value={feature.bgColor}
                    onChange={(e) =>
                      handleFeatureChange(index, "bgColor", e.target.value)
                    }
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Icon URL"
                      value={feature.icon}
                      onChange={(e) =>
                        handleFeatureChange(index, "icon", e.target.value)
                      }
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                      type="file"
                      onChange={(e) => handleFeatureIconUpload(e, index)}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="mt-2 text-red-500 hover:text-red-700"
                >
                  Remove Feature
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addFeature}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
          >
            Add Feature
          </button>

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

export default WhyChooseUsSectionPage;
