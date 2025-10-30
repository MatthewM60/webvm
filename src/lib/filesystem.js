// src/lib/filesystem.js
import { writable } from 'svelte/store';

export const fileSystemState = writable("IDLE");
export const currentPath = writable("/");
export const files = writable([]);

// Helper to read directory contents
async function readDir(path) {
	// normalize path to avoid double slashes
	const p = normalizePath(path);
	const entries = await cx.fileSystem.readdir(p);
	const result = [];

	for (const name of entries) {
		const itemPath = normalizePath(`${p}/${name}`);
		const stat = await cx.fileSystem.stat(itemPath);
		result.push({
			name,
			type: stat.isDir ? "folder" : "file",
			size: stat.size || null,
			path: itemPath
		});
	}

	return result;
}

function normalizePath(path) {
	if (!path || path === "") return "/";
	// replace multiple slashes with a single slash
	const p = path.replace(/\/+/g, '/');
	// remove trailing slash except root
	if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
	return p;
}

// Recursively build a tree representation of the filesystem starting at `path`.
// depthLimit prevents runaway recursion; pass null for unlimited (not recommended).
export async function getTree(path = "/", depthLimit = 5) {
	const p = normalizePath(path);
	const node = {
		name: p === "/" ? "/" : p.split('/').pop(),
		path: p,
		type: "folder",
		children: []
	};

	if (depthLimit === 0) return node;

	try {
		const entries = await readDir(p);
		for (const e of entries) {
			if (e.type === 'folder') {
				node.children.push(await getTree(e.path, depthLimit == null ? null : depthLimit - 1));
			} else {
				node.children.push({ name: e.name, path: e.path, type: 'file', size: e.size });
			}
		}
	} catch (err) {
		console.error('getTree failed for', p, err);
	}

	return node;
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
		const p = normalizePath(path);
		await cx.fileSystem.writeFile(`${p}/${file.name}`, new Uint8Array(arrayBuffer));
		fileSystemState.set("OPENED");
	} catch (err) {
		console.error("Upload failed:", err);
		fileSystemState.set("ERROR");
	}
}

// Download helper that returns a Uint8Array for the given file path.
export async function downloadFile(path) {
	try {
		const p = normalizePath(path);
		const data = await cx.fileSystem.readFile(p, { encoding: 'binary' });
		// Some backends may return ArrayBuffer or Uint8Array
		if (data instanceof Uint8Array) return data;
		if (data instanceof ArrayBuffer) return new Uint8Array(data);
		// If it's a string, convert to binary bytes
		if (typeof data === 'string') {
			const encoder = new TextEncoder();
			return encoder.encode(data);
		}
		return new Uint8Array([]);
	} catch (err) {
		console.error('downloadFile failed:', err);
		throw err;
	}
}