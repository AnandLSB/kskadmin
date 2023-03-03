import React, { useLayoutEffect, useState } from "react";
import { auth } from "../firebase";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getSummary, capitalizeWords } from "../shared/sharedFunc";
import { format } from "date-fns";

const Dashboard = () => {
  const [fullName, setFullName] = useState("");
  const [birthdays, setBirthdays] = useState([]);
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({
    totalVolunteers: null,
    totalActivities: null,
    totalForums: null,
  });

  useLayoutEffect(() => {
    getDashInfo();
  }, []);

  const getBirthdays = async () => {
    const todayStart = new Date();
    const todayEnd = new Date();
    todayStart.setHours(0, 0, 0, 0);
    todayEnd.setHours(23, 59, 59, 999);

    const ref = collection(db, "volunteer");
    const q = query(
      ref,
      where("birthdate", ">=", todayStart),
      where("birthdate", "<=", todayEnd)
    );
    const volunteer = [];

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        volunteer.push({
          ...doc.data(),
          id: doc.id,
          birthdate: doc.data().birthdate.toDate(),
        });
      });

      setBirthdays(volunteer);
    } else {
      setBirthdays(null);
    }
  };

  const getTodaysActivities = async () => {
    const todayStart = new Date();
    const todayEnd = new Date();
    todayStart.setHours(0, 0, 0, 0);
    todayEnd.setHours(23, 59, 59, 999);

    const ref = collection(db, "activities");
    const q = query(
      ref,
      where("activityDatetime", ">=", todayStart),
      where("activityDatetime", "<=", todayEnd)
    );
    const activities = [];

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        activities.push({
          ...doc.data(),
          id: doc.id,
          activityDatetime: doc.data().activityDatetime.toDate(),
          activityDatetimeEnd: doc.data().activityDatetimeEnd.toDate(),
        });
      });

      setActivities(activities);
    } else {
      setActivities(null);
    }
  };

  const getDashInfo = async () => {
    const ref = doc(db, "admin", auth.currentUser.email);
    const docSnap = await getDoc(ref);
    const summary = await getSummary();
    await getBirthdays();
    getTodaysActivities();

    setSummary(summary);
    setFullName(docSnap.data().fullName);
  };

  console.log(activities);

  return (
    <div>
      <div>
        <div className="flex flex-auto items-center h-16 bg-[#EB4335] text-white text-3xl pl-2">
          Dashboard
        </div>
        <p className="text-2xl font-semibold m-2">Hello {fullName}!</p>

        <div className="flex flex-row gap-10 justify-center mt-20">
          <div className="overflow-y-scroll max-h-[200px] w-2/5 rounded">
            <p className="font-bold pb-1">Today's Birthdays</p>
            {birthdays === null ? (
              <p className="text-center">No birthdays today</p>
            ) : (
              birthdays.map((volunteer) => (
                <div
                  key={volunteer.id}
                  className="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
                >
                  <div>
                    <p className="text-lg font-bold">
                      {capitalizeWords(volunteer?.Username)}
                    </p>
                    <p className="font-semibold">
                      Full Name: {capitalizeWords(volunteer.fullName)}
                    </p>
                    <p className="font-semibold">
                      Birthday: {format(volunteer.birthdate, "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="overflow-y-scroll max-h-[200px] w-2/5 rounded">
            <p className="font-bold pb-1">Today's Activities</p>
            {activities === null ? (
              <p className="text-center">No activities today</p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
                >
                  <div>
                    <p className="font-bold">
                      {capitalizeWords(activity.activityName)}
                    </p>
                    <p>
                      Date: {format(activity.activityDatetime, "dd MMM yyyy")}{" "}
                      to {format(activity.activityDatetimeEnd, "dd MMM yyyy")}
                    </p>
                    <p>
                      Time: {format(activity.activityDatetime, "p")} to{" "}
                      {format(activity.activityDatetimeEnd, "p")}
                    </p>
                    <p>Volunteer Slots: {activity.volunteerSlot}</p>
                    <p>Category: {activity.activityCategory}</p>
                    <p>Status: {activity.activityStatus}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-auto justify-center items-center gap-5 mt-24">
          <div className="flex flex-row border border-black bg-[#E9ECEF] p-4 rounded">
            <div className="flex items-center p-2 pl-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Total Volunteers</p>
              <p className="self-center text-base font-semibold">
                {summary.totalVolunteers}
              </p>
            </div>
          </div>

          <div className="flex flex-row border border-black bg-[#E9ECEF] p-4 rounded">
            <div className="flex items-center p-2 pl-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Total Activities</p>
              <p className="self-center text-base font-semibold">
                {summary.totalActivities}
              </p>
            </div>
          </div>

          <div className="flex flex-row border border-black bg-[#E9ECEF] p-4 rounded">
            <div className="flex items-center p-2 pl-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Total Forums</p>
              <p className="self-center text-base font-semibold">
                {summary.totalForums}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
