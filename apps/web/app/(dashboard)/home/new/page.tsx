import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HomeForm } from "@/components/homes/home-form";

export default function NewHomePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Home</CardTitle>
          <CardDescription>
            Enter your home details to get started tracking items and maintenance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HomeForm />
        </CardContent>
      </Card>
    </div>
  );
}
