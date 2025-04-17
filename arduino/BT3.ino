#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h> 

// WiFi credentials
const char* ssid = "Chang Kiều";
const char* password = "changkieune";

// MQTT broker details
const char* mqtt_server = "192.168.176.87";
const int mqtt_port = 1889;
const char* mqtt_user = "trinhkieutrang";
const char* mqtt_pass = "tkt123";

// Sensor setup
#define DHTPIN 14          // D4 on NodeMCU
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Light Sensor Pins
#define LIGHT_SENSOR_DO 12  // GPIO12 (D6) - Digital Output
#define LIGHT_SENSOR_AO A0  // Analog Pin (A0)

// LED pins
#define LED1 5  // J2
#define LED2 4   // J5
#define LED3 0   // J8
#define LED4 2   // J20
#define LED5 15   // J26

// Control variables
bool sendData = true;
unsigned long lastSend = 0;
bool isWindHigh = false;

WiFiClient espClient;
PubSubClient client(espClient);

void readSensorsAndPublish() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int lightDigital = digitalRead(LIGHT_SENSOR_DO);
  int lightAnalog = analogRead(LIGHT_SENSOR_AO);  // Range: 0 - 1023

  int dust = random(0, 101);       
  int wind = random(0, 101);
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ Failed to read sensors!");
    return;
  }
  if (wind > 60) {
    isWindHigh = true;
  } else {
    isWindHigh = false;
    digitalWrite(LED4, LOW); 
  }
  DynamicJsonDocument doc(256);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["light"] = lightAnalog;
  doc["light_status"] = (lightDigital == 0) ? "Bright" : "Dark";
  doc["dust"] = dust;
  doc["wind"] = wind;
  doc["timestamp"] = millis();

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  
  client.publish("data/sensors", jsonBuffer);
  Serial.println("📤 Sent sensor data to MQTT");
}

void connectWiFi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected! IP: " + WiFi.localIP().toString());
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP8266Client", mqtt_user, mqtt_pass)) {
      Serial.println(" connected!");
      client.subscribe("device/control");
    } else {
      Serial.print(" failed, rc=");
      Serial.print(client.state());
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';

  Serial.printf("📥 Received: [%s] %s\n", topic, message);

  if (String(topic) == "device/control") {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, message);
    Serial.println("Received JSON: " + String(message));
    
    if (error) {
      Serial.println("⚠️ JSON Parsing Failed! Trying to fix format...");
      String fixedJson = "";
      for (int i = 0; i < length; i++) {
        if (message[i] == ':') fixedJson += "\":\"";
        else if (message[i] == ',') fixedJson += "\",\"";
        else if (message[i] == '{') fixedJson += "{\"";
        else if (message[i] == '}') fixedJson += "\"}";
        else fixedJson += message[i];
      }

      Serial.printf("🛠️ Fixed JSON: %s\n", fixedJson.c_str());
      error = deserializeJson(doc, fixedJson);
      if (error) {
        Serial.println("❌ Failed to fix JSON!");
        return;
      }
    }

    if (doc.containsKey("led1")) digitalWrite(LED1, doc["led1"] == "ON" ? HIGH : LOW);
    if (doc.containsKey("led2")) digitalWrite(LED2, doc["led2"] == "ON" ? HIGH : LOW);
    if (doc.containsKey("led3")) digitalWrite(LED3, doc["led3"] == "ON" ? HIGH : LOW);
    if (doc.containsKey("led4")) digitalWrite(LED4, doc["led4"] == "ON" ? HIGH : LOW);
    if (doc.containsKey("led5")) digitalWrite(LED5, doc["led5"] == "ON" ? HIGH : LOW);


  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LED4, OUTPUT);
  pinMode(LED5, OUTPUT);
  dht.begin();

  connectWiFi();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  connectMQTT();

  Serial.println("✅ System ready, sending sensor data...");
}

void loop() {
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();

  if (sendData && millis() - lastSend >= 2000) {
    readSensorsAndPublish();
    lastSend = millis();
  }
  if (isWindHigh) {
    blinkLED(LED4, 1); 
  }
}
void blinkLED(int pin, int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(200); 
    digitalWrite(pin, LOW);
    delay(200);  
  }
}
