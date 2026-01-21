import useSWR from "swr";
import type {ApiResponse, PaymentMethod} from "@/types/api";

export function usePaymentMethods() {
    return useSWR<ApiResponse<PaymentMethod[]>>("/api/payment-methods");
}
