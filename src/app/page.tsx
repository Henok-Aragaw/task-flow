import { createClient } from "@/lib/supabase/server";
import HeroSection from "@/components/ui/hero-section";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex w-full flex-col">
      <main className="grow">
        <HeroSection isAuthenticated={!!user} />
      </main>
    </div>
  );
}

