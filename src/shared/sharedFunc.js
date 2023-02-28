import React from "react";
import {
  doc,
  getDoc,
  collection,
  getCountFromServer,
} from "firebase/firestore";
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

const getSummary = async () => {
  const volRef = collection(db, "volunteer");
  const actRef = collection(db, "activities");
  const forRef = collection(db, "forums");
  const volSnapshot = await getCountFromServer(volRef);
  const actSnapshot = await getCountFromServer(actRef);
  const forSnapshot = await getCountFromServer(forRef);

  return {
    totalVolunteers: volSnapshot.data().count,
    totalActivities: actSnapshot.data().count,
    totalForums: forSnapshot.data().count,
  };
};

export { capitalizeWords, getAuthor, getSummary };
