import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

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

export { capitalizeWords, getAuthor };
