import { useState, useCallback } from "react";
import { getErrorMessage } from "../../utils/helpers";

export const useAdminData = () => {
  const [data, setData] = useState({
    stats: {}, products: [], categories: [], orders: [], reviews: [], coupons: [], report: { report: [], topProducts: [] }
  });
  const [loading, setLoading] = useState({});
  const [message, setMessage] = useState(null);

  const showNotification = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchData = useCallback(async (key, serviceFn) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await serviceFn();
      // Handle different API response structures
      const result = res.data?.products || res.data?.coupons || res.data || [];
      setData((prev) => ({ ...prev, [key]: result }));
    } catch (err) {
      showNotification(getErrorMessage(err, `Failed to load ${key}`), "error");
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  return { data, setData, loading, message, showNotification, fetchData };
};