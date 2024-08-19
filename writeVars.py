import os
import sys
import json
from pymodbus.client import ModbusSerialClient
from pymodbus.exceptions import ModbusIOException
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Retrieve the variables from the environment
port = os.getenv('MODBUS_PORT')
baudrate = int(os.getenv('MODBUS_BAUDRATE', 9600))
timeout = int(os.getenv('MODBUS_TIMEOUT', 3))
parity = os.getenv('MODBUS_PARITY', 'N')
stopbits = int(os.getenv('MODBUS_STOPBITS', 1))
bytesize = int(os.getenv('MODBUS_BYTESIZE', 8))

# Map register names to addresses
register_map = {
    'pv_max_charging_current': 0xE001, # Photovoltaic maximum charging current setting
    'battery_nominal_capacity': 0xE002, # Battery nominal capacity
    'battery_type': 0xE004,            # Battery type
    'overvoltage': 0xE005,             # Overvoltage protection point
    'charge_limit_voltage': 0xE006,    # Charge limit voltage
    'balanced_charge_voltage': 0xE007, # Balanced charging voltage
    'boost_charge_voltage': 0xE008,    # Boost charging voltage/overcharge voltage
    'float_charge_voltage': 0xE009,    # Float charge voltage
    'boost_charge_return_voltage': 0xE00A, # Boost charge return voltage
    'undervoltage_warning_voltage': 0xE00C, # Undervoltage warning voltage
    'over_discharge_voltage': 0xE00D,  # Over-discharge voltage
    'discharge_cutoff_soc': 0xE00F,    # Discharge cut-off SOC
    'inverter_switch': 0xDF00,         # Inverter switch control
}

def write_register(register_name, value):
    result = {
        "status": "error",
        "message": "",
        "register_name": register_name,
        "address": None,
        "value": value
    }

    if register_name not in register_map:
        result["message"] = f"Register '{register_name}' not found in the register map."
        print(json.dumps(result))
        return

    address = register_map[register_name]
    result["address"] = hex(address)

    # Initialize the Modbus client
    client = ModbusSerialClient(
        port=port,
        baudrate=baudrate,
        timeout=timeout,
        parity=parity,
        stopbits=stopbits,
        bytesize=bytesize
    )

    try:
        if client.connect():
            result["message"] = f"Connected to Modbus device on port {port}"
            # Write value to the register
            response = client.write_register(address, value)
            if isinstance(response, ModbusIOException):
                result["message"] = f"Failed to write to register: {response}"
            else:
                result["status"] = "success"
                result["message"] = f"Successfully wrote value {value} to register '{register_name}' at address {hex(address)}"
        else:
            result["message"] = "Failed to connect to the Modbus device."
    finally:
        client.close()
    
    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({
            "status": "error",
            "message": "Usage: python script.py <register_name> <value>"
        }))
        sys.exit(1)

    register_name = sys.argv[1]
    value = int(sys.argv[2])

    write_register(register_name, value)