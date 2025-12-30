import React from 'react';
import { useData } from '../context/DataContext';
import { Bar, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);


function OverviewPage() {
  const { students, subjects, enrollments } = useData();

  const totalStudents = students.length;
  const totalSubjects = subjects.length;
  const totalGrades = Object.values(enrollments).flat().length;

  const calculateOverallAverage = () => {
    const allGrades = Object.values(enrollments).flat().map(e => e.grade);
    if (allGrades.length === 0) return 0;
    const sum = allGrades.reduce((acc, grade) => acc + grade, 0);
    return (sum / allGrades.length).toFixed(2);
  };

  const overallAverageGrade = React.useMemo(calculateOverallAverage, [enrollments]);

  const calculateAverageGradePerSubject = () => {
    const subjectGrades = {};
    subjects.forEach(subject => {
      subjectGrades[subject.name] = [];
    });

    Object.values(enrollments).flat().forEach(enrollment => {
      const subject = subjects.find(s => s.id === enrollment.subjectId);
      if (subject) {
        subjectGrades[subject.name].push(enrollment.grade);
      }
    });

    const averageGrades = Object.keys(subjectGrades).map(subjectName => {
      const grades = subjectGrades[subjectName];
      if (grades.length === 0) return { subject: subjectName, average: 0 };
      const sum = grades.reduce((acc, grade) => acc + grade, 0);
      return { subject: subjectName, average: (sum / grades.length) };
    });

    return averageGrades;
  };

  const averageGradePerSubjectData = calculateAverageGradePerSubject();

  const barChartData = {
    labels: averageGradePerSubjectData.map(data => data.subject),
    datasets: [
      {
        label: 'Average Grade',
        data: averageGradePerSubjectData.map(data => data.average),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(53, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Average Grade per Subject',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const calculateGradeDistribution = () => {
    const gradeCounts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    const gradeRanges = {
      'A': [90, 100],
      'B': [80, 89],
      'C': [70, 79],
      'D': [60, 69],
      'F': [0, 59],
    };

    Object.values(enrollments).flat().forEach(enrollment => {
      const grade = enrollment.grade;
      if (grade >= gradeRanges.A[0] && grade <= gradeRanges.A[1]) gradeCounts.A++;
      else if (grade >= gradeRanges.B[0] && grade <= gradeRanges.B[1]) gradeCounts.B++;
      else if (grade >= gradeRanges.C[0] && grade <= gradeRanges.C[1]) gradeCounts.C++;
      else if (grade >= gradeRanges.D[0] && grade <= gradeRanges.D[1]) gradeCounts.D++;
      else gradeCounts.F++;
    });

    return gradeCounts;
  };

  const gradeDistributionData = calculateGradeDistribution();

  const pieChartData = {
    labels: Object.keys(gradeDistributionData),
    datasets: [
      {
        data: Object.values(gradeDistributionData),
        backgroundColor: [
          '#4CAF50', // A - Green
          '#2196F3', // B - Blue
          '#FFC107', // C - Yellow
          '#FF9800', // D - Orange
          '#F44336', // F - Red
        ],
        borderColor: [
          '#fff',
          '#fff',
          '#fff',
          '#fff',
          '#fff',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Grade Distribution',
      },
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Total Students</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalStudents}</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Total Subjects</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalSubjects}</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Total Grades</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalGrades}</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Overall Average Grade</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{overallAverageGrade}</p>
        </div>
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
        <Link to="../students" style={{ background: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', textDecoration: 'none' }}>Add Student</Link>
        <Link to="../subjects" style={{ background: '#2196F3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', textDecoration: 'none' }}>Add Subject</Link>
        <Link to="../grades" style={{ background: '#FFC107', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', textDecoration: 'none' }}>Add Grade</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Average Grade per Subject</h3>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Grade Distribution</h3>
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;