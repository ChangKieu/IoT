const express = require('express');
const pool = require('./db');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
