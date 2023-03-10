import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { getAuthor, capitalizeWords } from "../shared/sharedFunc";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Modal from "react-modal";

const ReportForums = () => {
  const ref = collection(db, "reportedForums");
  const [forums, setForums] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteObj, setDeleteObj] = useState({
    forumId: "",
    reportId: "",
    title: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(ref, async (snapshot) => {
      const forumData = [];

      for (const doc of snapshot.docs) {
        const author = await getAuthor(doc.data().createdBy);
        const title = await getForumTitle(doc.data().forumId);

        forumData.push({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          createdBy: author,
          title: title,
        });
      }

      setForums(forumData);
    });

    return unsubscribe;
  }, []);

  const getForumTitle = async (forumId) => {
    const ref = doc(db, "forums", forumId);
    var title;

    await getDoc(ref).then((forumDoc) => {
      if (forumDoc.exists()) {
        title = forumDoc.data().title;
      } else {
        title = "Unknown";
      }
    });

    return title;
  };

  const handleDelete = async (deleteId, reportId) => {
    const ref = collection(db, "volunteer");
    const q = query(ref, where("myForums", "array-contains", deleteId));
    const postRef = collection(db, "forumPost");
    const qPost = query(postRef, where("forumId", "==", deleteId));

    await getDocs(qPost)
      .then((querySnapshot) => {
        querySnapshot.forEach((docPost) => {
          deleteDoc(doc(db, "forumPost", docPost.id));
        });
      })
      .then(() => {
        getDocs(q).then((querySnapshot) => {
          querySnapshot.forEach((docUser) => {
            updateDoc(doc(db, "volunteer", docUser.id), {
              myForums: arrayRemove(deleteId),
            });
          });
        });
      })
      .then(async () => {
        await deleteDoc(doc(db, "forums", deleteId));
        await deleteDoc(doc(db, "reportedForums", reportId));
      })
      .then(() => {
        setDeleteOpen(false);
        setDeleteObj({
          forumId: "",
          reportId: "",
          title: "",
        });
        alert("Forum deleted successfully!");
      })
      .catch((error) => {
        console.log(error);
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
      {/* Delete Forum Modal */}
      <Modal
        isOpen={deleteOpen}
        style={customStyles}
        onRequestClose={() => {
          setDeleteOpen(false);
          setDeleteObj({
            forumId: "",
            reportId: "",
            title: "",
          });
        }}
        shouldCloseOnOverlayClick={true}
        contentLabel="Delete Forum"
        ariaHideApp={false}
      >
        <h3 className="text-xl font-medium leading-6 text-red-600">
          Delete Forum
        </h3>
        <div className="mt-2 text-center">
          <p className="text-base text-black">
            Are you sure you would like to delete the forum:{" "}
            {capitalizeWords(deleteObj.title)}?
          </p>
          <p className="text-base text-black">This action is irreversible!</p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="inline-flex justify-center mr-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => {
              setDeleteOpen(false);
              setDeleteObj({
                forumId: "",
                reportId: "",
                title: "",
              });
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              handleDelete(deleteObj.forumId, deleteObj.reportId);
            }}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </Modal>

      <div className="flex flex-auto items-center h-16 bg-[#EB4335] text-white text-3xl pl-2">
        Reported Forums
      </div>

      <div class="flex-col h-[592px] mx-10 overflow-y-scroll">
        <div className="py-4">
          {forums.map((forum) => (
            <div
              key={forum.id}
              className="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
            >
              <div>
                <div className="flex flex-row">
                  <p className="font-bold mr-1">
                    {capitalizeWords(forum.title)}
                  </p>
                </div>
                <p>Description: {forum.reportText}</p>
                <p>Reported By: {capitalizeWords(forum.createdBy)}</p>
                <p>Reported At: {format(forum.createdAt, "dd MMM yyyy")}</p>
              </div>
              <div className="flex flex-col justify-center px-2">
                <Link
                  to={"/forumdetail"}
                  state={{ forumId: forum.forumId, forumTitle: forum.title }}
                >
                  <p>View</p>
                </Link>
                <button
                  onClick={() => {
                    setDeleteObj({
                      forumId: forum.forumId,
                      reportId: forum.id,
                      title: forum.title,
                    });
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
  );
};

export default ReportForums;
