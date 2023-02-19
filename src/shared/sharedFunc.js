import React from "react";

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

export { capitalizeWords };
