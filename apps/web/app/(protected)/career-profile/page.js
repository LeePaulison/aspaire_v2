import { Header } from "@/components/ui/Header";
import { CareerProfileClient } from "@/components/career-profile/CareerProfileClient";
import { getCareerProfile } from "@/graphql/careerProfile/serverCareerProfile";

export default async function CareerProfilePage() {
  const profile = await getCareerProfile();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <CareerProfileClient initialProfile={profile} />
    </div>
  );
}
