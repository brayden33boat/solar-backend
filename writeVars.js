import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace with the path to your Python script
const pythonScriptPath = path.join(__dirname, 'your_python_script.py');

/**
 * Writes a value to a specified Modbus register using a Python script.
 * @param {string} registerName - The name of the register to write to.
 * @param {number} value - The value to write to the register.
 * @returns {Promise<Object>} - A promise that resolves with the JSON output of the Python script.
 */
export async function writeToRegister(registerName, value) {
  return new Promise((resolve, reject) => {
    execFile('python', [pythonScriptPath, registerName, value], (error, stdout, stderr) => {
      if (error) {
        return reject(`Error executing Python script: ${error.message}`);
      }

      if (stderr) {
        return reject(`Python script stderr: ${stderr}`);
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseError) {
        reject(`Error parsing JSON: ${parseError.message}\nRaw output: ${stdout}`);
      }
    });
  });
}
