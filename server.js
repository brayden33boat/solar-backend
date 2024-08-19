import express from 'express';
import getSolarData from './getVars.js';
import { SolarData } from './db.js';
import { Op } from 'sequelize';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const app = express();
const server = http.createServer(app);  // Create an HTTP server with Express
const port = 3000;

const io = new Server(server, {
    path: '/ws',  // Set custom path for WebSocket
    cors: {
        origin: "*",  // Allow all origins for testing
        methods: ["GET", "POST"],
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.use(cors());

app.get('/solar-data', async (req, res) => {
    try {
        const latestData = await SolarData.findOne({
            order: [['timestamp', 'DESC']],
        });

        if (!latestData) {
            return res.status(404).json({ message: 'No solar data found' });
        }

        res.json(latestData);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve solar data',
            error: error.message,
        });
    }
});

app.get('/solar-data-week', async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyData = await SolarData.findAll({
            where: {
                timestamp: {
                    [Op.gte]: oneWeekAgo
                }
            },
            order: [['timestamp', 'DESC']],
            attributes: ['battery_voltage', 'timestamp'] // Updated to use snake_case
        });

        if (!weeklyData || weeklyData.length === 0) {
            return res.status(404).json({ message: 'No solar data found for the last week' });
        }

        res.json(weeklyData);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve solar data',
            error: error.message,
        });
    }
});

async function collectAndSaveSolarData() {
    getSolarData(async (error, data) => {
        if (error) {
            console.error(`Failed to retrieve solar data: ${error.message}`);
            return;
        }

        try {
            const savedData = await SolarData.create({
                battery_voltage: data["battery_voltage"],
                battery_current: data["battery_current"],
                solar_panel_1_voltage: data["solar_panel_1_voltage"],
                solar_panel_1_current: data["solar_panel_1_current"],
                solar_panel_1_power: data["solar_panel_1_power"],
                total_power_of_solar_panels: data["total_power_of_solar_panels"],
                total_charging_power: data["total_charging_power"],
                solar_panel_2_voltage: data["solar_panel_2_voltage"],
                solar_panel_2_current: data["solar_panel_2_current"],
                solar_panel_2_power: data["solar_panel_2_power"],
                controller_battery_temperature: data["controller_battery_temperature"],
                charging_upper_limit_temperature: data["charging_upper_limit_temperature"],
                charging_lower_limit_temperature: data["charging_lower_limit_temperature"],
                heat_sink_a_temperature: data["heat_sink_a_temperature"],
                heat_sink_b_temperature: data["heat_sink_b_temperature"],
                heat_sink_c_temperature: data["heat_sink_c_temperature"],
                ambient_temperature: data["ambient_temperature"],
                over_discharge_voltage: data["over_discharge_voltage"],
                discharge_limiting_voltage: data["discharge_limiting_voltage"],
                stop_charging_current: data["stop_charging_current"],
                stop_charging_capacity: data["stop_charging_capacity"],
                immediate_equalization_charge_command: data["immediate_equalization_charge_command"],
                errors: JSON.stringify(data["errors"]),
            });

            console.log('Solar data saved successfully.');
            io.emit('solarDataUpdate', savedData);
        } catch (saveError) {
            console.error('Failed to save solar data:', saveError.message);
        }
    });
}

setInterval(collectAndSaveSolarData, 5 * 60 * 1000);

// Use the server created with http.createServer
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
