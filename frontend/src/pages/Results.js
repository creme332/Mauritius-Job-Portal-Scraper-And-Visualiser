import { Container, Alert } from "@mantine/core";
import StatsGrid from "../components/graphs/StatsGrid";
import HorizontalBarChart from "../components/graphs/HorizontalBarChart";
import PieChart from "../components/graphs/PieChart";
import LineChart from "../components/graphs/LineChart";
import { IconAlertCircle } from "@tabler/icons-react";
import FireStoreManager from "../utils/FireStoreManager";
import { useState, useEffect } from "react";
export default function Results() {
  const [allData, setAllData] = useState(null);

  const stats_grid_data = [
    {
      title: "Jobs scraped this month",
      stats: allData ? allData.metadata.job_count_this_month : "...",
      description: "Number of jobs scraped since start of current month",
    },
    {
      title: "Last update",
      stats: allData
        ? date_diff_days(allData.metadata.last_update.toDate(), new Date())
        : "... hours ago",
      description: "myjob.mu website is scraped on a daily basis",
    },
    {
      title: "Total jobs scraped",
      stats: allData ? allData.metadata.size : "...",
      description: "Total number of jobs scraped from myjob.mu",
    },
  ];

  const chartTitle = {
    cloud_data: "Cloud platforms",
    db_data: "Databases",
    lang_data: "Programming, scripting, and markup languages",
    lib_data: "Other frameworks and libraries",
    loc_data: "Job locations",
    os_data: "Operating systems",
    salary_data: "Job salary",
    tools_data: "Other tools",
    web_data: "Web frameworks and technologies",
    job_trend_by_month: "Number of jobs scraped during last 6 months",
  };

  async function fetchData() {
    const result = await FireStoreManager().getAllDocs();
    setAllData(result);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function date_diff_days(date1, date2) {
    const hours = parseInt(Math.abs(date1 - date2) / 36e5, 10);
    return `${hours} hours ago`;
  }

  function getLineChart() {
    if (!allData) return;

    /**
     * labelsArray must already be sorted by date. Smallest date first.
     * @param {list[str]} labelsArray A list of strings with format YYYY-M-x.
     * @returns A list of strings with year and month. Eg June 2023
     */
    function parseDate(labelsArray) {
      const allMonths = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return labelsArray.map((el) => {
        const year = el.split("-")[0];
        const monthIndex = el.split("-")[1];
        return `${allMonths[monthIndex]} ${year}`;
      });
    }

    const data = allData.job_trend_by_month;
    // console.log(data);
    const [labelsArray, dataArray] = sort_object(data);
    // console.log(labelsArray, dataArray);

    return (
      <LineChart
        title={chartTitle.job_trend_by_month}
        labelsArray={parseDate(labelsArray)}
        dataArray={dataArray}
      />
    );
  }

  function sort_object(dict) {
    const labelsArr = Object.keys(dict);
    const dataArr = labelsArr.map((k) => dict[k]);

    const arrayOfObj = labelsArr.map((d, i) => {
      return {
        label: d,
        data: parseInt(dataArr[i]) || 0,
      };
    });

    const sortedArrayOfObj = arrayOfObj.sort(function (a, b) {
      return b.data - a.data;
    });

    const newLabelsArray = [];
    const newDataArray = [];

    sortedArrayOfObj.forEach(function (d) {
      newLabelsArray.push(d.label);
      newDataArray.push(d.data);
    });

    return [newLabelsArray, newDataArray];
  }

  function getHorizontalBarcharts() {
    if (!allData) return;
    const horizonalBarChartKeys = [
      "cloud_data",
      "db_data",
      "lang_data",
      "lib_data",
      "tools_data",
      "web_data",
    ];

    const validKeys = Object.keys(allData).filter((k) =>
      horizonalBarChartKeys.includes(k)
    );

    return validKeys.map((k, index) => {
      const data = allData[k];
      const [labelsArray, dataArray] = sort_object(data);

      return (
        <HorizontalBarChart
          key={`horizontal-barchart-${k}`}
          dataArray={dataArray}
          labelsArray={labelsArray}
          dataLabel="Frequency"
          titleName={chartTitle[k]}
          themeIndex={index}
        />
      );
    });
  }

  function getPieCharts() {
    if (!allData) return;
    const pieChartKeys = ["loc_data", "os_data", "salary_data"];

    const validKeys = Object.keys(allData).filter((k) =>
      pieChartKeys.includes(k)
    );

    return validKeys.map((k) => {
      const data = allData[k];
      const [labelsArray, dataArray] = sort_object(data);

      if (k === "os_data")
        return (
          <Container key={`piechart-container-${k}`}>
            <PieChart
              dataArray={dataArray}
              labelsArray={labelsArray}
              titleName={chartTitle[k]}
            />
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Note"
              color="green"
            >
              Not all jobs mention an operating system in the job description.
            </Alert>
          </Container>
        );

      if (k === "salary_data") {
        // merge "See description" and "not disclosed"
        const i = labelsArray.indexOf("See description");
        const newDataArray = [...dataArray];
        const newLabelArray = [...labelsArray];
        const SeeDescriptionCount = newDataArray.splice(i, 1)[0];
        const j = labelsArray.indexOf("Not disclosed");
        newDataArray[j] += SeeDescriptionCount;
        newLabelArray.splice(i, 1);
        return (
          <Container key={`piechart-container-${k}`}>
            <PieChart
              dataArray={newDataArray}
              labelsArray={newLabelArray}
              titleName={chartTitle[k]}
            />
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Note"
              color="green"
            >
              Jobs posts which set the salary to "See description" were counted
              in the "Not disclosed" category.
            </Alert>
          </Container>
        );
      }
      return (
        <PieChart
          key={`piechart-${k}`}
          dataArray={dataArray}
          labelsArray={labelsArray}
          titleName={chartTitle[k]}
        />
      );
    });
  }

  return (
    <Container>
      <StatsGrid data={stats_grid_data} />
      {getLineChart()}
      <Container w={640}>{getPieCharts()}</Container>

      {getHorizontalBarcharts()}
    </Container>
  );
}
