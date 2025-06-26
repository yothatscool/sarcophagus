"use client";
import React, { useState } from "react";
import OnboardingFlow from "./OnboardingFlow";

export default function UserOnboarding() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <OnboardingFlow isOpen={isOpen} onClose={() => setIsOpen(false)} onComplete={() => setIsOpen(false)} />
  );
} 