import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          return document.cookie.split("; ").map((c) => {
            const [name, ...rest] = c.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookie = `${name}=${value}; path=/`;
            if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
            if (options?.domain) cookie += `; domain=${options.domain}`;
            cookie += "; same-site=lax";
            if (process.env.NODE_ENV === "production") cookie += "; secure";
            document.cookie = cookie;
          });
        },
      },
    },
  );
}
