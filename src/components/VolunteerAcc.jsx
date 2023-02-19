import React, { useEffect, useState } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

const VolunteerAcc = () => {
  const volunteerRef = collection(db, "volunteer");
  const [volunteers, setVolunteers] = useState([]);

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

  console.log(volunteers);

  return (
    <div>
      <div className="flex-auto pb-10 bg-[#EB4335] text-white">
        Volunteer Accounts
      </div>
      <div>
        <p>Search bar here</p>
      </div>
      <div className="p-5 h-[592px] overflow-y-scroll">
        {volunteers.map((volunteer) => (
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
                <p>{volunteer.id}</p>
                <p>{volunteer?.Username}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VolunteerAcc;
