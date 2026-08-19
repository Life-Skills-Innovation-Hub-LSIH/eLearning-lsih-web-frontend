const payments = [
  { id: "ORD-1001", student: "Vanna Student", amount: "$49", status: "paid" },
  { id: "ORD-1002", student: "Sokha Learner", amount: "$79", status: "pending" },
  { id: "ORD-1003", student: "Rithy Trainee", amount: "$49", status: "failed" },
];

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">Static payment list for UI only.</p>
      <div className="surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--background)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3 font-medium">{payment.id}</td>
                <td className="px-4 py-3">{payment.student}</td>
                <td className="px-4 py-3">{payment.amount}</td>
                <td className="px-4 py-3 capitalize">{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
