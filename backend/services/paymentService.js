// Path: backend/services/paymentService.js
// Description: Handles payment session creation and marks 
// orders as paid after successful payment confirmation.

// Creates a payment session response based on the selected payment gateway.
export const createPaymentSession = async ({ order, gateway, customer }) => {
  const selectedGateway = gateway || order.paymentMethod;

  if (["COD", "bKash", "Nagad"].includes(selectedGateway)) {
    return {
      gateway: selectedGateway,
      status: "manual_or_cod",
      message: `${selectedGateway} selected. Collect/confirm payment according to checkout policy.`,
    };
  }

  return {
    gateway: selectedGateway,
    status: "created",
    transactionId: `KM-${order._id}-${Date.now()}`,
    redirectUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout/payment/${order._id}`,
    amount: order.totalPrice,
    currency: "BDT",
    customer: {
      name: customer?.name,
      email: customer?.email,
      phone: customer?.phone,
    },
  };
};

// Updates an order document after payment is confirmed.
export const markPaymentAsPaid = (order, paymentResult = {}) => {
  order.paymentStatus = "paid";
  order.isPaid = true;
  order.paidAt = new Date();

  order.paymentResult = {
    ...order.paymentResult,
    ...paymentResult,
    status: paymentResult.status || "paid",
  };

  return order;
};