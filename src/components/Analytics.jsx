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
import Select from "react-select";

const Analytics = () => {
  const [totalVolunteers, setTotalVolunteers] = useState([]);
  const [totalHours, setTotalHours] = useState([]);
  const [basis, setBasis] = useState();
  const [loading, setLoading] = useState(true);
  const ref = collection(db, "volunteerParticipation");
  const [dateSet, setDateSet] = useState({
    startDate: null,
    endDate: null,
  });
  const basisData = [
    { value: "thisMonth", label: "This Month" },
    { value: "pastMonth", label: "Past Month" },
    { value: "past3Months", label: "Past 3 Months" },
  ];

  const analyticsData = [
    { value: "newVolunteers", label: "New Volunteers" },

    { value: "totalVolunteeredHours", label: "Total Volunteered Hours" },
    {
      value: "totalNoVolunteered",
      label: "Total Number of Volunteers Volunteered",
    },
  ];

  function getWeek(date) {
    let monthStart = new Date(date);
    monthStart.setDate(0);
    let offset = ((monthStart.getDay() + 1) % 7) - 1; // -1 is for a week starting on Monday
    return Math.ceil((date.getDate() + offset) / 7);
  }

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

  //New volunteers?

  const getNewVolunteers = async (date) => {
    const ref = collection(db, "volunteer");
    const q = query(
      ref,
      where("accountCreationDate", ">=", date.startDate),
      where("accountCreationDate", "<=", date.endDate)
    );

    const snapshot = await getDocs(q);

    console.log("Size: ", snapshot.size);

    snapshot.forEach((doc) => {
      console.log(doc.data());
    });
  };

  const getTotalVolunteers = async () => {
    const ref = collection(db, "volunteer");
    const snapshot = await getCountFromServer(ref);
    setTotalVolunteers(snapshot.data().count);
  };

  const getTotalVolunteeredHours = async (basis, date) => {
    const q = query(
      ref,
      where("checkOutTime", ">=", date.startDate),
      where("checkOutTime", "<=", date.endDate)
    );

    const snapshot = await getDocs(q);

    console.log("Size: ", snapshot.size);

    if (basis === "thisMonth" || basis === "pastMonth") {
      const dataByWeekMap = new Map();

      for (const doc of snapshot.docs) {
        const week = getWeek(doc.data().checkOutTime.toDate());
        const totalHours = doc.data().totalHours;

        if (!dataByWeekMap.has(week)) {
          dataByWeekMap.set(week, { week: "Week " + week, totalHours });
        } else {
          const dataForWeek = dataByWeekMap.get(week);
          dataForWeek.totalHours += totalHours;
          dataByWeekMap.set(week, dataForWeek);
        }
      }

      const dataByWeekArr = Array.from(dataByWeekMap.values());
      console.log("Data by week: ", dataByWeekArr);
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
  };

  const getTotalActivities = async () => {
    const ref = collection(db, "activities");
    const snapshot = await getCountFromServer(ref);
    console.log(snapshot.data().count);
  };

  const getNoOfVolunteersVolunteered = async (basis, date) => {
    const ref = collection(db, "volunteerParticipation");
    const q = query(
      ref,
      where("checkInTime", ">=", date.startDate),
      where("checkInTime", "<=", date.endDate)
    );
    let volunteers = [];

    const snapshot = await getDocs(q);

    if (basis === "thisMonth" || basis === "pastMonth") {
      const dataByWeekMap = new Map();
      const volunteersByWeek = new Map();

      for (const doc of snapshot.docs) {
        const week = getWeek(doc.data().checkInTime.toDate());

        if (!dataByWeekMap.has(week)) {
          dataByWeekMap.set(week, { week: "Week " + week, volunteerCount: 1 });
          volunteersByWeek.set(week, [doc.data().volunteerId]);
        } else {
          const dataForWeek = dataByWeekMap.get(week);

          if (!volunteersByWeek.get(week).includes(doc.data().volunteerId)) {
            dataForWeek.volunteerCount += 1;
            dataByWeekMap.set(week, dataForWeek);
            volunteersByWeek.get(week).push(doc.data().volunteerId);
          }
        }
      }

      const dataByWeekArr = Array.from(dataByWeekMap.values());
      setTotalVolunteers(dataByWeekArr);
      console.log("Data by week: ", dataByWeekMap);
    } else if (basis === "past3Months") {
      const dataByMonthMap = new Map();
      const volunteersByMonth = new Map();

      for (const doc of snapshot.docs) {
        const month = new Date(doc.data().checkInTime.toDate())
          .toISOString()
          .slice(0, 7);

        if (!dataByMonthMap.has(month)) {
          dataByMonthMap.set(month, {
            month: month,
            volunteerCount: 1,
          });
          volunteersByMonth.set(month, [doc.data().volunteerId]);
        } else {
          const dataForMonth = dataByMonthMap.get(month);

          if (!volunteersByMonth.get(month).includes(doc.data().volunteerId)) {
            dataForMonth.volunteerCount += 1;
            dataByMonthMap.set(month, dataForMonth);
            volunteersByMonth.get(month).push(doc.data().volunteerId);
          }
        }
      }

      const dataByMonthArr = Array.from(dataByMonthMap.values());
      setTotalVolunteers(dataByMonthArr);
      console.log("Data by month: ", dataByMonthMap);
    }
  };

  console.log("Total volunteers: ", totalVolunteers);

  return (
    <div>
      <div className="flex-auto pb-10 bg-[#EB4335] text-white">Analytics</div>
      <Select
        options={analyticsData}
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
        placeholder="Choose Analytics Data"
      />
      <Select
        options={basisData}
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
        placeholder="Set Basis"
        onChange={(e) => {
          setBasis(e.value);
          setDate(e.value);
        }}
      />

      <button
        onClick={async () => {
          await getTotalVolunteeredHours(basis, dateSet);
        }}
      >
        Generate
      </button>

      <button
        onClick={() => {
          getNoOfVolunteersVolunteered(basis, dateSet);
        }}
      >
        Getvolunteers
      </button>

      <button
        onClick={() => {
          getNewVolunteers(dateSet);
        }}
      >
        New Volunteers
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
            data={totalVolunteers}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              label={{ value: "Hours", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="volunteerCount"
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
