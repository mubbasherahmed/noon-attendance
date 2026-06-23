"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import CampusSelector from "@/components/dashboard/CampusSelector";
import TransferModal from "@/components/transfer/TransferModal";
import {
  ArrowLeft,
  ArrowRightLeft,
  Sparkles,
  Users,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

export default function TransferPage() {
  const { refreshRooms, sheetNames, selectedCampus } = useApp();
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-[3px] border-accent bg-[#1e1e1e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="btn-icon bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white no-underline" aria-label="Back">
                <ArrowLeft size={18} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full px-3 py-1 flex items-center justify-center">
                  <span className="text-black font-bold text-xl tracking-tighter leading-none pb-0.5">noon</span>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">
                    Student Transfers
                  </h1>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    Move students between sheets
                  </p>
                </div>
              </div>
            </div>
            <CampusSelector />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="glass-card-static p-8 sm:p-12 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-6">
            <ArrowRightLeft size={32} className="text-accent" />
          </div>

          <h2 className="text-xl font-semibold text-text-primary mb-3">
            Transfer Students Between Sheets
          </h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-8">
            Move students from one attendance sheet to another within{" "}
            <strong className="text-text-primary">
              {selectedCampus || "your campus"}
            </strong>
            . If the student exists on both sheets, their counters will be merged
            automatically.
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left max-w-lg mx-auto">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet size={16} className="text-emerald" />
                <span className="text-xs font-medium text-text-secondary">
                  Available Sheets
                </span>
              </div>
              <p className="text-xl font-bold text-text-primary">
                {sheetNames.length}
              </p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-cyan" />
                <span className="text-xs font-medium text-text-secondary">
                  Transfer Type
                </span>
              </div>
              <p className="text-sm font-medium text-text-primary">
                Move or Merge
              </p>
            </div>
          </div>

          <button
            onClick={() => setTransferOpen(true)}
            className="btn-primary text-base px-8 py-3"
            disabled={sheetNames.length < 2}
          >
            <ArrowRightLeft size={18} />
            Start Transfer
          </button>

          {sheetNames.length < 2 && (
            <p className="text-xs text-text-muted mt-4">
              You need at least 2 sheets in your campus to perform transfers.
            </p>
          )}
        </div>
      </main>

      <TransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        onComplete={refreshRooms}
      />
    </div>
  );
}
