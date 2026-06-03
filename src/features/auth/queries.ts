import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useCurrentUser() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) return null;
      return {
        email: user.email || "",
        name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      };
    },
  });
}
