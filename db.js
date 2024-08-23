import { Sequelize, DataTypes } from 'sequelize';

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'solar_data.db',  // This will create the SQLite database file if it doesn't exist
    logging: false,            // Disable logging
});

// Define the SolarData model with all the columns
const SolarData = sequelize.define('SolarData', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
    battery_voltage: {
        type: DataTypes.REAL,
    },
    battery_current: {
        type: DataTypes.REAL,
    },
    solar_panel_1_voltage: {
        type: DataTypes.REAL,
    },
    solar_panel_1_current: {
        type: DataTypes.REAL,
    },
    solar_panel_1_power: {
        type: DataTypes.REAL,
    },
    total_power_of_solar_panels: {
        type: DataTypes.REAL,
    },
    total_charging_power: {
        type: DataTypes.REAL,
    },
    solar_panel_2_voltage: {
        type: DataTypes.REAL,
    },
    solar_panel_2_current: {
        type: DataTypes.REAL,
    },
    solar_panel_2_power: {
        type: DataTypes.REAL,
    },
    controller_battery_temperature: {
        type: DataTypes.REAL,
    },
    charging_upper_limit_temperature: {
        type: DataTypes.REAL,
    },
    charging_lower_limit_temperature: {
        type: DataTypes.REAL,
    },
    heat_sink_a_temperature: {
        type: DataTypes.REAL,
    },
    heat_sink_b_temperature: {
        type: DataTypes.REAL,
    },
    heat_sink_c_temperature: {
        type: DataTypes.REAL,
    },
    ambient_temperature: {
        type: DataTypes.REAL,
    },
    over_discharge_voltage: {
        type: DataTypes.REAL,
    },
    discharge_limiting_voltage: {
        type: DataTypes.REAL,
    },
    stop_charging_current: {
        type: DataTypes.REAL,
    },
    stop_charging_capacity: {
        type: DataTypes.INTEGER,
    },
    immediate_equalization_charge_command: {
        type: DataTypes.INTEGER,
    },
    load_voltage: {
        type: DataTypes.REAL,
    },
    load_current: {
        type: DataTypes.REAL,
    },
    load_power: {
        type: DataTypes.REAL,
    },
    battery_soc: {
        type: DataTypes.REAL,
    },
    grid_a_phase_voltage: {
        type: DataTypes.REAL,
    },
    grid_a_phase_current: {
        type: DataTypes.REAL,
    },
    grid_frequency: {
        type: DataTypes.REAL,
    },
    inverter_phase_a_voltage: {
        type: DataTypes.REAL,
    },
    inverter_phase_a_current: {
        type: DataTypes.REAL,
    },
    inverter_frequency: {
        type: DataTypes.REAL,
    },
    pv_charging_current: {
        type: DataTypes.REAL,
    },
    battery_charge_status: {
        type: DataTypes.INTEGER,
    },
    inverter_switch_status: {
        type: DataTypes.INTEGER,
    },
    charge_limit_voltage: {
        type: DataTypes.INTEGER,
    },
    errors: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'solar_data',
    timestamps: false,  // Disable Sequelize's automatic createdAt and updatedAt fields
});

// Synchronize the model with the database
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the SQLite database has been established successfully.');

        // Create the table if it doesn't exist
        await SolarData.sync();
        console.log('The table for the SolarData model was just (re)created!');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
    }
})();

export { sequelize, SolarData };
