"use client";

import React, { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  Loader2,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "mdparvezmusharaf2@gmail.com",
    href: "mailto:mdparvezmusharaf2@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+880 1XXX-XXXXXX",
    href: "tel:+8801XXXXXXXXX",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Dhaka, Bangladesh",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      setStatus({ loading: false, success: true, error: "" });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setStatus({ loading: false, success: false, error: errorMessage });
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-[#15203b] dark:text-white dark:focus:border-violet-400";

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-[1320px]">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-5 lg:gap-14">
          {/* Left — image + contact cards */}
          <div className="space-y-6 lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-violet-500/10">
              <Image
                src="/images/front-pages/contact.jpg"
                alt="Contact us"
                width={554}
                height={724}
                className="h-64 w-full object-cover lg:h-auto lg:min-h-[420px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-violet-900/80 via-violet-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-sm font-medium text-violet-200">We reply within 24 hours</p>
                <p className="text-xl font-bold">Let&apos;s build your learning journey together</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-[#15203b]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="font-medium text-slate-900 hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-medium text-slate-900 dark:text-white">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-gray-700 dark:bg-[#15203b] dark:shadow-none md:p-10">
              <div className="mb-8 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  <MessageSquare size={22} />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Send us a message
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    Fill out the form and we&apos;ll get back to you soon.
                  </p>
                </div>
              </div>

              {status.success && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <CheckCircle2 size={20} />
                  <span className="font-medium">Message sent successfully! We&apos;ll reply soon.</span>
                </div>
              )}
              {status.error && (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
                  {status.error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className={inputClass}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className={inputClass}
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
                    Message *
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[140px] resize-y py-3`}
                    placeholder="How can we help you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={status.loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 sm:w-auto"
                >
                  {status.loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
