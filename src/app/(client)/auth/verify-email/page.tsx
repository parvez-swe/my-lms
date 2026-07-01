"use client";

import React, { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
