"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Course } from "@/data/courses";

interface CartContextType {
  cart: Course[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseSlug: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<Course[]>([]);

  const addToCart = (course: Course) => {
    setCart((prevCart) => {
      if (prevCart.find((item) => item.slug === course.slug)) {
        alert(`${course.title} is already in your cart.`);
        return prevCart;
      }
      alert(`${course.title} has been added to your cart.`);
      return [...prevCart, course];
    });
  };

  const removeFromCart = (courseSlug: string) => {
    setCart((prevCart) =>
      prevCart.filter((course) => course.slug !== courseSlug)
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
