import express from 'express';
import getSolarData from './getVars.js';
import { SolarData } from './db.js';
import { Op } from 'sequelize';

const app = express();
const port = 3000;

app.get('/solar-data', async (req, res) => {
    try {
        // Fetch the latest solar data entry
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

// New endpoint to get the last week's solar data
app.get('/solar-data-week', async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Fetch solar data entries from the last week
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

// Function to collect and save solar data
async function collectAndSaveSolarData() {
    getSolarData(async (error, data) => {
        if (error) {
            console.error(`Failed to retrieve solar data: ${error.message}`);
            return;
        }

        try {
            // Save the solar data using Sequelize
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
                errors: JSON.stringify(data["errors"]),
            });
            
            console.log('Solar data saved successfully.');
        } catch (saveError) {
            console.error('Failed to save solar data:', saveError.message);
        }
    });
}

// Set an interval to collect and save data every 5 minutes (600,000 ms)
setInterval(collectAndSaveSolarData, 5 * 60 * 1000);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
