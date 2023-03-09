import React, { useEffect, useState } from "react";
import {
  onSnapshot,
  collection,
  getDoc,
  doc,
  getDocs,
  query,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "../firebase";
import { capitalizeWords } from "../shared/sharedFunc";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const Forums = () => {
  const ref = collection(db, "forums");
  const [forums, setForums] = useState([]);
  const [search, setSearch] = useState("");

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

  const searchForums = async () => {
    const forums = [];

    const q = query(
      ref,
      orderBy("title"),
      startAt(search.toLowerCase()),
      endAt(search.toLowerCase() + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const author = await getAuthor(doc.data().createdBy);

      forums.push({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        createdBy: author,
      });
    }

    if (forums.length > 0) {
      setForums(forums);
    } else {
      setForums(null);
    }
  };

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
      <div className="flex flex-auto items-center h-16 bg-[#EB4335] text-white text-3xl pl-2">
        Forums
      </div>
      <div className="flex justify-center items-center py-1">
        <input
          value={search}
          type="text"
          placeholder="Search Forums by Title"
          className="border border-black w-96 rounded"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="inline-flex justify-center mx-2 rounded-md border border-transparent bg-[#E9ECEF] px-4 py-2 text-sm font-medium text-black hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          onClick={() => {
            if (search === "") {
              alert("Please enter a search term");
            } else {
              searchForums();
            }
          }}
        >
          Search
        </button>
        <Link to={"/reportforums"}>
          <p className="font-bold px-2">View Reported Forums</p>
        </Link>
      </div>

      <div class="flex-col h-[592px] mx-10 overflow-y-scroll">
        <div className="py-4">
          {forums === null ? (
            <p>No Forums Found</p>
          ) : (
            forums.map((forum) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Forums;
