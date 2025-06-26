"use client";
import React, { useState } from "react";
import VaultManagementModal from "./VaultManagementModal";

export default function ManageVault() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <VaultManagementModal isOpen={isOpen} onClose={() => setIsOpen(false)} vault={null} />
  );
} 