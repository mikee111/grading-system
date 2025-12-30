import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const DataContext = createContext(null);
const STORAGE_KEY = "gradingSystemData";

export function DataProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const data = JSON.parse(raw);

      setStudents(Array.isArray(data.students) ? data.students : []);
      setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
      setEnrollments(data.enrollments && typeof data.enrollments === "object" ? data.enrollments : {});

      const loadedUsers = Array.isArray(data.users) ? data.users : [];
      const defaultAdmin = {
        id: "admin1",
        firstName: "Default",
        lastName: "Admin",
        email: "admin@example.com",
        username: "admin",
        password: "123",
        role: "admin",
        lastLogin: null,
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
      };

      const withDefaults = [...loadedUsers];
      if (!withDefaults.some((user) => user.email === defaultAdmin.email)) {
        withDefaults.push(defaultAdmin);
      }
      if (!withDefaults.some((user) => user.email === defaultTeacher.email)) {
        withDefaults.push(defaultTeacher);
      }

      setUsers(withDefaults);

      setCurrentUser(data.currentUser || null);

    } else {
      // If no data in localStorage, initialize with default admin

      const initialUsers = [
        {
          id: "admin1",
          firstName: "Default",
          lastName: "Admin",
          email: "admin@example.com",
          username: "admin",
          password: "123",
          role: "admin",
          lastLogin: null,
        },
        {
          id: "teacher1",
          firstName: "Default",
          lastName: "Teacher",
          email: "teacher@example.com",
          username: "teacher",
          password: "123",
          role: "teacher",
          lastLogin: null,
        },
      ];
      setUsers(initialUsers);
      setCurrentUser(null);

    }

    setIsLoading(false);

    if (students.length === 0) {
      const initialStudents = [
        { id: "s1", firstName: "John", lastName: "Doe", course: "Computer Science", year: "3" },
        { id: "s2", firstName: "Jane", lastName: "Smith", course: "Biology", year: "2" }
      ];
      setStudents(initialStudents);
    }

    if (subjects.length === 0) {
      const initialSubjects = [
        { id: "sub1", name: "Mathematics", gradeLevel: "Advanced" },
        { id: "sub2", name: "Science", gradeLevel: "Intermediate" }
      ];
      setSubjects(initialSubjects);
    }

    if (Object.keys(enrollments).length === 0) {
      const initialEnrollments = {
        "s1": [{ id: "sub1", name: "Mathematics", gradeLevel: "Advanced", grade: 85 }],
        "s2": [{ id: "sub2", name: "Science", gradeLevel: "Intermediate", grade: 90 }]
      };
      setEnrollments(initialEnrollments);
    }
  }, []); // Empty dependency array to prevent infinite re-render

  useEffect(() => {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ students, subjects, enrollments, users, currentUser })
    );

  }, [students, subjects, enrollments, users, currentUser]);

  const addStudent = useCallback((student) => {
    setStudents((prev) => [...prev, student]);
  }, []);

  const updateStudent = useCallback((index, student) => {
    setStudents((prev) => prev.map((s, i) => (i === index ? student : s)));
  }, []);

  const deleteStudent = useCallback((index) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addSubject = useCallback((subject) => {
    setSubjects((prev) => [...prev, subject]);
  }, []);

  const updateSubject = useCallback((index, subject) => {
    setSubjects((prev) => prev.map((s, i) => (i === index ? subject : s)));
  }, []);

  const deleteSubject = useCallback((index) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const enrollSubject = useCallback((studentId, subject) => {
    setEnrollments((prev) => {
      const list = prev[studentId] ? [...prev[studentId]] : [];
      if (!list.some((s) => s.id === subject.id)) {
        list.push({ id: subject.id, name: subject.name, gradeLevel: subject.gradeLevel || "", grade: "" });
      }
      return { ...prev, [studentId]: list };
    });
  }, []);

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
    const n = Number(score);
    if (Number.isNaN(n)) return "";
    const eq = n / 10 - 0.4;
    return Math.round(eq * 10) / 10;
  }, []);

  const saveGradeRecord = useCallback((studentId, subject, midtermScore, finalScore) => {
    setEnrollments((prev) => {
      const list = prev[studentId] ? [...prev[studentId]] : [];
      const idx = list.findIndex((s) => s.id === subject.id);
      const record = {
        id: subject.id,
        name: subject.name,
        gradeLevel: subject.gradeLevel || "",
        midtermScore: midtermScore,
        midtermEq: toEquivalent(midtermScore),
        finalScore: finalScore,
        finalEq: toEquivalent(finalScore),
      };
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...record };
      } else {
        list.push(record);
      }
      return { ...prev, [studentId]: list };
    });
  }, [toEquivalent]);

  const signUp = useCallback((firstName, lastName, email, password, role = "admin") => {
    const exists = users.some((u) => u.email === email);
    if (exists) return false;
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = { id, firstName, lastName, email, password, role, username: email, lastLogin: null };
    setUsers((prev) => [...prev, user]);
    return true;
  }, [users]);

  const login = useCallback((identifier, password) => {

    const idx = users.findIndex((u) => (u.username === identifier || u.email === identifier) && u.password === password);
    if (idx === -1) {

      return false;
    }
    const now = new Date().toISOString();
    const baseUser = users[idx];
    const updatedUser = { ...baseUser, lastLogin: now };
    setUsers((prev) => {
      const copy = [...prev];
      copy[idx] = updatedUser;
      return copy;
    });

    setCurrentUser(updatedUser);
    return updatedUser;
  }, [users]);

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
              username: profileData.email,
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
        username: profileData.email,
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

  const value = useMemo(
    () => ({
      students,
      subjects,
      enrollments,
      users,
      currentUser,
      addStudent,
      updateStudent,
      deleteStudent,
      addSubject,
      updateSubject,
      deleteSubject,
      enrollSubject,
      removeEnrollment,
      setGrade,
      saveGradeRecord,
      availableSubjectsFor,
      signUp,
      login,
      logout,
      updateUserProfile,
      changePassword,
      updateUserRole,
      isLoading,
    }),
    [
      students,
      subjects,
      enrollments,
      users,
      currentUser,
      addStudent,
      updateStudent,
      deleteStudent,
      addSubject,
      updateSubject,
      deleteSubject,
      enrollSubject,
      removeEnrollment,
      setGrade,
      saveGradeRecord,
      availableSubjectsFor,
      signUp,
      login,
      logout,
      updateUserProfile,
      changePassword,
      updateUserRole,
      isLoading,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  return ctx;
}
