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
        data["battery_voltage"] = read_register(client, 0x0101, "Battery Voltage", scaling_factor=0.1, errors=errors)
        data["battery_current"] = read_register(client, 0x0102, "Battery Current", scaling_factor=0.1, errors=errors)
        data["solar_panel_1_voltage"] = read_register(client, 0x0107, "Solar Panel 1 Voltage", scaling_factor=0.1, errors=errors)
        data["solar_panel_1_current"] = read_register(client, 0x0108, "Solar Panel 1 Current", scaling_factor=0.1, errors=errors)
        data["solar_panel_1_power"] = read_register(client, 0x0109, "Solar Panel 1 Power", scaling_factor=1, errors=errors)
        data["total_power_of_solar_panels"] = read_register(client, 0x010A, "Total Power of Solar Panels", scaling_factor=1, errors=errors)
        data["total_charging_power"] = read_register(client, 0x010E, "Total Charging Power", scaling_factor=1, errors=errors)
        data["solar_panel_2_voltage"] = read_register(client, 0x010F, "Solar Panel 2 Voltage", scaling_factor=0.1, errors=errors)
        data["solar_panel_2_current"] = read_register(client, 0x0110, "Solar Panel 2 Current", scaling_factor=0.1, errors=errors)
        data["solar_panel_2_power"] = read_register(client, 0x0111, "Solar Panel 2 Power", scaling_factor=1, errors=errors)


    except Exception as e:
        errors.append(f"An error occurred: {e}")
        sys.exit(1)
    
    client.close()

    # Add errors to the data dictionary
    data["errors"] = errors

    # Output the data as JSON
    print(json.dumps(data, indent=4))

if __name__ == "__main__":
    main()