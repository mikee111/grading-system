import React from 'react';
import { useData } from '../context/DataContext';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);


function OverviewPage() {
  const { students, subjects, enrollments, users, teacherAssignments, activities } = useData();

  const [filters, setFilters] = React.useState({
    schoolYear: 'all',
    semester: 'all',
    subjectId: 'all',
    gradeLevel: 'all',
    teacherId: 'all',
  });

  const flatEnrollments = React.useMemo(() => {
    const result = [];
    Object.entries(enrollments || {}).forEach(([studentId, records]) => {
      const student = students.find((s) => s.id === studentId);
      (records || []).forEach((rec) => {
        const subject = subjects.find((s) => s.id === rec.id || s.name === rec.name);
        const gradeValue =
          typeof rec.grade === 'number'
            ? rec.grade
            : rec.finalScore ?? rec.midtermScore ?? 0;

        const assignedTeacherId = Object.entries(teacherAssignments || {}).find(([tId, subIds]) => 
          (subIds || []).includes(subject?.id || rec.id)
        )?.[0] || 'unassigned';

        result.push({
          studentId,
          subjectId: subject?.id || rec.id,
          subjectName: rec.name || subject?.name || '',
          gradeLevel: rec.gradeLevel || subject?.gradeLevel || '',
          course: student?.course || '',
          year: student?.year || '',
          grade: gradeValue,
          schoolYear: rec.schoolYear || '2024-2025',
          semester: rec.semester || '1st',
          teacherId: assignedTeacherId,
        });
      });
    });
    return result;
  }, [enrollments, students, subjects, teacherAssignments]);

  const filteredEnrollments = React.useMemo(
    () =>
      flatEnrollments.filter((rec) => {
        if (filters.schoolYear !== 'all' && rec.schoolYear !== filters.schoolYear) return false;
        if (filters.semester !== 'all' && rec.semester !== filters.semester) return false;
        if (filters.subjectId !== 'all' && rec.subjectId !== filters.subjectId) return false;
        if (filters.gradeLevel !== 'all' && rec.gradeLevel !== filters.gradeLevel) return false;
        if (filters.teacherId !== 'all' && rec.teacherId !== filters.teacherId) return false;
        return true;
      }),
    [flatEnrollments, filters]
  );

  const totalStudents = React.useMemo(
    () => new Set(filteredEnrollments.map((e) => e.studentId)).size,
    [filteredEnrollments]
  );
  const totalSubjects = React.useMemo(
    () => new Set(filteredEnrollments.map((e) => e.subjectId)).size,
    [filteredEnrollments]
  );
  const totalGrades = filteredEnrollments.length;

  const overallAverageGrade = React.useMemo(() => {
    if (filteredEnrollments.length === 0) return 0;
    const sum = filteredEnrollments.reduce((acc, e) => acc + (Number(e.grade) || 0), 0);
    return (sum / filteredEnrollments.length).toFixed(2);
  }, [filteredEnrollments]);

  const studentsAtRisk = React.useMemo(() => {
    const studentGrades = {};
    filteredEnrollments.forEach(rec => {
      if (!studentGrades[rec.studentId]) studentGrades[rec.studentId] = [];
      studentGrades[rec.studentId].push(Number(rec.grade) || 0);
    });

    return Object.entries(studentGrades).filter(([id, grades]) => {
      const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
      return avg < 75;
    }).length;
  }, [filteredEnrollments]);

  const handleExportExcel = () => {
    // Basic CSV export as a fallback for "Excel" without heavy libraries
    const headers = ["Student ID", "Subject", "Grade", "SY", "Semester", "Level"];
    const rows = filteredEnrollments.map(e => [
      e.studentId,
      e.subjectName,
      e.grade,
      e.schoolYear,
      e.semester,
      e.gradeLevel
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Grading_Report_${filters.schoolYear}_${filters.semester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateAverageGradePerSubject = () => {
    const subjectGrades = {};
    filteredEnrollments.forEach((rec) => {
      const key = rec.subjectName || 'Unknown';
      if (!subjectGrades[key]) subjectGrades[key] = [];
      subjectGrades[key].push(Number(rec.grade) || 0);
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

  // Enrollment Trend Analytics Logic
  const enrollmentTrendData = React.useMemo(() => {
    const periods = {};
    
    // Group all enrollments (ignore filters for trend except if we want gradeLevel filtering)
    // Actually, user said: "The chart must update dynamically when filters change"
    filteredEnrollments.forEach((rec) => {
      const periodKey = `${rec.schoolYear} ${rec.semester}`;
      if (!periods[periodKey]) {
        periods[periodKey] = new Set();
      }
      periods[periodKey].add(rec.studentId);
    });

    // Sort periods chronologically
    const sortedPeriods = Object.keys(periods).sort((a, b) => {
      // Simple string sort works for SY 2022-2023 1st format
      return a.localeCompare(b);
    });

    return {
      labels: sortedPeriods,
      counts: sortedPeriods.map(p => periods[p].size),
    };
  }, [filteredEnrollments]);

  const maxCapacity = 100; // Configurable static capacity
  const lineChartData = {
    labels: enrollmentTrendData.labels,
    datasets: [
      {
        label: 'Total Enrolled Students',
        data: enrollmentTrendData.counts,
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.25)',
        borderColor: '#1976D2',
        borderWidth: 5, // Even bolder line
        tension: 0.4,
        pointBackgroundColor: '#1976D2',
        pointBorderColor: '#fff',
        pointRadius: 8, // Even larger points
        pointHoverRadius: 10,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#1976D2',
        zIndex: 2,
      },
      {
        label: `Capacity (${maxCapacity})`,
        data: Array(enrollmentTrendData.labels.length).fill(maxCapacity),
        borderColor: '#D32F2F',
        borderDash: [5, 5],
        borderWidth: 4, // Bolder capacity line
        fill: false,
        pointRadius: 0,
        zIndex: 1,
      }
    ],
  };
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { font: { weight: 'bold', size: 13 }, color: '#333' } 
      },
      title: { 
        display: true, 
        text: 'Student Enrollment Analytics',
        font: { size: 18, weight: 'bold' },
        color: '#1a202c'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Students', font: { weight: 'bold', size: 12 } },
        ticks: { font: { weight: 'bold' }, color: '#4a5568' }
      },
      x: {
        ticks: { font: { weight: 'bold' }, color: '#4a5568' }
      }
    }
  };

  const enrollmentInsight = React.useMemo(() => {
    const counts = enrollmentTrendData.counts;
    if (counts.length < 2) return "Collecting more data for trend analysis...";
    const current = counts[counts.length - 1];
    const previous = counts[counts.length - 2];
    const diff = current - previous;
    if (diff > 0) return `Enrollment increased by ${diff} students since last period.`;
    if (diff < 0) return `Enrollment decreased by ${Math.abs(diff)} students since last period.`;
    return "Enrollment remains stable compared to the last period.";
  }, [enrollmentTrendData]);

  const barChartData = {
    labels: averageGradePerSubjectData.map(data => data.subject),
    datasets: [
      {
        label: 'Average Grade',
        data: averageGradePerSubjectData.map(data => data.average),
        backgroundColor: averageGradePerSubjectData.map(data => {
          const avg = data.average;
          if (avg >= 85) return 'rgba(46, 125, 50, 0.85)'; // Darker Green
          if (avg >= 75) return 'rgba(245, 127, 23, 0.85)'; // Darker Yellow/Amber
          return 'rgba(198, 40, 40, 0.85)'; // Darker Red
        }),
        borderColor: averageGradePerSubjectData.map(data => {
          const avg = data.average;
          if (avg >= 85) return '#1B5E20';
          if (avg >= 75) return '#E65100';
          return '#B71C1C';
        }),
        borderWidth: 3, // Bolder bar borders
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { weight: 'bold', size: 13 } }
      },
      title: {
        display: true,
        text: 'Average Grade per Subject',
        font: { size: 18, weight: 'bold' },
        color: '#1a202c'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { font: { weight: 'bold' }, color: '#4a5568' },
        title: { display: true, text: 'Grade (%)', font: { weight: 'bold' } }
      },
      x: {
        ticks: { font: { weight: 'bold' }, color: '#4a5568' }
      }
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
    filteredEnrollments.forEach(enrollment => {
      const grade = Number(enrollment.grade) || 0;
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
          '#2E7D32', // A - Darker Green
          '#1565C0', // B - Darker Blue
          '#F9A825', // C - Darker Amber/Yellow
          '#EF6C00', // D - Darker Orange
          '#C62828', // F - Darker Red
        ],
        borderColor: '#fff',
        borderWidth: 4, // Bolder white borders for pie slices
        hoverOffset: 20,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { font: { weight: 'bold', size: 13 }, color: '#333' }
      },
      title: {
        display: true,
        text: 'Grade Distribution',
        font: { size: 18, weight: 'bold' },
        color: '#1a202c'
      },
    },
  };

  const gradeDistributionInsight = React.useMemo(() => {
    const counts = gradeDistributionData;
    const entries = Object.entries(counts);
    if (entries.length === 0) return "No grade data available.";
    
    const maxGrade = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
    if (maxGrade[1] === 0) return "No grades recorded yet.";
    
    return `Most students are in Grade ${maxGrade[0]} range`;
  }, [gradeDistributionData]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Admin Overview</h2>
        <button 
          onClick={handleExportExcel}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📥 Export Report (CSV/Excel)
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', // Slightly wider min-width
          gap: '24px',
          marginBottom: '30px',
        }}
      >
        {[
          { label: 'Total Students', value: totalStudents, icon: '👨‍🎓', color: '#E3F2FD', textColor: '#1976D2', sub: 'Registered students' },
          { label: 'Total Subjects', value: totalSubjects, icon: '📚', color: '#E8F5E9', textColor: '#2E7D32', sub: 'Offered subjects' },
          { label: 'Total Grades', value: totalGrades, icon: '📝', color: '#FFF3E0', textColor: '#E65100', sub: 'Recorded grades' },
          { label: 'Overall Average', value: `${overallAverageGrade}%`, icon: '📊', color: '#F3E5F5', textColor: '#7B1FA2', sub: 'Student performance' },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              padding: '28px', // Increased padding
              borderRadius: '16px', // More rounded corners
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              border: '1px solid #edf2f7',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div
              style={{
                width: 64, // Larger icon container
                height: 64,
                borderRadius: '14px',
                background: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                flexShrink: 0
              }}
            >
              {card.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>{card.label}</span>
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#1a202c', lineHeight: 1.1 }}>{card.value}</span>
              <span style={{ fontSize: '13px', color: '#a0aec0', fontWeight: '500' }}>{card.sub}</span>
            </div>
          </div>
        ))}

        {/* Warning Indicator Card - styled to match others */}
        {studentsAtRisk > 0 && (
          <div
            style={{
              background: '#FFF5F5',
              padding: '28px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(229, 62, 62, 0.1), 0 4px 6px -2px rgba(229, 62, 62, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              border: '1px solid #FED7D7',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(229, 62, 62, 0.2), 0 10px 10px -5px rgba(229, 62, 62, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(229, 62, 62, 0.1), 0 4px 6px -2px rgba(229, 62, 62, 0.05)';
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '14px',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 4px 6px rgba(229, 62, 62, 0.1)',
                flexShrink: 0
              }}
            >
              ⚠
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#C53030', textTransform: 'uppercase', letterSpacing: '1px' }}>At Risk</span>
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#C53030', lineHeight: 1.1 }}>{studentsAtRisk}</span>
              <span style={{ fontSize: '13px', color: '#F56565', fontWeight: '500' }}>Avg grade below 75%</span>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '12px 16px',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 160 }}>
          <label style={{ fontSize: 12, marginBottom: 4 }}>School Year</label>
          <select
            value={filters.schoolYear}
            onChange={(e) => setFilters((f) => ({ ...f, schoolYear: e.target.value }))}
          >
            <option value="all">All Years</option>
            <option value="2022-2023">2022-2023</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 140 }}>
          <label style={{ fontSize: 12, marginBottom: 4 }}>Semester</label>
          <select
            value={filters.semester}
            onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))}
          >
            <option value="all">All Semesters</option>
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 180 }}>
          <label style={{ fontSize: 12, marginBottom: 4 }}>Subject</label>
          <select
            value={filters.subjectId}
            onChange={(e) => setFilters((f) => ({ ...f, subjectId: e.target.value }))}
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 180 }}>
          <label style={{ fontSize: 12, marginBottom: 4 }}>Grade Level / Section</label>
          <select
            value={filters.gradeLevel}
            onChange={(e) => setFilters((f) => ({ ...f, gradeLevel: e.target.value }))}
          >
            <option value="all">All Levels</option>
            {Array.from(new Set(subjects.map((s) => s.gradeLevel).filter(Boolean))).map((gl) => (
              <option key={gl} value={gl}>{gl}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 180 }}>
          <label style={{ fontSize: 12, marginBottom: 4 }}>Teacher (optional)</label>
          <select
            value={filters.teacherId}
            onChange={(e) => setFilters((f) => ({ ...f, teacherId: e.target.value }))}
          >
            <option value="all">All Teachers</option>
            {(users || [])
              .filter((u) => u.role === 'teacher')
              .map((t) => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() =>
            setFilters({
              schoolYear: 'all',
              semester: 'all',
              subjectId: 'all',
              gradeLevel: 'all',
              teacherId: 'all',
            })
          }
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            background: '#007bff',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Reset Filters
        </button>
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
        <Link to="../students" style={{ background: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', textDecoration: 'none' }}>Add Student</Link>
        <Link to="../subjects" style={{ background: '#2196F3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', textDecoration: 'none' }}>Add Subject</Link>
        <Link to="../grades" style={{ background: '#FFC107', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', textDecoration: 'none' }}>Add Grade</Link>
      </div>

      {/* Enrollment Analytics & Recent Activity Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ marginBottom: '20px' }}>Student Enrollment Analytics</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            background: '#f8f9fa', 
            borderRadius: '4px',
            borderLeft: '4px solid #007bff',
            fontSize: '14px',
            color: '#555',
            fontWeight: '500'
          }}>
            {enrollmentInsight}
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Recent Activities</span>
            <span style={{ fontSize: '18px' }}>🔔</span>
          </h3>
          <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '380px' }}>
            {(!activities || activities.length === 0) ? (
              <p style={{ color: '#777', textAlign: 'center', marginTop: '20px' }}>No recent activities</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {activities.slice(0, 10).map((activity, index) => (
                  <li key={activity.id} style={{ 
                    padding: '12px 0', 
                    borderBottom: index === activities.slice(0, 10).length - 1 ? 'none' : '1px solid #eee',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <div style={{ 
                      minWidth: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: activity.type === 'grade_encoded' ? '#e8f5e9' : 
                                  activity.type === 'subject_added' ? '#fff3e0' : '#e3f2fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}>
                      {activity.type === 'grade_encoded' ? '✔' : 
                       activity.type === 'subject_added' ? '➕' : '👤'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', color: '#333', lineHeight: '1.4' }}>{activity.message}</span>
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        {new Date(activity.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexGrow: 1, minHeight: '300px' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <p style={{ fontSize: '12px', color: '#777', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>
            * Based on selected semester and filters
          </p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexGrow: 1, minHeight: '300px' }}>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {Object.entries(gradeDistributionData).map(([grade, count]) => (
              <div key={grade} style={{ fontSize: '14px', fontWeight: 'bold' }}>
                <span style={{ color: 
                  grade === 'A' ? '#4CAF50' : 
                  grade === 'B' ? '#2196F3' : 
                  grade === 'C' ? '#FFC107' : 
                  grade === 'D' ? '#FF9800' : '#F44336'
                }}>{grade}</span> ({count})
              </div>
            ))}
          </div>
          <div style={{ 
            marginTop: '15px', 
            padding: '8px', 
            background: '#f8f9fa', 
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#555',
            fontWeight: '600',
            border: '1px dashed #ddd'
          }}>
            {gradeDistributionInsight}
          </div>
        </div>
      </div>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginTop: '24px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>👨‍🏫 Active Teachers & Assigned Subjects</span>
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>({users.filter(u => u.role === 'teacher').length} Teachers)</span>
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #edf2f7' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#4a5568', fontWeight: 'bold' }}>Teacher Name</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#4a5568', fontWeight: 'bold' }}>Assigned Subjects</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#4a5568', fontWeight: 'bold' }}>Total Students</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'teacher').map(teacher => {
                const assignedIds = teacherAssignments[teacher.id] || [];
                const assignedSubjects = subjects.filter(s => assignedIds.includes(s.id));
                
                // Calculate total students across all assigned subjects
                let teacherTotalStudents = 0;
                assignedIds.forEach(subId => {
                  Object.values(enrollments).forEach(studentEnrollments => {
                    if (studentEnrollments.some(e => e.id === subId)) {
                      teacherTotalStudents++;
                    }
                  });
                });

                return (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#2d3748' }}>
                      {teacher.firstName} {teacher.lastName}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {assignedSubjects.length > 0 ? (
                          assignedSubjects.map(s => (
                            <span key={s.id} style={{ 
                              background: '#E3F2FD', 
                              color: '#1976D2', 
                              padding: '2px 10px', 
                              borderRadius: '20px', 
                              fontSize: '12px',
                              fontWeight: '600',
                              border: '1px solid #BBDEFB'
                            }}>
                              {s.name} ({s.gradeLevel})
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#a0aec0', fontSize: '13px', fontStyle: 'italic' }}>No subjects assigned</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ 
                        background: teacherTotalStudents > 0 ? '#E8F5E9' : '#F5F5F5', 
                        color: teacherTotalStudents > 0 ? '#2E7D32' : '#9E9E9E',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {teacherTotalStudents}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {users.filter(u => u.role === 'teacher').length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#718096' }}>No active teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;
