"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Home, Sliders, Shield, CalendarDays, Download, Upload } from "lucide-react";
import { ProfileSettings } from "./profile-settings";
import { HomeSettings } from "./home-settings";
import { PreferencesSettings } from "./preferences-settings";
import { AccountSettings } from "./account-settings";
import { CalendarSettings } from "./calendar-settings";
import { DataExportSettings } from "./data-export-settings";
import { ImportSettings } from "./import-settings";

export function SettingsLayout() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6 flex w-full flex-wrap gap-1 sm:inline-flex sm:w-auto">
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="homes" className="gap-2">
          <Home className="h-4 w-4" />
          Homes
        </TabsTrigger>
        <TabsTrigger value="preferences" className="gap-2">
          <Sliders className="h-4 w-4" />
          Prefs
        </TabsTrigger>
        <TabsTrigger value="account" className="gap-2">
          <Shield className="h-4 w-4" />
          Account
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-2">
          <CalendarDays className="h-4 w-4" />
          Calendar
        </TabsTrigger>
        <TabsTrigger value="export" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </TabsTrigger>
        <TabsTrigger value="import" className="gap-2">
          <Upload className="h-4 w-4" />
          Import
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
      <TabsContent value="calendar">
        <CalendarSettings />
      </TabsContent>
      <TabsContent value="export">
        <DataExportSettings />
      </TabsContent>
      <TabsContent value="import">
        <ImportSettings />
      </TabsContent>
    </Tabs>
  );
}
