import sys
import json
import os
from pymodbus.client import ModbusSerialClient
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Retrieve the variables
port = os.getenv('MODBUS_PORT')
baudrate = int(os.getenv('MODBUS_BAUDRATE'))
timeout = int(os.getenv('MODBUS_TIMEOUT'))
parity = os.getenv('MODBUS_PARITY')
stopbits = int(os.getenv('MODBUS_STOPBITS'))
bytesize = int(os.getenv('MODBUS_BYTESIZE'))

def read_register(client, address, description, scaling_factor=1, errors=[]):
    try:
        response = client.read_holding_registers(address=address, count=1)
        if response.isError():
            error_message = f"Error reading {description} at address {hex(address)}"
            errors.append(error_message)
            return None
        else:
            value = response.registers[0] * scaling_factor
            return value
    except Exception as e:
        error_message = f"An error occurred while reading {description} at address {hex(address)}: {e}"
        errors.append(error_message)
        return None

def main():
    client = ModbusSerialClient(
        port=port,
        baudrate=baudrate,
        timeout=timeout,
        parity=parity,
        stopbits=stopbits,
        bytesize=bytesize
    )

    if not client.connect():
        print("Failed to connect to Modbus device")
        sys.exit(1)

    # Dictionary to store the results
    data = {}
    errors = []

    try:
        # Assume the slave address is 1
        slave_address = 1
        client.unit_id = slave_address

        # Read multiple variables and store the results in the dictionary
        data["battery_soc"] = read_register(client, 0x0100, "Battery SOC", scaling_factor=1, errors=errors)
        data["battery_voltage"] = read_register(client, 0x0101, "Battery Voltage", scaling_factor=0.1, errors=errors)
        data["battery_current"] = read_register(client, 0x0102, "Battery Current", scaling_factor=0.1, errors=errors)
        data["device_temperature"] = read_register(client, 0x0103, "Device Temperature", scaling_factor=1, errors=errors)
        data["solar_panel_1_voltage"] = read_register(client, 0x0107, "Solar Panel 1 Voltage", scaling_factor=0.1, errors=errors)
        data["solar_panel_1_current"] = read_register(client, 0x0108, "Solar Panel 1 Current", scaling_factor=0.1, errors=errors)
        data["solar_panel_1_power"] = read_register(client, 0x0109, "Solar Panel 1 Power", scaling_factor=1, errors=errors)
        data["total_power_of_solar_panels"] = read_register(client, 0x010A, "Total Power of Solar Panels", scaling_factor=1, errors=errors)
        data["total_charging_power"] = read_register(client, 0x010E, "Total Charging Power", scaling_factor=1, errors=errors)
        data["solar_panel_2_voltage"] = read_register(client, 0x010F, "Solar Panel 2 Voltage", scaling_factor=0.1, errors=errors)
        data["solar_panel_2_current"] = read_register(client, 0x0110, "Solar Panel 2 Current", scaling_factor=0.1, errors=errors)
        data["solar_panel_2_power"] = read_register(client, 0x0111, "Solar Panel 2 Power", scaling_factor=1, errors=errors)
        data["load_voltage"] = read_register(client, 0x0112, "Load Voltage", scaling_factor=0.1, errors=errors)
        data["load_current"] = read_register(client, 0x0113, "Load Current", scaling_factor=0.1, errors=errors)
        data["load_power"] = read_register(client, 0x0114, "Load Power", scaling_factor=1, errors=errors)
        data["grid_a_phase_voltage"] = read_register(client, 0x0213, "Grid A Phase Voltage", scaling_factor=0.1, errors=errors)
        data["grid_a_phase_current"] = read_register(client, 0x0214, "Grid A Phase Current", scaling_factor=0.1, errors=errors)
        data["grid_frequency"] = read_register(client, 0x0215, "Grid Frequency", scaling_factor=0.01, errors=errors)
        data["inverter_phase_a_voltage"] = read_register(client, 0x0216, "Inverter Phase A Voltage", scaling_factor=0.1, errors=errors)
        data["inverter_phase_a_current"] = read_register(client, 0x0217, "Inverter Phase A Current", scaling_factor=0.1, errors=errors)
        data["inverter_frequency"] = read_register(client, 0x0218, "Inverter Frequency", scaling_factor=0.01, errors=errors)
        data["load_phase_a_current"] = read_register(client, 0x0219, "Load Phase A Current", scaling_factor=0.1, errors=errors)
        data["load_phase_a_active_power"] = read_register(client, 0x021B, "Load Phase A Active Power", scaling_factor=1, errors=errors)
        data["heat_sink_a_temperature"] = read_register(client, 0x0220, "Heat Sink A Temperature", scaling_factor=0.1, errors=errors)
        data["heat_sink_b_temperature"] = read_register(client, 0x0221, "Heat Sink B Temperature", scaling_factor=0.1, errors=errors)
        data["heat_sink_c_temperature"] = read_register(client, 0x0222, "Heat Sink C Temperature", scaling_factor=0.1, errors=errors)
        data["ambient_temperature"] = read_register(client, 0x0223, "Ambient Temperature", scaling_factor=0.1, errors=errors)
        data["pv_charging_current"] = read_register(client, 0x0224, "PV Charging Current", scaling_factor=0.1, errors=errors)
        data["discharge_limiting_voltage"] = read_register(client, 0xE00E, "Discharge Limiting Voltage", scaling_factor=0.1, errors=errors)
    

    except Exception as e:
        errors.append(f"An error occurred: {e}")
    
    client.close()

    # Add errors to the data dictionary
    data["errors"] = errors

    # Output the data as JSON
    print(json.dumps(data, indent=4))

if __name__ == "__main__":
    main()
