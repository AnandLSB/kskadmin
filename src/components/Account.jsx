import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  getDoc,
  doc,
  onSnapshot,
  query,
  where,
  collection,
  updateDoc,
  deleteDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateEmail,
} from "firebase/auth";
import { db } from "../firebase";
import { format } from "date-fns";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({});
  const [unapprovedAdmins, setUnapprovedAdmins] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [passwordEmailOpen, setPasswordEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(auth.currentUser.email);
  const [passwordObj, setPasswordObj] = useState({
    currPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    passwordObj.currPassword
  );

  const reauthenticateUser = () => {
    reauthenticateWithCredential(auth.currentUser, credential)
      .then(() => {
        alert(
          "Re-authenticated successfully, please proceed to change email or password"
        );
      })
      .catch(() => {
        alert("Incorrect current password, please re-enter current password");
      });
  };

  useEffect(() => {
    getAdminData();

    const ref = collection(db, "admin");
    const q = query(ref, where("approved", "==", false));

    const unsub = onSnapshot(q, (querySnapshot) => {
      const unapprovedAdmins = [];

      querySnapshot.forEach((doc) => {
        unapprovedAdmins.push({
          ...doc.data(),
          id: doc.id,
          createdAt: format(doc.data().createdAt.toDate(), "dd MMM yyyy"),
        });
      });

      setUnapprovedAdmins(unapprovedAdmins);
    });

    return unsub;
  }, []);

  const handleEdit = async (e) => {
    e.preventDefault();
    const ref = doc(db, "admin", auth.currentUser.email);

    await updateDoc(ref, {
      fullName: editName,
    }).then(() => {
      alert("Admin account updated!");
      setEditOpen(false);
      setEditName("");
      getAdminData();
    });
  };

  const handleEmail = async () => {
    updateEmail(auth.currentUser, newEmail)
      .then(async () => {
        await deleteDoc(doc(db, "admin", admin.email));

        await setDoc(doc(db, "admin", newEmail), {
          ...admin,
          email: newEmail,
          createdAt: Timestamp.fromDate(new Date(admin.createdAt)),
        }).then(() => {
          setAdmin({
            ...admin,
            email: newEmail,
          });
          navigate("/account");
          alert("Email updated successfully");
        });
      })
      .catch((e) => {
        alert("Failed to update email");
      });
  };

  const handlePass = async () => {
    console.log("handlePass");

    updatePassword(auth.currentUser, passwordObj.newPassword)
      .catch(() => {
        alert("Failed to update password");
      })
      .then(() => {
        alert("Password updated successfully");
        setPasswordEmailOpen(false);
        setPasswordObj({
          currPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      });
  };

  const getAdminData = async () => {
    const ref = doc(db, "admin", auth.currentUser.email);

    await getDoc(ref).then((adminDoc) => {
      if (adminDoc.exists()) {
        setAdmin({
          ...adminDoc.data(),
          createdAt: format(adminDoc.data().createdAt.toDate(), "dd MMM yyyy"),
        });
      } else {
        console.log("No such document!");
      }
    });
  };

  const handleApprove = async (uid) => {
    const ref = doc(db, "admin", uid);

    await updateDoc(ref, {
      approved: true,
    }).then(() => {
      alert("Admin account approved!");
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
        isOpen={editOpen}
        style={customStyles}
        onRequestClose={() => {
          setEditOpen(false);
          setEditName("");
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Edit Account Information"
        ariaHideApp={false}
      >
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Edit Admin Account Information:
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Make changes to the respective fields to modify your account
            information
          </p>
        </div>
        <form onSubmit={handleEdit}>
          <input
            id="fullName"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            type="text"
            placeholder="Full Name"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />

          <div className="mt-4">
            <button
              type="button"
              className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => {
                setEditOpen(false);
                setEditName("");
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditOpen(false);
                setPasswordEmailOpen(true);
              }}
              className="inline-flex justify-center rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Edit Email/Password
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={passwordEmailOpen}
        style={customStyles}
        onRequestClose={() => {
          setPasswordEmailOpen(false);
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Edit Account Information"
        ariaHideApp={false}
      >
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Update Account Email / Password
        </h3>

        <div className="mt-2">
          <p className="text-sm text-center text-gray-500">
            Enter your current password to reauthenticate your session and
            update your respective account information
          </p>
        </div>

        <div className="py-2">
          <p>Current Password</p>
          <input
            id="currentPassword"
            value={passwordObj.currPassword}
            onChange={(e) =>
              setPasswordObj({
                ...passwordObj,
                currPassword: e.target.value,
              })
            }
            onBlur={() => {
              if (passwordObj.currPassword !== "") {
                reauthenticateUser();
              }
            }}
            type="password"
            placeholder="Current Password"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
        </div>

        <div className="py-2">
          <p>Update Email</p>
          <input
            id="editEmail"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            type="email"
            placeholder="New Email"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
        </div>

        <div className="py-2">
          <p>Update Password</p>
          <input
            id="newPassword"
            value={passwordObj.newPassword}
            onChange={(e) =>
              setPasswordObj({
                ...passwordObj,
                newPassword: e.target.value,
              })
            }
            type="password"
            placeholder="New Password"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
          <input
            id="confirmNewPassword"
            value={passwordObj.confirmPassword}
            onChange={(e) =>
              setPasswordObj({
                ...passwordObj,
                confirmPassword: e.target.value,
              })
            }
            type="password"
            placeholder="Confirm New Password"
            className="bg-[#E9ECEF] border border-gray-400 rounded-sm w-full mt-1 py-1"
          />
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => {
              setPasswordEmailOpen(false);
              setPasswordObj({
                currPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (newEmail === "") {
                alert("Please fill in new email field");
              } else if (newEmail === auth.currentUser.email) {
                alert("Please enter a new email");
              } else if (passwordObj.currPassword === "") {
                alert("Plese enter your current password to reauthenticate");
              } else {
                handleEmail();
              }
            }}
            className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Update Email
          </button>
          <button
            onClick={() => {
              if (passwordObj.newPassword !== passwordObj.confirmPassword) {
                alert("Passwords do not match");
              } else if (passwordObj.newPassword.length < 6) {
                alert("Please enter a password with a minimum of 6 characters");
              } else if (passwordObj.currPassword === "") {
                alert("Plese enter your current password to reauthenticate");
              } else {
                handlePass();
              }
            }}
            className="inline-flex justify-center rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Update Password
          </button>
        </div>
      </Modal>

      <div className="flex flex-auto items-center h-16 bg-[#EB4335] text-white text-3xl pl-2">
        Admin Account
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col  w-3/5">
          <div className="flex flex-row justify-between py-1">
            <p className="font-bold text-lg">Your Admin Account</p>
            <div>
              <button onClick={() => setEditOpen(true)} className="font-bold">
                Edit
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2">
            <p>Full Name: {admin?.fullName}</p>
            <p>Email: {auth?.currentUser.email}</p>
            <p>Category: {admin?.category}</p>
          </div>
        </div>
        {admin?.category === "master" ? (
          <div className="w-3/5">
            <p className="font-bold text-lg pb-1">Unapproved Admin Accounts</p>
            <div className="max-h-[592px] overflow-y-scroll">
              {unapprovedAdmins.length === 0 ? (
                <p className="text-center">No unapproved admins</p>
              ) : (
                unapprovedAdmins.map((admin) => (
                  <div
                    key={admin?.id}
                    className="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
                  >
                    <div>
                      <p>Full Name: {admin?.fullName}</p>
                      <p>Email: {admin?.email}</p>
                      <p>Created At: {admin?.createdAt}</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="font-semibold"
                        onClick={() => handleApprove(admin.id)}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Account;
