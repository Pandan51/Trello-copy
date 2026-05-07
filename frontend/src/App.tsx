
import "./App.css";
import "./Components/Content.tsx";
import Navbar from "./Components/Navbar.tsx";
import Content from "./Components/Content.tsx";
import { ThemeContext } from "./Context/ThemeContext.ts";
import {useContext, useState} from "react";


function App() {

    // const ThemeContext = ThemeContext();
    const [theme, setTheme] = useState('dark');

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
    <ThemeContext value={theme}>
        <Navbar email={"example@gmail.com"}/>
        <button onClick={()=>{
            if(theme === "dark") {
                setTheme("light");
            }
            else if (theme === "light") {
                setTheme("dark");
            }
        }
        }>Change theme</button>
        <Content/>
        <h2>Drag box</h2>
        <p id="p1" draggable="true" onDragStart={handleDragStart}>This element is draggable.</p>
        <p id="target" onDragOver={handleDragOver} onDrop={handleDrop}>Drop Zone</p>
    </ThemeContext>
  )
}

export default App
