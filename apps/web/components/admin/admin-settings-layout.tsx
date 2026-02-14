"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wrench, CreditCard, Key, Shield } from "lucide-react";
import { GeneralSettings } from "./general-settings";
import { PricingSettings } from "./pricing-settings";
import { ApiKeysSettings } from "./api-keys-settings";
import { AdminUsersSettings } from "./admin-users-settings";

export function AdminSettingsLayout() {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-6 flex w-full flex-wrap gap-1 sm:inline-flex sm:w-auto">
        <TabsTrigger value="general" className="gap-2">
          <Wrench className="h-4 w-4" />
          General
        </TabsTrigger>
        <TabsTrigger value="pricing" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Pricing
        </TabsTrigger>
        <TabsTrigger value="api-keys" className="gap-2">
          <Key className="h-4 w-4" />
          API Keys
        </TabsTrigger>
        <TabsTrigger value="admin-users" className="gap-2">
          <Shield className="h-4 w-4" />
          Admin Users
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralSettings />
      </TabsContent>
      <TabsContent value="pricing">
        <PricingSettings />
      </TabsContent>
      <TabsContent value="api-keys">
        <ApiKeysSettings />
      </TabsContent>
      <TabsContent value="admin-users">
        <AdminUsersSettings />
      </TabsContent>
    </Tabs>
  );
}
