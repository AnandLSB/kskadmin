import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ref = doc(db, "admin", email);
    await getDoc(ref).then((adminDoc) => {
      if (adminDoc.exists()) {
        if (adminDoc.data().approved === false) {
          alert(
            "Your admin account is not approved yet, please contact master admin."
          );
        } else {
          signInWithEmailAndPassword(auth, email, password).catch((error) => {
            if (error.code === "auth/user-not-found") {
              alert("No user found with this email.");
            } else if (error.code === "auth/wrong-password") {
              alert("Wrong password.");
            } else {
              alert(error.message);
            }
          });
        }
      } else {
        alert("No valid admin account exists with this email.");
      }
    });
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password Reset Email Sent! Please check your email");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div class="bg-[#808080] h-screen overflow-hidden flex items-center justify-center">
      <div class="bg-[#EB4335] lg:w-5/12 md:6/12 w-10/12 shadow-3xl">
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
          <p className="font-semibold text-white pt-2">Sign In</p>
        </div>

        <form class="p-12 md:p-24" onSubmit={handleSubmit}>
          <div class="flex items-center text-lg mb-6 md:mb-8">
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
              class="bg-gray-200 pl-12 py-2 md:py-4 focus:outline-none w-full"
              placeholder="Email"
              required
            />
          </div>
          <div class="flex items-center text-lg mb-6 md:mb-8">
            <svg class="absolute ml-3" viewBox="0 0 24 24" width="24">
              <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
            </svg>

            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              class="bg-gray-200 pl-12 py-2 md:py-4 focus:outline-none w-full"
              placeholder="Password"
              required
            />
          </div>
          <button className="bg-[#7f8fa6] font-medium p-2 md:p-4 text-white uppercase w-full">
            Login
          </button>
        </form>
        <div className="flex flex-row gap-4 justify-center items-center py-4">
          <button
            onClick={handlePasswordReset}
            className="text-white font-lg font-semibold"
          >
            Forgot Password
          </button>
          <p className="text-white font-lg font-semibold">
            <Link to={"/signup"}> Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;
