import React, { useEffect, useState } from "react";
import { onSnapshot, collection, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { capitalizeWords } from "../shared/sharedFunc";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const Forums = () => {
  const ref = collection(db, "forums");
  const [forums, setForums] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(ref, async (querySnapshot) => {
      const forums = [];

      for (const doc of querySnapshot.docs) {
        const author = await getAuthor(doc.data().createdBy);

        forums.push({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          createdBy: author,
        });
      }

      setForums(forums);
    });

    return unsubscribe;
  }, []);

  const getAuthor = async (uid) => {
    const ref = doc(db, "volunteer", uid);
    var author;

    await getDoc(ref).then((userDoc) => {
      if (userDoc.exists()) {
        author = userDoc.data().Username;
      } else {
        author = "Unknown";
      }
    });

    return author;
  };

  console.log(forums);

  return (
    <div>
      <div className="flex-auto pb-10 bg-[#EB4335] text-white">Forums</div>
      <div className="flex justify-end">
        <Link to={"/reportforums"}>
          <p className="font-bold px-2">View Reported Forums</p>
        </Link>
      </div>

      <div class="flex-col h-[592px] mx-10 overflow-y-scroll">
        <div className="py-4">
          {forums.map((forum) => (
            <Link
              key={forum.id}
              to={"/forumdetail"}
              state={{ forumId: forum.id, forumTitle: forum.title }}
            >
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

                  <p>Description: {forum.desc}</p>
                  <p>Created By: {capitalizeWords(forum.createdBy)}</p>
                  <p>Created At: {format(forum.createdAt, "dd MMM yyyy")}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Forums;
