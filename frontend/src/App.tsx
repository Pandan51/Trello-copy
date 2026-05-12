import "./App.css";
import "./Components/Content.tsx";
import Navbar from "./Components/Navbar.tsx";
import Content from "./Components/Content.tsx";

import ThemeProvider from "./Context/ThemeProvider.tsx";

function App() {
  return (
    <ThemeProvider>
      <Navbar email={"example@gmail.com"} />

      <Content />
    </ThemeProvider>
  );
}

export default App;
