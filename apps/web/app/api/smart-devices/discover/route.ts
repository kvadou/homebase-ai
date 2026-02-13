import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

interface SmartDeviceTemplate {
  deviceType: string;
  displayName: string;
  brand: string;
  protocols: string[];
  icon: string;
  description: string;
  commonModels: string[];
}

const DEVICE_TEMPLATES: SmartDeviceTemplate[] = [
  {
    deviceType: "smart_thermostat",
    displayName: "Smart Thermostat",
    brand: "Various",
    protocols: ["wifi", "zigbee", "matter"],
    icon: "Thermometer",
    description: "Connected thermostats for climate control",
    commonModels: ["Nest Learning", "Ecobee Smart", "Honeywell T9"],
  },
  {
    deviceType: "smart_lock",
    displayName: "Smart Lock",
    brand: "Various",
    protocols: ["wifi", "zigbee", "zwave", "bluetooth"],
    icon: "Lock",
    description: "Connected door locks with remote access",
    commonModels: ["August Wi-Fi", "Schlage Encode", "Yale Assure"],
  },
  {
    deviceType: "smart_light",
    displayName: "Smart Light",
    brand: "Various",
    protocols: ["wifi", "zigbee", "bluetooth", "matter"],
    icon: "Lightbulb",
    description: "Connected light bulbs and switches",
    commonModels: ["Philips Hue", "LIFX", "Wyze Bulb"],
  },
  {
    deviceType: "smart_camera",
    displayName: "Smart Camera",
    brand: "Various",
    protocols: ["wifi"],
    icon: "Camera",
    description: "Security cameras with remote viewing",
    commonModels: ["Ring Indoor", "Arlo Pro", "Wyze Cam"],
  },
  {
    deviceType: "smart_speaker",
    displayName: "Smart Speaker",
    brand: "Various",
    protocols: ["wifi", "bluetooth"],
    icon: "Speaker",
    description: "Voice assistants and connected speakers",
    commonModels: ["Amazon Echo", "Google Nest", "Apple HomePod"],
  },
  {
    deviceType: "smart_sensor",
    displayName: "Smart Sensor",
    brand: "Various",
    protocols: ["zigbee", "zwave", "wifi"],
    icon: "Activity",
    description: "Motion, temperature, and environmental sensors",
    commonModels: ["Aqara Sensor", "Samsung SmartThings", "Eve Motion"],
  },
  {
    deviceType: "smart_plug",
    displayName: "Smart Plug",
    brand: "Various",
    protocols: ["wifi", "zigbee", "matter"],
    icon: "Plug",
    description: "Connected outlets for remote control",
    commonModels: ["TP-Link Kasa", "Wemo Mini", "Amazon Smart Plug"],
  },
  {
    deviceType: "smart_doorbell",
    displayName: "Smart Doorbell",
    brand: "Various",
    protocols: ["wifi"],
    icon: "Bell",
    description: "Video doorbells with motion detection",
    commonModels: ["Ring Video", "Nest Doorbell", "Arlo Doorbell"],
  },
  {
    deviceType: "smart_garage",
    displayName: "Garage Door Opener",
    brand: "Various",
    protocols: ["wifi", "matter"],
    icon: "Warehouse",
    description: "Connected garage door controllers",
    commonModels: ["Chamberlain myQ", "Meross Smart", "Tailwind iQ3"],
  },
  {
    deviceType: "smart_sprinkler",
    displayName: "Smart Sprinkler",
    brand: "Various",
    protocols: ["wifi"],
    icon: "Droplets",
    description: "Connected irrigation controllers",
    commonModels: ["Rachio 3", "RainMachine", "Orbit B-hyve"],
  },
  {
    deviceType: "smart_smoke_detector",
    displayName: "Smoke Detector",
    brand: "Various",
    protocols: ["wifi", "zigbee", "matter"],
    icon: "Flame",
    description: "Connected smoke and CO detectors",
    commonModels: ["Nest Protect", "First Alert Onelink", "Kidde Smart"],
  },
  {
    deviceType: "smart_vacuum",
    displayName: "Robot Vacuum",
    brand: "Various",
    protocols: ["wifi"],
    icon: "Bot",
    description: "Automated robot vacuums and mops",
    commonModels: ["iRobot Roomba", "Roborock S7", "Ecovacs Deebot"],
  },
];

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    let protocol: string | undefined;
    try {
      const body = await req.json();
      protocol = body?.protocol;
    } catch {
      // No body or invalid JSON is fine
    }

    let devices = DEVICE_TEMPLATES;
    if (protocol && protocol !== "all") {
      devices = devices.filter((d) =>
        d.protocols.includes(protocol as string)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        devices,
        note: "Manual device linking - select a device type to link to your item",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to discover devices" },
      { status: 500 }
    );
  }
}
