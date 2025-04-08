const express = require('express');
const pool = require('./db');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const mqttClient = mqtt.connect('mqtt://192.168.1.198:1889', {
    username: 'trinhkieutrang',
    password: 'tkt123'
});

mqttClient.on('connect', () => {
    console.log('📡 MQTT connected!');
    mqttClient.subscribe('data/sensors', (err) => {
        if (!err) {
            console.log('✅ Subscribed to topic: data/sensors');
        } else {
            console.error('❌ Failed to subscribe:', err);
        }
    });
});

mqttClient.on('message', async (topic, message) => {
    if (topic === 'data/sensors') {
        try {
            const data = JSON.parse(message.toString());
            const { temperature, humidity, light } = data;

            const sql = `
                INSERT INTO device_data (temperature, humidity, light, recorded_at)
                VALUES (?, ?, ?, NOW())
            `;
            await pool.query(sql, [temperature, humidity, light]);

            console.log('📥 Saved data from MQTT:', data);
        } catch (error) {
            console.error('❌ Error parsing or saving MQTT data:', error);
        }
    }
});

app.get("/get_latest_data", async (req, res) => {
    const [rows] = await pool.query(
        "SELECT humidity, temperature, light FROM device_data ORDER BY recorded_at DESC LIMIT 1"
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "Không có dữ liệu" });
      }
  
      res.json(rows[0]);
  });


app.get("/get_list_data", async (req, res) => {
    const [rows] = await pool.query(
        "SELECT humidity, temperature, light, DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i:%s') AS recorded_at FROM device_data ORDER BY recorded_at DESC LIMIT 12"
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: "Không có dữ liệu" });
    }

    res.json(rows);
});

app.get("/get_sensor_data", async (req, res) => {
  try {
      const { 
          page_size = 10, 
          page_number = 1, 
          search = "",
          search_field = "all",  
          sort_by = null, 
          sort_order = "DESC" 
      } = req.query;

      let whereClause = "";
      if (search) {
          if (search_field === "temperature") {
              whereClause = `WHERE CAST(temperature AS CHAR) LIKE '%${search}%'`;
          } else if (search_field === "humidity") {
              whereClause = `WHERE CAST(humidity AS CHAR) LIKE '%${search}%'`;
          } else if (search_field === "light") {
              whereClause = `WHERE CAST(light AS CHAR) LIKE '%${search}%'`;
          } 
          else if (search_field === "recorded_at") {
            whereClause = `WHERE recorded_at = '${search}'`;
        } 
          else {
              whereClause = `WHERE 
                  CAST(temperature AS CHAR) LIKE '%${search}%' OR 
                  CAST(humidity AS CHAR) LIKE '%${search}%' OR 
                  CAST(light AS CHAR) LIKE '%${search}%' OR
                  CAST(humidity AS CHAR) LIKE '%${search}%' `;
          }
      }

      const validSortFields = ["temperature", "humidity", "light", "recorded_at"];
      const sortColumn = validSortFields.includes(sort_by) ? sort_by : null;
      const sortDirection = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const limit = parseInt(page_size);
      const offset = (parseInt(page_number) - 1) * limit;

      let sqlQuery = `
          SELECT humidity, temperature, light, DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i:%s') AS recorded_at FROM device_data 
          ${whereClause}
      `;

      if (sortColumn) {
          sqlQuery += ` ORDER BY ${sortColumn} ${sortDirection}`;
      }

      sqlQuery += ` LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await pool.query(sqlQuery);

      res.json({ page_size, page_number, search, search_field, sort_by, data: rows });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi server" });
  }
});

app.get("/get_device", async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, status, DATE_FORMAT(last_changed_at, '%Y-%m-%d %H:%i:%s') AS last_changed_at FROM devices"
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "Không có dữ liệu" });
      }
  
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.get("/get_sensor_datas", async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, humidity, temperature, light, DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i:%s') AS recorded_at FROM device_data"
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "Không có dữ liệu" });
      }
  
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

app.get("/get_devices", async (req, res) => {
  try {
      const { 
          page_size = 10, 
          page_number = 1, 
          search_time = "", 
          sort_by = "last_changed_at", 
          sort_order = "DESC" 
      } = req.query;

      const validSortFields = ["id", "name", "status", "last_changed_at"];
      const sortColumn = validSortFields.includes(sort_by) ? sort_by : "last_changed_at";
      const sortDirection = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      let whereClause = "";
      if (search_time) {
          whereClause = `WHERE last_changed_at = '${search_time}'`;
      }

      const limit = parseInt(page_size);
      const offset = (parseInt(page_number) - 1) * limit;

      let sqlQuery = `
          SELECT id, name, status, DATE_FORMAT(last_changed_at, '%Y-%m-%d %H:%i:%s') AS last_changed_at
          FROM devices
          ${whereClause}
          ORDER BY ${sortColumn} ${sortDirection}
          LIMIT ${limit} OFFSET ${offset}
      `;

      const [rows] = await pool.query(sqlQuery);

      res.json({ page_size, page_number, search_time, sort_by, sort_order, data: rows });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi server" });
  }
});

let led1Count = 0;
let led2Count = 0;
let led3Count = 0;
let led4Count = 0;
let led5Count = 0;

const getDeviceName = (led) => {
  switch (led) {
    case 'led1': return 'Đèn';
    case 'led2': return 'Quạt';
    case 'led3': return 'Điều hòa';
    case 'led4': return 'Máy lọc khí';
    case 'led5': return 'Máy bơm';
    default: return 'Không xác định';
  }
};

app.post('/control_led', async (req, res) => {
    const { led, state } = req.body;

    try {
        // Kiểm tra đầu vào
        const validLeds = ['led1', 'led2', 'led3', 'led4', 'led5'];
        if (!validLeds.includes(led) || !['ON', 'OFF'].includes(state)) {
            return res.status(400).json({ message: "Invalid LED or state" });
        }

        // Tạo thông điệp MQTT
        const message = JSON.stringify({ [led]: state });

        // Gửi thông điệp MQTT
        await mqttClient.publish('device/control', message, (err) => {
            if (err) {
                console.error('❌ Failed to send control message:', err);
                return res.status(500).json({ message: 'Failed to control LED' });
            }

            console.log(`📤 Sent LED control message: ${message}`);
        });

        // Đếm số lần bật
        if (state === 'ON') {
            if (led === 'led1') led1Count++;
            else if (led === 'led2') led2Count++;
            else if (led === 'led3') led3Count++;
            else if (led === 'led4') led4Count++;
            else if (led === 'led5') led5Count++;
        }

        // Thêm vào database
        const name = getDeviceName(led);
        const status = state === 'ON' ? 1 : 0;

        const sql = `
            INSERT INTO devices (name, status, last_changed_at)
            VALUES (?, ?, NOW())  
        `;

        await pool.query(sql, [name, status]);

        console.log(`✅ Saved ${name} (${state}) to DB`);

        return res.status(200).json({
            message: `LED ${led} turned ${state}`,
            led1Count,
            led2Count,
            led3Count,
            led4Count,
            led5Count
        });
    } catch (error) {
        console.error('❌ Lỗi điều khiển:', error);
        return res.status(500).json({ message: 'Không thể điều khiển thiết bị' });
    }
});

app.get('/get_led_counts', (req, res) => {
    res.json({
        led1Count,
        led2Count,
        led3Count,
        led4Count,
        led5Count
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
