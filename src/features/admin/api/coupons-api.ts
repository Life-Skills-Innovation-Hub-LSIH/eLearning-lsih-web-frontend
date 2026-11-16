import { apiRequest } from "@/shared/api/client";

export type Coupon = {
  id: number;
  code: string;
  discount_percent: number;
  active: boolean;
};

export async function fetchCoupons(token: string): Promise<Coupon[]> {
  const payload = await apiRequest<{ data: Coupon[] }>("/admin/coupons", { token });
  return payload.data ?? [];
}

export async function createCouponApi(
  token: string,
  input: { code: string; discount_percent: number },
): Promise<Coupon> {
  const payload = await apiRequest<{ data: Coupon }>("/admin/coupons", {
    method: "POST",
    token,
    body: input,
  });
  return payload.data;
}

export async function updateCouponApi(
  token: string,
  id: number,
  input: { active?: boolean; discount_percent?: number; code?: string },
): Promise<Coupon> {
  const payload = await apiRequest<{ data: Coupon }>(`/admin/coupons/${id}`, {
    method: "PUT",
    token,
    body: input,
  });
  return payload.data;
}

export async function deleteCouponApi(token: string, id: number): Promise<void> {
  await apiRequest(`/admin/coupons/${id}`, { method: "DELETE", token });
}
