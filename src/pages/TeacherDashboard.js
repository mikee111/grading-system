import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

function TeacherDashboard() {
  const navigate = useNavigate();
  const { 
    currentUser, students, subjects, enrollments, saveGradeRecord, 
    teacherAssignments, isLoading, refreshData,
    schoolYears, semesters, logout 
  } = useData();
  const [grades, setGrades] = useState([]);
  const [teacherSubjectIds, setTeacherSubjectIds] = useState([]);

  // DEBUG: Log teacher data
  useEffect(() => {
    if (currentUser) {
      console.log("Teacher Dashboard for:", currentUser.firstName, currentUser.lastName, "ID:", currentUser.id);
      console.log("Teacher Assignments:", teacherAssignments?.[currentUser.id]);
    }
  }, [currentUser, teacherAssignments]);

  const activeSY = useMemo(() => schoolYears.find(sy => sy.isActive)?.name || "", [schoolYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive)?.name || "", [semesters]);

  const teacherIdentity = useMemo(() => {
    if (!currentUser) return { firstName: "", lastName: "", email: "", username: "", fullName: "" };
    const firstName = (currentUser.firstName || "").toString().trim();
    const lastName = (currentUser.lastName || "").toString().trim();
    const email = (currentUser.email || "").toString().trim();
    const username = (currentUser.username || "").toString().trim();
    const fullName = `${firstName} ${lastName}`.trim() || username || email;
    return { firstName, lastName, email, username, fullName };
  }, [currentUser]);

  const { firstName, lastName, email, username, fullName } = teacherIdentity;

  const [activeView, setActiveView] = useState("overview");
  const [enterSubjectId, setEnterSubjectId] = useState("");
  const [enterStudentId, setEnterStudentId] = useState("");
  const [enterSection, setEnterSection] = useState("");
  const [enterCourse, setEnterCourse] = useState("");
  const [enterYear, setEnterYear] = useState("");
  const [enterSchoolYear, setEnterSchoolYear] = useState("");
  const [enterSemester, setEnterSemester] = useState("");
  const [enterAcademicYear, setEnterAcademicYear] = useState("");
  const [enterMidterm, setEnterMidterm] = useState("");
  const [enterFinals, setEnterFinals] = useState("");
  const [enterMessage, setEnterMessage] = useState("");
  const [gradingSearchQuery, setGradingSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("All Status");
  const [studentItemsPerPage] = useState(10);
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [summaryStatusFilter, setSummaryStatusFilter] = useState("All");
  const [summarySemesterFilter, setSummarySemesterFilter] = useState("All");
  const [summaryYearFilter, setSummaryYearFilter] = useState("All");
  const [summarySearchQuery, setSummarySearchQuery] = useState("");
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchResults]);

  // Normalize function for fuzzy matching - defined here to be used in hooks and event handlers
  const normalize = (str) => 
    (str || "")
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\u00A0\u1680​\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, " ") // Replace various space characters with standard space
      .replace(/^(ma'am|maam|ms|mr|mrs|sir)\.?\s+/g, "") // Remove common titles
      .replace(/[^a-z0-9]/g, ""); // Remove ALL non-alphanumeric characters (including spaces, dots, hyphens, etc.)

  useEffect(() => {
    // Automatically refresh data when the window is focused
    const onFocus = () => {
      console.log("TeacherDashboard focused, refreshing data...");
      refreshData();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshData]);

  useEffect(() => {
    const list = [];
    Object.keys(enrollments || {}).forEach((studentId) => {
      (enrollments[studentId] || []).forEach((subject) => {
        list.push({
          studentId,
          subject: subject.name,
          subjectId: subject.id, // Add subjectId for more accurate matching
          midterm: subject.midtermScore || "",
          midtermEq: subject.midtermEq || "",
          finals: subject.finalScore || "",
          finalsEq: subject.finalEq || "",
          schoolYear: subject.schoolYear || "",
          semester: subject.semester || "",
          academicYear: subject.academicYear || "",
        });
      });
    });
    setGrades(list);
  }, [enrollments]);

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;
    const ids = teacherAssignments?.[currentUser.id] || [];
    setTeacherSubjectIds(ids);
  }, [currentUser, teacherAssignments]);

  const teacherSubjects = useMemo(() => {
    if (!currentUser) return [];
    
    const normalizedFullName = normalize(fullName);
    const normalizedLastName = normalize(lastName.toLowerCase());
    const normalizedFirstName = normalize(firstName.toLowerCase());
    const normalizedEmail = normalize(email.toLowerCase());
    const normalizedUsername = normalize(username.toLowerCase());

    // Filter subjects by matching the teacherName typed in the admin dashboard OR by explicit assignment
    const filtered = subjects.filter((s) => {
      // 1. Check ID-based matching first (explicit assignment)
      const subjectId = (s.id || "").toString();
      
      // Also check if teacherAssignments has this user's ID
      const explicitIds = teacherAssignments?.[currentUser.id] || [];
      const isAssignedById = Array.isArray(explicitIds) && explicitIds.some(id => id.toString() === subjectId);
      
      if (isAssignedById) return true;

      // 2. Fallback to name-based matching
      const assignedName = (s.teacherName || "").toString().trim();
      if (!assignedName) return false;

      const normalizedAssignedName = normalize(assignedName);
      
      // Exact match against various identifiers (case-insensitive)
      const lowerAssigned = assignedName.toLowerCase();
      const lowerFull = fullName.toLowerCase();
      const lowerEmail = email.toLowerCase();
      const lowerUser = username.toLowerCase();
      const lowerFirst = firstName.toLowerCase();
      const lowerLast = lastName.toLowerCase();

      // Check if assigned name matches ANY of our identifiers exactly
      const isExactMatch = 
        lowerAssigned === lowerFull || 
        lowerAssigned === lowerEmail || 
        lowerAssigned === lowerUser ||
        lowerAssigned === lowerFirst ||
        lowerAssigned === lowerLast ||
        normalizedAssignedName === normalizedFullName ||
        normalizedAssignedName === normalizedUsername ||
        normalizedAssignedName === normalizedEmail ||
        normalizedAssignedName === normalizedFirstName ||
        normalizedAssignedName === normalizedLastName;
      
      if (isExactMatch) return true;

      // 3. Very flexible matching for edge cases
      const isPartialMatch = 
        (lowerFull && (lowerAssigned.includes(lowerFull) || lowerFull.includes(lowerAssigned))) || 
        (normalizedFullName && (normalizedAssignedName.includes(normalizedFullName) || normalizedFullName.includes(normalizedAssignedName))) ||
        (lowerUser && (lowerAssigned.includes(lowerUser) || lowerUser.includes(lowerAssigned))) ||
        (normalizedUsername && (normalizedAssignedName.includes(normalizedUsername) || normalizedUsername.includes(normalizedAssignedName))) ||
        (lowerEmail && (lowerAssigned.includes(lowerEmail) || lowerEmail.includes(lowerAssigned))) ||
        (lowerFirst && lowerFirst.length > 2 && (lowerAssigned.includes(lowerFirst) || normalizedAssignedName.includes(normalizedFirstName))) ||
        (lowerLast && lowerLast.length > 2 && (lowerAssigned.includes(lowerLast) || normalizedAssignedName.includes(normalizedLastName)));

      return isPartialMatch;
    });

    return filtered;
  }, [subjects, currentUser, teacherSubjectIds, firstName, lastName, email, username, fullName]);

  const teacherSubjectIdsSet = useMemo(() => {
    return new Set(teacherSubjects.map(s => String(s.id)));
  }, [teacherSubjects]);

  // Added console logging for debugging
  useEffect(() => {
    console.log("TeacherDashboard subjects update:", {
      totalSubjects: subjects.length,
      mySubjects: teacherSubjects.length
    });
  }, [subjects, teacherSubjects]);

  const studentMap = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      map.set(s.id, s);
    });
    return map;
  }, [students]);

  const subjectStats = useMemo(() => {
    const bySubject = new Map();
    const teacherSubjectNamesSet = new Set(teacherSubjects.map((s) => s.name));

    // Initialize with all assigned subjects to ensure they show up even with 0 students
    teacherSubjects.forEach(s => {
      bySubject.set(s.name, {
        subject: s.name,
        studentIds: new Set(),
        records: [],
      });
    });

    grades.forEach((g) => {
      if (!g.studentId) return;
      
      // Use subjectId if available for more precise matching
      const isTeacherSubject = (g.subjectId && teacherSubjectIdsSet.has(g.subjectId)) || 
                             teacherSubjectNamesSet.has(g.subject);
                             
      if (!isTeacherSubject) return;

      // Use subject name from the actual subject object to be consistent
      const subj = subjects.find(s => (g.subjectId && s.id === g.subjectId) || s.name === g.subject);
      const subjectName = subj ? subj.name : g.subject;

      if (!bySubject.has(subjectName)) {
        bySubject.set(subjectName, {
          subject: subjectName,
          studentIds: new Set(),
          records: [],
        });
      }
      const entry = bySubject.get(subjectName);
      entry.studentIds.add(g.studentId);
      entry.records.push(g);
    });

    const result = [];

    bySubject.forEach((value) => {
      const pendingCount = value.records.filter(
        (r) => r.midterm === "" || r.finals === ""
      ).length;

      const completed = value.records.filter(
        (r) => r.midterm !== "" && r.finals !== ""
      );

      let avg = 0;
      if (completed.length > 0) {
        const sum = completed.reduce((acc, r) => {
          const m = Number(r.midterm);
          const f = Number(r.finals);
          if (Number.isNaN(m) || Number.isNaN(f)) return acc;
          return acc + (m + f) / 2;
        }, 0);
        avg = sum / completed.length;
      }

      result.push({
        subject: value.subject,
        studentsCount: value.studentIds.size,
        pending: pendingCount,
        average: avg,
      });
    });

    return result;
  }, [grades, teacherSubjects, teacherSubjectIdsSet, subjects]);

  const submissionProgress = useMemo(() => {
    if (subjectStats.length === 0) return { submitted: 0, total: 0, percentage: 0 };
    const submitted = subjectStats.filter(s => s.pending === 0 && s.studentsCount > 0).length;
    const total = subjectStats.length;
    const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;
    return { submitted, total, percentage };
  }, [subjectStats]);

  const recentActivity = useMemo(() => {
    const teacherSubjectNamesSet = new Set(teacherSubjects.map((s) => s.name));

    const copy = grades.filter(g => 
      (g.subjectId && teacherSubjectIdsSet.has(String(g.subjectId))) || 
      teacherSubjectNamesSet.has(g.subject)
    );
    copy.reverse();
    return copy.slice(0, 5).map((g, index) => {
      const s = studentMap.get(g.studentId);
      const name = s ? `${s.firstName} ${s.lastName}` : g.studentId || "Unknown";
      let action = "Updated";
      if (g.midterm && !g.finals) action = "Recorded midterm";
      else if (!g.midterm && g.finals) action = "Recorded finals";
      else if (g.midterm && g.finals) action = "Recorded midterm and finals";
      return {
        id: `${g.studentId}-${g.subject}-${index}`,
        text: `${action} for ${name} in ${g.subject}`,
      };
    });
  }, [grades, studentMap, teacherSubjects, teacherSubjectIdsSet]);

  const allStudentsUnderTeacher = useMemo(() => {
    // 1. Get IDs of all students enrolled in subjects assigned to this teacher
    const enrolledStudentIds = new Set();

    Object.entries(enrollments || {}).forEach(([studentId, studentEnrollments]) => {
      if (studentEnrollments.some(enrollment => teacherSubjectIdsSet.has(String(enrollment.id)))) {
        enrolledStudentIds.add(String(studentId));
      }
    });

    // 2. Map all students and mark if they are "My Students"
    return students.map(stu => {
      const studentName = `${stu.firstName} ${stu.lastName}`;
      const isMyStudent = enrolledStudentIds.has(String(stu.id));
      
      // Find all subjects this student is enrolled in
      const enrolledSubjects = [];
      subjects.forEach(subj => {
        const normalizeSubj = (str) => (str || "").trim().toLowerCase().replace(/\s+/g, "");
        const normalizedSubjectGrade = normalizeSubj(subj.gradeLevel);
        const normalizedStudentYear = normalizeSubj(stu.year);
        const normalizedSubjectSection = normalizeSubj(subj.section);
        const normalizedStudentSection = normalizeSubj(stu.section);
        
        const matchGrade = normalizedSubjectGrade && normalizedSubjectGrade === normalizedStudentYear;
        const matchSection = !normalizedSubjectSection || (normalizedSubjectSection === normalizedStudentSection);
        const explicitMatch = Array.isArray(stu.subjects) && stu.subjects.some(subjName => normalizeSubj(subjName) === normalizeSubj(subj.name));
        
        if ((matchGrade && matchSection) || explicitMatch) {
          enrolledSubjects.push({ name: subj.name, id: subj.id });
        }
      });

      return {
        ...stu,
        name: studentName,
        course: stu.course || "N/A",
        year: stu.year || "N/A",
        section: stu.section || "N/A",
        email: stu.email || "N/A",
        subjects: enrolledSubjects,
        isMyStudent,
        accountStatus: stu.accountStatus || "Active"
      };
    }).filter(stu => stu.isMyStudent); // By default, only show teacher's students
  }, [students, subjects, enrollments, teacherSubjectIdsSet]);

  const filteredStudents = useMemo(() => {
    let result = allStudentsUnderTeacher;
    
    if (studentSearchQuery.trim()) {
      const query = studentSearchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.id.toString().toLowerCase().includes(query) ||
        s.course.toLowerCase().includes(query)
      );
    }

    if (studentStatusFilter !== "all" && studentStatusFilter !== "All Status") {
      result = result.filter(s => s.accountStatus === studentStatusFilter);
    }

    return result;
  }, [allStudentsUnderTeacher, studentSearchQuery, studentStatusFilter]);

  // Pagination for student list
  const totalPages = Math.ceil(filteredStudents.length / studentItemsPerPage);
  const indexOfLastItem = studentCurrentPage * studentItemsPerPage;
  const indexOfFirstItem = indexOfLastItem - studentItemsPerPage;
  const currentStudentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setStudentCurrentPage(pageNumber);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const totalSubjectsTaught = subjectStats.length;
  const totalStudentsCovered = allStudentsUnderTeacher.length;

  const subjectsWithStudents = useMemo(() => {
    const map = new Map(); // Map<subjectId, Array<{studentId, name, year}>>

    const normalize = (str) => (str || "").trim().toLowerCase().replace(/\s+/g, "");

    // 0. Initialize map with all subjects assigned to this teacher
    teacherSubjects.forEach(subj => {
      if (!map.has(String(subj.id))) {
        map.set(String(subj.id), []);
      }
    });

    // 1. Map students based on DataContext enrollments (Source of truth)
    students.forEach((stu) => {
      const studentEnrollments = enrollments[stu.id] || [];
      studentEnrollments.forEach(enrollment => {
        const sId = String(enrollment.id);
        if (map.has(sId)) {
          const list = map.get(sId);
          if (!list.some(s => s.id === stu.id)) {
            list.push({
              id: stu.id,
              name: `${stu.firstName} ${stu.lastName}`,
              year: stu.year || enrollment.gradeLevel || ""
            });
          }
        }
      });

      // 1.1 Fallback: Matching by grade level and section (for legacy/manual matching)
      const matchingByRules = subjects.filter(s => {
        const normalizedSubjectGrade = normalize(s.gradeLevel);
        const normalizedStudentYear = normalize(stu.year);
        const matchGrade = normalizedSubjectGrade && normalizedSubjectGrade === normalizedStudentYear;
        
        const normalizedSubjectSection = normalize(s.section);
        const normalizedStudentSection = normalize(stu.section);
        const matchSection = !normalizedSubjectSection || (normalizedSubjectSection === normalizedStudentSection);
        
        return matchGrade && matchSection;
      });

      matchingByRules.forEach((subj) => {
        const sId = String(subj.id);
        if (map.has(sId)) {
          const list = map.get(sId);
          if (!list.some(s => s.id === stu.id)) {
            list.push({
              id: stu.id,
              name: `${stu.firstName} ${stu.lastName}`,
              year: stu.year
            });
          }
        }
      });
    });

    // 2. Also ensure students with existing grades for a subject are included
    grades.forEach((g) => {
      if (!g.studentId) return;
      const subj = subjects.find(s => (g.subjectId && String(s.id) === String(g.subjectId)) || s.name === g.subject);
      if (!subj) return;

      const sId = String(subj.id);
      if (map.has(sId)) {
        const list = map.get(sId);
        if (!list.some((s) => s.id === g.studentId)) {
          const stu = students.find((s) => s.id === g.studentId);
          const name = stu ? `${stu.firstName} ${stu.lastName}` : g.studentId;
          list.push({
            id: g.studentId,
            name,
            year: stu ? stu.year : ""
          });
        }
      }
    });

    let entries = [];
    map.forEach((value, subjectId) => {
      const metaSubject = subjects.find((s) => String(s.id) === String(subjectId)) || {};
      entries.push({
        id: subjectId,
        name: metaSubject.name || subjectId,
        gradeLevel: metaSubject.gradeLevel || "",
        section: metaSubject.section || "",
        students: value,
      });
    });

    return entries;
  }, [students, grades, teacherSubjects, subjects, enrollments]);

  const availableStudentsForSubject = useMemo(() => {
    if (!enterSubjectId) return [];
    const entry = subjectsWithStudents.find((s) => String(s.id) === String(enterSubjectId));
    return entry ? entry.students : [];
  }, [enterSubjectId, subjectsWithStudents]);

  const toEquivalent = (raw) => {
    const n = Number(raw);
    if (Number.isNaN(n)) return "";
    if (n >= 96) return 1.0;
    if (n >= 94) return 1.25;
    if (n >= 92) return 1.5;
    if (n >= 89) return 1.75;
    if (n >= 86) return 2.0;
    if (n >= 83) return 2.25;
    if (n >= 80) return 2.5;
    if (n >= 77) return 2.75;
    if (n >= 75) return 3.0;
    return 5.0;
  };

  const gradeSummary = useMemo(() => {
    if (!grades || grades.length === 0) return [];

    const bySubject = new Map();

    grades.forEach((g) => {
      if (!g.subject) return;

      // Filter by Semester/Year if set
      if (summarySemesterFilter !== "All" && g.semester !== summarySemesterFilter) return;
      if (summaryYearFilter !== "All" && (g.schoolYear !== summaryYearFilter && g.academicYear !== summaryYearFilter)) return;

      if (!bySubject.has(g.subject)) {
        bySubject.set(g.subject, {
          subject: g.subject,
          records: [],
        });
      }
      bySubject.get(g.subject).records.push(g);
    });

    const teacherSubjectNamesSet = new Set(teacherSubjects.map((s) => s.name));

    const result = [];

    bySubject.forEach((value, subjectName) => {
      // Check if this subject name or any of its records' subjectIds belong to the teacher
      const hasTeacherSubjectId = value.records.some(r => r.subjectId && teacherSubjectIdsSet.has(String(r.subjectId)));
      const isTeacherSubject = hasTeacherSubjectId || teacherSubjectNamesSet.has(subjectName);
      
      if (!isTeacherSubject) return;

      const completed = value.records.filter(
        (r) => r.midterm !== "" && r.finals !== ""
      );

      let avg = 0;
      let highest = 0;
      let lowest = 100;
      let passCount = 0;
      let failCount = 0;

      const distribution = {
        "1.0": 0, "1.25": 0, "1.5": 0, "1.75": 0, "2.0": 0, 
        "2.25": 0, "2.5": 0, "2.75": 0, "3.0": 0, "5.0": 0
      };

      const studentDetails = value.records.map(r => {
        const m = Number(r.midterm);
        const f = Number(r.finals);
        const total = (m + f) / 2;
        const isPass = total >= 75;
        const stu = students.find(s => s.id === r.studentId);
        
        if (!Number.isNaN(total)) {
          if (total > highest) highest = total;
          if (total < lowest) lowest = total;
          if (isPass) passCount++; else failCount++;
          
          const eq = toEquivalent(total);
          if (distribution.hasOwnProperty(eq.toString())) {
            distribution[eq.toString()]++;
          }
        }

        return {
          studentId: r.studentId,
          studentName: stu ? `${stu.firstName} ${stu.lastName}` : r.studentId,
          midterm: r.midterm,
          finals: r.finals,
          total: Number.isNaN(total) ? 0 : total,
          status: isPass ? "Pass" : "Fail",
          equivalent: toEquivalent(total)
        };
      });

      if (completed.length > 0) {
        let sum = 0;
        let count = 0;
        completed.forEach((r) => {
          const m = Number(r.midterm);
          const f = Number(r.finals);
          if (!Number.isNaN(m) && !Number.isNaN(f)) {
            sum += (m + f) / 2;
            count += 1;
          }
        });
        avg = count ? sum / count : 0;
      } else {
        lowest = 0;
      }

      const metaSubject =
        teacherSubjects.find((s) => s.name === subjectName) ||
        subjects.find((s) => s.name === subjectName) ||
        {};

      const status = avg === 0 ? "" : avg >= 75 ? "Pass" : "Fail";
      
      const pendingCount = value.records.filter(r => r.midterm === "" || r.finals === "").length;
      const isComplete = pendingCount === 0 && value.records.length > 0;

      // Filter by Search Query
      if (summarySearchQuery.trim() && !subjectName.toLowerCase().includes(summarySearchQuery.toLowerCase())) return;

      // Filter by Status if set
      if (summaryStatusFilter !== "All" && status !== summaryStatusFilter) return;

      result.push({
        subject: subjectName,
        gradeLevel: metaSubject.gradeLevel || "",
        section: metaSubject.section || "",
        average: avg,
        status,
        highestGrade: highest,
        lowestGrade: lowest === 100 ? 0 : lowest,
        passCount,
        failCount,
        totalStudents: value.records.length,
        studentDetails,
        distribution,
        isComplete,
        pendingCount
      });
    });
    return result;
  }, [grades, teacherSubjects, subjects, students, summaryStatusFilter, summarySemesterFilter, summaryYearFilter, teacherSubjectIdsSet, summarySearchQuery]);

  const gradableItems = useMemo(() => {
    const items = [];
    teacherSubjects.forEach(subj => {
      // Find students enrolled in this subject
      const subjectEntry = subjectsWithStudents.find(s => s.id === subj.id);
      const enrolledStudents = subjectEntry ? subjectEntry.students : students.filter(stu => 
        Array.isArray(stu.subjects) && stu.subjects.includes(subj.name)
      ).map(stu => ({ id: stu.id, name: `${stu.firstName} ${stu.lastName}` }));

      enrolledStudents.forEach(stu => {
        // Get full student details for course/year
        const fullStu = students.find(s => s.id === stu.id);
        items.push({
          studentId: stu.id,
          studentName: stu.name,
          subjectId: subj.id,
          subjectName: subj.name,
          section: subj.section || "N/A",
          course: fullStu?.course || "N/A",
          yearLevel: fullStu?.year || "N/A"
        });
      });
    });
    return items;
  }, [teacherSubjects, subjectsWithStudents, students]);

  const filteredGradingResults = useMemo(() => {
    if (!gradingSearchQuery.trim()) return [];
    const query = gradingSearchQuery.toLowerCase();
    return gradableItems.filter(item => 
      item.studentName.toLowerCase().includes(query) ||
      item.studentId.toString().toLowerCase().includes(query) ||
      item.subjectName.toLowerCase().includes(query) ||
      item.section.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 results for performance/UI
  }, [gradableItems, gradingSearchQuery]);

  // Auto-populate fields when subject or student changes
  useEffect(() => {
    if (enterSubjectId) {
      const subj = teacherSubjects.find(s => String(s.id) === String(enterSubjectId));
      if (subj) {
        setEnterSection(subj.section || "");
        // Smart defaults for SY and Semester from DataContext
        if (!enterSchoolYear) setEnterSchoolYear(activeSY);
        if (!enterAcademicYear) setEnterAcademicYear(activeSY);
        if (!enterSemester) setEnterSemester(activeSem);
      }
    } else {
      setEnterSection("");
    }
  }, [enterSubjectId, teacherSubjects, enterSchoolYear, enterAcademicYear, enterSemester, activeSY, activeSem]);

  useEffect(() => {
    if (enterStudentId) {
      const stu = students.find(s => s.id === enterStudentId);
      if (stu) {
        setEnterCourse(stu.course || "");
        setEnterYear(stu.year || "");
      }

      // Check for existing grades
      if (enterSubjectId) {
        const subj = teacherSubjects.find(s => String(s.id) === String(enterSubjectId));
        if (subj) {
          const existingGrade = grades.find(g => 
            g.studentId === enterStudentId && 
            (String(g.subjectId) === String(subj.id) || g.subject === subj.name)
          );
          if (existingGrade) {
            setEnterMidterm(existingGrade.midterm || "");
            setEnterFinals(existingGrade.finals || "");
          } else {
            setEnterMidterm("");
            setEnterFinals("");
          }
        }
      }
    } else {
      setEnterCourse("");
      setEnterYear("");
      setEnterMidterm("");
      setEnterFinals("");
    }
  }, [enterStudentId, enterSubjectId, students, teacherSubjects, grades]);

  const handleSaveEnteredGrades = () => {
    setEnterMessage("");
    if (!enterSubjectId || !enterStudentId) {
      return;
    }
    if (enterMidterm === "" && enterFinals === "") {
      return;
    }
    const subj = teacherSubjects.find((s) => String(s.id) === String(enterSubjectId));
    if (!subj) {
      setEnterMessage("Subject not found or not assigned to you.");
      return;
    }
    const mid = enterMidterm === "" ? "" : enterMidterm;
    const fin = enterFinals === "" ? "" : enterFinals;
    
    const extraFields = {
      section: enterSection,
      course: enterCourse,
      yearLevel: enterYear,
      schoolYear: enterSchoolYear,
      semester: enterSemester,
      academicYear: enterAcademicYear
    };

    saveGradeRecord(enterStudentId, subj, mid, fin, extraFields);
    setEnterMessage("Grades saved successfully.");
  };

  const handleExportCSV = (subjectData) => {
    if (!subjectData || !subjectData.studentDetails) return;
    
    const headers = ["Student ID", "Student Name", "Midterm", "Finals", "Total", "Status"];
    const rows = subjectData.studentDetails.map(s => [
      s.studentId,
      s.studentName,
      s.midterm,
      s.finals,
      s.total.toFixed(2),
      s.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Grade_Summary_${subjectData.subject.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeStudentsUnderTeacher = allStudentsUnderTeacher.filter(s => s.accountStatus === "Active" || !s.accountStatus).length;
  const inactiveStudentsUnderTeacher = allStudentsUnderTeacher.filter(s => s.accountStatus === "Inactive").length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavItem = ({ label, icon, active, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          textAlign: "left",
          background: active 
            ? "rgba(255, 255, 255, 0.15)" 
            : isHovered ? "rgba(255, 255, 255, 0.08)" : "transparent",
          border: 0,
          padding: "12px 16px",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "14px",
          color: active ? "#ffffff" : "#fecaca",
          fontWeight: active ? "600" : "500",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "100%",
          marginBottom: "4px",
          border: active ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent"
        }}
      >
        <span style={{ fontSize: "18px", opacity: active ? 1 : 0.8 }}>{icon}</span>
        {label}
      </button>
    );
  };

  if (isLoading) {
    return <div style={{ padding: 20 }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#fef2f2" }}>
      <aside
        style={{
          width: 280,
          background: "#7f1d1d",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          color: "#ffffff",
          boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          padding: "24px 16px",
          zIndex: 10
        }}
      >
        {/* Brand/Logo Section */}
        <div style={{ marginBottom: 32, padding: "0 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              background: "linear-gradient(135deg, #ef4444, #b91c1c)", 
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)"
            }}>👨‍🏫</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: "#ffffff", fontWeight: "700", letterSpacing: "0.5px" }}>Teacher Portal</h3>
              <p style={{ margin: 0, fontSize: 11, color: "#fecaca", fontWeight: "bold", textTransform: "uppercase" }}>Academic Management</p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        {currentUser && (
          <div style={{ 
            padding: "16px", 
            background: "rgba(255, 255, 255, 0.08)", 
            borderRadius: "12px", 
            marginBottom: 24,
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 12 }}>
              <div style={{ 
                width: "36px", 
                height: "36px", 
                borderRadius: "50%", 
                background: "#dc2626", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#ffffff"
              }}>
                {firstName?.[0]}{lastName?.[0]}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {fullName}
                </div>
                <div style={{ fontSize: "11px", color: "#fecaca" }}>@{username}</div>
              </div>
            </div>
            <div style={{ 
              fontSize: "10px", 
              background: "rgba(255, 255, 255, 0.15)", 
              color: "#ffffff", 
              padding: "4px 8px", 
              borderRadius: "4px", 
              display: "inline-block",
              fontWeight: "700",
              textTransform: "uppercase"
            }}>
              {currentUser.role}
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <nav style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <div style={{ fontSize: "11px", color: "#fca5a5", fontWeight: "700", padding: "0 12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Main Menu</div>
          
          <NavItem 
            label="Overview" 
            icon="📊" 
            active={activeView === "overview"} 
            onClick={() => setActiveView("overview")} 
          />
          <NavItem 
            label="My Subjects" 
            icon="📚" 
            active={activeView === "subjects"} 
            onClick={() => setActiveView("subjects")} 
          />
          <NavItem 
            label="Student Directory" 
            icon="👥" 
            active={activeView === "students"} 
            onClick={() => setActiveView("students")} 
          />
          <NavItem 
            label="Grade Entry" 
            icon="✍️" 
            active={activeView === "enterGrades"} 
            onClick={() => setActiveView("enterGrades")} 
          />
          <NavItem 
            label="Grade Summary" 
            icon="📜" 
            active={activeView === "summary"} 
            onClick={() => setActiveView("summary")} 
          />

          {/* Dynamic Subject List Section */}
          {teacherSubjects.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: "11px", color: "#fca5a5", fontWeight: "700", padding: "0 12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Current Classes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {teacherSubjects.slice(0, 3).map(subj => (
                  <div 
                    key={subj.id}
                    style={{ 
                      fontSize: "12px", 
                      padding: "10px 12px", 
                      borderRadius: "8px", 
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      margin: "0 4px"
                    }}
                  >
                    <div style={{ color: "#ffffff", fontWeight: "600", marginBottom: "2px" }}>{subj.name}</div>
                    <div style={{ fontSize: "10px", color: "#fecaca" }}>{subj.gradeLevel} {subj.section && `• Sec ${subj.section}`}</div>
                  </div>
                ))}
                {teacherSubjects.length > 3 && (
                  <div 
                    onClick={() => setActiveView("subjects")}
                    style={{ fontSize: "11px", color: "#ffffff", padding: "8px 12px", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
                  >
                    + {teacherSubjects.length - 3} more subjects
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Footer Section */}
        <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
          <header style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "32px", 
            background: "#ffffff",
            padding: "20px 24px",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #fee2e2"
          }}>
            <div>
              <h1 style={{ color: "#7f1d1d", margin: 0, fontSize: "24px", fontWeight: "800" }}>Welcome back, {firstName}!</h1>
              <p style={{ margin: "4px 0 0 0", color: "#991b1b", fontSize: "14px" }}>Here's what's happening with your classes today.</p>
            </div>
            <div style={{ 
              fontSize: "14px", 
              color: "#dc2626", 
              fontWeight: "700", 
              backgroundColor: "#fef2f2", 
              padding: "10px 18px", 
              borderRadius: "12px", 
              border: "1px solid #fee2e2",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{ fontSize: "18px" }}>🗓️</span> {activeSem} | AY {activeSY}
            </div>
          </header>
          {activeView === "overview" && (
            <>
              {/* Teacher Summary Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "24px",
                  marginBottom: "40px",
                }}
              >
                {[
                  { label: "Total Students", value: totalStudentsCovered, icon: "👥", color: "#dc2626" },
                  { label: "Active Students", value: activeStudentsUnderTeacher, icon: "✅", color: "#059669" },
                  { label: "Inactive Students", value: inactiveStudentsUnderTeacher, icon: "⚠️", color: "#b91c1c" }
                ].map((card, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      padding: "24px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      border: "1px solid #fee2e2",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      cursor: "default"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ 
                        width: "40px", 
                        height: "40px", 
                        borderRadius: "10px", 
                        background: `${card.color}15`, 
                        color: card.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px"
                      }}>{card.icon}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", color: "#991b1b", fontWeight: "600" }}>{card.label}</div>
                      <div style={{ fontSize: "28px", fontWeight: "800", color: "#450a0a", marginTop: "4px" }}>{card.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                }}
              >
        <div
          onClick={() => setActiveView("subjects")}
          style={{
          	flex: 1,
            minWidth: "220px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "16px 20px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#666", display: 'flex', justifyContent: 'space-between' }}>
            <span>Courses</span>
            <span>📂</span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#007bff", marginTop: "4px" }}>
            {totalSubjectsTaught}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#007bff", marginTop: "8px", fontWeight: "600" }}>View My Courses →</div>
        </div>

        <div
          onClick={() => setActiveView("students")}
          style={{
            flex: 1,
            minWidth: "220px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "16px 20px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#666", display: 'flex', justifyContent: 'space-between' }}>
            <span>Enrolled Students</span>
            <span>👥</span>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#28a745", marginTop: "4px" }}>
            {totalStudentsCovered}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#28a745", marginTop: "8px", fontWeight: "600" }}>View Class Roster →</div>
        </div>

        <div
          id="submission-progress-section"
          onClick={() => {
            setActiveView("overview");
            setTimeout(() => {
              document.getElementById('subjects-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          style={{
            flex: 1,
            minWidth: "220px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "16px 20px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#666", display: 'flex', justifyContent: 'space-between' }}>
            <span>Pending Submissions</span>
            <span>📝</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: "4px" }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10B981" }}>
              {submissionProgress.submitted} / {submissionProgress.total}
            </div>
          </div>
          <div style={{ marginTop: "8px", backgroundColor: "#f3f4f6", borderRadius: "4px", height: "8px", width: "100%", overflow: "hidden" }}>
            <div style={{ backgroundColor: "#10B981", height: "100%", width: `${submissionProgress.percentage}%`, transition: "width 0.5s ease-out" }}></div>
          </div>
          <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#10B981", fontWeight: "600" }}>Pending Courses →</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "32px",
        }}
      >
        <div
          id="subjects-section"
          style={{
            flex: 2,
            minWidth: "600px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            padding: "20px",
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1a202c" }}>
              Course Status
            </h2>
            <button
              onClick={() => setActiveView("enterGrades")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2563EB",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
              }}
            >
              <span>➕</span> Enter Grades
            </button>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  <th style={{ padding: "12px 8px", color: "#666", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase" }}>Course</th>
                  <th style={{ padding: "12px 8px", color: "#666", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase" }}>Section</th>
                  <th style={{ padding: "12px 8px", color: "#666", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase" }}>Students</th>
                  <th style={{ padding: "12px 8px", color: "#666", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 8px", color: "#666", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {subjectStats.map((s) => {
                  const meta = subjects.find(subj => subj.name === s.subject) || {};
                  const isSubmitted = s.pending === 0 && s.studentsCount > 0;
                  return (
                    <tr key={s.subject} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "14px 8px", fontWeight: "500" }}>{s.subject}</td>
                      <td style={{ padding: "14px 8px" }}>{meta.section || "A"}</td>
                      <td style={{ padding: "14px 8px" }}>{s.studentsCount}</td>
                      <td style={{ padding: "14px 8px" }}>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "4px", 
                          fontSize: "0.75rem", 
                          fontWeight: "bold",
                          backgroundColor: isSubmitted ? "#D1FAE5" : "#FEF3C7",
                          color: isSubmitted ? "#065F46" : "#92400E"
                        }}>
                          {isSubmitted ? "Submitted" : "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 8px" }}>
                        <button
                          onClick={() => {
                            setEnterSubjectId(meta.id || s.subject);
                            setActiveView("enterGrades");
                          }}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: isSubmitted ? "#f3f4f6" : "#EFF6FF",
                            color: isSubmitted ? "#4B5563" : "#2563EB",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          {isSubmitted ? "View" : "Encode"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {teacherSubjects.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#666", fontStyle: "italic" }}>
                      No subjects assigned to you yet. Please contact the administrator.
                    </td>
                  </tr>
                )}
                {teacherSubjects.length > 0 && subjectStats.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#666", fontStyle: "italic" }}>
                      No grade records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: "320px" }}>
          <div
            id="activity-section"
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              padding: "16px 20px",
              flex: 1
            }}
          >
            <h2 style={{ margin: 0, marginBottom: "12px", fontSize: "1.2rem" }}>
              Recent grading activity
            </h2>
            {recentActivity.length === 0 && <div>No grading activity yet.</div>}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  style={{
                    padding: "6px 0",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "0.95rem",
                  }}
                >
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div
            id="deadlines-section"
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              padding: "16px 20px",
            }}
          >
            <h2 style={{ margin: 0, marginBottom: "16px", fontSize: "1.2rem", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📅</span> Grade Deadlines
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#FFFBEB', borderRadius: '6px', border: '1px solid #FEF3C7' }}>
                <span style={{ fontWeight: '600', color: '#92400E' }}>Midterm Grades Due</span>
                <span style={{ fontWeight: 'bold', color: '#B45309' }}>Feb 10</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FEE2E2' }}>
                <span style={{ fontWeight: '600', color: '#991B1B' }}>Final Grades Due</span>
                <span style={{ fontWeight: 'bold', color: '#B91C1C' }}>Mar 25</span>
              </div>
            </div>
          </div>
        </div>
      </div>
            </>
          )}

          {activeView === "subjects" && (
            <div style={{ maxWidth: "900px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                <h2 style={{ margin: 0 }}>Subjects</h2>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    {teacherSubjects.length} subjects found
                  </span>
                </div>
              </div>
              <p style={{ marginBottom: "16px", color: "#666", fontStyle: "italic" }}>
                Subject assignments are managed by the Administrator. If you need to add or remove a subject, please contact the admin.
              </p>

              <table
                border="1"
                cellPadding="10"
                style={{ 
                  width: "100%", 
                  borderCollapse: "separate", 
                  borderSpacing: "0",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #fee2e2",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <thead>
                  <tr style={{ background: "#fef2f2" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "700", color: "#991b1b", borderBottom: "1px solid #fee2e2" }}>ID</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "700", color: "#991b1b", borderBottom: "1px solid #fee2e2" }}>Name</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "700", color: "#991b1b", borderBottom: "1px solid #fee2e2" }}>Grade level</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "700", color: "#991b1b", borderBottom: "1px solid #fee2e2" }}>Section</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherSubjects.map((subj) => (
                    <tr key={subj.id?.toString() || Math.random()} style={{ transition: "background 0.2s" }}>
                      <td style={{ padding: "16px", borderBottom: "1px solid #fef2f2", color: "#450a0a", fontWeight: "500" }}>{subj.id}</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #fef2f2", color: "#450a0a", fontWeight: "600" }}>{subj.name}</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #fef2f2", color: "#450a0a" }}>{subj.gradeLevel}</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #fef2f2", color: "#450a0a" }}>{subj.section}</td>
                    </tr>
                  ))}
                  {teacherSubjects.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        style={{ textAlign: "center", fontSize: "0.9rem", color: "#666", padding: "40px 20px" }}
                      >
                        <div style={{ marginBottom: "15px", fontSize: "1.2rem", fontWeight: "bold", color: "#333" }}>
                          No subjects assigned yet.
                        </div>
                        
                        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "left", background: "#fff5f5", padding: "24px", borderRadius: "12px", border: "1px solid #feb2b2", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#7f1d1d", fontWeight: "600" }}>
                            The system is looking for subjects assigned to:
                          </p>
                          <ul style={{ margin: "0 0 16px 0", paddingLeft: "25px", fontSize: "14px", color: "#dc2626", lineHeight: "1.8" }}>
                            <li>Full Name: <strong>{fullName}</strong></li>
                            <li>Username: <strong>{username}</strong></li>
                            <li>Email: <strong>{email}</strong></li>
                          </ul>
                          
                          <div style={{ borderTop: "1px solid #fecaca", paddingTop: "16px", marginTop: "16px" }}>
                            <p style={{ margin: 0, fontSize: "12px", color: "#991b1b", fontStyle: "italic" }}>
                              Ask your Admin to assign your subjects using one of the names above.
                            </p>
                          </div>
                        </div>

                        <div style={{ marginTop: "30px", fontSize: "0.9rem", color: "#999", padding: "20px", background: "#fcfcfc", borderRadius: "8px", border: "1px dashed #eee" }}>
                          No other subjects found in the system.<br/>
                          Total subjects in system: <strong>{subjects.length}</strong>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {activeView === "students" && (
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "15px"
              }}>
                <h2 style={{ margin: 0, color: "#7f1d1d" }}>My Student Directory</h2>
                
                <div style={{ display: "flex", gap: "12px", flex: 1, justifyContent: "flex-end", minWidth: "300px" }}>
                  <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={studentSearchQuery}
                      onChange={(e) => {
                        setStudentSearchQuery(e.target.value);
                        setStudentCurrentPage(1);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 35px",
                        borderRadius: "8px",
                        border: "1px solid #dc2626",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                        boxShadow: "0 1px 2px rgba(127,29,29,0.05)"
                      }}
                    />
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#dc2626" }}>🔍</span>
                  </div>
                  
                  <select
                    value={studentStatusFilter}
                    onChange={(e) => {
                      setStudentStatusFilter(e.target.value);
                      setStudentCurrentPage(1);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #dc2626",
                      fontSize: "0.9rem",
                      backgroundColor: "#fff",
                      color: "#7f1d1d",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(127,29,29,0.05)"
                    }}
                  >
                    <option value="All Status">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>

              {/* Stats Bar */}
              <div style={{ display: "flex", gap: "20px", marginBottom: "24px" }}>
                <div style={{ 
                  padding: "16px 20px", 
                  background: "#fef2f2", 
                  borderRadius: "12px", 
                  border: "1px solid #fee2e2", 
                  flex: 1,
                  boxShadow: "0 1px 3px rgba(127,29,29,0.05)"
                }}>
                  <div style={{ fontSize: "0.8rem", color: "#991b1b", marginBottom: "4px", fontWeight: "600", textTransform: "uppercase" }}>Assigned Students</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#7f1d1d" }}>{allStudentsUnderTeacher.length}</div>
                </div>
                <div style={{ 
                  padding: "16px 20px", 
                  background: "#fef2f2", 
                  borderRadius: "12px", 
                  border: "1px solid #fee2e2", 
                  flex: 1,
                  boxShadow: "0 1px 3px rgba(127,29,29,0.05)"
                }}>
                  <div style={{ fontSize: "0.8rem", color: "#991b1b", marginBottom: "4px", fontWeight: "600", textTransform: "uppercase" }}>Active Courses</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#7f1d1d" }}>{teacherSubjects.length}</div>
                </div>
              </div>


              {currentStudentItems.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "60px 40px", 
                  background: "#fff", 
                  borderRadius: "12px", 
                  border: "1px dashed #dc2626",
                  color: "#991b1b"
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "16px" }}>👥</div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#7f1d1d" }}>No students found</h3>
                  <p style={{ margin: 0 }}>
                    {studentSearchQuery ? "Try adjusting your search or filters." : "No students are currently enrolled in your assigned subjects."}
                  </p>
                </div>

              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                    {currentStudentItems.map((stu) => (
                      <div
                        key={stu.id}
                        style={{
                          backgroundColor: "#fff",
                          borderRadius: "16px",
                          padding: "24px",
                          border: "1px solid #fee2e2",
                          boxShadow: "0 4px 6px -1px rgba(127, 29, 29, 0.1), 0 2px 4px -1px rgba(127, 29, 29, 0.06)",
                          transition: "all 0.2s",
                          display: "flex",
                          flexDirection: "column",
                          gap: "20px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(127, 29, 29, 0.1), 0 4px 6px -2px rgba(127, 29, 29, 0.05)";
                          e.currentTarget.style.borderColor = "#fca5a5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(127, 29, 29, 0.1), 0 2px 4px -1px rgba(127, 29, 29, 0.06)";
                          e.currentTarget.style.borderColor = "#fee2e2";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ 
                            width: "56px", 
                            height: "56px", 
                            borderRadius: "14px", 
                            background: "#fef2f2", 
                            color: "#dc2626", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            border: "2px solid #fff",
                            boxShadow: "0 0 0 2px #fef2f2"
                          }}>
                            {(stu.name || stu.firstName || "?").charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "bold", fontSize: "1.125rem", color: "#7f1d1d", marginBottom: "2px" }}>
                              {stu.name || `${stu.firstName} ${stu.lastName}`.trim() || "Unknown Student"}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "0.75rem", color: "#991b1b", fontWeight: "600" }}>ID: {stu.id}</span>
                              <span style={{ 
                                padding: "2px 8px", 
                                borderRadius: "9999px", 
                                fontSize: "0.65rem", 
                                fontWeight: "700",
                                textTransform: "uppercase",
                                backgroundColor: stu.accountStatus === "Active" ? "#dcfce7" : "#fee2e2",
                                color: stu.accountStatus === "Active" ? "#15803d" : "#b91c1c"
                              }}>
                                {stu.accountStatus || "Active"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "1fr 1fr", 
                          gap: "12px",
                          padding: "16px",
                          backgroundColor: "#fef2f2",
                          borderRadius: "12px"
                        }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.7rem", color: "#991b1b", fontWeight: "700", textTransform: "uppercase" }}>Course</span>
                            <span style={{ fontWeight: "600", color: "#7f1d1d", fontSize: "0.9rem" }}>{stu.course}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.7rem", color: "#991b1b", fontWeight: "700", textTransform: "uppercase" }}>Section</span>
                            <span style={{ fontWeight: "600", color: "#7f1d1d", fontSize: "0.9rem" }}>{stu.section}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.7rem", color: "#991b1b", fontWeight: "700", textTransform: "uppercase" }}>Year Level</span>
                            <span style={{ fontWeight: "600", color: "#7f1d1d", fontSize: "0.9rem" }}>{stu.year}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.7rem", color: "#991b1b", fontWeight: "700", textTransform: "uppercase" }}>Enrolled</span>
                            <span style={{ fontWeight: "600", color: "#7f1d1d", fontSize: "0.9rem" }}>{stu.subjects ? stu.subjects.length : 0} Subjects</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleViewStudent(stu)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#fff",
                            color: "#dc2626",
                            border: "1px solid #fee2e2",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#dc2626";
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.borderColor = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fff";
                            e.currentTarget.style.color = "#dc2626";
                            e.currentTarget.style.borderColor = "#fee2e2";
                          }}
                        >
                          View Student Profile
                        </button>
                      </div>
                    ))}

                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "20px 0",
                      borderTop: "1px solid #fee2e2"
                    }}>
                      <div style={{ fontSize: "0.875rem", color: "#991b1b" }}>
                        Showing <span style={{ fontWeight: "600", color: "#7f1d1d" }}>{indexOfFirstItem + 1}</span> to <span style={{ fontWeight: "600", color: "#7f1d1d" }}>{Math.min(indexOfLastItem, filteredStudents.length)}</span> of <span style={{ fontWeight: "600", color: "#7f1d1d" }}>{filteredStudents.length}</span> students
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handlePageChange(studentCurrentPage - 1)}
                          disabled={studentCurrentPage === 1}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #dc2626",
                            backgroundColor: studentCurrentPage === 1 ? "#fef2f2" : "#fff",
                            color: studentCurrentPage === 1 ? "#fca5a5" : "#dc2626",
                            cursor: studentCurrentPage === 1 ? "not-allowed" : "pointer",
                            fontSize: "0.875rem",
                            fontWeight: "500"
                          }}
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              border: "1px solid",
                              borderColor: studentCurrentPage === i + 1 ? "#dc2626" : "#dc2626",
                              backgroundColor: studentCurrentPage === i + 1 ? "#dc2626" : "#fff",
                              color: studentCurrentPage === i + 1 ? "#fff" : "#dc2626",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              fontWeight: "600"
                            }}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(studentCurrentPage + 1)}
                          disabled={studentCurrentPage === totalPages}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #dc2626",
                            backgroundColor: studentCurrentPage === totalPages ? "#fef2f2" : "#fff",
                            color: studentCurrentPage === totalPages ? "#fca5a5" : "#dc2626",
                            cursor: studentCurrentPage === totalPages ? "not-allowed" : "pointer",
                            fontSize: "0.875rem",
                            fontWeight: "500"
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                </>
              )}
            </div>
          )}

          {activeView === "enterGrades" && (
            <div style={{ maxWidth: "800px", padding: "20px", margin: "0 auto" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "24px",
                borderBottom: "2px solid #28a745",
                paddingBottom: "10px"
              }}>
                <h2 style={{ margin: 0, color: "#28a745" }}>Enter Student Grades</h2>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  Teacher: <strong>{fullName}</strong>
                </div>
              </div>

              {/* Student Search Section */}
              <div className="search-container" style={{ marginBottom: "20px", position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Quick Search Student</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Search by name, ID, subject, or section..."
                      value={gradingSearchQuery}
                      onChange={(e) => {
                        setGradingSearchQuery(e.target.value);
                        setShowSearchResults(true);
                      }}
                      onFocus={() => setShowSearchResults(true)}
                      style={{ 
                        width: "100%", 
                        padding: "12px 12px 12px 40px", 
                        borderRadius: "8px", 
                        border: "2px solid #28a745", 
                        fontSize: "1rem",
                        boxSizing: "border-box"
                      }}
                    />
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem" }}>🔍</span>
                  </div>
                </div>

                {showSearchResults && filteredGradingResults.length > 0 && (
                  <div style={{ 
                    position: "absolute", 
                    top: "100%", 
                    left: 0, 
                    right: 0, 
                    backgroundColor: "#fff", 
                    border: "1px solid #ccc", 
                    borderRadius: "8px", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", 
                    zIndex: 100, 
                    marginTop: "5px",
                    maxHeight: "300px",
                    overflowY: "auto"
                  }}>
                    {filteredGradingResults.map((result, idx) => (
                      <div 
                        key={`${result.studentId}-${result.subjectId}-${idx}`}
                        onClick={() => {
                          setEnterSubjectId(result.subjectId);
                          setEnterStudentId(result.studentId);
                          setGradingSearchQuery("");
                          setShowSearchResults(false);
                        }}
                        style={{ 
                          padding: "12px 15px", 
                          borderBottom: "1px solid #eee", 
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0fdf4"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontWeight: "bold", color: "#333" }}>{result.studentName}</span>
                          <span style={{ fontSize: "0.8rem", color: "#666" }}>ID: {result.studentId}</span>
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#059669" }}>
                          Subject: {result.subjectName} | Section: {result.section}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showSearchResults && gradingSearchQuery && filteredGradingResults.length === 0 && (
                  <div style={{ 
                    position: "absolute", 
                    top: "100%", 
                    left: 0, 
                    right: 0, 
                    backgroundColor: "#fff", 
                    border: "1px solid #ccc", 
                    borderRadius: "8px", 
                    padding: "15px",
                    textAlign: "center",
                    color: "#666",
                    zIndex: 100,
                    marginTop: "5px"
                  }}>
                    No students or subjects match your search.
                  </div>
                )}
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "20px",
                backgroundColor: "#fff",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "1px solid #e0e0e0"
              }}>
                {/* Left Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Subject</label>
                    <select
                      value={enterSubjectId}
                      onChange={(e) => {
                        setEnterSubjectId(e.target.value);
                        setEnterStudentId("");
                      }}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
                    >
                      <option value="">Select subject</option>
                      {teacherSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.gradeLevel && `(${s.gradeLevel})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Section</label>
                    <input
                      type="text"
                      value={enterSection}
                      readOnly
                      placeholder="Auto-populated"
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #eee", backgroundColor: "#f9f9f9", fontSize: "1rem" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Student</label>
                    <select
                      value={enterStudentId}
                      onChange={(e) => setEnterStudentId(e.target.value)}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
                      disabled={!enterSubjectId}
                    >
                      <option value="">Select student</option>
                      {availableStudentsForSubject.map((stu) => (
                        <option key={stu.id} value={stu.id}>
                          {stu.id} - {stu.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Course</label>
                    <input
                      type="text"
                      value={enterCourse}
                      readOnly
                      placeholder="Auto-populated"
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #eee", backgroundColor: "#f9f9f9", fontSize: "1rem" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Year Level</label>
                    <input
                      type="text"
                      value={enterYear}
                      readOnly
                      placeholder="Auto-populated"
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #eee", backgroundColor: "#f9f9f9", fontSize: "1rem" }}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>School Year</label>
                    <select
                      value={enterSchoolYear}
                      onChange={(e) => setEnterSchoolYear(e.target.value)}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
                    >
                      <option value="">Select School Year</option>
                      {schoolYears.map(sy => (
                        <option key={sy.id} value={sy.name}>{sy.name} {sy.isActive ? "(Active)" : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Academic Year</label>
                    <select
                      value={enterAcademicYear}
                      onChange={(e) => setEnterAcademicYear(e.target.value)}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
                    >
                      <option value="">Select Academic Year</option>
                      {schoolYears.map(sy => (
                        <option key={sy.id} value={sy.name}>{sy.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Semester</label>
                    <select
                      value={enterSemester}
                      onChange={(e) => setEnterSemester(e.target.value)}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
                    >
                      <option value="">Select Semester</option>
                      {semesters.map(sem => (
                        <option key={sem.id} value={sem.name}>{sem.name} {sem.isActive ? "(Active)" : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Midterm</label>
                      <input
                        type="number"
                        value={enterMidterm}
                        onChange={(e) => setEnterMidterm(e.target.value)}
                        placeholder="0-100"
                        style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#444" }}>Finals</label>
                      <input
                        type="number"
                        value={enterFinals}
                        onChange={(e) => setEnterFinals(e.target.value)}
                        placeholder="0-100"
                        style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: "10px",
                    padding: "15px", 
                    borderRadius: "8px", 
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold", color: "#166534" }}>Total Grade:</span>
                      <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#166534" }}>
                        {enterMidterm && enterFinals 
                          ? ((Number(enterMidterm) + Number(enterFinals)) / 2).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    
                    {enterMidterm && enterFinals && (
                      <div style={{ 
                        textAlign: "center",
                        padding: "8px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        backgroundColor: (Number(enterMidterm) + Number(enterFinals)) / 2 >= 75 ? "#dcfce7" : "#fee2e2",
                        color: (Number(enterMidterm) + Number(enterFinals)) / 2 >= 75 ? "#15803d" : "#b91c1c",
                        border: `1px solid ${(Number(enterMidterm) + Number(enterFinals)) / 2 >= 75 ? "#86efac" : "#fecaca"}`
                      }}>
                        {(Number(enterMidterm) + Number(enterFinals)) / 2 >= 75 ? "PASSED" : "FAILED"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer / Save Button */}
                <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  <button 
                    type="button" 
                    onClick={handleSaveEnteredGrades}
                    style={{ 
                      padding: "14px", 
                      borderRadius: "8px", 
                      border: "none", 
                      backgroundColor: "#28a745", 
                      color: "#fff", 
                      fontSize: "1.1rem", 
                      fontWeight: "bold", 
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(40,167,69,0.2)",
                      transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#218838"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#28a745"}
                  >
                    Save Grade Record
                  </button>
                  {enterMessage && (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "10px", 
                      borderRadius: "6px", 
                      backgroundColor: "#d1e7dd", 
                      color: "#0f5132",
                      fontWeight: "500"
                    }}>
                      {enterMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === "summary" && (
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>Grade Summary</h2>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input 
                    type="text"
                    placeholder="Search subject..."
                    value={summarySearchQuery}
                    onChange={(e) => setSummarySearchQuery(e.target.value)}
                    style={{ 
                      padding: "8px 12px", 
                      borderRadius: "6px", 
                      border: "1px solid #ccc",
                      minWidth: "200px"
                    }}
                  />
                  <select 
                    value={summaryStatusFilter} 
                    onChange={(e) => setSummaryStatusFilter(e.target.value)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                  >
                    <option value="All">All Status</option>
                    <option value="Pass">Passed Only</option>
                    <option value="Fail">Failed Only</option>
                  </select>
                  <select 
                    value={summarySemesterFilter} 
                    onChange={(e) => setSummarySemesterFilter(e.target.value)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                  >
                    <option value="All">All Semesters</option>
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                  <select 
                    value={summaryYearFilter} 
                    onChange={(e) => setSummaryYearFilter(e.target.value)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                  >
                    <option value="All">All Years</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
              </div>

              {/* Performance Alerts */}
              {gradeSummary.some(s => s.failCount > 0 || s.average < 75) && (
                <div style={{ 
                  padding: "15px 20px", 
                  backgroundColor: "#fff5f5", 
                  border: "1px solid #feb2b2", 
                  borderRadius: "10px", 
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c53030", fontWeight: "bold" }}>
                    <span>⚠️ Performance Alerts</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#742a2a" }}>
                    {gradeSummary.filter(s => s.failCount > 0).length} subjects have students with failing grades. 
                    {gradeSummary.filter(s => s.average < 75 && s.average > 0).length > 0 && ` ${gradeSummary.filter(s => s.average < 75 && s.average > 0).length} subjects have a failing class average.`}
                  </div>
                </div>
              )}

              {/* Stats Overview */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" }}>
                <div style={{ padding: "15px", background: "#fff", borderRadius: "10px", border: "1px solid #e0e0e0", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px" }}>Total Records</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>{gradeSummary.length}</div>
                </div>
                <div style={{ padding: "15px", background: "#fff", borderRadius: "10px", border: "1px solid #e0e0e0", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px" }}>Overall Pass Rate</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#28a745" }}>
                    {gradeSummary.length > 0 
                      ? (gradeSummary.reduce((acc, s) => acc + (s.passCount / (s.totalStudents || 1)), 0) / gradeSummary.length * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
                <div style={{ padding: "15px", background: "#fff", borderRadius: "10px", border: "1px solid #e0e0e0", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px" }}>Highest Subject Avg</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#007bff" }}>
                    {Math.max(...gradeSummary.map(s => s.average), 0).toFixed(1)}
                  </div>
                </div>
                <div style={{ padding: "15px", background: "#fff", borderRadius: "10px", border: "1px solid #e0e0e0", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px" }}>Lowest Subject Avg</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc3545" }}>
                    {gradeSummary.length > 0 ? Math.min(...gradeSummary.map(s => s.average)).toFixed(1) : "0.0"}
                  </div>
                </div>
              </div>

              {gradeSummary.length === 0 && (
                <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#fff", borderRadius: "8px", border: "1px dashed #ccc" }}>
                  No grade records match your current filters.
                </div>
              )}

              {gradeSummary.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {gradeSummary.map((s) => (
                    <div 
                      key={s.subject} 
                      style={{ 
                        backgroundColor: "#fff", 
                        borderRadius: "10px", 
                        border: "1px solid #e0e0e0", 
                        overflow: "hidden",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
                      }}
                    >
                      {/* Subject Header Row */}
                      <div 
                        style={{ 
                          padding: "15px 20px", 
                          display: "grid", 
                          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                          alignItems: "center",
                          cursor: "pointer",
                          backgroundColor: expandedSubjectId === s.subject ? "#f8f9fa" : "#fff"
                        }}
                        onClick={() => setExpandedSubjectId(expandedSubjectId === s.subject ? null : s.subject)}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{s.subject}</span>
                            <span style={{ 
                              fontSize: "0.7rem", 
                              padding: "2px 8px", 
                              borderRadius: "10px", 
                              backgroundColor: s.isComplete ? "#d1e7dd" : "#fff3cd",
                              color: s.isComplete ? "#0f5132" : "#856404",
                              fontWeight: "bold",
                              textTransform: "uppercase"
                            }}>
                              {s.isComplete ? "Complete" : "In Progress"}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#666" }}>{s.gradeLevel} - {s.section}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.8rem", color: "#666" }}>Average</div>
                          <div style={{ fontWeight: "bold", color: s.average >= 75 ? "#28a745" : "#dc3545" }}>
                            {s.average.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.8rem", color: "#666" }}>Highest</div>
                          <div style={{ fontWeight: "bold" }}>{s.highestGrade.toFixed(2)}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.8rem", color: "#666" }}>Pass Rate</div>
                          <div style={{ fontWeight: "bold", color: "#198754" }}>
                            {((s.passCount / s.totalStudents) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.8rem", color: "#666" }}>Students</div>
                          <div style={{ fontWeight: "bold" }}>{s.totalStudents}</div>
                        </div>
                        <div style={{ fontSize: "1.2rem", color: "#666", padding: "0 10px" }}>
                          {expandedSubjectId === s.subject ? "▼" : "▶"}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ height: "4px", backgroundColor: "#eee", width: "100%" }}>
                        <div style={{ 
                          height: "100%", 
                          width: `${s.average}%`, 
                          backgroundColor: s.average >= 75 ? "#28a745" : "#dc3545",
                          transition: "width 0.5s ease-in-out"
                        }} />
                      </div>

                      {/* Expandable Content */}
                      {expandedSubjectId === s.subject && (
                        <div style={{ padding: "20px", borderTop: "1px solid #eee", backgroundColor: "#fafafa" }}>
                          
                          {/* Grade Distribution Visualization */}
                          <div style={{ marginBottom: "25px" }}>
                            <h4 style={{ margin: "0 0 15px 0" }}>Grade Distribution</h4>
                            <div style={{ 
                              display: "flex", 
                              alignItems: "flex-end", 
                              justifyContent: "space-between", 
                              height: "150px", 
                              padding: "0 10px",
                              borderBottom: "2px solid #ddd"
                            }}>
                              {Object.entries(s.distribution).map(([grade, count]) => {
                                const height = s.totalStudents > 0 ? (count / s.totalStudents) * 100 : 0;
                                return (
                                  <div key={grade} style={{ 
                                    display: "flex", 
                                    flexDirection: "column", 
                                    alignItems: "center", 
                                    width: "8%",
                                    gap: "5px"
                                  }}>
                                    <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#666" }}>{count}</div>
                                    <div style={{ 
                                      width: "100%", 
                                      height: `${height}%`, 
                                      backgroundColor: grade === "5.0" ? "#feb2b2" : "#9ae6b4",
                                      borderRadius: "4px 4px 0 0",
                                      minHeight: count > 0 ? "4px" : "0",
                                      transition: "height 0.3s ease"
                                    }} title={`${count} students got ${grade}`} />
                                    <div style={{ fontSize: "0.75rem", fontWeight: "bold" }}>{grade}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h4 style={{ margin: 0 }}>Student Breakdown</h4>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportCSV(s);
                              }}
                              style={{ 
                                padding: "6px 12px", 
                                background: "#0d6efd", 
                                color: "#fff", 
                                border: "none", 
                                borderRadius: "4px", 
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: "bold"
                              }}
                            >
                              📥 Export CSV
                            </button>
                          </div>
                          
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                            <thead>
                              <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                                <th style={{ padding: "10px" }}>Student Name</th>
                                <th style={{ padding: "10px", textAlign: "center" }}>Midterm</th>
                                <th style={{ padding: "10px", textAlign: "center" }}>Finals</th>
                                <th style={{ padding: "10px", textAlign: "center" }}>Total</th>
                                <th style={{ padding: "10px", textAlign: "center" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {s.studentDetails.map((stu, idx) => (
                                <tr key={stu.studentId} style={{ borderBottom: "1px solid #eee", backgroundColor: idx % 2 === 0 ? "#fff" : "transparent" }}>
                                  <td style={{ padding: "10px" }}>
                                    <div>{stu.studentName}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#888" }}>ID: {stu.studentId}</div>
                                  </td>
                                  <td style={{ padding: "10px", textAlign: "center" }}>{stu.midterm || "-"}</td>
                                  <td style={{ padding: "10px", textAlign: "center" }}>{stu.finals || "-"}</td>
                                  <td style={{ padding: "10px", textAlign: "center", fontWeight: "bold" }}>{stu.total.toFixed(2)}</td>
                                  <td style={{ padding: "10px", textAlign: "center" }}>
                                    <span style={{ 
                                      padding: "3px 8px", 
                                      borderRadius: "12px", 
                                      fontSize: "0.75rem", 
                                      fontWeight: "bold",
                                      backgroundColor: stu.status === "Pass" ? "#d1e7dd" : "#f8d7da",
                                      color: stu.status === "Pass" ? "#0f5132" : "#842029"
                                    }}>
                                      {stu.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* VIEW STUDENT MODAL */}
      {showViewModal && selectedStudent && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{ 
            background: "white", padding: "0", borderRadius: "16px", 
            width: "700px", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            display: "flex", flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '24px 30px', 
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Student Profile</h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>Detailed information and academic records</p>
              </div>
              <button 
                onClick={() => setShowViewModal(false)} 
                style={{ 
                  background: '#fff', 
                  border: '1px solid #e2e8f0', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '20px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >&times;</button>
            </div>
            
            <div style={{ padding: '30px' }}>
              {/* Profile Overview */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '24px', 
                  background: '#eff6ff', 
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  border: '4px solid #fff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {selectedStudent.name.charAt(0)}
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <h2 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>{selectedStudent.name}</h2>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Student ID: <strong>{selectedStudent.id}</strong></span>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>•</span>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Email: <strong>{selectedStudent.email}</strong></span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ 
                      padding: "4px 12px", 
                      borderRadius: "9999px", 
                      fontSize: "0.75rem", 
                      fontWeight: "700",
                      textTransform: "uppercase",
                      backgroundColor: selectedStudent.accountStatus === "Active" ? "#dcfce7" : "#fee2e2",
                      color: selectedStudent.accountStatus === "Active" ? "#15803d" : "#b91c1c"
                    }}>
                      {selectedStudent.accountStatus || "Active"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academic Info</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Course:</span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{selectedStudent.course}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Year Level:</span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{selectedStudent.year}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Section:</span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{selectedStudent.section}</span>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Gender:</span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{selectedStudent.gender || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Age:</span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{selectedStudent.age || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Contact:</span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{selectedStudent.contactNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grades Section */}
              <div style={{ marginTop: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Subject Records</h4>
                {enrollments[selectedStudent.id] && enrollments[selectedStudent.id].filter(e => teacherSubjectIdsSet.has(String(e.id))).length > 0 ? (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Subject</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Midterm</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Finals</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Average</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments[selectedStudent.id]
                          .filter(e => teacherSubjectIdsSet.has(String(e.id)))
                          .map((grade, idx) => {
                            const midterm = Number(grade.midtermScore || 0);
                            const finals = Number(grade.finalScore || 0);
                            const avg = (midterm + finals) / 2;
                            return (
                              <tr key={idx} style={{ borderBottom: idx === enrollments[selectedStudent.id].length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px', color: '#1e293b', fontWeight: '500' }}>{grade.name}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                  <div style={{ fontWeight: '600' }}>{grade.midtermScore || '-'}</div>
                                  {grade.midtermEq && <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{grade.midtermEq}</div>}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                  <div style={{ fontWeight: '600' }}>{grade.finalScore || '-'}</div>
                                  {grade.finalEq && <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{grade.finalEq}</div>}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                  <div style={{ 
                                    fontWeight: '700', 
                                    color: avg >= 75 ? '#16a34a' : '#dc2626',
                                    backgroundColor: avg >= 75 ? '#f0fdf4' : '#fef2f2',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                  }}>
                                    {avg > 0 ? avg.toFixed(2) : '-'}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '30px', 
                    textAlign: 'center', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px', 
                    border: '1px dashed #e2e8f0',
                    color: '#64748b'
                  }}>
                    No records found for your subjects.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ 
              padding: '20px 30px', 
              borderTop: '1px solid #f1f5f9', 
              display: 'flex', 
              justifyContent: 'flex-end',
              background: '#f8fafc',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px'
            }}>
              <button 
                onClick={() => setShowViewModal(false)}
                style={{ 
                  padding: '10px 24px', 
                  backgroundColor: '#fff', 
                  color: '#1e293b', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
