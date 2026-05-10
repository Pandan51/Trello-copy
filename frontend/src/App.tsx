import "./App.css";
import "./Components/Content.tsx";
import Navbar from "./Components/Navbar.tsx";
import Content from "./Components/Content.tsx";
import { ThemeContext } from "./Context/ThemeContext.ts";
import { useContext, useState } from "react";
import ThemeProvider from "./Context/ThemeProvider.tsx";

function App() {
  // const ThemeContext = ThemeContext();

  // Handler for when the drag starts
  const handleDragStart = (e: React.DragEvent) => {
    // We use the ID of the element to know what to move
    e.dataTransfer.setData("text/plain", "This element is draggable.");
    e.dataTransfer.effectAllowed = "move";
  };

  // Handler for the Drop Zone
  const handleDragOver = (e: React.DragEvent) => {
    // CRITICAL: This allows the drop to happen
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");

    // In a real app, you would update state here!
    console.log("Dropped:", data);
    (e.target as HTMLElement).append(data);
  };

  return (
    <ThemeProvider>
      <Navbar email={"example@gmail.com"} />

      <Content />
    </ThemeProvider>
  );
}

export default App;
