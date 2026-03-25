
import "./App.css";
import "./Components/Content.tsx";


import Navbar from "./Components/Navbar.tsx";
import Content from "./Components/Content.tsx";


function App() {


  return (
    <>
        <Navbar email={"example@gmail.com"}/>
        <Content/>
    </>
  )
}

export default App
