# BloomPot Firmware

Arduino/ESP32 firmware for the BloomPot smart plant monitoring device.

## Hardware
- **Board:** ESP32
- **Sensors:**
  - DHT22 (Temperature & Humidity)
  - Capacitive Soil Moisture Sensor
  - BH1750 Light Sensor

## Setup
1. Install Arduino IDE or PlatformIO
2. Install required libraries (see `platformio.ini` or sketch comments)
3. Update WiFi credentials and Supabase URL in the main sketch
4. Upload to ESP32

## BLE Configuration
- **Device Name:** BloomPot-XXXX
- **Service UUID:** `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- **Password Characteristic:** `6e400002-b5a3-f393-e0a9-e50e24dcca9e`
- **Status Characteristic:** `6e400003-b5a3-f393-e0a9-e50e24dcca9e`

## File Structure
```
firmware/
├── bloompot/              # Main Arduino sketch
│   └── bloompot.ino
├── platformio.ini         # PlatformIO config (if using PlatformIO)
└── README.md              # This file
```
