import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getDoc,
  doc,
  query,
  collection,
  getDocs,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import Modal from "react-modal";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState({});
  const [totalTime, setTotalTime] = useState({});
  const [registeredActivities, setRegisteredActivities] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [createdForums, setCreatedForums] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getVolunteerData();
  }, []);

  const capitalizeWords = (activityName) => {
    if (activityName !== undefined) {
      return activityName
        .toLowerCase()
        .split(" ")
        .map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
    }
  };

  const getRegisteredActivities = async (activities) => {
    const activityData = [];

    for (let activity of activities) {
      let ref = doc(db, "activities", activity);
      const docData = await getDoc(ref);

      if (docData.exists()) {
        activityData.push({
          ...docData.data(),
          id: docData.id,
          activityDatetime: docData.data().activityDatetime.toDate(),
          activityDatetimeEnd: docData.data().activityDatetimeEnd.toDate(),
        });
      }
    }

    setRegisteredActivities(activityData);
  };

  const getCompletedActivities = async (activities) => {
    const activityData = [];

    for (let activity of activities) {
      let ref = doc(db, "activities", activity);
      const docData = await getDoc(ref);

      if (docData.exists()) {
        activityData.push({
          ...docData.data(),
          id: docData.id,
          activityDatetime: docData.data().activityDatetime.toDate(),
          activityDatetimeEnd: docData.data().activityDatetimeEnd.toDate(),
        });
      }
    }

    setCompletedActivities(activityData);
  };

  const getCreatedForums = async () => {
    const ref = collection(db, "forums");
    const q = query(ref, where("createdBy", "==", location.state.volunteerId));
    const forumData = await getDocs(q);

    const createdForums = [];

    if (!forumData.empty) {
      forumData.forEach((doc) => {
        createdForums.push({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
        });
      });
    }

    setCreatedForums(createdForums);
  };

  const getVolunteerData = async () => {
    const ref = doc(db, "volunteer", location.state.volunteerId);
    const volunteerData = await getDoc(ref);

    if (volunteerData.exists()) {
      await getRegisteredActivities(volunteerData.data().myActivities);
      await getCompletedActivities(volunteerData.data().myCompleteAct);
      await getCreatedForums();

      setVolunteer({
        ...volunteerData.data(),
        id: volunteerData.id,
        accountCreationDate: volunteerData.data().accountCreationDate.toDate(),
        birthdate: format(
          volunteerData.data().birthdate.toDate(),
          "dd MMM yyyy"
        ),
      });

      const volunteerHours = await getVolunteerHours();

      setTotalTime({
        hours: volunteerHours.hours,
        minutes: volunteerHours.minutes,
      });
    }
  };

  const getMilestones = async (hours) => {
    const ref = collection(db, "milestones");
    const q = query(ref, where("hours", "<=", hours));
    const milestones = [];

    const milestoneData = await getDocs(q);

    if (!milestoneData.empty) {
      milestoneData.forEach((doc) => {
        milestones.push({
          ...doc.data(),
          id: doc.id,
        });
      });

      setMilestones(milestones);
    }
  };

  const getVolunteerHours = async () => {
    let totalTime = 0;
    const ref = collection(db, "volunteerParticipation");
    const q = query(
      ref,
      where("volunteerId", "==", location.state.volunteerId),
      where("totalHours", ">", 0)
    );

    const volunteerHours = await getDocs(q);

    if (!volunteerHours.empty) {
      volunteerHours.forEach((doc) => {
        totalTime += doc.data().totalHours;
      });
    }
    let hours = Math.floor(totalTime);
    let minutes = Math.round((totalTime % 1) * 60);

    await getMilestones(hours);

    return { hours, minutes };
  };

  const handleDelete = async () => {
    const ref = doc(db, "volunteer", location.state.volunteerId);
    await deleteDoc(ref).then(() => {
      navigate("/volunteeracc");
      alert("Volunteer account deleted successfully!");
    });
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      overflow: "visible",
      width: "40%",
    },
  };

  return (
    <div>
      <Modal
        isOpen={isModalOpen}
        style={customStyles}
        onRequestClose={() => {
          setIsModalOpen(false);
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Delete Volunteer Account"
        ariaHideApp={false}
      >
        <h3 className="text-xl font-medium leading-6 text-red-600">
          Delete Volunteer Account
        </h3>
        <div className="mt-2 text-center">
          <p className="text-base text-black">
            Are you sure you would like to delete the volunteer account:{" "}
            {volunteer.Username}?
          </p>
          <p className="text-base text-black">This action is irreversible!</p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </Modal>

      <div className="flex-auto pb-10 bg-[#EB4335] text-white">
        Volunteer Information
      </div>
      <div className="flex justify-end">
        <button
          className="mx-2 text-red-600 text-lg font-semibold"
          onClick={() => setIsModalOpen(true)}
        >
          Delete
        </button>
      </div>
      <div className="flex flex-row justify-center gap-4">
        <div className="flex flex-row  bg-[#E9ECEF] shadow-md rounded-lg w-1/2 p-4 m-2">
          <div className="flex justify-center items-center px-10">
            <div class="relative w-32 h-32 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 border border-black">
              <img
                src={volunteer.profilePic}
                alt="profile"
                className=" w-32 h-32 text-gray-400 "
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-row mb-1">
              <p className="font-bold mr-1">Username: </p>
              <p className="font-semibold">{volunteer.Username}</p>
            </div>

            <div className="flex flex-row mb-1">
              <p className="font-bold mr-1">Full Name: </p>
              <p className="font-semibold">{volunteer.fullName}</p>
            </div>

            <div className="flex flex-row mb-1">
              <p className="font-bold mr-1">IC Number: </p>
              <p className="font-semibold">{volunteer.icNumber}</p>
            </div>

            <div className="flex flex-row mb-1">
              <p className="font-bold mr-1">Birthdate: </p>
              <p className="font-semibold">{volunteer.birthdate}</p>
            </div>

            <div className="flex flex-row mb-1">
              <p className="font-bold mr-1">Phone Number: </p>
              <p className="font-semibold">{volunteer.phoneNumber}</p>
            </div>

            <div className="flex flex-row mb-1">
              <p className="font-bold mr-1">Nationality: </p>
              <p className="font-semibold">{volunteer.nationality}</p>
            </div>

            <div className="flex flex-row mb-1">
              <p className="font-bold mr-1">KSK Location: </p>
              <p className="font-semibold">{volunteer.kskLocation}</p>
            </div>

            <div className="flex flex-row mb-1">
              <p className="font-bold mr-1">Emergency Contact: </p>
              <p className="font-semibold">{volunteer.emergencyContact}</p>
            </div>

            <div className="flex flex-row mb-1">
              <p className="font-bold mr-1 whitespace-nowrap">Home Address: </p>
              <p className="font-semibold">{volunteer.homeAddress}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-2/6 bg-[#E9ECEF] shadow-md rounded-lg p-4 m-2 ">
          <div className="flex flex-row">
            <p className="mr-1 font-bold">Total Time Volunteered:</p>
            <p className="mr-1 font-semibold">{totalTime.hours} Hours</p>
            <p className="mr-1 font-semibold">{totalTime.minutes} Minutes</p>
          </div>
          <p className="font-bold mt-2 mb-1">Volunteer Milestones:</p>
          <div className="flex flex-col h-[240px] overflow-y-scroll">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="rounded border-2 border-black mb-1 p-1"
              >
                <p className="font-semibold">{milestone.desc}</p>
                <p>Achieved at {milestone.hours} hour(s) of volunteering</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-center gap-4 ">
        <div className="px-6 w-3/5 ">
          <p className="text-base font-bold">Registered Activities</p>

          <div className="overflow-y-scroll">
            {registeredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-row bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
              >
                <div>
                  <p className="font-bold">
                    {capitalizeWords(activity.activityName)}
                  </p>
                  <p>
                    Date: {format(activity.activityDatetime, "dd MMM yyyy")} to{" "}
                    {format(activity.activityDatetimeEnd, "dd MMM yyyy")}
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
            ))}
          </div>
        </div>

        <div className="px-6 w-3/5 ">
          <p className="text-base font-bold">Completed Activities</p>

          <div className="overflow-y-scroll">
            {completedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-row bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
              >
                <div>
                  <p className="font-bold">
                    {capitalizeWords(activity.activityName)}
                  </p>
                  <p>
                    Date: {format(activity.activityDatetime, "dd MMM yyyy")} to{" "}
                    {format(activity.activityDatetimeEnd, "dd MMM yyyy")}
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
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-center gap-4 ">
        <div className="px-6 w-3/5 ">
          <p className="text-base font-bold">Created Forums</p>

          <div className="overflow-y-scroll">
            {createdForums.map((forum) => (
              <div
                key={forum.id}
                className="flex flex-row bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
              >
                <div>
                  <p className="font-bold">{capitalizeWords(forum.title)}</p>
                  <p>Description: {forum.desc}</p>
                  <p>
                    Created At: {format(forum.createdAt, "dd MMM yyyy")} to{" "}
                    {format(forum.createdAt, "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
