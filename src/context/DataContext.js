import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const DataContext = createContext(null);
const STORAGE_KEY = "gradingSystemData";

export function DataProvider({ children }) {
  // Helper to load data from localStorage immediately
  const loadInitialData = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse stored data", e);
        return {};
      }
    }
    return {};
  };

  const initialData = loadInitialData();

  const [students, setStudents] = useState(() => {
    let list = Array.isArray(initialData.students) ? [...initialData.students] : [
      { id: "s1", firstName: "John", lastName: "Doe", course: "BSIT", year: "BSIT 4", section: "Section 3" },
      { id: "s2", firstName: "Jane", lastName: "Smith", course: "Biology", year: "2nd Year", section: "A" },
      { id: "s3", firstName: "Alice", lastName: "Brown", course: "Engineering", year: "1st Year", section: "B" },
      { id: "s-john-cruzin", firstName: "John Viray", lastName: "Cruzin", course: "BSIT", year: "BSIT 4", section: "Section 3" },
      { id: "s-mikee", firstName: "Mikee", lastName: "User", course: "BSIT", year: "1st Year", section: "A" },
      { id: "s-clarenz", firstName: "Clarenz", lastName: "User", course: "BSIT", year: "1st Year", section: "A" },
    ];
    
    // Ensure John Cruzin is ALWAYS present
    if (!list.some(s => s.id === "s-john-cruzin")) {
      list.push({ id: "s-john-cruzin", firstName: "John Viray", lastName: "Cruzin", course: "BSIT", year: "BSIT 4", section: "Section 3", accountStatus: "Active" });
    }
    // Ensure Mikee and Clarenz exist
    if (!list.some(s => s.id === "s-mikee")) {
      list.push({ id: "s-mikee", firstName: "Mikee", lastName: "User", course: "BSIT", year: "1st Year", section: "A", accountStatus: "Active" });
    }
    if (!list.some(s => s.id === "s-clarenz")) {
      list.push({ id: "s-clarenz", firstName: "Clarenz", lastName: "User", course: "BSIT", year: "1st Year", section: "A", accountStatus: "Active" });
    }
    return list;
  });

  const [subjects, setSubjects] = useState(() => {
    if (Array.isArray(initialData.subjects)) return initialData.subjects;
    return [
      { id: "sub-it107", code: "IT 107", name: "Information Tech 1", schedule: "MWF 8:00AM - 9:30AM", gradeLevel: "BSIT 4", course: "BSIT", section: "Section 3", teacherName: "teacher" },
      { id: "sub1", code: "MATH 101", name: "Advanced Mathematics", schedule: "TTh 10:00AM - 11:30AM", gradeLevel: "3rd Year", course: "Computer Science", yearLevel: "3rd Year", teacherName: "polcruz" },
      { id: "sub2", code: "SCI 102", name: "General Science", schedule: "Fri 1:00PM - 4:00PM", gradeLevel: "2nd Year", course: "Biology", yearLevel: "2nd Year", teacherName: "mariaclara" },
      // Enlistment examples
      { id: "sub-it301", code: "IT301", name: "Web Systems", units: 3, schedule: "MWF 9:00AM - 10:00AM", gradeLevel: "3rd Year", course: "BSIT", yearLevel: "3rd Year", capacity: 30, teacherName: "teacher" },
      { id: "sub-it302", code: "IT302", name: "Data Analytics", units: 3, schedule: "TTH 1:00PM - 3:00PM", gradeLevel: "3rd Year", course: "BSIT", yearLevel: "3rd Year", capacity: 30, teacherName: "teacher" }
    ];
  });

  const [courses, setCourses] = useState(() => {
    if (Array.isArray(initialData.courses)) return initialData.courses;
    return [
      { id: "c1", name: "Computer Science", code: "CS" },
      { id: "c2", name: "Biology", code: "BIO" },
      { id: "c3", name: "Engineering", code: "ENG" },
      { id: "c4", name: "Arts", code: "ARTS" }
    ];
  });

  const [yearLevels, setYearLevels] = useState(() => {
    if (Array.isArray(initialData.yearLevels)) return initialData.yearLevels;
    return [
      { id: "y1", name: "1st Year" },
      { id: "y2", name: "2nd Year" },
      { id: "y3", name: "3rd Year" },
      { id: "y4", name: "4th Year" }
    ];
  });

  const [sections, setSections] = useState(() => {
    if (Array.isArray(initialData.sections)) return initialData.sections;
    return [
      { id: "sec1", name: "A", courseId: "c1", yearLevelId: "y1" },
      { id: "sec2", name: "B", courseId: "c1", yearLevelId: "y1" },
      { id: "sec3", name: "A", courseId: "c2", yearLevelId: "y2" }
    ];
  });

  const [schoolYears, setSchoolYears] = useState(() => {
    if (Array.isArray(initialData.schoolYears)) return initialData.schoolYears;
    return [
      { id: "sy1", name: "2023-2024", isActive: false },
      { id: "sy2", name: "2024-2025", isActive: true }
    ];
  });

  const [semesters, setSemesters] = useState(() => {
    if (Array.isArray(initialData.semesters)) return initialData.semesters;
    return [
      { id: "sem1", name: "1st Semester", isActive: true },
      { id: "sem2", name: "2nd Semester", isActive: false }
    ];
  });

  const [enrollments, setEnrollments] = useState(() => {
    let data = (initialData.enrollments && typeof initialData.enrollments === "object") ? { ...initialData.enrollments } : {
      "s1": [
        { id: "sub1", name: "Mathematics", gradeLevel: "Advanced", grade: 85, schoolYear: "2024-2025", semester: "1st" },
        { id: "sub2", name: "Science", gradeLevel: "Intermediate", grade: 88, schoolYear: "2023-2024", semester: "2nd" }
      ],
      "s2": [
        { id: "sub2", name: "Science", gradeLevel: "Intermediate", grade: 90, schoolYear: "2024-2025", semester: "1st" }
      ],
      "s3": [ // Historical data for charts
        { id: "sub1", name: "Mathematics", gradeLevel: "Advanced", grade: 80, schoolYear: "2022-2023", semester: "1st" }
      ],
      "s4": [
        { id: "sub1", name: "Mathematics", gradeLevel: "Advanced", grade: 82, schoolYear: "2022-2023", semester: "2nd" }
      ],
      "s5": [
        { id: "sub2", name: "Science", gradeLevel: "Intermediate", grade: 75, schoolYear: "2023-2024", semester: "1st" }
      ],
      "s-john-cruzin": [
        { id: "sub1", name: "Mathematics", gradeLevel: "BSIT 4", grade: "", schoolYear: "2024-2025", semester: "1st Semester" }
      ]
    };

    // Ensure John Cruzin is enrolled in sub1
    if (!data["s-john-cruzin"] || !data["s-john-cruzin"].some(e => e.id === "sub1")) {
      const johnEnrollments = data["s-john-cruzin"] ? [...data["s-john-cruzin"]] : [];
      if (!johnEnrollments.some(e => e.id === "sub1")) {
        johnEnrollments.push({ 
          id: "sub1", 
          name: "Mathematics", 
          gradeLevel: "BSIT 4", 
          grade: "", 
          schoolYear: "2024-2025", 
          semester: "1st Semester" 
        });
      }
      data["s-john-cruzin"] = johnEnrollments;
    }
    return data;
  });

  const [users, setUsers] = useState(() => {
    const loadedUsers = Array.isArray(initialData.users) ? initialData.users : [];
    
    const defaultAdmin = {
      id: "admin1",
      firstName: "Default",
      lastName: "Admin",
      email: "admin@example.com",
      username: "admin",
      password: "123",
      role: "admin",
      lastLogin: null,
      accountStatus: "Active"
    };
    const defaultTeacher = {
      id: "teacher1",
      firstName: "Default",
      lastName: "Teacher",
      email: "teacher@example.com",
      username: "teacher",
      password: "123",
      role: "teacher",
      lastLogin: null,
      accountStatus: "Active"
    };
    const polCruz = {
      id: "teacher-pol",
      firstName: "Pol",
      lastName: "Cruz",
      email: "pol@example.com",
      username: "polcruz",
      password: "123",
      role: "teacher",
      lastLogin: null,
      accountStatus: "Active"
    };
    const mariaClara = {
      id: "teacher-maria",
      firstName: "Maria",
      lastName: "Clara",
      email: "maria@example.com",
      username: "mariaclara",
      password: "123",
      role: "teacher",
      lastLogin: null,
      accountStatus: "Active"
    };
    const defaultStudent = {
      id: "s1",
      firstName: "John",
      lastName: "Doe",
      email: "student@example.com",
      username: "student",
      password: "123",
      role: "student",
      lastLogin: null,
      accountStatus: "Active"
    };
    const johnCruzin = {
      id: "s-john-cruzin",
      firstName: "John Viray",
      lastName: "Cruzin",
      email: "john.cruzin@example.com",
      username: "johncruzin",
      password: "123",
      role: "student",
      lastLogin: null,
      accountStatus: "Active"
    };
    const mikeeStudent = {
      id: "s-mikee",
      firstName: "Mikee",
      lastName: "User",
      email: "mikee@example.com",
      username: "mikee",
      password: "123",
      role: "student",
      lastLogin: null,
      accountStatus: "Active"
    };
    const clarenzStudent = {
      id: "s-clarenz",
      firstName: "Clarenz",
      lastName: "User",
      email: "clarenz@gmail.com",
      username: "clarenz",
      password: "123",
      role: "student",
      lastLogin: null,
      accountStatus: "Active"
    };

    const withDefaults = [...loadedUsers];
    if (!withDefaults.some((user) => user.id === "admin1")) {
      withDefaults.push(defaultAdmin);
    }
    if (!withDefaults.some((user) => user.id === "teacher1")) {
      withDefaults.push(defaultTeacher);
    }
    if (!withDefaults.some((user) => user.id === "teacher-pol")) {
      withDefaults.push(polCruz);
    }
    if (!withDefaults.some((user) => user.id === "teacher-maria")) {
      withDefaults.push(mariaClara);
    }
    if (!withDefaults.some((user) => user.id === "s1")) {
      withDefaults.push(defaultStudent);
    }
    if (!withDefaults.some((user) => user.id === "s-john-cruzin")) {
      withDefaults.push(johnCruzin);
    }
    if (!withDefaults.some((user) => user.id === "s-mikee")) {
      withDefaults.push(mikeeStudent);
    }
    if (!withDefaults.some((user) => user.id === "s-clarenz")) {
      withDefaults.push(clarenzStudent);
    }
    return withDefaults;
  });

  const [roles, setRoles] = useState(() => {
    if (Array.isArray(initialData.roles)) return initialData.roles;
    return [
      { 
        id: "role-admin", 
        name: "Admin", 
        permissions: ["view_students", "encode_grades", "edit_submitted_grades", "manage_teachers", "academic_setup", "view_dashboard", "manage_roles"],
        isFullAccess: true,
        status: "Active"
      },
      { 
        id: "role-teacher", 
        name: "Teacher", 
        permissions: ["view_students", "encode_grades"],
        isFullAccess: false,
        status: "Active"
      },
      { 
        id: "role-student", 
        name: "Student", 
        permissions: ["view_profile"],
        isFullAccess: false,
        status: "Active"
      }
    ];
  });

  const [activities, setActivities] = useState(() => {
    if (Array.isArray(initialData.activities)) return initialData.activities;
    return [
      { id: "act1", type: "grade_encoded", message: "Teacher Juan encoded grades for Mathematics - Grade 9", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: "act2", type: "subject_added", message: "Admin added new subject: Science 10", timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: "act3", type: "student_enrolled", message: "Student Maria Cruz enrolled", timestamp: new Date(Date.now() - 10800000).toISOString() }
    ];
  });

  const addActivity = useCallback((message, type = "info") => {
    setActivities((prev) => [
      {
        id: "act-" + Date.now(),
        type,
        message,
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, 49), // Keep only last 50 activities
    ]);
  }, []);

  const [teacherAssignments, setTeacherAssignments] = useState(() => {
    let assignments = (initialData.teacherAssignments && typeof initialData.teacherAssignments === "object") ? { ...initialData.teacherAssignments } : {
      "teacher1": ["sub-it107"],
      "teacher-pol": ["sub1"],
      "teacher-maria": ["sub2"]
    };
    
    // Force sub1 for Pol Cruz
    if (!assignments["teacher-pol"]) assignments["teacher-pol"] = [];
    if (!assignments["teacher-pol"].includes("sub1")) {
      assignments["teacher-pol"].push("sub1");
    }
    return assignments;
  });

  // Enlistment status per studentId: "Pending" | "Approved" | "Rejected"
  const [enlistmentStatuses, setEnlistmentStatuses] = useState(() => {
    const fromStorage = initialData.enlistmentStatuses;
    return (fromStorage && typeof fromStorage === "object") ? fromStorage : {};
  });

  const [currentUser, setCurrentUser] = useState(() => initialData.currentUser || null);
  const [isLoading, setIsLoading] = useState(false); // No longer loading as we read directly in state init

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const data = JSON.parse(e.newValue);
        if (Array.isArray(data.students)) setStudents(data.students);
        if (Array.isArray(data.subjects)) setSubjects(data.subjects);
        if (Array.isArray(data.courses)) setCourses(data.courses);
        if (Array.isArray(data.yearLevels)) setYearLevels(data.yearLevels);
        if (Array.isArray(data.sections)) setSections(data.sections);
        if (Array.isArray(data.schoolYears)) setSchoolYears(data.schoolYears);
        if (Array.isArray(data.semesters)) setSemesters(data.semesters);
        if (data.enrollments) setEnrollments(data.enrollments);
        if (data.teacherAssignments) setTeacherAssignments(data.teacherAssignments);
        if (Array.isArray(data.users)) setUsers(data.users);
        if (Array.isArray(data.roles)) setRoles(data.roles);
        if (data.enlistmentStatuses) setEnlistmentStatuses(data.enlistmentStatuses);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // No longer need the initialization useEffect as it's done in useState initializers

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 
        students, subjects, enrollments, users, currentUser, 
        teacherAssignments, activities, courses, yearLevels, 
        sections, schoolYears, semesters, roles, enlistmentStatuses
      })
    );
  }, [students, subjects, enrollments, users, currentUser, teacherAssignments, activities, courses, yearLevels, sections, schoolYears, semesters, roles, enlistmentStatuses]);

  const setEnlistmentStatus = useCallback((studentId, status) => {
    const allowed = ["Pending", "Approved", "Rejected"];
    const normalized = allowed.includes(status) ? status : "Pending";
    setEnlistmentStatuses((prev) => ({ ...prev, [studentId]: normalized }));
  }, []);

  const assignTeacherToSubject = useCallback((teacherId, subjectId) => {
    setTeacherAssignments((prev) => {
      const current = prev[teacherId] ? [...prev[teacherId]] : [];
      if (!current.includes(subjectId)) {
        current.push(subjectId);
      }
      return { ...prev, [teacherId]: current };
    });
  }, []);

  const removeTeacherFromSubject = useCallback((teacherId, subjectId) => {
    setTeacherAssignments((prev) => {
      const current = prev[teacherId] ? prev[teacherId].filter(id => id !== subjectId) : [];
      return { ...prev, [teacherId]: current };
    });
  }, []);

  const addStudent = useCallback((student) => {
    const studentWithMeta = {
      ...student,
      id: student.id || `STU-${Date.now()}`,
      role: "student",
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      accountStatus: student.accountStatus || "Active",
      createdBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "System"
    };
    setStudents((prev) => [...prev, studentWithMeta]);
    addActivity(`Student ${student.firstName} ${student.lastName} enrolled`, "student_enrolled");
  }, [addActivity, currentUser]);

  const updateStudent = useCallback((student) => {
    const updatedStudent = {
      ...student,
      lastUpdated: new Date().toISOString()
    };
    setStudents((prev) => prev.map((s) => (s.id === student.id ? updatedStudent : s)));
  }, []);

  const deleteStudent = useCallback((id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addSubject = useCallback((subject) => {
    setSubjects((prev) => [...prev, subject]);
    addActivity(`Admin added new subject: ${subject.name}`, "subject_added");
  }, [addActivity]);

  const updateSubject = useCallback((index, subject) => {
    setSubjects((prev) => prev.map((s, i) => (i === index ? subject : s)));
  }, []);

  const deleteSubject = useCallback((index) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const claimSubject = useCallback((subjectId, teacherName) => {
    setSubjects((prev) => {
      return prev.map((s) => {
        if (s.id.toString() === subjectId.toString()) {
          return { ...s, teacherName: teacherName };
        }
        return s;
      });
    });
  }, []);

  // Academic Setup CRUD functions
  const addCourse = useCallback((course) => {
    setCourses((prev) => [...prev, { ...course, id: `c-${Date.now()}` }]);
    addActivity(`Admin added new course: ${course.name}`, "academic_setup");
  }, [addActivity]);

  const updateCourse = useCallback((id, updatedCourse) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? updatedCourse : c)));
  }, []);

  const deleteCourse = useCallback((id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addYearLevel = useCallback((year) => {
    setYearLevels((prev) => [...prev, { ...year, id: `y-${Date.now()}` }]);
  }, []);

  const updateYearLevel = useCallback((id, updatedYear) => {
    setYearLevels((prev) => prev.map((y) => (y.id === id ? updatedYear : y)));
  }, []);

  const deleteYearLevel = useCallback((id) => {
    setYearLevels((prev) => prev.filter((y) => y.id !== id));
  }, []);

  const addSection = useCallback((section) => {
    setSections((prev) => [...prev, { ...section, id: `sec-${Date.now()}` }]);
  }, []);

  const updateSection = useCallback((id, updatedSection) => {
    setSections((prev) => prev.map((s) => (s.id === id ? updatedSection : s)));
  }, []);

  const deleteSection = useCallback((id) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addSchoolYear = useCallback((sy) => {
    setSchoolYears((prev) => {
      const newList = [...prev, { ...sy, id: `sy-${Date.now()}` }];
      if (sy.isActive) {
        return newList.map(item => item.id === `sy-${Date.now()}` ? item : { ...item, isActive: false });
      }
      return newList;
    });
  }, []);

  const updateSchoolYear = useCallback((id, updatedSy) => {
    setSchoolYears((prev) => {
      const newList = prev.map((s) => (s.id === id ? updatedSy : s));
      if (updatedSy.isActive) {
        return newList.map(item => item.id === id ? item : { ...item, isActive: false });
      }
      return newList;
    });
  }, []);

  const deleteSchoolYear = useCallback((id) => {
    setSchoolYears((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addSemester = useCallback((sem) => {
    setSemesters((prev) => {
      const newList = [...prev, { ...sem, id: `sem-${Date.now()}` }];
      if (sem.isActive) {
        return newList.map(item => item.id === `sem-${Date.now()}` ? item : { ...item, isActive: false });
      }
      return newList;
    });
  }, []);

  const updateSemester = useCallback((id, updatedSem) => {
    setSemesters((prev) => {
      const newList = prev.map((s) => (s.id === id ? updatedSem : s));
      if (updatedSem.isActive) {
        return newList.map(item => item.id === id ? item : { ...item, isActive: false });
      }
      return newList;
    });
  }, []);

  const deleteSemester = useCallback((id) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const enrollSubject = useCallback((studentId, subject) => {
    setEnrollments((prev) => {
      const list = prev[studentId] ? [...prev[studentId]] : [];
      if (!list.some((s) => s.id === subject.id)) {
        list.push({ 
          id: subject.id, 
          name: subject.name, 
          gradeLevel: subject.gradeLevel || "", 
          grade: "",
          schoolYear: subject.schoolYear || "",
          semester: subject.semester || ""
        });
      }
      return { ...prev, [studentId]: list };
    });
  }, []);

  const enrollStudentsInSubject = useCallback((subjectId, studentIds) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    setEnrollments((prev) => {
      const newEnrollments = { ...prev };
      studentIds.forEach(studentId => {
        const list = newEnrollments[studentId] ? [...newEnrollments[studentId]] : [];
        if (!list.some(s => s.id === subjectId)) {
          list.push({
            id: subject.id,
            name: subject.name,
            gradeLevel: subject.gradeLevel || "",
            grade: "",
            schoolYear: subject.schoolYear || "",
            semester: subject.semester || ""
          });
        }
        newEnrollments[studentId] = list;
      });
      return newEnrollments;
    });

    const teacherId = Object.keys(teacherAssignments).find(tId => teacherAssignments[tId].includes(subjectId));
    const teacher = users.find(u => u.id === teacherId);
    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "a teacher";
    addActivity(`Admin enrolled ${studentIds.length} students to ${subject.name} (Assigned to ${teacherName})`, "student_enrolled");
  }, [subjects, teacherAssignments, users, addActivity]);

  const removeEnrollment = useCallback((studentId, subjectId) => {
    setEnrollments((prev) => {
      const list = prev[studentId] ? prev[studentId].filter((s) => s.id !== subjectId) : [];
      return { ...prev, [studentId]: list };
    });
  }, []);

  const setGrade = useCallback((studentId, subjectId, grade) => {
    setEnrollments((prev) => {
      const list = prev[studentId] ? [...prev[studentId]] : [];
      const idx = list.findIndex((s) => s.id === subjectId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], grade };
      }
      return { ...prev, [studentId]: list };
    });
  }, []);

  const availableSubjectsFor = useCallback((studentId) => {
    const enrolled = enrollments[studentId] ? enrollments[studentId].map((e) => e.id) : [];
    return subjects.filter((s) => !enrolled.includes(s.id));
  }, [enrollments, subjects]);

  const toEquivalent = useCallback((score) => {
    if (score === undefined || score === null || score === "") return "";
    const raw = Number(score);
    if (Number.isNaN(raw)) return "";
    if (raw >= 96) return 1.0;
    if (raw >= 94) return 1.25;
    if (raw >= 92) return 1.5;
    if (raw >= 89) return 1.75;
    if (raw >= 86) return 2.0;
    if (raw >= 83) return 2.25;
    if (raw >= 80) return 2.5;
    if (raw >= 77) return 2.75;
    if (raw >= 75) return 3.0;
    return 5.0;
  }, []);

  const saveGradeRecord = useCallback((studentId, subject, midtermScore, finalScore, extraFields = {}) => {
    setEnrollments((prev) => {
      const list = prev[studentId] ? [...prev[studentId]] : [];
      const idx = list.findIndex((s) => String(s.id) === String(subject.id));
      const record = {
        id: subject.id,
        name: subject.name,
        gradeLevel: subject.gradeLevel || "",
        midtermScore: midtermScore,
        midtermEq: toEquivalent(midtermScore),
        finalScore: finalScore,
        finalEq: toEquivalent(finalScore),
        ...extraFields
      };
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...record };
      } else {
        list.push(record);
      }
      return { ...prev, [studentId]: list };
    });

    // Log activity
    const teacherName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "A teacher";
    addActivity(`${teacherName} encoded grades for ${subject.name} - ${subject.gradeLevel || "N/A"}`, "grade_encoded");
  }, [toEquivalent, addActivity, currentUser]);

  const signUp = useCallback((firstName, lastName, email, password, role = "admin", username = null, extras = {}) => {
    const emailTrimmed = (email || "").toString().trim().toLowerCase();
    const usernameTrimmed = (username || "").toString().trim().toLowerCase();
    const passTrimmed = (password || "").toString().trim();
    const roleTrimmed = (role || "admin").toString().toLowerCase().trim();
    
    console.log("Signup attempt:", { firstName, lastName, email: emailTrimmed, role: roleTrimmed, username: usernameTrimmed });

    const exists = users.some((u) => {
      const storedEmail = (u.email || "").toString().toLowerCase().trim();
      const storedUsername = (u.username || "").toString().toLowerCase().trim();
      return storedEmail === emailTrimmed || (usernameTrimmed && storedUsername === usernameTrimmed);
    });

    if (exists) {
      console.log("Signup failed: User already exists.");
      return false;
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = { 
      id, 
      firstName: (firstName || "").toString().trim(), 
      lastName: (lastName || "").toString().trim(), 
      email: emailTrimmed, 
      password: passTrimmed, 
      role: roleTrimmed, 
      username: usernameTrimmed || emailTrimmed, 
      lastLogin: null,
      accountStatus: "Active",
      course: extras.course || "",
      year: extras.yearLevel || "",
      section: extras.section || ""
    };

    setUsers((prev) => [...prev, user]);

    // If the new account is a student, also ensure a corresponding student profile entry exists
    if (roleTrimmed === "student") {
      const studentProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        course: user.course || "",
        year: user.year || "",
        section: user.section || "",
        accountStatus: "Active"
      };
      setStudents((prev) => {
        if (prev.some(s => s.id === studentProfile.id)) return prev;
        return [...prev, studentProfile];
      });
    }

    // Explicitly sync to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      
      // Merge new user into existing users array without losing other data
      const existingUsers = Array.isArray(data.users) ? data.users : [];
      if (!existingUsers.some(u => u.id === user.id)) {
        existingUsers.push(user);
      }
      
      // Also persist student profile if applicable
      let existingStudents = Array.isArray(data.students) ? data.students : [];
      if (roleTrimmed === "student" && !existingStudents.some(s => s.id === user.id)) {
        existingStudents = [
          ...existingStudents,
          {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            course: user.course || "",
            year: user.year || "",
            section: user.section || "",
            accountStatus: "Active"
          }
        ];
      }

      const dataToSave = {
        ...data,
        users: existingUsers,
        students: existingStudents
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log("Signup success! User saved to state and localStorage:", user);
    } catch (e) {
      console.error("Manual sync during signup failed:", e);
    }

    return true;
  }, [users]);

  const deleteUser = useCallback((userId) => {
    if (userId === "admin1") {
      alert("Cannot delete the default admin user.");
      return;
    }

    setUsers((prev) => {
      const user = prev.find((u) => u.id === userId);
      if (!user) return prev;
      
      const adminsCount = prev.filter((u) => u.role === "admin").length;
      if (user.role === "admin" && adminsCount <= 1) {
        alert("Cannot delete the last admin user.");
        return prev;
      }
      return prev.filter((u) => u.id !== userId);
    });
  }, []);

  const updateUser = useCallback((userId, updates) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
  }, []);

  const resetPasswordByAdmin = useCallback((userId, newPassword) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)));
    
    setCurrentUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      return { ...prev, password: newPassword };
    });
  }, []);

  const login = useCallback((identifier, password) => {
    const iden = (identifier || "").toString().trim().toLowerCase();
    const pass = (password || "").toString().trim();
    
    console.log("Login attempt for:", iden);

    // 1. Force a fresh read from localStorage to ensure we have the absolute latest users
    const raw = localStorage.getItem(STORAGE_KEY);
    let latestUsers = users;
    let latestStudents = students;
    let latestSubjects = subjects;
    let latestEnrollments = enrollments;
    let latestAssignments = teacherAssignments;

    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (Array.isArray(data.users)) {
          latestUsers = data.users;
          // Sync state if different
          if (JSON.stringify(latestUsers) !== JSON.stringify(users)) {
            setUsers(latestUsers);
          }
        }
        if (Array.isArray(data.students)) latestStudents = data.students;
        if (Array.isArray(data.subjects)) latestSubjects = data.subjects;
        if (data.enrollments) latestEnrollments = data.enrollments;
        if (data.teacherAssignments) latestAssignments = data.teacherAssignments;
      } catch (e) {
        console.error("Error during login data sync:", e);
      }
    }

    // 2. Helper to find user
    const findUser = (list) => {
      return list.find((u) => {
        const storedEmail = (u.email || "").toString().toLowerCase().trim();
        const storedUsername = (u.username || "").toString().toLowerCase().trim();
        const storedPass = (u.password || "").toString().trim();
        return (storedUsername === iden || storedEmail === iden) && storedPass === pass;
      });
    };

    const foundUser = findUser(latestUsers) || findUser(latestStudents);

    if (!foundUser) {
      console.log("Login failed. Registered users found in storage:", latestUsers.length);
      console.log("Registered students found in storage:", latestStudents.length);
      return false;
    }

    if (foundUser.accountStatus === "Inactive") {
      console.log("Login failed: Account is inactive.");
      return { success: false, message: "Your account is deactivated. Please contact the administrator." };
    }

    console.log("Login successful for:", foundUser.username);
    const now = new Date().toISOString();
    const updatedUser = { ...foundUser, lastLogin: now };
    
    // Update state based on role
    if (foundUser.role === "student") {
      setStudents((prev) => {
        const existsIdx = prev.findIndex(s => s.id === foundUser.id);
        if (existsIdx !== -1) {
          const copy = [...prev];
          copy[existsIdx] = {
            ...prev[existsIdx],
            firstName: updatedUser.firstName || prev[existsIdx].firstName,
            lastName: updatedUser.lastName || prev[existsIdx].lastName,
            course: updatedUser.course || prev[existsIdx].course || "",
            year: updatedUser.year || prev[existsIdx].year || "",
            section: updatedUser.section || prev[existsIdx].section || "",
          };
          return copy;
        }
        return [
          ...prev,
          {
            id: updatedUser.id,
            firstName: updatedUser.firstName || "",
            lastName: updatedUser.lastName || "",
            course: updatedUser.course || "",
            year: updatedUser.year || "",
            section: updatedUser.section || "",
            accountStatus: "Active"
          }
        ];
      });
    } else {
      setUsers((prev) => {
        const idx = prev.findIndex(u => u.id === foundUser.id);
        if (idx === -1) return [...prev, updatedUser];
        const copy = [...prev];
        copy[idx] = updatedUser;
        return copy;
      });
    }

    setCurrentUser(updatedUser);
    
    // 3. Absolute sync back to localStorage
    try {
      const dataToSave = {
        students: latestStudents.map(s => s.id === updatedUser.id ? updatedUser : s),
        subjects: latestSubjects,
        enrollments: latestEnrollments,
        users: latestUsers.map(u => u.id === updatedUser.id ? updatedUser : u),
        currentUser: updatedUser,
        teacherAssignments: latestAssignments
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Final login sync failed:", e);
    }

    return updatedUser;
  }, [users, students, subjects, enrollments, teacherAssignments]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateUserProfile = useCallback((userId, profileData) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              email: profileData.email,
              username: u.username || profileData.email,
              phoneNumber: profileData.phoneNumber !== undefined ? profileData.phoneNumber : u.phoneNumber,
              address: profileData.address !== undefined ? profileData.address : u.address,
              profilePhoto: profileData.profilePhoto !== undefined ? profileData.profilePhoto : u.profilePhoto,
            }
          : u
      )
    );

    setCurrentUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      return {
        ...prev,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        username: prev.username || profileData.email,
        phoneNumber: profileData.phoneNumber !== undefined ? profileData.phoneNumber : prev.phoneNumber,
        address: profileData.address !== undefined ? profileData.address : prev.address,
        profilePhoto: profileData.profilePhoto !== undefined ? profileData.profilePhoto : prev.profilePhoto,
      };
    });
  }, []);

  const changePassword = useCallback((userId, currentPassword, newPassword) => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === userId);
      if (idx === -1) {
        throw new Error("User not found.");
      }
      const user = prev[idx];
      if (user.password !== currentPassword) {
        throw new Error("Current password is incorrect.");
      }
      const updated = [...prev];
      updated[idx] = { ...user, password: newPassword };
      return updated;
    });

    setCurrentUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      return { ...prev, password: newPassword };
    });
  }, []);

  const updateUserRole = useCallback((userId, newRole) => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === userId);
      if (idx === -1) {
        throw new Error("User not found.");
      }

      const adminsCount = prev.filter((u) => u.role === "admin").length;
      const user = prev[idx];
      if (user.id === "admin1" && newRole !== "admin") {
        throw new Error("Cannot change role of the default admin user.");
      }
      if (user.role === "admin" && newRole !== "admin" && adminsCount <= 1) {
        throw new Error("Cannot change role of the last admin user.");
      }

      const updated = [...prev];
      updated[idx] = { ...user, role: newRole };
      return updated;
    });

    setCurrentUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      return { ...prev, role: newRole };
    });
  }, []);

  const refreshData = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      
      // Force state updates by using functional updates and ensuring new references
      if (Array.isArray(data.students)) setStudents([...data.students]);
      if (Array.isArray(data.subjects)) setSubjects([...data.subjects]);
      if (data.enrollments) setEnrollments({...data.enrollments});
      if (data.teacherAssignments) setTeacherAssignments({...data.teacherAssignments});
      if (Array.isArray(data.users)) setUsers([...data.users]);
      if (Array.isArray(data.roles)) setRoles([...data.roles]);
      if (data.currentUser) setCurrentUser({...data.currentUser});
      
      console.log("Data successfully refreshed from localStorage");
      return true;
    } catch (e) {
      console.error("Refresh failed:", e);
      return false;
    }
  }, []);

  const addRole = useCallback((role) => {
    setRoles((prev) => [...prev, { ...role, id: `role-${Date.now()}` }]);
    addActivity(`Admin created new role: ${role.name}`, "role_management");
  }, [addActivity]);

  const updateRole = useCallback((id, updatedRole) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? updatedRole : r)));
    addActivity(`Admin updated role: ${updatedRole.name}`, "role_management");
  }, [addActivity]);

  const deleteRole = useCallback((id) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    addActivity(`Admin deleted role with ID: ${id}`, "role_management");
  }, [addActivity]);

  const toggleRoleStatus = useCallback((id) => {
    setRoles((prev) => prev.map((r) => {
      if (r.id === id) {
        return { ...r, status: r.status === "Active" ? "Inactive" : "Active" };
      }
      return r;
    }));
  }, []);

  const value = useMemo(
    () => ({
      students,
      subjects,
      courses,
      yearLevels,
      sections,
      schoolYears,
      semesters,
      enrollments,
      users,
      roles,
      teacherAssignments,
      currentUser,
      addStudent,
      updateStudent,
      deleteStudent,
      addSubject,
      updateSubject,
      deleteSubject,
      addCourse,
      updateCourse,
      deleteCourse,
      addYearLevel,
      updateYearLevel,
      deleteYearLevel,
      addSection,
      updateSection,
      deleteSection,
      addSchoolYear,
      updateSchoolYear,
      deleteSchoolYear,
      addSemester,
      updateSemester,
      deleteSemester,
      assignTeacherToSubject,
      removeTeacherFromSubject,
      enrollSubject,
      enrollStudentsInSubject,
      removeEnrollment,
      setGrade,
      saveGradeRecord,
      availableSubjectsFor,
      signUp,
      deleteUser,
      updateUser,
      updateUserRole,
      resetPasswordByAdmin,
      claimSubject,
      login,
      logout,
      updateUserProfile,
      changePassword,
      updateUserRole,
      isLoading,
      refreshData,
      activities,
      addActivity,
      addRole,
      updateRole,
      deleteRole,
      toggleRoleStatus,
      enlistmentStatuses,
      setEnlistmentStatus,
    }),
    [
      students, subjects, courses, yearLevels, sections, schoolYears, semesters,
      enrollments, users, roles, teacherAssignments, currentUser, addStudent, updateStudent, 
      deleteStudent, addSubject, updateSubject, deleteSubject, addCourse, updateCourse, 
      deleteCourse, addYearLevel, updateYearLevel, deleteYearLevel, addSection, 
      updateSection, deleteSection, addSchoolYear, updateSchoolYear, deleteSchoolYear, 
      addSemester, updateSemester, deleteSemester, assignTeacherToSubject, 
      removeTeacherFromSubject, enrollSubject, enrollStudentsInSubject, removeEnrollment, setGrade, 
      saveGradeRecord, availableSubjectsFor, signUp, deleteUser, updateUser, updateUserRole, resetPasswordByAdmin, claimSubject, 
      login, logout, updateUserProfile, changePassword, updateUserRole, 
      isLoading, refreshData, activities, addActivity, addRole, updateRole, deleteRole, toggleRoleStatus,
      enlistmentStatuses, setEnlistmentStatus
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  return ctx;
}
