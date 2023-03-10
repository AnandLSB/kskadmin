import {
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import { getAuthor } from "../shared/sharedFunc";
import { format } from "date-fns";

const ForumDetail = () => {
  const location = useLocation();
  const ref = collection(db, "forumPost");
  const [forumPosts, setForumPosts] = useState([]);

  useEffect(() => {
    const q = query(
      ref,
      where("forumId", "==", location.state.forumId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const forumPostData = [];

      for (const doc of snapshot.docs) {
        const author = await getAuthor(doc.data().createdBy);

        forumPostData.push({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          createdBy: author,
        });
      }

      setForumPosts(forumPostData);
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      <div className="flex flex-auto items-center h-16 bg-[#EB4335] text-white text-3xl pl-2">
        Forum - {location.state.forumTitle}
      </div>
      <div class="flex-col max-h-[592px] mx-10 overflow-y-scroll mt-2">
        <div className="py-4">
          {forumPosts.map((forum) => (
            <div
              key={forum.id}
              className="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
            >
              <div>
                <div className="flex flex-row">
                  <p className="text-sm font-bold mr-1">{forum.createdBy} at</p>
                  <p className="text-sm font-medium">
                    {format(forum.createdAt, "dd MMM yyyy p")}
                  </p>
                </div>
                <p className="font-semibold text-lg mr-1">{forum.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumDetail;
