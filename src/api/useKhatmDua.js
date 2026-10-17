import { useState, useEffect } from "react";
import { api } from "./client";

export function useKhatmDua() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDua() {
      try {
        setLoading(true);
        // طلب البيانات المباشر من الـ Endpoint المعلن في Swagger
        const responseData = await api("/v1/daily/khatm-dua");
        
        if (isMounted) {
          setData(responseData);
          setError(null);
        }
      } catch (err) {
        console.error("خطأ في جلب دعاء ختم القرآن:", err);
        if (isMounted) {
          setError("تعذر جلب دعاء ختم القرآن الكريم من السيرفر.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDua();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}