"use client";

import * as React from "react";
import { Plus, Users, ClipboardList, Loader2, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProviderCard } from "@/components/providers/provider-card";
import { ProviderDetail } from "@/components/providers/provider-detail";
import { ProviderSearch } from "@/components/providers/provider-search";
import { CreateProviderDialog } from "@/components/providers/create-provider-dialog";
import { ServiceRequestCard } from "@/components/providers/service-request-card";
import { CreateRequestDialog } from "@/components/providers/create-request-dialog";
import { DiscoverProviders } from "@/components/providers/discover-providers";

interface Provider {
  id: string;
  name: string;
  company: string | null;
  specialty: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  featured: boolean;
  isClaimable: boolean;
  claimedByUserId: string | null;
  stripeConnectId: string | null;
}

interface ProviderWithDetails extends Provider {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    authorName: string | null;
    createdAt: string;
  }>;
  availability: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

interface ServiceRequest {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  cost: number | null;
  home?: { id: string; name: string } | null;
  provider?: { id: string; name: string; specialty: string } | null;
}

interface Home {
  id: string;
  name: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = React.useState<Provider[]>([]);
  const [requests, setRequests] = React.useState<ServiceRequest[]>([]);
  const [homes, setHomes] = React.useState<Home[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [requestsLoading, setRequestsLoading] = React.useState(true);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [specialty, setSpecialty] = React.useState("all");
  const [selectedProvider, setSelectedProvider] = React.useState<ProviderWithDetails | null>(null);
  const [createProviderOpen, setCreateProviderOpen] = React.useState(false);
  const [createRequestOpen, setCreateRequestOpen] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  const fetchProviders = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (specialty && specialty !== "all") params.set("specialty", specialty);

      const res = await fetch(`/api/providers?${params}`);
      const data = await res.json();
      if (data.success) {
        setProviders(data.data);
        if (data.meta?.currentUserId) {
          setCurrentUserId(data.meta.currentUserId);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, specialty]);

  const fetchRequests = React.useCallback(async () => {
    try {
      const res = await fetch("/api/service-requests");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const fetchHomes = React.useCallback(async () => {
    try {
      const res = await fetch("/api/homes");
      const data = await res.json();
      if (data.success) {
        setHomes(data.data);
      }
    } catch {
      // silently fail
    }
  }, []);

  React.useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  React.useEffect(() => {
    fetchRequests();
    fetchHomes();
  }, [fetchRequests, fetchHomes]);

  const handleSelectProvider = async (id: string) => {
    try {
      const res = await fetch(`/api/providers/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedProvider(data.data);
      }
    } catch {
      // silently fail
    }
  };

  const handleRefreshProvider = async () => {
    if (!selectedProvider) return;
    await handleSelectProvider(selectedProvider.id);
    await fetchProviders();
  };

  // Debounce search: update input immediately, defer API query
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setLoading(true);
      setSearch(value);
    }, 300);
  };

  if (selectedProvider) {
    return (
      <div className="mx-auto max-w-3xl">
        <ProviderDetail
          provider={selectedProvider}
          onBack={() => setSelectedProvider(null)}
          onRefresh={handleRefreshProvider}
          currentUserId={currentUserId}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Tabs defaultValue="directory">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Service Providers
            </h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Find and manage trusted service providers for your homes.
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="directory" className="gap-1.5">
              <Users className="h-4 w-4" />
              Directory
            </TabsTrigger>
            <TabsTrigger value="discover" className="gap-1.5">
              <Compass className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Requests
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="directory" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <ProviderSearch
                search={searchInput}
                specialty={specialty}
                onSearch={handleSearch}
                onSpecialtyFilter={(s) => {
                  setSpecialty(s);
                  setLoading(true);
                }}
              />
            </div>
            <Button
              onClick={() => setCreateProviderOpen(true)}
              className="gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Provider
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                <Users className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--foreground))]">
                No providers found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
                {search || specialty !== "all"
                  ? "Try adjusting your search or filters."
                  : "Add your first service provider to get started."}
              </p>
              {!search && specialty === "all" && (
                <Button
                  onClick={() => setCreateProviderOpen(true)}
                  className="mt-4 gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Provider
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onClick={handleSelectProvider}
                  currentUserId={currentUserId}
                  onClaimed={fetchProviders}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <DiscoverProviders homes={homes} />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[hsl(var(--foreground))]">
              Service Requests
            </h2>
            <Button
              onClick={() => setCreateRequestOpen(true)}
              className="gap-1.5"
              disabled={homes.length === 0}
            >
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </div>

          {requestsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                <ClipboardList className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--foreground))]">
                No service requests
              </h3>
              <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
                {homes.length === 0
                  ? "Add a home first, then create service requests."
                  : "Create your first service request to track maintenance and repairs."}
              </p>
              {homes.length > 0 && (
                <Button
                  onClick={() => setCreateRequestOpen(true)}
                  className="mt-4 gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  New Request
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <ServiceRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateProviderDialog
        open={createProviderOpen}
        onOpenChange={setCreateProviderOpen}
        onCreated={fetchProviders}
      />

      <CreateRequestDialog
        open={createRequestOpen}
        onOpenChange={setCreateRequestOpen}
        homes={homes}
        providers={providers}
        onCreated={fetchRequests}
      />
    </div>
  );
}
