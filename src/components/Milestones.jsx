import {
  onSnapshot,
  collection,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import Modal from "react-modal";

const Milestones = () => {
  const [milestones, setMilestones] = useState([]);
  const [milestoneObj, setMilestoneObj] = useState({
    description: "",
    hours: "",
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteObj, setDeleteObj] = useState({
    id: "",
    desc: "",
  });

  useEffect(() => {
    const ref = collection(db, "milestones");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const milestones = [];
      snapshot.forEach((doc) => {
        milestones.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      setMilestones(milestones);
    });

    return unsubscribe;
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const ref = collection(db, "milestones");

    await addDoc(ref, {
      desc: milestoneObj.description,
      hours: milestoneObj.hours,
    }).catch((e) => {
      console.log(e);
    });

    alert("Volunteer Milestone Created!");
    setMilestoneObj({
      description: "",
      hours: "",
    });
  };

  const handleDelete = async () => {
    const ref = doc(db, "milestones", deleteObj.id);

    await deleteDoc(ref).catch((e) => console.log(e));

    alert("Volunteer Milestone Deleted!");
    setDeleteOpen(false);
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
        isOpen={deleteOpen}
        style={customStyles}
        onRequestClose={() => {
          setDeleteObj({
            id: "",
            desc: "",
          });
          setDeleteOpen(false);
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Delete Milestone"
        ariaHideApp={false}
      >
        <h3 className="text-xl font-medium leading-6 text-red-600">
          Delete Volunteer Milestone
        </h3>
        <div className="mt-2 text-center">
          <p className="text-base text-black">
            Are you sure you would like to delete the volunteer milestone{" "}
            {deleteObj.desc}?
          </p>
          <p className="text-base text-black">This action is irreversible!</p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => {
              setDeleteObj({
                id: "",
                desc: "",
              });
              setDeleteOpen(false);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              handleDelete();
            }}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </Modal>

      <div className="flex flex-auto items-center h-16 bg-[#EB4335] text-white text-3xl pl-2">
        Volunteer Milestones
      </div>

      <div className="flex flex-row gap-10 justify-center mt-32">
        <div>
          <p className="font-bold text-lg">Create Milestone</p>
          <div className="border border-black rounded w-[350px] p-2">
            <p className="text-sm font-semibold">Milestone Description</p>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={milestoneObj.description}
                placeholder="Milestone Description"
                className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
                onChange={(e) => {
                  setMilestoneObj({
                    ...milestoneObj,
                    description: e.target.value,
                  });
                }}
              />
              <p className="text-sm font-semibold">Required Volunteer Hours</p>
              <input
                type="text"
                value={milestoneObj.hours}
                onChange={(e) => {
                  const regex = /^[0-9\b]+$/;
                  if (e.target.value === "" || regex.test(e.target.value)) {
                    setMilestoneObj({ ...milestoneObj, hours: e.target.value });
                  }
                }}
                placeholder="Hours (Numbers Only)"
                className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
              />
              <div className="flex flex-row justify-end">
                <button
                  type="submit"
                  className="inline-flex justify-center mt-1 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
        <div>
          <p className="font-bold text-lg">Milestones</p>
          <div className="border border-black rounded overflow-y-scroll max-h-[250px] p-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
              >
                <div>
                  <div className="flex flex-row">
                    <p className="font-semibold mr-1">Description:</p>
                    <p>{milestone.desc}</p>
                  </div>
                  <div className="flex flex-row">
                    <p className="font-semibold mr-1">Required Hours:</p>
                    <p>{milestone.hours}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center ml-2 px-2">
                  <button
                    onClick={() => {
                      setDeleteObj({
                        id: milestone.id,
                        desc: milestone.desc,
                      });
                      setDeleteOpen(true);
                    }}
                    className="text-red-600 text-base"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Milestones;
