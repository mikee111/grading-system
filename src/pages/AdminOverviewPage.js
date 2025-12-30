import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
ChartJS.register(...registerables);


const StatsCard = ({ title, value }) => (
  <div style={{
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    flex: 1,
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    backgroundColor: "#fff",
  }}>
    <h3 style={{ margin: "0 0 10px 0", fontSize: "1.2em", color: "#333" }}>{title}</h3>
    <p style={{ margin: 0, fontSize: "2em", fontWeight: "bold", color: "#007bff" }}>{value}</p>
  </div>
);

const AdminOverviewPage = () => {
  const { students = [], subjects = [], enrollments = {} } = useData() || {};
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalGrades, setTotalGrades] = useState(0);
  const [overallAverageGrade, setOverallAverageGrade] = useState(0);

  useEffect(() => {
    const safeStudents = Array.isArray(students) ? students : [];
    const safeSubjects = Array.isArray(subjects) ? subjects : [];

    const enrollmentLists =
      enrollments && typeof enrollments === "object"
        ? Object.values(enrollments).filter(Array.isArray)
        : [];

    const allEnrollments = enrollmentLists.flat();

    const gradedRecords = allEnrollments.filter((record) => {
      const rawGrade =
        record.finalScore !== undefined && record.finalScore !== null && record.finalScore !== ""
          ? record.finalScore
          : record.grade;
      if (rawGrade === undefined || rawGrade === null || rawGrade === "") return false;
      const n = Number(rawGrade);
      return !Number.isNaN(n);
    });

    setTotalStudents(safeStudents.length);
    setTotalSubjects(safeSubjects.length);
    setTotalGrades(gradedRecords.length);

    if (gradedRecords.length > 0) {
      const sumGrades = gradedRecords.reduce((acc, record) => {
        const rawGrade =
          record.finalScore !== undefined && record.finalScore !== null && record.finalScore !== ""
            ? record.finalScore
            : record.grade;
        const n = Number(rawGrade);
        return Number.isNaN(n) ? acc : acc + n;
      }, 0);
      const avg = sumGrades / gradedRecords.length;
      setOverallAverageGrade(avg.toFixed(2));
    } else {
      setOverallAverageGrade(0);
    }
  }, [students, subjects, enrollments]);

  // Mock data for charts
  const mockSubjectGrades = {
    labels: ['Math', 'Science', 'History', 'Art'],
    datasets: [
      {
        label: 'Average Grade',
        data: [85, 78, 92, 88],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const mockGradeDistribution = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for recent activity
  const mockRecentActivity = [
    { id: 1, type: 'student', description: 'Added new student: John Doe' },
    { id: 2, type: 'grade', description: 'Updated grade for Jane Smith in Math' },
    { id: 3, type: 'subject', description: 'Added new subject: Computer Science' },
    { id: 4, type: 'student', description: 'Added new student: Emily White' },
  ];

  // Mock data for top students
  const mockTopStudents = [
    { id: 1, name: 'Alice Johnson', averageGrade: 95 },
    { id: 2, name: 'Bob Williams', averageGrade: 92 },
    { id: 3, name: 'Charlie Brown', averageGrade: 88 },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#333", marginBottom: "30px" }}>Admin Overview</h1>

      {/* Summary Statistic Cards */}
      <div style={{ display: "flex", justifyContent: "space-around", gap: "20px", marginBottom: "40px" }}>
        <StatsCard title="Total Students" value={totalStudents} />
        <StatsCard title="Total Subjects" value={totalSubjects} />
        <StatsCard title="Total Grades" value={totalGrades} />
        <StatsCard title="Overall Average Grade" value={overallAverageGrade} />
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "40px" }}>
        <Link to="/admin/add-student" style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          borderRadius: "5px",
          textDecoration: "none",
          fontWeight: "bold",
        }}>Add Student</Link>
        <Link to="/admin/add-subject" style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "5px",
          textDecoration: "none",
          fontWeight: "bold",
        }}>Add Subject</Link>
        <Link to="/admin/add-grade" style={{
          padding: "10px 20px",
          backgroundColor: "#ffc107",
          color: "#333",
          borderRadius: "5px",
          textDecoration: "none",
          fontWeight: "bold",
        }}>Add Grade</Link>
      </div>

      {/* Charts Section */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "40px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#333", marginBottom: "20px", fontSize: "1.5em" }}>Average Grade per Subject</h2>
          <Bar data={mockSubjectGrades} />
        </div>
        <div style={{ flex: 1, minWidth: "300px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#333", marginBottom: "20px", fontSize: "1.5em" }}>Grade Distribution</h2>
          <Pie data={mockGradeDistribution} />
        </div>
      </div>

      {/* Recent Activity and Top Students */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#333", marginBottom: "20px", fontSize: "1.5em" }}>Recent Activity</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {mockRecentActivity.map(activity => (
              <li key={activity.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
                {activity.description}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1, minWidth: "300px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#333", marginBottom: "20px", fontSize: "1.5em" }}>Top 3 Students</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {mockTopStudents.map(student => (
              <li key={student.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
                {student.name} - {student.averageGrade}%
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
