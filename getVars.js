import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Full path to the Python interpreter in the virtual environment
const pythonPath = path.join(__dirname, 'myenv', 'bin', 'python3');

function getSolarData(callback) {
    exec(`${pythonPath} getVars.py`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            callback(error, null);
            return;
        }

        if (stderr) {
            console.error(`Error in Python script: ${stderr}`);
            callback(new Error(stderr), null);
            return;
        }

        try {
            // Parse the JSON output from the Python script
            const data = JSON.parse(stdout);
            callback(null, data);
        } catch (parseError) {
            console.error(`Error parsing JSON: ${parseError.message}`);
            callback(parseError, null);
        }
    });
}

export default getSolarData;