import React from "react";
import { Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Signin from "./components/Signin";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Activities from "./components/Activities";
import Sidebar from "./Sidebar";

function App() {
  const [user, setUser] = React.useState(null);
  const [initializing, setInitializing] = React.useState(true);

  function onAuthStateChange(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, onAuthStateChange);

    return () => unsubscribeAuth();
  }, []);

  if (initializing) return null;

  if (user === null) {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    );
  } else if (user != null) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/activities" element={<Activities />} />
          </Routes>
        </div>
      </div>
    );
  }
}

export default App;
