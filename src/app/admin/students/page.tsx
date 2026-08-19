const students = [
  { name: "Vanna Student", email: "student@lsih.demo", courses: 1, progress: "35%" },
  { name: "Sokha Learner", email: "sokha@example.com", courses: 2, progress: "70%" },
  { name: "Rithy Trainee", email: "rithy@example.com", courses: 1, progress: "10%" },
];

export default function AdminStudentsPage() {
  return (
    <div className="surface overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--background)] text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Courses</th>
            <th className="px-4 py-3">Progress</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.email} className="border-t border-[var(--line)]">
              <td className="px-4 py-3 font-medium">{student.name}</td>
              <td className="px-4 py-3 text-[var(--muted)]">{student.email}</td>
              <td className="px-4 py-3">{student.courses}</td>
              <td className="px-4 py-3">{student.progress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
