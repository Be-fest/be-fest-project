"use client";

import { useOffCanvas } from "@/contexts/OffCanvasContext";
import { OffCanvasCart } from "./OffCanvasCart";

export function CartWrapper() {
  const { isCartOpen, closeCart, showPartyConfig, pendingService } = useOffCanvas();
  return (
    <OffCanvasCart 
      isOpen={isCartOpen} 
      onClose={closeCart}
      showPartyConfig={showPartyConfig}
      pendingService={pendingService}
    />
  );
}
