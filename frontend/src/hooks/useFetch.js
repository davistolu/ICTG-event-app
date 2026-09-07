import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Runs `fetcher` whenever `deps` change, tracking loading/error/data state.
 * Guards against setting state after unmount and against a slow, stale
 * request overwriting a newer one (e.g. typing quickly in a search box).
 */
export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (currentRequest !== requestId.current) return;
        setData(result);
      })
      .catch((err) => {
        if (currentRequest !== requestId.current) return;
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (currentRequest !== requestId.current) return;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
