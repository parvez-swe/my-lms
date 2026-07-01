"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CHART_PRIMARY = "#605DFF";
const CHART_COLORS = ["#3584FC", "#37D80A", "#FD5812"];

interface AnalyticsOverview {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  pendingEnrollments: number;
  approvedEnrollments: number;
  recentEnrollments: number;
  newStudentsThisMonth: number;
  enrollmentsByDay: { date: string; count: number }[];
  topCourses: { slug: string; title: string; enrollmentCount: number }[];
  enrollmentsByStatus: { pending: number; approved: number; rejected: number };
}

function StatCardSkeleton() {
  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <div
      className="animate-pulse bg-gray-100 dark:bg-[#15203c] rounded-md"
      style={{ height }}
    />
  );
}

export default function DashboardOverview() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    setChartReady(true);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/analytics/overview");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load analytics");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const lineOptions: ApexOptions = {
    chart: { zoom: { enabled: false }, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    colors: [CHART_PRIMARY],
    fill: {
      type: "gradient",
      gradient: {
        stops: [0, 90, 100],
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.9,
      },
    },
    xaxis: {
      categories:
        data?.enrollmentsByDay.map((d) =>
          new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        ) ?? [],
      axisTicks: { show: false, color: "#ECEEF2" },
      axisBorder: { show: false, color: "#ECEEF2" },
      labels: {
        show: true,
        rotate: -45,
        style: { colors: "#8695AA", fontSize: "11px" },
      },
    },
    yaxis: {
      tickAmount: 5,
      labels: { style: { colors: "#64748B", fontSize: "12px" } },
    },
    grid: { borderColor: "#ECEEF2" },
    tooltip: { x: { show: true } },
  };

  const lineSeries = [
    {
      name: "Enrollments",
      data: data?.enrollmentsByDay.map((d) => d.count) ?? [],
    },
  ];

  const donutOptions: ApexOptions = {
    labels: ["Pending", "Approved", "Rejected"],
    colors: CHART_COLORS,
    stroke: { width: 1, colors: ["#ffffff"] },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
      labels: { colors: "#64748B" },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: "#64748B",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  const donutSeries = data
    ? [
        data.enrollmentsByStatus.pending,
        data.enrollmentsByStatus.approved,
        data.enrollmentsByStatus.rejected,
      ]
    : [];

  const statCards = data
    ? [
        {
          label: "Total Students",
          value: data.totalStudents.toLocaleString(),
          icon: "school",
          color: "text-primary-500 bg-primary-100 dark:bg-[#15203c]",
        },
        {
          label: "Total Courses",
          value: data.totalCourses.toLocaleString(),
          icon: "auto_stories",
          color: "text-secondary-500 bg-secondary-100 dark:bg-[#15203c]",
        },
        {
          label: "Total Enrollments",
          value: data.totalEnrollments.toLocaleString(),
          icon: "group",
          color: "text-purple-500 bg-purple-100 dark:bg-[#15203c]",
        },
        {
          label: "Completion Rate",
          value: `${data.completionRate}%`,
          icon: "verified",
          color: "text-success-600 bg-success-100 dark:bg-[#15203c]",
        },
      ]
    : [];

  return (
    <div className="space-y-[25px]">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="!mb-0 !text-xl font-semibold text-black dark:text-white">
            LMS Dashboard
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Live platform metrics from MongoDB
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#172036] rounded-md text-sm hover:bg-gray-50 dark:hover:bg-[#15203c] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[25px]">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <div
                key={card.label}
                className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"
              >
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  {card.label}
                </span>
                <h5 className="!text-[24px] mt-[5px] !mb-[15px]">
                  {card.value}
                </h5>
                <div
                  className={`flex items-center justify-center w-[50px] h-[50px] rounded-full ${card.color}`}
                >
                  <i className="material-symbols-outlined !text-[26px]">
                    {card.icon}
                  </i>
                </div>
              </div>
            ))}
      </div>

      <div className="lg:grid lg:grid-cols-3 gap-[25px]">
        <div className="lg:col-span-2">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5 className="!mb-[20px]">Enrollments (Last 30 Days)</h5>
            {loading || !chartReady ? (
              <ChartSkeleton height={350} />
            ) : (
              <Chart
                options={lineOptions}
                series={lineSeries}
                type="area"
                height={350}
                width="100%"
              />
            )}
          </div>
        </div>

        <div>
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <h5 className="!mb-[20px]">Enrollments by Status</h5>
            {loading || !chartReady ? (
              <ChartSkeleton height={350} />
            ) : (
              <Chart
                options={donutOptions}
                series={donutSeries}
                type="donut"
                height={350}
                width="100%"
              />
            )}
          </div>
        </div>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <h5 className="!mb-[20px]">Top Courses</h5>
        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#172036]">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Slug</th>
                <th className="pb-3 font-medium text-right">Enrollments</th>
              </tr>
            </thead>
            <tbody className="text-black dark:text-white">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4">
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                      <td className="py-4">
                        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                      <td className="py-4 text-right">
                        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                : data?.topCourses.length
                  ? data.topCourses.map((course) => (
                      <tr
                        key={course.slug}
                        className="border-b border-gray-100 dark:border-[#172036] last:border-0"
                      >
                        <td className="py-4 font-medium">{course.title}</td>
                        <td className="py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {course.slug}
                        </td>
                        <td className="py-4 text-right font-semibold">
                          {course.enrollmentCount}
                        </td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-gray-500"
                        >
                          No enrollment data yet
                        </td>
                      </tr>
                    )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[25px]">
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] rounded-md text-center">
            <span className="text-sm text-gray-500">Last 7 Days</span>
            <h5 className="!text-xl !mb-0 mt-1">{data.recentEnrollments}</h5>
            <span className="text-xs text-gray-400">new enrollments</span>
          </div>
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] rounded-md text-center">
            <span className="text-sm text-gray-500">New Students</span>
            <h5 className="!text-xl !mb-0 mt-1">{data.newStudentsThisMonth}</h5>
            <span className="text-xs text-gray-400">this month</span>
          </div>
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] rounded-md text-center">
            <span className="text-sm text-gray-500">Pending</span>
            <h5 className="!text-xl !mb-0 mt-1">{data.pendingEnrollments}</h5>
            <span className="text-xs text-gray-400">awaiting approval</span>
          </div>
        </div>
      )}
    </div>
  );
}
