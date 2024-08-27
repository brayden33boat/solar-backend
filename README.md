## Description
The SolarApp Backend is a Node.js application built to interface with PowMr hybrid inverters. It’s designed to be installed on a Raspberry Pi (or a similar device) with Wi-Fi and USB capabilities. This app connects directly to your PowMr inverter, providing real-time data and control options. I’m using this setup for my off-grid living, managing a "POW-LVM3K-24V-H" inverter, though it should work with all PowMr hybrid inverters. While this project began as a personal tool, I'm happy to help others who might need something similar.

## Setup
brew install python
python3 -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt

npm install -g node-gyp

//Pi shiz?
sudo apt-get update
sudo apt-get install -y build-essential python3 make g++
sudo apt-get install -y libsqlite3-dev

sudo apt install sqlite3 libsqlite3-dev


npm install