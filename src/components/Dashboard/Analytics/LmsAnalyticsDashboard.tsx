"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CHART_COLORS = ["#605DFF", "#AD63F6", "#3584FC", "#FD5812"];

interface AnalyticsData {
  totalStudents: number;
  totalEnrollments: number;
  completionRate: number;
  newStudentsThisMonth: number;
  enrollmentsThisMonth: number;
  enrollmentsLastMonth: number;
  monthOverMonthChange: number;
  enrollmentsByDay: { date: string; count: number }[];
  enrollmentsByStatus: { pending: number; approved: number; rejected: number };
  courseCompletionRates: {
    slug: string;
    title: string;
    avgCompletionRate: number;
  }[];
  studentRetention: { multiCourse: number; singleCourse: number };
  topCourses: { slug: string; title: string; enrollmentCount: number }[];
}

export default function LmsAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
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

  const momPositive = (data?.monthOverMonthChange ?? 0) >= 0;

  const comparisonOptions: ApexOptions = {
    chart: { toolbar: { show: false } },
    colors: [CHART_COLORS[0], CHART_COLORS[2]],
    plotOptions: {
      bar: { columnWidth: "45%", borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Last Month", "This Month"],
      labels: { style: { colors: "#8695AA", fontSize: "12px" } },
    },
    yaxis: {
      labels: { style: { colors: "#64748B", fontSize: "12px" } },
    },
    grid: { borderColor: "#ECEEF2" },
    legend: { show: false },
  };

  const comparisonSeries = [
    {
      name: "Enrollments",
      data: [data?.enrollmentsLastMonth ?? 0, data?.enrollmentsThisMonth ?? 0],
    },
  ];

  const completionCategories =
    data?.courseCompletionRates.map((c) =>
      c.title.length > 25 ? `${c.title.slice(0, 25)}…` : c.title
    ) ?? [];

  const completionBarOptions: ApexOptions = {
    chart: { toolbar: { show: false } },
    colors: [CHART_COLORS[1]],
    plotOptions: {
      bar: { horizontal: true, barHeight: "60%", borderRadius: 4 },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
      style: { fontSize: "11px" },
    },
    xaxis: {
      max: 100,
      categories: completionCategories,
      labels: { style: { colors: "#8695AA", fontSize: "12px" } },
    },
    yaxis: {
      labels: { style: { colors: "#64748B", fontSize: "12px" } },
    },
    grid: { borderColor: "#ECEEF2" },
  };

  const completionBarSeries = [
    {
      name: "Avg Completion",
      data: data?.courseCompletionRates.map((c) => c.avgCompletionRate) ?? [],
    },
  ];

  const retentionOptions: ApexOptions = {
    labels: ["Multiple Courses", "Single Course"],
    colors: [CHART_COLORS[0], CHART_COLORS[3]],
    stroke: { width: 1, colors: ["#ffffff"] },
    legend: {
      show: true,
      position: "bottom",
      labels: { colors: "#64748B" },
    },
    plotOptions: {
      pie: { donut: { size: "60%" } },
    },
    dataLabels: { enabled: false },
  };

  const retentionSeries = data
    ? [data.studentRetention.multiCourse, data.studentRetention.singleCourse]
    : [];

  const trendOptions: ApexOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    colors: [CHART_COLORS[2]],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    xaxis: {
      categories:
        data?.enrollmentsByDay.map((d) =>
          new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        ) ?? [],
      labels: { rotate: -45, style: { colors: "#8695AA", fontSize: "10px" } },
    },
    yaxis: { labels: { style: { colors: "#64748B", fontSize: "12px" } } },
    grid: { borderColor: "#ECEEF2" },
  };

  const trendSeries = [
    {
      name: "Daily Enrollments",
      data: data?.enrollmentsByDay.map((d) => d.count) ?? [],
    },
  ];

  return (
    <div className="space-y-[25px]">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="!mb-0 !text-xl font-semibold">LMS Analytics</h4>
          <p className="text-sm text-gray-500 mt-1">
            Enrollment trends, completion rates, and student retention
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px]">
        {[
          { label: "Total Students", value: data?.totalStudents },
          { label: "Total Enrollments", value: data?.totalEnrollments },
          { label: "Completion Rate", value: data ? `${data.completionRate}%` : undefined },
          { label: "New Students (Month)", value: data?.newStudentsThisMonth },
        ].map((stat) => (
          <div
            key={stat.label}
            className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md"
          >
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-500">{stat.label}</span>
                <h5 className="!text-2xl !mb-0 mt-1">{stat.value ?? "—"}</h5>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-2 gap-[25px]">
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <div className="flex items-center justify-between mb-[20px]">
            <h5 className="!mb-0">Month-over-Month Enrollments</h5>
            {!loading && data && (
              <span
                className={`inline-flex items-center gap-1 text-sm font-medium ${
                  momPositive ? "text-success-600" : "text-danger-500"
                }`}
              >
                {momPositive ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {data.monthOverMonthChange > 0 ? "+" : ""}
                {data.monthOverMonthChange}%
              </span>
            )}
          </div>
          {loading || !chartReady ? (
            <div className="h-[300px] animate-pulse bg-gray-100 dark:bg-[#15203c] rounded" />
          ) : (
            <Chart
              options={comparisonOptions}
              series={comparisonSeries}
              type="bar"
              height={300}
              width="100%"
            />
          )}
        </div>

        <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
          <h5 className="!mb-[20px]">Student Retention</h5>
          <p className="text-xs text-gray-500 mb-4">
            Approved students enrolled in multiple vs. single courses
          </p>
          {loading || !chartReady ? (
            <div className="h-[300px] animate-pulse bg-gray-100 dark:bg-[#15203c] rounded" />
          ) : (
            <Chart
              options={retentionOptions}
              series={retentionSeries}
              type="donut"
              height={300}
              width="100%"
            />
          )}
        </div>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <h5 className="!mb-[20px]">Average Completion Rate per Course</h5>
        {loading || !chartReady ? (
          <div className="h-[400px] animate-pulse bg-gray-100 dark:bg-[#15203c] rounded" />
        ) : data?.courseCompletionRates.length ? (
          <Chart
            options={completionBarOptions}
            series={completionBarSeries}
            type="bar"
            height={Math.max(300, data.courseCompletionRates.length * 45)}
            width="100%"
          />
        ) : (
          <p className="text-gray-500 text-center py-12">No completion data yet</p>
        )}
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <h5 className="!mb-[20px]">Enrollment Trend (30 Days)</h5>
        {loading || !chartReady ? (
          <div className="h-[350px] animate-pulse bg-gray-100 dark:bg-[#15203c] rounded" />
        ) : (
          <Chart
            options={trendOptions}
            series={trendSeries}
            type="line"
            height={350}
            width="100%"
          />
        )}
      </div>
    </div>
  );
}
