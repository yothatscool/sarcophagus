"use client";
import React, { useState } from "react";
import VaultManagementModal from "./VaultManagementModal";

export default function ManageVault() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
      >
        Manage Vault
      </button>
      
      <VaultManagementModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        vault={null} 
      />
    </div>
  );
} 