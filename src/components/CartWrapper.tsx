"use client";

import React from 'react';
import { useOffCanvas } from "@/contexts/OffCanvasContext";
import { OffCanvasCart } from "./OffCanvasCart";

export function CartWrapper() {
  const { isOpen, closeOffCanvas } = useOffCanvas();

  return (
    <OffCanvasCart
      isOpen={isOpen}
      onClose={closeOffCanvas}
    />
  );
}
