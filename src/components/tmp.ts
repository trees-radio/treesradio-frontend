// renameExtensions.js
import { $ } from "bun";
import fs from "fs";
import path from "path";

// Function to rename .jsx files to .tsx recursively
async function renameFiles(dir) {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            await renameFiles(fullPath); // Recursively process subdirectories
        } else if (file.isFile() && file.name.endsWith(".tsx")) {
            const newFilePath = fullPath.replace(/\.tsx$/, ".jsx");
            await fs.promises.rename(fullPath, newFilePath);
            console.log(`Renamed: ${fullPath} -> ${newFilePath}`);
        }
    }
}

// Run the function in the current directory
renameFiles(process.cwd()).catch(console.error);
