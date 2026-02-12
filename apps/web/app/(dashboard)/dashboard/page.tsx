import Link from "next/link";
import { Plus, Home, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireAuth();

  const homes = await prisma.home.findMany({
    where: {
      users: { some: { userId: user.id } },
    },
    include: {
      _count: {
        select: { rooms: true, items: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalItems = homes.reduce((sum, h) => sum + h._count.items, 0);
  const totalRooms = homes.reduce((sum, h) => sum + h._count.rooms, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            Welcome back{user.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-1 text-[hsl(var(--muted-foreground))]">
            Here&apos;s an overview of your homes and items.
          </p>
        </div>
        <Button asChild>
          <Link href="/home/new">
            <Plus className="h-4 w-4" />
            Add Home
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Total Homes
            </CardTitle>
            <Home className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Total Items
            </CardTitle>
            <Package className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Total Rooms
            </CardTitle>
            <Wrench className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
          </CardContent>
        </Card>
      </div>

      {/* Home cards */}
      <div>
        <h2 className="font-heading text-xl font-semibold">Your Homes</h2>
        {homes.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Home className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
              <h3 className="mt-4 font-heading text-lg font-semibold">No homes yet</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Add your first home to get started.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/home/new">
                  <Plus className="h-4 w-4" />
                  Add Your First Home
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homes.map((home) => (
              <Link key={home.id} href={`/home/${home.id}`}>
                <Card className="transition-all duration-200 hover:shadow-md hover:border-[hsl(var(--ring))]/30 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
                        <Home className="h-6 w-6 text-teal-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading font-semibold truncate">{home.name}</h3>
                        {home.address && (
                          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))] truncate">
                            {home.city}{home.state ? `, ${home.state}` : ""}
                          </p>
                        )}
                        <div className="mt-3 flex gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                          <span>{home._count.rooms} rooms</span>
                          <span>{home._count.items} items</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
