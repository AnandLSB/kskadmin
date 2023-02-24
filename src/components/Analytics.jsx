import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [totalHours, setTotalHours] = useState([]);
  const [basis, setBasis] = useState();
  const [loading, setLoading] = useState(true);
  const ref = collection(db, "volunteerParticipation");
  const [dateSet, setDateSet] = useState({
    startDate: null,
    endDate: null,
  });

  function getWeek(date) {
    let monthStart = new Date(date);
    monthStart.setDate(0);
    let offset = ((monthStart.getDay() + 1) % 7) - 1; // -1 is for a week starting on Monday
    return Math.ceil((date.getDate() + offset) / 7);
  }

  const getThisMonth = () => {
    const endDate = new Date();
    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(1);

    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);

    return {
      startDate: startDate,
      endDate: endDate,
    };
  };

  const getPastMonth = () => {
    const endDate = new Date();
    const startDate = new Date();

    endDate.setHours(23, 59, 59, 999);
    endDate.setDate(0);
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return {
      startDate: startDate,
      endDate: endDate,
    };
  };

  const setDate = (selectedBasis) => {
    let endDate = new Date();
    let startDate = new Date();

    if (selectedBasis === "thisMonth") {
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(1);

      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedBasis === "pastMonth") {
      endDate.setHours(23, 59, 59, 999);
      endDate.setDate(0);
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else if (selectedBasis === "past3Months") {
      endDate.setHours(23, 59, 59, 999);
      endDate.setDate(0);
      startDate.setMonth(startDate.getMonth() - 3);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    setDateSet({
      startDate: startDate,
      endDate: endDate,
    });

    return {
      startDate: startDate,
      endDate: endDate,
    };
  };

  console.log("Date set: ", dateSet);

  const getTotalVolunteers = async () => {
    const ref = collection(db, "volunteer");
    const snapshot = await getCountFromServer(ref);
    setTotalVolunteers(snapshot.data().count);
  };

  const getTotalVolunteeredHours = async (basis, date) => {
    let totalHours = 0;

    const q = query(
      ref,
      where("checkOutTime", ">=", date.startDate),
      where("checkOutTime", "<=", date.endDate)
    );

    console.log("Passed Obj", date);

    const snapshot = await getDocs(q);

    let dataByMonthArr = [];

    console.log("Size: ", snapshot.size);

    if (basis === "thisMonth" || basis === "pastMonth") {
      const dataByWeekMap = new Map();

      for (const doc of snapshot.docs) {
        const week = getWeek(doc.data().checkOutTime.toDate());
        const totalHours = doc.data().totalHours;

        // If data for this week doesn't exist in the Map, add it
        if (!dataByWeekMap.has(week)) {
          dataByWeekMap.set(week, { week: "Week " + week, totalHours });
        }
        // Otherwise, update the total hours for the existing data
        else {
          const dataForWeek = dataByWeekMap.get(week);
          dataForWeek.totalHours += totalHours;
          dataByWeekMap.set(week, dataForWeek);
        }

        /*
        if (
          !dataByMonthArr.some(
            (obj) => obj.week === getWeek(doc.data().checkOutTime.toDate())
          )
        ) {
          dataByMonthArr.push({
            week: "Week " + getWeek(doc.data().checkOutTime.toDate()),
            totalHours: doc.data().totalHours,
          });
        } else {
          dataByMonthArr.forEach((obj) => {
            if (obj.week === getWeek(doc.data().checkOutTime.toDate())) {
              obj.totalHours += doc.data().totalHours;
            }
          });
        }
        */
      }

      const dataByWeekArr = Array.from(dataByWeekMap.values());
      setTotalHours(dataByWeekArr);
    } else if (basis === "past3Months") {
      const dataByMonthMap = new Map();

      for (const doc of snapshot.docs) {
        const month = new Date(doc.data().checkOutTime.toDate())
          .toISOString()
          .slice(0, 7);

        if (!dataByMonthMap.has(month)) {
          dataByMonthMap.set(month, {
            month: month,
            totalHours: doc.data().totalHours,
          });
        } else {
          const dataForMonth = dataByMonthMap.get(month);
          dataForMonth.totalHours += doc.data().totalHours;
          dataByMonthMap.set(month, dataForMonth);
        }
      }

      const dataByMonthArr = Array.from(dataByMonthMap.values());

      console.log("Data by month: ", dataByMonthArr);

      setTotalHours(dataByMonthArr);
    }

    console.log("Basis: ", basis);

    setLoading(false);

    /*
    for (const doc of snapshot.docs) {
      totalHours += doc.data().totalHours;

      console.log(
        "Week: ",
        getWeek(doc.data().checkOutTime.toDate()),
        doc.data().checkOutTime.toDate()
      );

      if (basis === "thisMonth" || basis === "pastMonth") {
        dataByMonthArr.push({
          week: "Week " + getWeek(doc.data().checkOutTime.toDate()),
          totalHours: doc.data().totalHours,
        });
      } else if (basis === "past3Months") {
        const month = new Date(doc.data().checkOutTime.toDate())
          .toISOString()
          .slice(0, 7);

        if (!dataByMonthArr.some((obj) => obj.month === month)) {
          dataByMonthArr.push({
            month: month,
            totalHours: doc.data().totalHours,
          });
        } else {
          dataByMonthArr.forEach((obj) => {
            if (obj.month === month) {
              obj.totalHours += doc.data().totalHours;
            }
          });
        }
      }
    }
    */
  };

  const getTotalActivities = async () => {
    const ref = collection(db, "activities");
    const snapshot = await getCountFromServer(ref);
    console.log(snapshot.data().count);
  };

  const getNoOfVolunteersVolunteered = async () => {
    const ref = collection(db, "volunteerParticipation");
    const q = query(
      ref,
      where("checkInTime", ">=", new Date("2023-02-01")),
      where("checkInTime", "<=", new Date("2023-02-28"))
    );
    let volunteers = [];

    const snapshot = await getDocs(q);

    //Pushing if the activity was checked in within the date range
    snapshot.forEach((doc) => {
      if (
        doc.data().checkInTime.toDate() >= new Date("2023-02-01") &&
        doc.data().checkInTime.toDate() <= new Date("2023-02-28")
      ) {
        console.log("Month: ", doc.data().checkInTime.toDate().getMonth() + 1);
        volunteers.push(doc.data().volunteerId);
      }
    });

    //Removing duplicate entries for a respective volunteer
    let uniqueVolunteers = volunteers.filter((item, index) => {
      return volunteers.indexOf(item) === index;
    });

    console.log(uniqueVolunteers);
  };

  const Chart = ({ hours }) => {
    return (
      <ResponsiveContainer width="50%" aspect={2}>
        <LineChart
          width={500}
          height={300}
          data={hours}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis
            label={{ value: "Hours", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalHours"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div>
      <div className="flex-auto pb-10 bg-[#EB4335] text-white">Analytics</div>
      <button
        onClick={async () => {
          let date = setDate("thisMonth");
          await getTotalVolunteeredHours("thisMonth", date);
        }}
      >
        Click
      </button>

      <button
        onClick={() => {
          setDate("thisMonth");
          setBasis("thisMonth");
        }}
      >
        Set This Month
      </button>

      <button
        onClick={() => {
          setDate("pastMonth");
          setBasis("pastMonth");
        }}
      >
        Set Past Month
      </button>

      <button
        onClick={() => {
          setDate("past3Months");
          setBasis("past3Months");
        }}
      >
        Set Past 3 Month
      </button>

      <button
        onClick={async () => {
          let date = setDate("pastMonth");
          await getTotalVolunteeredHours("pastMonth", date);
        }}
      >
        Past Month
      </button>

      <button
        onClick={async () => {
          await getTotalVolunteeredHours(basis, dateSet);
        }}
      >
        Generate
      </button>

      <button
        onClick={() => {
          setTotalHours([]);
          setDateSet({
            startDate: null,
            endDate: null,
          });
        }}
      >
        Clear
      </button>
      {loading ? (
        <p>Loading</p>
      ) : (
        <ResponsiveContainer width="50%" aspect={2}>
          <LineChart
            width={500}
            height={300}
            data={totalHours}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis
              label={{ value: "Hours", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalHours"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Analytics;
