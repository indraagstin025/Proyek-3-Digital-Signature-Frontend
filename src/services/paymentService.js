import apiClient from "./apiClient";

/**
 * Service untuk menangani transaksi pembayaran dan subscription.
 */
const createSubscription = async (planType) => {
  const response = await apiClient.post("/payments/subscribe", { planType });
  return response.data?.data;
};

const getTransactionStatus = async (orderId) => {
  const response = await apiClient.get(`/payments/status/${orderId}`);
  return response.data?.data;
};

const cancelTransaction = async (orderId) => {
  const response = await apiClient.post("/payments/cancel", { orderId });
  return response.data;
};

const paymentService = {
  createSubscription,
  getTransactionStatus,
  cancelTransaction,
};

export default paymentService;
