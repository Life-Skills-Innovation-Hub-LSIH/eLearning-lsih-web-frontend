function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const students = [
  { name: "Vanna Student", email: "student@lsih.demo", courses: 1, progress: 35 },
  { name: "Sokha Learner", email: "sokha@example.com", courses: 2, progress: 70 },
  { name: "Rithy Trainee", email: "rithy@example.com", courses: 1, progress: 10 },
];

export default function AdminStudentsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Students</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{students.length} learners</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--background)] text-[var(--muted)]">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Courses</th>
              <th className="px-5 py-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.email} className="border-t border-[var(--line)]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]">
                      {initials(student.name)}
                    </span>
                    <span className="font-medium text-[var(--ink)]">{student.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-[var(--muted)]">{student.email}</td>
                <td className="px-5 py-4 text-[var(--ink)]">{student.courses}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--line)]">
                      <div
                        className="h-full rounded-full bg-[var(--brand)]"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-[var(--muted)]">{student.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
