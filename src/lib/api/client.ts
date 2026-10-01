const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

let refreshPromise: Promise<string | null> | null = null;

async function getOrRefreshToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("agncypay_refresh_token");
      if (refreshToken) {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.accessToken) {
            localStorage.setItem("agncypay_token", data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem("agncypay_refresh_token", data.refreshToken);
            }
            return data.accessToken;
          }
        }
      }

    } catch (e) {
      console.warn("Session refresh failed:", e);
    } finally {
      refreshPromise = null;
    }
    localStorage.removeItem("agncypay_token");
    localStorage.removeItem("agncypay_refresh_token");
    return null;
  })();

  return refreshPromise;
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = typeof window !== "undefined" ? localStorage.getItem("agncypay_token") : null;

  // Refresh an existing user session; never provision an implicit/demo identity.
  if (!token && typeof window !== "undefined" && !endpoint.includes("/auth/")) {
    token = await getOrRefreshToken();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, refresh the user's own session and retry once.
  if (response.status === 401 && typeof window !== "undefined" && !endpoint.includes("/auth/")) {
    const newToken = await getOrRefreshToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = (await response.json()) as Record<string, unknown>;
      errorMessage = String(errorData.message || errorData.error || errorMessage);
    } catch {}
    throw new Error(errorMessage);
  }

  // Handle empty responses (like 204 or empty json)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return {} as T;
}
