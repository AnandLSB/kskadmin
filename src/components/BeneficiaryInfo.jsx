import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { capitalizeWords } from "../shared/sharedFunc";
import { format } from "date-fns";
import Modal from "react-modal";
import Select from "react-select";
import { getAuthor } from "../shared/sharedFunc";

const BeneficiaryInfo = () => {
  const [beneficiary, setBeneficiary] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editObj, setEditObj] = useState({});
  const [deleteObj, setDeleteObj] = useState({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const categories = [
    {
      value: 1,
      label: "Single Parent",
    },
    {
      value: 2,
      label: "Elderly Living Alone",
    },
    {
      value: 3,
      label: "Disabled (OKU)",
    },
    {
      value: 4,
      label: "Orang Asli Community",
    },
  ];

  useEffect(() => {
    const ref = collection(db, "foodBankBeneficiary");
    const unsubscribe = onSnapshot(ref, async (querySnapshot) => {
      const data = [];

      for (const doc of querySnapshot.docs) {
        const author = await getAuthor(doc.data().createdBy);

        data.push({
          ...doc.data(),
          id: doc.id,
          createdBy: author,
          createdAt: doc.data().createdAt.toDate(),
        });
      }

      setBeneficiary(data);
    });

    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await updateDoc(doc(db, "foodBankBeneficiary", editObj.id), {
      firstName: editObj.firstName.toLowerCase(),
      lastName: editObj.lastName.toLowerCase(),
      category: editObj.category,
      houseAddress: editObj.houseAddress,
      noOfFamilyMembers: editObj.noOfFamilyMembers,
      remarks: editObj.remarks,
    })
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        setEditOpen(false);
        setEditObj({});
        alert("Successfully updated beneficiary information");
      });
  };

  const handleDelete = async () => {
    const docRef = doc(db, "foodBankBeneficiary", deleteObj.id);

    await deleteDoc(docRef).then(() => {
      setDeleteOpen(false);
      setDeleteObj({});
      alert("Successfully deleted beneficiary information");
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
      {/* Edit Beneficiary Information Modal */}
      <Modal
        isOpen={editOpen}
        style={customStyles}
        onRequestClose={() => {
          setEditOpen(false);
          setEditObj({});
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Edit Beneficiary Information"
        ariaHideApp={false}
      >
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Edit Beneficiary Information:
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Make changes to the respective fields to modify the beneficiay
            information
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            id="firstName"
            value={capitalizeWords(editObj.firstName)}
            onChange={(e) =>
              setEditObj({
                ...editObj,
                firstName: e.target.value,
              })
            }
            type="text"
            placeholder="First Name"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <input
            id="lastName"
            value={capitalizeWords(editObj.lastName)}
            onChange={(e) =>
              setEditObj({
                ...editObj,
                lastName: e.target.value,
              })
            }
            type="text"
            placeholder="Last Name"
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
            placeholder={editObj.category}
            onChange={(e) =>
              setEditObj({
                ...editObj,
                category: e.label,
              })
            }
            required
          />
          <input
            id="houseAddress"
            value={editObj.houseAddress}
            onChange={(e) =>
              setEditObj({
                ...editObj,
                houseAddress: e.target.value,
              })
            }
            type="text"
            placeholder="House Address"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <input
            id="noOfFamilyMembers"
            type="text"
            value={editObj.noOfFamilyMembers}
            onChange={(e) => {
              const regex = /^[0-9\b]+$/;
              if (e.target.value === "" || regex.test(e.target.value)) {
                setEditObj({
                  ...editObj,
                  noOfFamilyMembers: e.target.value,
                });
              }
            }}
            placeholder="No of Family Members (Numbers Only)"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <input
            id="remarks"
            value={editObj.remarks}
            onChange={(e) =>
              setEditObj({
                ...editObj,
                remarks: e.target.value,
              })
            }
            type="text"
            placeholder="Remarks"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
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

      {/* Delete Beneficiary Information Modal */}
      <Modal
        isOpen={deleteOpen}
        style={customStyles}
        onRequestClose={() => {
          setDeleteOpen(false);
          setDeleteObj({});
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Delete Beneficiary Information"
        ariaHideApp={false}
      >
        <h3 className="text-xl font-medium leading-6 text-red-600">
          Delete Beneficiary Information
        </h3>
        <div className="mt-2 text-center">
          <p className="text-base text-black">
            Are you sure you would like to delete the beneficiary information
            for{" "}
            {capitalizeWords(deleteObj.firstName) +
              " " +
              capitalizeWords(deleteObj.lastName)}
            ?
          </p>
          <p className="text-base text-black">This action is irreversible!</p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => {
              setDeleteOpen(false);
              setDeleteObj({});
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

      <div className="flex-auto pb-10 bg-[#EB4335] text-white">
        Beneficiary Information
      </div>
      <div class="flex-col h-[592px] mx-10 overflow-y-scroll">
        <div className="py-4">
          {beneficiary.map((beneficiary) => (
            <div
              key={beneficiary.id}
              class="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
            >
              <div>
                <div className="flex flex-row">
                  <p className="font-bold mr-1">
                    {capitalizeWords(beneficiary.firstName)}
                  </p>
                  <p className="font-bold mr-1">
                    {capitalizeWords(beneficiary.lastName)}
                  </p>
                </div>

                <p>Category: {beneficiary.category}</p>
                <p>House Address: {beneficiary.houseAddress}</p>
                <p>No Of Family Members: {beneficiary.noOfFamilyMembers}</p>
                <p>Created By: {beneficiary.createdBy}</p>
                <p>
                  Created At: {format(beneficiary.createdAt, "dd MMM yyyy")}
                </p>
                <p>Remarks: {beneficiary.remarks}</p>
              </div>
              <div className="flex flex-col justify-center px-2">
                <button
                  onClick={() => {
                    setEditOpen(true);
                    setEditObj(beneficiary);
                  }}
                  className="text-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteOpen(true);
                    setDeleteObj({
                      id: beneficiary.id,
                      firstName: beneficiary.firstName,
                      lastName: beneficiary.lastName,
                    });
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
  );
};

export default BeneficiaryInfo;
