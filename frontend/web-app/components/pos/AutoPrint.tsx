"use client";

import { useEffect } from "react";

export default function AutoPrint() {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.print();
      } finally {
        // Optionally close after print: window.close();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
