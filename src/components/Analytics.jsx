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
  BarChart,
  Bar,
  Cell,
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
import { format } from "date-fns";
import { capitalizeWords } from "../shared/sharedFunc";

const Analytics = () => {
  const [totalVolunteers, setTotalVolunteers] = useState([]);
  const [summary, setSummary] = useState({});
  const [newVolunteers, setNewVolunteers] = useState([]);
  const [basis, setBasis] = useState();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const ref = collection(db, "volunteerParticipation");
  const [dateSet, setDateSet] = useState({
    startDate: null,
    endDate: null,
  });
  const [dataFunc, setDataFunc] = useState({
    function: null,
    lineDataKey: null,
    sideLabel: null,
  });

  const basisData = [
    { value: "thisMonth", label: "This Month" },
    { value: "pastMonth", label: "Past Month" },
    { value: "past3Months", label: "Past 3 Months" },
  ];

  const analyticsData = [
    { value: "newVolunteers", label: "New Volunteers" },

    {
      value: "totalVolunteeredHours",
      label: "Total Volunteered Hours",
      lineDataKey: "totalHours",
      sideLabel: "Total Hours",
    },
    {
      value: "totalNoVolunteered",
      label: "Total Number of Volunteers Volunteered",
      lineDataKey: "volunteerCount",
      sideLabel: "No of Volunteers",
    },
  ];

  useEffect(() => {
    getSummary();
  }, []);

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

  const getNewVolunteers = async (date) => {
    const volunteers = [];
    const ref = collection(db, "volunteer");
    const q = query(
      ref,
      where("accountCreationDate", ">=", date.startDate),
      where("accountCreationDate", "<=", date.endDate)
    );

    const snapshot = await getDocs(q);

    console.log("Size: ", snapshot.size);

    snapshot.forEach((doc) => {
      volunteers.push({
        ...doc.data(),
        id: doc.id,
        accountCreationDate: doc.data().accountCreationDate.toDate(),
      });
    });

    setNewVolunteers(volunteers);
  };

  const getSummary = async () => {
    const volRef = collection(db, "volunteer");
    const actRef = collection(db, "activities");
    const forRef = collection(db, "forums");
    const volSnapshot = await getCountFromServer(volRef);
    const actSnapshot = await getCountFromServer(actRef);
    const forSnapshot = await getCountFromServer(forRef);
    setSummary({
      totalVolunteers: volSnapshot.data().count,
      totalActivities: actSnapshot.data().count,
      totalForums: forSnapshot.data().count,
    });
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
      setData(dataByWeekArr);
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
      setData(dataByMonthArr);
    }

    setLoading(false);
  };

  const getTotalActivities = async () => {
    const ref = collection(db, "activities");
    const snapshot = await getCountFromServer(ref);
    console.log("totalAct: ", snapshot.data().count);
    setSummary({ ...summary, totalActivities: snapshot.data().count });
  };

  const getNoOfVolunteersVolunteered = async (basis, date) => {
    console.log("volunteer");

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
      setData(dataByWeekArr);
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
      setData(dataByMonthArr);
      console.log("Data by month: ", dataByMonthMap);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-auto pb-10 bg-[#EB4335] text-white">Analytics</div>

      <div className="flex flex-row">
        <div className="flex flex-row items-center mr-5">
          <p className="text-lg font-semibold mx-2">Analytics Data:</p>
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
            onChange={(e) => {
              setDataFunc({
                function: e.value,
                lineDataKey: e.lineDataKey,
                sideLabel: e.sideLabel,
              });
            }}
          />
        </div>

        <div className="flex flex-row items-center mx-5">
          <p className="text-lg font-semibold mx-2">Date Range:</p>
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
        </div>

        <button
          className="bg-[#E9ECEF] mx-5 px-5 py-2 mt-1 font-semibold rounded-md"
          onClick={() => {
            if (dateSet.startDate !== null && dateSet.endDate !== null) {
              if (dataFunc.function === "totalVolunteeredHours") {
                getTotalVolunteeredHours(basis, dateSet);
              } else if (dataFunc.function === "totalNoVolunteered") {
                getNoOfVolunteersVolunteered(basis, dateSet);
              } else if (dataFunc.function === "newVolunteers") {
                getNewVolunteers(dateSet);
              }
            } else if (dataFunc === undefined) {
              alert("Please select the analytics data");
            } else {
              alert("Please select a date range");
            }
          }}
        >
          Generate
        </button>
      </div>

      <div className="flex h-[450px] justify-center my-10">
        {basis === "past3Months" &&
          dataFunc.function !== "newVolunteers" &&
          !loading && (
            <ResponsiveContainer width="60%" aspect={2}>
              <LineChart
                width={500}
                height={300}
                data={data}
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
                  label={{
                    value: dataFunc.sideLabel,
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={dataFunc.lineDataKey}
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

        {((basis === "thisMonth" && dataFunc.function !== "newVolunteers") ||
          (basis === "pastMonth" && dataFunc.function !== "newVolunteers")) &&
        !loading ? (
          <ResponsiveContainer width="60%" aspect={2}>
            <BarChart
              width={500}
              height={300}
              data={data}
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
                label={{
                  value: dataFunc.sideLabel,
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataFunc.lineDataKey} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : null}

        {dataFunc.function === "newVolunteers" && (
          <div className="max-h-[500px] w-[500px] overflow-y-scroll ">
            {newVolunteers.map((volunteer) => (
              <div
                key={volunteer.id}
                className="flex flex-row justify-between bg-[#E9ECEF] shadow-md rounded-lg p-4 mb-2"
              >
                <div className="font-semibold">
                  <p>{"Username: " + capitalizeWords(volunteer?.Username)}</p>
                  <p>{"Full Name: " + capitalizeWords(volunteer?.fullName)}</p>
                  <p>{"Phone Number: " + volunteer?.phoneNumber}</p>
                  <p>{"Email: " + volunteer?.email}</p>
                  <p>
                    {"Creation Date: " +
                      format(volunteer.accountCreationDate, "dd MMM yyyy p")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-row justify-evenly pt-1 mt-auto">
        <div className="flex flex-row border border-black rounded p-4 bg-[#E9ECEF] font-semibold">
          <p className="mr-1">Total Volunteers:</p>
          <p>{summary.totalVolunteers}</p>
        </div>
        <div className="flex flex-row border border-black rounded p-4 bg-[#E9ECEF] font-semibold">
          <p className="mr-1">Total Activities:</p>
          <p>{summary.totalActivities}</p>
        </div>
        <div className="flex flex-row border border-black rounded p-4 bg-[#E9ECEF] font-semibold">
          <p className="mr-1">Total Forums:</p>
          <p>{summary.totalForums}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
