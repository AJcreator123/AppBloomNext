#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <NimBLEDevice.h>
#include <NimBLEServer.h>
#include <Preferences.h>

#define DHT_PIN 4
#define DHT_TYPE DHT11
#define MOISTURE_PIN 34
#define LIGHT_PIN 35

DHT dht(DHT_PIN, DHT_TYPE);

const char* SUPABASE_URL = "https://nepohvfehtgyydsaknjn.supabase.co/rest/v1/plant_readings";
const char* SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcG9odmZlaHRneXlkc2FrbmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjYwNDUsImV4cCI6MjA3ODIwMjA0NX0.L51yGKouLxfbdZPBQ65cbv9Ub8P9VhDj-7b5CVXYGNU";

const int PLANT_ID = 1;

enum DeviceState {
  STATE_CHECKING_PREFS,
  STATE_BLE_PROVISIONING,
  STATE_WIFI_CONNECTING,
  STATE_WIFI_CONNECTED_LOOP,
  STATE_WIFI_FAIL
};
DeviceState deviceState = STATE_CHECKING_PREFS;
unsigned long connectStartTime = 0;
#define WIFI_CONNECT_TIMEOUT 30000

Preferences preferences;

String ble_ssid = "";
String ble_password = "";
NimBLECharacteristic* statusChar;
bool bleStarted = false;

#define SERVICE_UUID "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define SSID_CHAR_UUID "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
#define PASS_CHAR_UUID "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
#define CONNECT_CHAR_UUID "6e400004-b5a3-f393-e0a9-e50e24dcca9e"
#define STATUS_CHAR_UUID "6e400005-b5a3-f393-e0a9-e50e24dcca9e"

class CredentialCallback : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* c, NimBLEConnInfo& connInfo) override {
    std::string uuid = c->getUUID().toString();
    std::string value = c->getValue();

    if (uuid == SSID_CHAR_UUID) {
      ble_ssid = value.c_str();
      Serial.print("BLE Received SSID: ");
      Serial.println(ble_ssid);
    } else if (uuid == PASS_CHAR_UUID) {
      ble_password = value.c_str();
      Serial.println("BLE Received Password.");
    }
  }
};

class ConnectCallback : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* c, NimBLEConnInfo& connInfo) override {
    Serial.println("BLE Connect command received.");
    if (ble_ssid.length() > 0 && ble_password.length() > 0) {
      Serial.println("Credentials valid, saving and attempting to connect.");

      preferences.begin("wifi-creds", false);
      preferences.putString("wifi_ssid", ble_ssid);
      preferences.putString("wifi_pass", ble_password);
      preferences.end();
      
      if (statusChar) {
        statusChar->setValue("CONNECTING");
        statusChar->notify();
      }

      WiFi.begin(ble_ssid.c_str(), ble_password.c_str());
      connectStartTime = millis();
      deviceState = STATE_WIFI_CONNECTING;

    } else {
      Serial.println("Connect command ignored, SSID or Pass is missing.");
      if (statusChar) {
        statusChar->setValue("NO_CREDS");
        statusChar->notify();
      }
    }
  }
};

void startBLE() {
  if (bleStarted) {
    Serial.println("BLE is already running.");
    return;
  }
  
  Serial.println("Starting BLE setup...");

  String devName = "BloomPot-" +
                   String((uint32_t)ESP.getEfuseMac(), HEX).substring(6);

  NimBLEDevice::init(devName.c_str());
  Serial.println("BLE Device initialized.");
  
  NimBLEServer* server = NimBLEDevice::createServer();
  Serial.println("BLE Server created.");
  
  NimBLEService* service = server->createService(SERVICE_UUID);
  Serial.println("BLE Service created.");

  static CredentialCallback credCallback;
  static ConnectCallback connCallback;

  NimBLECharacteristic* ssidChar = service->createCharacteristic(
      SSID_CHAR_UUID, NIMBLE_PROPERTY::WRITE);
  ssidChar->setCallbacks(&credCallback);

  NimBLECharacteristic* passChar = service->createCharacteristic(
      PASS_CHAR_UUID, NIMBLE_PROPERTY::WRITE);
  passChar->setCallbacks(&credCallback);

  NimBLECharacteristic* connChar = service->createCharacteristic(
      CONNECT_CHAR_UUID, NIMBLE_PROPERTY::WRITE);
  connChar->setCallbacks(&connCallback);

  statusChar = service->createCharacteristic(
      STATUS_CHAR_UUID, NIMBLE_PROPERTY::NOTIFY | NIMBLE_PROPERTY::READ);
  
  Serial.println("BLE Characteristics created.");

  service->start();
  server->start();
  Serial.println("BLE Service and Server started.");

  NimBLEAdvertising* ads = NimBLEDevice::getAdvertising();
  ads->addServiceUUID(SERVICE_UUID);
  ads->setName(devName.c_str());
  NimBLEDevice::startAdvertising();

  Serial.println("BLE Provisioning Started");
  Serial.print("Advertising as: ");
  Serial.println(devName);
  statusChar->setValue("WAITING_CREDS");
  bleStarted = true;
}

// We no longer need a stopBLE() function

void setup() {
  Serial.begin(115200);
  delay(2000); // Wait 2 seconds for monitor to connect
  Serial.println("\n\n--- Serial Monitor Connected. Starting Setup ---");
  
  Serial.println("Initializing DHT sensor...");
  dht.begin();
  Serial.println("DHT initialized.");
  
  deviceState = STATE_CHECKING_PREFS;
  Serial.println("Setup complete. Moving to loop().");
}

void loop() {
  switch (deviceState) {
    case STATE_CHECKING_PREFS: {
      Serial.println("--- LOOP: STATE_CHECKING_PREFS ---");
      Serial.println("Checking for saved WiFi credentials...");
      preferences.begin("wifi-creds", true);
      ble_ssid = preferences.getString("wifi_ssid", "");
      ble_password = preferences.getString("wifi_pass", "");
      preferences.end();

      if (ble_ssid.length() > 0 && ble_password.length() > 0) {
        Serial.println("Found credentials, attempting to connect...");
        WiFi.begin(ble_ssid.c_str(), ble_password.c_str());
        deviceState = STATE_WIFI_CONNECTING;
        connectStartTime = millis();
      } else {
        Serial.println("No credentials found, starting BLE provisioning.");
        startBLE(); // Start BLE for the first time
        deviceState = STATE_BLE_PROVISIONING;
      }
      break;
    }

    case STATE_BLE_PROVISIONING:
      Serial.println("--- LOOP: STATE_BLE_PROVISIONING (Waiting for creds) ---");
      delay(2000); // Slowed down delay
      break;

    case STATE_WIFI_CONNECTING:
      Serial.print("."); 
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi Connected!");
        deviceState = STATE_WIFI_CONNECTED_LOOP;
        if (statusChar) {
          statusChar->setValue("CONNECTED");
          statusChar->notify();
        }
        // We no longer stop BLE here. It just keeps running.
        delay(1000);
      } else if (millis() - connectStartTime > WIFI_CONNECT_TIMEOUT) {
        Serial.println("\nWiFi Connection Failed (Timeout).");
        deviceState = STATE_WIFI_FAIL;
      }
      delay(500);
      break;

    case STATE_WIFI_CONNECTED_LOOP: {
      Serial.println("--- LOOP: STATE_WIFI_CONNECTED_LOOP (Sending data) ---");
      if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi Disconnected. Moving to FAIL state.");
        deviceState = STATE_WIFI_FAIL;
        // No return, just let it fall through to the next loop iteration
      } else {
        float humidity = dht.readHumidity();
        float temperature = dht.readTemperature();
        int moisture_raw = analogRead(MOISTURE_PIN);
        int light_raw = analogRead(LIGHT_PIN);

        int moisture_percent = map(moisture_raw, 4095, 1500, 0, 100);
        int light_percent = map(light_raw, 0, 4095, 0, 100);

        if (isnan(humidity) || isnan(temperature)) {
          Serial.println("Failed to read from DHT sensor!");
        } else {
          Serial.printf("Data: %.1f°C, %.0f%%, %d%% moisture, %d%% light\n",
                        temperature, humidity, moisture_percent, light_percent);

          HTTPClient http;
          http.begin(SUPABASE_URL);
          http.addHeader("Content-Type", "application/json");
          http.addHeader("apikey", SUPABASE_KEY);
          http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
          http.addHeader("Prefer", "return=minimal");

          String body = "{"
                        "\"plant_id\": " + String(PLANT_ID) + ","
                        "\"temperature\": " + String(temperature, 1) + ","
                        "\"humidity\": " + String(humidity, 0) + ","
                        "\"moisture\": " + String(moisture_percent) + ","
                        "\"light\": " + String(light_percent) +
                        "}";

          int code = http.POST(body);
          Serial.printf("Supabase Response: %d\n", code);
          http.end();
        }
        delay(30000); // Wait 30 seconds before next reading
      }
      break;
    }

    case STATE_WIFI_FAIL: {
      Serial.println("--- LOOP: STATE_WIFI_FAIL ---");
      Serial.println("Clearing credentials and returning to provisioning mode.");
      WiFi.disconnect(true);

      preferences.begin("wifi-creds", false);
      preferences.clear();
      preferences.end();

      ble_ssid = "";
      ble_password = "";

      if (statusChar) {
          statusChar->setValue("FAIL");
          statusChar->notify();
      }

      // BLE is already running, so just go back to the provisioning state
      deviceState = STATE_BLE_PROVISIONING;
      break;
    }
  }
}