import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Dashboard = () => {
  return (
    <div>
      <div>
        <div className="flex-auto pb-10 bg-[#EB4335] text-white">Dashboard</div>
        <p>{auth.currentUser.email}</p>
        <button onClick={() => signOut(auth)}>Sign Out</button>
      </div>
    </div>
  );
};

export default Dashboard;
