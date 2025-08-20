import { useEffect, useState } from 'react';

export function useFetch<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(res.statusText || 'Network error');
          return res.json();
        })
        .then((d) => {
          if (!cancelled) setData(d as T);
        })
        .catch((e: any) => {
          if (!cancelled) setError(e?.message ?? String(e));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [url]);

    return { data, loading, error } as {
      data: T | null;
      loading: boolean;
      error: string | null;
    };
}
