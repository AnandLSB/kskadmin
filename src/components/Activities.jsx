import React, { useEffect, useRef } from "react";
import {
  onSnapshot,
  query,
  where,
  orderBy,
  collection,
  addDoc,
  Timestamp,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import Select from "react-select";
import DatePicker from "react-datepicker";
import Modal from "react-modal";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import "react-datepicker/dist/react-datepicker.css";

const Activities = () => {
  const [active, setActive] = React.useState([]);
  const [inactive, setInactive] = React.useState([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState();
  const [editId, setEditId] = React.useState();
  const [editObj, setEditObj] = React.useState({});
  const [qrId, setQrId] = React.useState("");
  const [qrOpen, setQrOpen] = React.useState(false);
  const activitiesRef = collection(db, "activities");
  const componentRef = useRef();

  const [category, setCategory] = React.useState();
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [volunteerSlot, setVolunteerSlot] = React.useState("");
  const [activityName, setActivityName] = React.useState("");
  const [activityDesc, setActivityDesc] = React.useState("");

  const categories = [
    {
      value: 1,
      label: "Soup Kitchen",
    },
    {
      value: 2,
      label: "Food Bank",
    },
  ];

  const activityStatus = [
    {
      value: 1,
      label: "Active",
    },
    {
      value: 2,
      label: "Full",
    },
    {
      value: 3,
      label: "Inactive",
    },
  ];

  useEffect(() => {
    const q = query(
      activitiesRef,
      where("activityStatus", "in", ["active", "full"]),
      orderBy("activityName", "asc")
    );

    const qInact = query(
      activitiesRef,
      where("activityStatus", "==", "inactive"),
      orderBy("activityName", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activities = [];

      querySnapshot.forEach((actDoc) => {
        activities.push({
          ...actDoc.data(),
          id: actDoc.id,
          activityDatetime: actDoc.data().activityDatetime.toDate(),
          activityDatetimeEnd: actDoc.data().activityDatetimeEnd.toDate(),
        });
      });

      setActive(activities);
    });

    const unsubscribeInact = onSnapshot(qInact, (querySnapshot) => {
      const activities = [];

      querySnapshot.forEach((actDoc) => {
        activities.push({
          ...actDoc.data(),
          id: actDoc.id,
          activityDatetime: actDoc.data().activityDatetime.toDate(),
          activityDatetimeEnd: actDoc.data().activityDatetimeEnd.toDate(),
        });
      });

      setInactive(activities);
    });

    return unsubscribe, unsubscribeInact;
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

  const handleCreate = async (e) => {
    e.preventDefault();

    await addDoc(activitiesRef, {
      activityName: activityName.toLowerCase(),
      activityDesc: activityDesc,
      activityDatetime: Timestamp.fromDate(startDate),
      activityDatetimeEnd: Timestamp.fromDate(endDate),
      activityCategory: category,
      volunteerSlot: Number(volunteerSlot),
      activityStatus: "active",
      createdAt: serverTimestamp(),
    })
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        setCreateOpen(false);
        clearCreateState();
        alert("Activity created successfully!");
      });
  };

  const clearCreateState = () => {
    setCategory();
    setStartDate(null);
    setEndDate(null);
    setVolunteerSlot("");
    setActivityName("");
    setActivityDesc("");
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    await updateDoc(doc(db, "activities", editId), {
      activityName: editObj.activityName.toLowerCase(),
      activityDesc: editObj.activityDesc,
      activityDatetime: Timestamp.fromDate(editObj.activityDatetime),
      activityDatetimeEnd: Timestamp.fromDate(editObj.activityDatetimeEnd),
      activityCategory: editObj.activityCategory,
      volunteerSlot: Number(editObj.volunteerSlot),
      activityStatus: editObj.activityStatus.toLowerCase(),
    })
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        setEditOpen(false);
        setEditObj({});
        alert("Activity updated successfully!");
      });
  };

  const handleDelete = async () => {
    const ref = collection(db, "volunteer");
    const q = query(ref, where("myActivities", "array-contains", deleteId));

    await getDocs(q)
      .then((querySnapshot) => {
        querySnapshot.forEach((userDoc) => {
          const userRef = doc(db, "volunteer", userDoc.id);
          updateDoc(userRef, {
            myActivities: arrayRemove(deleteId),
          });
        });
      })
      .then(() => {
        deleteDoc(doc(db, "activities", deleteId))
          .catch((error) => {
            console.log(error);
          })
          .then(() => {
            setDeleteOpen(false);
            setDeleteId();
            setActivityName("");
            alert("Activity deleted successfully!");
          });
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

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Activity QR Code",
  });

  return (
    <div>
      {/*Create Activity Modal*/}
      <Modal
        isOpen={createOpen}
        style={customStyles}
        onRequestClose={() => {
          setCreateOpen(false);
          clearCreateState();
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Create Activity"
        ariaHideApp={false}
      >
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Create Volunteer Activity
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Fill in the respective fields to create a volunteer activity
          </p>
        </div>
        <form onSubmit={handleCreate}>
          <input
            id="activityName"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            type="text"
            placeholder="Activity Name"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <input
            id="activityDesc"
            value={activityDesc}
            onChange={(e) => setActivityDesc(e.target.value)}
            type="text"
            placeholder="Activity Description"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <Select
            options={categories}
            menuPortalTarget={document.body}
            name="color"
            className="bg-[#E9ECEF] mt-1"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({
                ...base,
                backgroundColor: "#E9ECEF",
              }),
            }}
            isSearchable={false}
            placeholder="Select Category"
            onChange={(e) => setCategory(e.label)}
          />
          <input
            id="volunteerSlot"
            type="text"
            value={volunteerSlot}
            onChange={(e) => {
              const regex = /^[0-9\b]+$/;
              if (e.target.value === "" || regex.test(e.target.value)) {
                setVolunteerSlot(e.target.value);
              }
            }}
            placeholder="Volunteer Slots (Numbers Only)"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(new Date(date))}
            className="border border-gray-400 w-full mt-1 py-1"
            showTimeSelect
            dateFormat="d MMMM yyyy h:mm aa"
            placeholderText="Activity Start Date and Time"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(new Date(date))}
            className="border border-gray-400 w-full mt-1 py-1"
            showTimeSelect
            dateFormat="d MMMM yyyy h:mm aa"
            placeholderText="Activity End Date and Time"
          />

          <div className="mt-4">
            <button
              type="button"
              className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/*Edit Activity Modal*/}
      <Modal
        isOpen={editOpen}
        style={customStyles}
        onRequestClose={() => setEditOpen(false)}
        shouldCloseOnOverlayClick={true}
        contentLabel="Edit Activity"
        ariaHideApp={false}
      >
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Edit Volunteer Activity: {capitalizeWords(editObj.activityName)}
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Make changes to the respective fields to modify the volunteer
            activity
          </p>
        </div>
        <form onSubmit={handleEdit}>
          <input
            id="activityName"
            value={capitalizeWords(editObj.activityName)}
            onChange={(e) =>
              setEditObj({
                ...editObj,
                activityName: e.target.value,
              })
            }
            type="text"
            placeholder="Activity Name"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <input
            id="activityDesc"
            value={editObj.activityDesc}
            onChange={(e) =>
              setEditObj({
                ...editObj,
                activityDesc: e.target.value,
              })
            }
            type="text"
            placeholder="Activity Description"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <Select
            options={categories}
            menuPortalTarget={document.body}
            name="color"
            className="bg-[#E9ECEF] mt-1"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({
                ...base,
                backgroundColor: "#E9ECEF",
              }),
            }}
            isSearchable={false}
            placeholder={editObj.activityCategory}
            onChange={(e) =>
              setEditObj({
                ...editObj,
                activityCategory: e.label,
              })
            }
            required
          />
          <input
            id="volunteerSlot"
            type="text"
            value={editObj.volunteerSlot}
            onChange={(e) => {
              const regex = /^[0-9\b]+$/;
              if (e.target.value === "" || regex.test(e.target.value)) {
                setEditObj({
                  ...editObj,
                  volunteerSlot: e.target.value,
                });
              }
            }}
            placeholder="Volunteer Slots (Numbers Only)"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <DatePicker
            selected={editObj.activityDatetime}
            onChange={(date) =>
              setEditObj({
                ...editObj,
                activityDatetime: new Date(date),
              })
            }
            className="border border-gray-400 w-full mt-1 py-1"
            showTimeSelect
            dateFormat="d MMMM yyyy h:mm aa"
            placeholderText="Activity Start Date and Time"
          />
          <DatePicker
            selected={editObj.activityDatetimeEnd}
            onChange={(date) =>
              setEditObj({
                ...editObj,
                activityDatetimeEnd: new Date(date),
              })
            }
            className="border border-gray-400 w-full mt-1 py-1"
            showTimeSelect
            dateFormat="d MMMM yyyy h:mm aa"
            placeholderText="Activity End Date and Time"
          />
          <Select
            options={activityStatus}
            menuPortalTarget={document.body}
            name="color"
            className="bg-[#E9ECEF] mt-1"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({
                ...base,
                backgroundColor: "#E9ECEF",
              }),
            }}
            isSearchable={false}
            placeholder={editObj.activityStatus}
            onChange={(e) =>
              setEditObj({
                ...editObj,
                activityStatus: e.label,
              })
            }
            required
          />

          <div className="mt-4">
            <button
              type="button"
              className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => {
                setEditOpen(false);
                setEditObj({});
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/*Delete Activity Modal*/}
      <Modal
        isOpen={deleteOpen}
        style={customStyles}
        onRequestClose={() => {
          setDeleteOpen(false);
          setActivityName("");
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Delete Activity"
        ariaHideApp={false}
      >
        <h3 className="text-xl font-medium leading-6 text-red-600">
          Delete Volunteer Activity
        </h3>
        <div className="mt-2 text-center">
          <p className="text-base text-black">
            Are you sure you would like to delete the volunteer activity{" "}
            {capitalizeWords(activityName)}?
          </p>
          <p className="text-base text-black">This action is irreversible!</p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => {
              setDeleteOpen(false);
              setActivityName("");
              setDeleteId("");
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

      {/*Generate QR Code Modal*/}
      <Modal
        isOpen={qrOpen}
        style={customStyles}
        onRequestClose={() => {
          setQrOpen(false);
          setActivityName("");
          setQrId("");
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Activity QR Code"
        ariaHideApp={false}
      >
        <h3 className="text-xl font-medium leading-6">
          Generate Activity QR Code
        </h3>
        <div ref={componentRef} className="mt-2 flex justify-center">
          <div className="flex flex-col justify-center items-center print:mt-32">
            <p className="text-xl py-5 print:text-4xl print:pb-32">
              QR Code for {capitalizeWords(activityName)} Activity
            </p>
            <QRCode value={qrId} size={320} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => {
              setQrOpen(false);
              setActivityName("");
              setQrId("");
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Print
          </button>
        </div>
      </Modal>

      <div className="flex-auto pb-10 bg-[#EB4335] text-white">
        Volunteer Activities
      </div>
      <div className="flex-auto">
        Search bar? Create Activities button here
        <button className="font-bold" onClick={() => setCreateOpen(true)}>
          Create Volunteer Activity
        </button>
      </div>

      <div className="flex flex-row gap-4 p-5 border border-black">
        {/*Active Activities Col*/}
        <div class="flex-col h-[592px] w-3/5 mr-10 overflow-y-scroll">
          Active Activities
          <div className="py-4">
            {active.map((activity) => (
              <div
                key={activity.id}
                class="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
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
                <div className="flex flex-col justify-center px-2">
                  <button
                    onClick={() => {
                      setEditId(activity.id);
                      setEditObj(activity);
                      setEditOpen(true);
                    }}
                    className="text-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(activity.id);
                      setActivityName(activity.activityName);
                      setDeleteOpen(true);
                    }}
                    className="text-red-600 text-lg"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setQrId(activity.id);
                      setActivityName(activity.activityName);
                      setQrOpen(true);
                    }}
                    className="text-lg"
                  >
                    Generate QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*Inactive Activities Col*/}
        <div class="flex-col h-[592px] w-3/5 ml-10 overflow-y-scroll">
          Inactive Activities
          <div className="py-4">
            {inactive.map((activity) => (
              <div
                key={activity.id}
                class="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
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
                <div className="flex flex-col justify-center px-2">
                  <button
                    onClick={() => {
                      setEditId(activity.id);
                      setEditObj(activity);
                      setEditOpen(true);
                    }}
                    className="text-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(activity.id);
                      setActivityName(activity.activityName);
                      setDeleteOpen(true);
                    }}
                    className="text-red-600 text-lg"
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

export default Activities;
