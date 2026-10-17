
import { useEffect, useState } from "react";
import { api } from "./client";

const cache = new Map();

export function useApi(path) {
  const [state, setState] = useState(() => ({ data: cache.get(path) ?? null, error: null }));

  useEffect(() => {
    if (cache.has(path)) return;
    const ctrl = new AbortController();
    api(path, { signal: ctrl.signal })
      .then((data) => {
        cache.set(path, data);
        setState({ data, error: null });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.error("API error:", path, error);
        setState({ data: null, error });
      });
    return () => ctrl.abort();
  }, [path]);

  return { ...state, loading: !state.data && !state.error };
}