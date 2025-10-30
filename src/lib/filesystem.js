// src/lib/filesystem.js
import { writable } from 'svelte/store';

export const fileSystemState = writable("IDLE");
export const currentPath = writable("/");
export const files = writable([]);

// Helper to read directory contents
async function readDir(path) {
	const entries = await cx.fileSystem.readdir(path);
	const result = [];

	for (const name of entries) {
		const stat = await cx.fileSystem.stat(`${path}/${name}`);
		result.push({
			name,
			type: stat.isDir ? "folder" : "file",
			size: stat.size || null
		});
	}

	return result;
}

export async function openFolder(path = "/") {
	fileSystemState.set("OPENING");
	try {
		const dirContents = await readDir(path);
		files.set(dirContents);
		currentPath.set(path);
		fileSystemState.set("OPENED");
	} catch (err) {
		console.error("Failed to open folder:", err);
		fileSystemState.set("ERROR");
	}
}

export async function uploadFile(file, path = "/") {
	fileSystemState.set("UPLOADING");
	try {
		const arrayBuffer = await file.arrayBuffer();
		await cx.fileSystem.writeFile(`${path}/${file.name}`, new Uint8Array(arrayBuffer));
		fileSystemState.set("OPENED");
	} catch (err) {
		console.error("Upload failed:", err);
		fileSystemState.set("ERROR");
	}
}