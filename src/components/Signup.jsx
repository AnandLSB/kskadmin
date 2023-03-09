import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password).then(() =>
        signOut(auth)
      );
      await setDoc(doc(db, "admin", email), {
        fullName: name,
        email: email,
        category: "normal",
        approved: false,
        createdAt: serverTimestamp(),
      }).then(() => {
        navigate("/");
        alert(
          "Admin account created, please wait for approval from master admin."
        );
      });
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("Email already in use.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email.");
      } else if (error.code === "auth/weak-password") {
        alert("Password must be at least 6 characters.");
      } else {
        alert(error.message);
      }
    }
  };

  console.log(password, email);

  return (
    <div className="bg-[#808080] h-screen overflow-hidden flex items-center justify-center">
      <div className="bg-[#EB4335] lg:w-5/12 md:6/12 w-10/12 shadow-3xl">
        <div class="flex flex-row justify-center">
          <img
            src={process.env.PUBLIC_URL + "/kskLogo.png"}
            alt="logo"
            className="w-10 h-10 ml-4 mt-8"
          />
          <p className="text-white text-lg font-bold pt-10">
            Kechara Soup Kitchen Admin
          </p>
        </div>
        <div className="flex justify-center">
          <p className="font-semibold text-white pt-2">Sign Up</p>
        </div>

        <form className="p-12 md:p-24" onSubmit={handleSignup}>
          <div className="flex items-center text-lg mb-6 md:mb-8">
            <svg className="absolute ml-3" width="24" viewBox="0 0 24 24">
              <path d="M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z" />
            </svg>
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              id="name"
              className="bg-gray-200 pl-12 py-2 md:py-2 focus:outline-none w-full"
              placeholder="Full Name"
              required
            />
          </div>
          <div className="flex items-center text-lg mb-6 md:mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="absolute ml-3 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
              />
            </svg>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              className="bg-gray-200 pl-12 py-2 md:py-2 focus:outline-none w-full"
              placeholder="Email"
              required
            />
          </div>
          <div className="flex items-center text-lg mb-6 md:mb-8">
            <svg className="absolute ml-3" viewBox="0 0 24 24" width="24">
              <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
            </svg>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              className="bg-gray-200 pl-12 py-2 md:py-2 focus:outline-none w-full"
              placeholder="Password"
              required
            />
          </div>
          <button className="bg-[#7f8fa6] font-medium p-2 md:p-4 text-white uppercase w-full">
            Sign Up
          </button>
        </form>
        <div className="flex justify-center pb-2">
          <p className="text-white font-semibold">
            Already have an account?{" "}
            <Link to="/" className="text-white font-bold underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
