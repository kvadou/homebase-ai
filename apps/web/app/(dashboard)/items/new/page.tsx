import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ItemForm } from "@/components/items/item-form";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Props {
  searchParams: Promise<{
    homeId?: string;
    roomId?: string;
    name?: string;
    category?: string;
    brand?: string;
    model?: string;
    condition?: string;
    description?: string;
  }>;
}

export default async function NewItemPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await requireAuth();

  const homes = await prisma.home.findMany({
    where: {
      users: { some: { userId: user.id } },
    },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
          <CardDescription>
            Enter your item details to add it to your home inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemForm
            homes={homes}
            defaultHomeId={params.homeId}
            defaultRoomId={params.roomId}
            scanData={
              params.name
                ? {
                    name: params.name,
                    category: params.category,
                    brand: params.brand,
                    model: params.model,
                    condition: params.condition,
                    description: params.description,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
