import { RequestHandler } from "express";
import { readJSON, writeJSON } from "../utils/db";

function genId(prefix = "course") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

type Course = {
  id: string;
  title: string;
  students: number;
  assignments: number;
};

export const listCourses: RequestHandler = async (_req, res) => {
  const courses = await readJSON<Course[]>("courses.json", [
    { id: "c1", title: "Algebra I", students: 28, assignments: 12 },
    { id: "c2", title: "Chemistry Basics", students: 24, assignments: 10 },
  ]);
  res.json({ courses });
};

export const createCourse: RequestHandler = async (req, res) => {
  const { title, students, assignments } = (req.body || {}) as Partial<Course>;
  if (!title || typeof title !== "string")
    return res.status(400).json({ error: "title is required" });
  const s = Number.isFinite(Number(students)) ? Number(students) : 0;
  const a = Number.isFinite(Number(assignments)) ? Number(assignments) : 0;
  const courses = await readJSON<Course[]>("courses.json", []);
  const course: Course = { id: genId(), title: title.trim(), students: s, assignments: a };
  courses.push(course);
  await writeJSON("courses.json", courses);
  res.status(201).json({ course });
};
