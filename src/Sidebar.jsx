import React from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#CCCCCC]">
      <div className="flex flex-row bg-[#EB4335] pb-3  items-center">
        <img
          src={process.env.PUBLIC_URL + "/kskLogo.png"}
          alt="logo"
          className="w-10 h-10 ml-4 mt-3"
        />
        <p className="text-white pt-3 font-semibold">Kechara Soup Kitchen</p>
      </div>
      <nav className="flex flex-col bg-[#CCCCCC] w-60 h-screen px-4">
        <div className="mt-5 mb-4">
          <ul className="ml-0">
            <li className="mb-2 py-4 text-black flex flex-row  border-gray-300 hover:text-black   hover:bg-gray-300  hover:font-bold  rounded-lg">
              <span>
                <svg className="fill-current h-6 w-6" viewBox="0 0 24 24">
                  <path
                    d="M16 20h4v-4h-4m0-2h4v-4h-4m-6-2h4V4h-4m6
                            4h4V4h-4m-6 10h4v-4h-4m-6 4h4v-4H4m0 10h4v-4H4m6
                            4h4v-4h-4M4 8h4V4H4v4z"
                  ></path>
                </svg>
              </span>
              <p>
                <span className="ml-2">
                  <Link to="/">Dashboard</Link>
                </span>
              </p>
            </li>
            <li className="mb-2 py-4 text-black flex flex-row  border-gray-300 hover:text-black   hover:bg-gray-300  hover:font-bold  rounded-lg">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </span>
              <span className="ml-2">
                <Link to="/volunteeracc">Volunteer Accounts</Link>
              </span>
            </li>
            <li className="mb-2 py-4 text-black flex flex-row  border-gray-300 hover:text-black   hover:bg-gray-300  hover:font-bold  rounded-lg">
              <span>
                <svg className="fill-current h-5 w-5 " viewBox="0 0 24 24">
                  <path
                    d="M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2
                            2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0
                            00-2-2h-1V1m-1 11h-5v5h5v-5z"
                  ></path>
                </svg>
              </span>
              <p href="#">
                <span className="ml-2">
                  <Link to="/activities">Volunteer Activities</Link>
                </span>
              </p>
            </li>
            <li className="mb-2 py-4 text-black flex flex-row  border-gray-300 hover:text-black   hover:bg-gray-300  hover:font-bold rounded-lg">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
              </span>

              <span className="ml-2">
                <Link to="/forums">Forums</Link>
              </span>
            </li>
            <li className="mb-2 py-4 text-black flex flex-row  border-gray-300 hover:text-black   hover:bg-gray-300  hover:font-bold rounded-lg">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </span>
              <span className="ml-2">
                <Link to="/beneficiaryinfo">Beneficiary Information</Link>
              </span>
            </li>
            <li className="mb-2 py-4 text-black flex flex-row  border-gray-300 hover:text-black   hover:bg-gray-300  hover:font-bold rounded-lg">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </span>
              <span className="ml-2">
                <Link to="/milestones">Volunteer Milestones</Link>
              </span>
            </li>
            <li className="mb-2 py-4 text-black flex flex-row  border-gray-300 hover:text-black   hover:bg-gray-300  hover:font-bold rounded-lg">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                  />
                </svg>
              </span>
              <span className="ml-2">
                <Link to="/analytics">Analytics</Link>
              </span>
            </li>
            <li className="mb-2 py-4 text-black flex flex-row  border-gray-300 hover:text-black   hover:bg-gray-300  hover:font-bold rounded-lg">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              <span className="ml-2">
                <Link to="/account">Account</Link>
              </span>
            </li>
            <li className="mb-2 py-4 text-black flex flex-row  border-gray-300 hover:text-black   hover:bg-gray-300  hover:font-bold rounded-lg">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </span>
              <button
                onClick={() => {
                  signOut(auth).then(() => {
                    navigate("/");
                  });
                }}
                className="ml-2"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
