import express from 'express';
import getSolarData from './getVars.js';
import { SolarData } from './db.js';
import { Op } from 'sequelize';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import writeToRegister from './writeVars.js';


const app = express();
const server = http.createServer(app);  // Create an HTTP server with Express
const port = 3000;

const availableRegisters = [
    'pv_max_charging_current',        // Photovoltaic maximum charging current setting
    'battery_nominal_capacity',       // Battery nominal capacity
    'battery_type',                   // Battery type
    'overvoltage',                    // Overvoltage protection point
    'charge_limit_voltage',           // Charge limit voltage
    'balanced_charge_voltage',        // Balanced charging voltage
    'boost_charge_voltage',           // Boost charging voltage/overcharge voltage
    'float_charge_voltage',           // Float charge voltage
    'boost_charge_return_voltage',    // Boost charge return voltage
    'undervoltage_warning_voltage',   // Undervoltage warning voltage
    'over_discharge_voltage',         // Over-discharge voltage
    'discharge_cutoff_soc',           // Discharge cut-off SOC
    'inverter_switch',                // Inverter switch control
    'battery_charge_status',          // Battery charge status control
];

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
app.use(express.json());

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

app.post('/solar-set-var/:attributeName', async (req, res) => {
    const { attributeName } = req.params;
    const { value } = req.body ?? {};

    if (typeof value === 'undefined') {
        return res.status(400).json({ error: 'Value is required in the request body.' });
    }

    if (!availableRegisters.includes(attributeName)) {
        return res.status(400).json({ error: 'Attribute not recognized.' });
    }

    console.log("Writing to regsiter", attributeName, value);

    try {
        const result = await writeToRegister(attributeName, value);
        res.status(200).json({ message: 'Register updated successfully', result });
    } catch (error) {
        console.error(`Failed to update register: ${error}`);
        res.status(500).json({ error: `Failed to update register: ${error}` });
    }
});

app.get('/solar-data-week/:attributeName', async (req, res) => {
    try {
        const { attributeName } = req.params;
        const validAttributes = ['battery_voltage', 'total_charging_power']; // Add all valid attribute names here

        // Check if the requested attribute is valid
        if (!validAttributes.includes(attributeName)) {
            return res.status(400).json({ message: 'Invalid attribute name' });
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyData = await SolarData.findAll({
            where: {
                timestamp: {
                    [Op.gte]: oneWeekAgo
                }
            },
            order: [['timestamp', 'DESC']],
            attributes: [attributeName, 'timestamp'] // Use the dynamic attribute name
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

let counter = 0;
const saveInterval = 120; // Run every 5 seconds, so 120 counts equals 10 minutes (120 * 5 seconds = 600 seconds)
let isCollectingData = false;

async function collectAndProcessSolarData() {
    if (isCollectingData) {
        console.log('Data collection already in progress. Skipping this interval.');
        return;
    }
    isCollectingData = true;

    getSolarData(async (error, data) => {
        if (error) {
            console.error(`Failed to retrieve solar data: ${error.message}`);
            isCollectingData = false;
            return;
        }

        try {
            io.emit('solarDataUpdate', data); // Emit fresh data every 5 seconds

            counter++;

            if (counter >= saveInterval) {
                await SolarData.create({
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
                    load_voltage: data["load_voltage"],
                    load_current: data["load_current"],
                    load_power: data["load_power"],
                    battery_soc: data["battery_soc"],
                    grid_a_phase_voltage: data["grid_a_phase_voltage"],
                    grid_a_phase_current: data["grid_a_phase_current"],
                    grid_frequency: data["grid_frequency"],
                    inverter_phase_a_voltage: data["inverter_phase_a_voltage"],
                    inverter_phase_a_current: data["inverter_phase_a_current"],
                    inverter_frequency: data["inverter_frequency"],
                    pv_charging_current: data["pv_charging_current"],
                    battery_charge_status: data["battery_charge_status"],
                    inverter_switch_status: data["inverter_switch_status"],
                    charge_limit_voltage: data["charge_limit_voltage"],
                    errors: JSON.stringify(data["errors"]),
                });

                console.log('Solar data saved successfully.');
                counter = 0; // Reset the counter after saving
            }
        } catch (saveError) {
            console.error('Failed to save solar data:', saveError.message);
        } finally {
            isCollectingData = false;
        }
    });
}

// Run the function every 5 seconds (5000 milliseconds)
setInterval(collectAndProcessSolarData, 5000);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred, but the server is still running.' });
});

// Catch Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    // Keep the server running
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason.message);
    // Keep the server running
});

// Use the server created with http.createServer
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
