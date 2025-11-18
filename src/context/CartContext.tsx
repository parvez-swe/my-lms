"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { courses, Course } from "@/data/courses";

interface CartContextType {
  cart: Course[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<Course[]>([]);

  const addToCart = (course: Course) => {
    setCart((prevCart) => {
      if (prevCart.find((item) => item.id === course.id)) {
        alert(`${course.title} is already in your cart.`);
        return prevCart;
      }
      alert(`${course.title} has been added to your cart.`);
      return [...prevCart, course];
    });
  };

  const removeFromCart = (courseId: number) => {
    setCart((prevCart) => prevCart.filter((course) => course.id !== courseId));
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
