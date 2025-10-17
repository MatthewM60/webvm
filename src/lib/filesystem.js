// src/lib/filesystem.js
import { writable } from 'svelte/store';

export const fileSystemState = writable("IDLE");
export const currentPath = writable("/");
export const files = writable([]);

// Placeholder function for opening a folder
export async function openFolder(path = "/") {
	fileSystemState.set("OPENING");
	
	try {
		// Future: this could call WebVM's FS API or fetch from backend
		console.log(`Opening folder at path: ${path}`);
		await new Promise((r) => setTimeout(r, 500)); // simulate async load
		
		// Simulated example files
		files.set([
			{ name: "example.txt", type: "file", size: "2 KB" },
			{ name: "Documents", type: "folder" },
		]);
		
		currentPath.set(path);
		fileSystemState.set("OPENED");
	} catch (err) {
		console.error("Failed to open folder:", err);
		fileSystemState.set("ERROR");
	}
}

export async function uploadFile(file) {
	fileSystemState.set("UPLOADING");
	try {
		console.log("Uploading file:", file.name);
		await new Promise((r) => setTimeout(r, 700));
		fileSystemState.set("OPENED");
	} catch (err) {
		console.error("Upload failed:", err);
		fileSystemState.set("ERROR");
	}
}

export function updateButtonData(state, handleOpenFolder) {
	switch (state) {
		case "IDLE":
		case "OPENED":
			return {
				buttonText: "Open Folder",
				isClickable: true,
				clickHandler: handleOpenFolder,
				buttonIcon: "fas fa-folder-open",
			};
		case "OPENING":
			return {
				buttonText: "Opening...",
				isClickable: false,
				buttonIcon: "fas fa-spinner fa-spin",
			};
		case "UPLOADING":
			return {
				buttonText: "Uploading...",
				isClickable: false,
				buttonIcon: "fas fa-cloud-upload-alt",
			};
		case "ERROR":
			return {
				buttonText: "Error - Retry?",
				isClickable: true,
				clickHandler: handleOpenFolder,
				buttonIcon: "fas fa-exclamation-triangle",
			};
		default:
			return {
				buttonText: "Open Folder",
				isClickable: true,
				clickHandler: handleOpenFolder,
				buttonIcon: "fas fa-folder-open",
			};
	}
}