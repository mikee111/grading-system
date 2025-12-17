import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const DataContext = createContext(null);
const STORAGE_KEY = "gradingSystemData";

export function DataProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      setStudents(Array.isArray(data.students) ? data.students : []);
      setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
      setEnrollments(data.enrollments && typeof data.enrollments === "object" ? data.enrollments : {});

      const loadedUsers = Array.isArray(data.users) ? data.users : [];
      const defaultAdmin = { id: "admin1", firstName: "Default", lastName: "Admin", email: "admin@example.com", username: "admin", password: "123", role: "admin" };
      if (!loadedUsers.some(user => user.email === defaultAdmin.email)) {
        setUsers([...loadedUsers, defaultAdmin]);
      } else {
        setUsers(loadedUsers);
      }
      setCurrentUser(data.currentUser || null);
    } else {
      // If no data in localStorage, initialize with default admin
      setUsers([{ id: "admin1", firstName: "Default", lastName: "Admin", email: "admin@example.com", username: "admin", password: "123", role: "admin" }]);
      setCurrentUser(null);
    }
  }, []);

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
    const user = { firstName, lastName, email, password, role, username: email };
    setUsers((prev) => [...prev, user]);
    return true;
  }, [users]);

  const login = useCallback((identifier, password) => {
    const user = users.find((u) => (u.username === identifier || u.email === identifier) && u.password === password);
    if (!user) return false;
    setCurrentUser(user);
    return user;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
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
    }),
    [students, subjects, enrollments, users, currentUser, addStudent, updateStudent, deleteStudent, addSubject, updateSubject, deleteSubject, enrollSubject, removeEnrollment, setGrade, saveGradeRecord, availableSubjectsFor, signUp, login, logout]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  return ctx;
}

