const payments = [
  { id: "ORD-1001", student: "Vanna Student", amount: "$49", status: "paid" },
  { id: "ORD-1002", student: "Sokha Learner", amount: "$79", status: "pending" },
  { id: "ORD-1003", student: "Rithy Trainee", amount: "$49", status: "failed" },
];

function statusClass(status: string) {
  if (status === "paid") return "bg-emerald-50 text-emerald-800";
  if (status === "pending") return "bg-amber-50 text-amber-800";
  return "bg-red-50 text-red-800";
}

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">Payments</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{payments.length} recent orders</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--background)] text-[var(--muted)]">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-[var(--line)]">
                <td className="px-5 py-4 font-medium text-[var(--ink)]">{payment.id}</td>
                <td className="px-5 py-4">{payment.student}</td>
                <td className="px-5 py-4">{payment.amount}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
