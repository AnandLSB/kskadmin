import React, { useEffect, useState } from "react";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  getDocs,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { capitalizeWords } from "../shared/sharedFunc";
import { format } from "date-fns";

const VolunteerAcc = () => {
  const volunteerRef = collection(db, "volunteer");
  const [volunteers, setVolunteers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(volunteerRef, (snapshot) => {
      const volunteerData = [];

      snapshot.forEach((volunteerDoc) => {
        volunteerData.push({ ...volunteerDoc.data(), id: volunteerDoc.id });
      });

      setVolunteers(volunteerData);
    });

    return unsubscribe;
  }, []);

  const searchVolunteer = async () => {
    const volunteerRef = collection(db, "volunteer");
    const volunteerData = [];

    const q = query(
      volunteerRef,
      orderBy("Username"),
      startAt(search.toLowerCase()),
      endAt(search.toLowerCase() + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      volunteerData.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    if (volunteerData.length > 0) {
      setVolunteers(volunteerData);
    } else {
      setVolunteers(null);
    }
  };

  console.log(volunteers);

  return (
    <div>
      <div className="flex flex-auto items-center h-16 bg-[#EB4335] text-white text-3xl pl-2">
        Volunteer Accounts
      </div>
      <div className="flex justify-center py-1">
        <input
          value={search}
          type="text"
          placeholder="Search Volunteers by Username"
          className="border border-black w-96 rounded"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="inline-flex justify-center mx-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          onClick={() => {
            if (search === "") {
              alert("Please enter a search term");
            } else {
              searchVolunteer();
            }
          }}
        >
          Search
        </button>
      </div>
      <div className="p-5 h-[592px] overflow-y-scroll rounded">
        {volunteers === null ? (
          <p>No Volunteers Found</p>
        ) : (
          volunteers.map((volunteer) => (
            <Link
              key={volunteer.id}
              to={"/profile"}
              state={{ volunteerId: volunteer.id }}
            >
              <div
                key={volunteer.id}
                className="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
              >
                <div>
                  <p className="text-lg font-bold">
                    {capitalizeWords(volunteer?.Username)}
                  </p>
                  <p className="font-semibold">
                    Full Name: {capitalizeWords(volunteer?.fullName)}
                  </p>
                  <p className="font-semibold">Email: {volunteer?.email}</p>
                  <p className="font-semibold">
                    Phone Number: {volunteer?.phoneNumber}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default VolunteerAcc;
