import HeroSection from "@/components/ui/hero-section";
import { createClient } from "@/lib/supabase/server";

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
