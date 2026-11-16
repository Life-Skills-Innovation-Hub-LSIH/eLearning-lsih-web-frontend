"use client";

import { FormEvent, useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/shared/api/client";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/features/admin/shadcn";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import {
  createCouponApi,
  deleteCouponApi,
  fetchCoupons,
  updateCouponApi,
  type Coupon,
} from "../api/coupons-api";
import { AdminFormField, AdminFormInput } from "./AdminFormFields";
import { AdminPageLayout } from "./AdminPageLayout";

export function CouponsManagement() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("50");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCoupons(token)
      .then(setCoupons)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load coupons."))
      .finally(() => setLoading(false));
  }, [token]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    const discount = Number(percent);
    if (!code.trim() || !Number.isInteger(discount) || discount < 1 || discount > 100) {
      setError("Enter a code and a percent from 1 to 100. 100% makes the course free.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await createCouponApi(token, {
        code: code.trim().toUpperCase(),
        discount_percent: discount,
      });
      setCoupons((current) => [created, ...current]);
      setCode("");
      setPercent("50");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save that coupon.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(coupon: Coupon) {
    if (!token) return;
    const updated = await updateCouponApi(token, coupon.id, { active: !coupon.active });
    setCoupons((current) => current.map((item) => (item.id === coupon.id ? updated : item)));
  }

  async function remove(coupon: Coupon) {
    if (!token) return;
    await deleteCouponApi(token, coupon.id);
    setCoupons((current) => current.filter((item) => item.id !== coupon.id));
  }

  if (loading) return <PageLoader />;

  return (
    <AdminPageLayout
      title="Coupons"
      description="A code can make a course free (100%) or take a percent off the course price."
    >
      <form onSubmit={(event) => void onCreate(event)} className="mb-8 grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
        <AdminFormField id="coupon-code" label="Code" required>
          <AdminFormInput
            id="coupon-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="SAVE50"
            required
          />
        </AdminFormField>
        <AdminFormField id="coupon-percent" label="Discount %" required>
          <AdminFormInput
            id="coupon-percent"
            type="number"
            min="1"
            max="100"
            step="1"
            value={percent}
            onChange={(event) => setPercent(event.target.value)}
            required
          />
        </AdminFormField>
        <Button type="submit" disabled={saving}>
          <Ticket className="h-4 w-4" />
          {saving ? "Saving…" : "Add coupon"}
        </Button>
      </form>
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">Code</TableHead>
            <TableHead className="px-4">Discount</TableHead>
            <TableHead className="px-4">Status</TableHead>
            <TableHead className="px-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="px-4 py-8 text-sm text-muted-foreground">
                No coupons yet.
              </TableCell>
            </TableRow>
          ) : (
            coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="px-4 py-3 font-medium">{coupon.code}</TableCell>
                <TableCell className="px-4 py-3">
                  {coupon.discount_percent === 100 ? "Free" : `${coupon.discount_percent}% off`}
                </TableCell>
                <TableCell className="px-4 py-3">{coupon.active ? "Active" : "Off"}</TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <button type="button" className="mr-3 text-sm text-[var(--brand)]" onClick={() => void toggle(coupon)}>
                    {coupon.active ? "Turn off" : "Turn on"}
                  </button>
                  <button type="button" className="text-sm text-red-600" onClick={() => void remove(coupon)}>
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </AdminPageLayout>
  );
}
