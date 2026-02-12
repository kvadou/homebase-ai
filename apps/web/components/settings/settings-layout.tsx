"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Home, Sliders, Shield } from "lucide-react";
import { ProfileSettings } from "./profile-settings";
import { HomeSettings } from "./home-settings";
import { PreferencesSettings } from "./preferences-settings";
import { AccountSettings } from "./account-settings";

export function SettingsLayout() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6 flex w-full flex-wrap gap-1 sm:inline-flex sm:w-auto">
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="homes" className="gap-2">
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Homes</span>
        </TabsTrigger>
        <TabsTrigger value="preferences" className="gap-2">
          <Sliders className="h-4 w-4" />
          <span className="hidden sm:inline">Preferences</span>
        </TabsTrigger>
        <TabsTrigger value="account" className="gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Account</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="homes">
        <HomeSettings />
      </TabsContent>
      <TabsContent value="preferences">
        <PreferencesSettings />
      </TabsContent>
      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>
    </Tabs>
  );
}
