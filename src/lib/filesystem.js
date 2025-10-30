// src/lib/filesystem.js
import { writable } from 'svelte/store';

// ---------------------------------------------------------------------
// Stores (shared with the UI)
// ---------------------------------------------------------------------
export const fileTree      = writable([]);   // hierarchical tree
export const selectedPath  = writable('/'); // currently viewed folder
export const fileSystemStatus = writable('IDLE'); // IDLE | LOADING | ERROR

// ---------------------------------------------------------------------
// Helper: turn a flat FS listing into a tree node
// ---------------------------------------------------------------------
function buildNode(name, isDir, size = 0, children = []) {
	return { name, isDir, size, children, expanded: false };
}

// ---------------------------------------------------------------------
// Load a directory (recursively for the tree)
// ---------------------------------------------------------------------
async function loadDirectory(path, parentNode = null) {
	try {
		const entries = await FS.readdir(path);                // WebVM FS API
		const nodes = [];

		for (const entry of entries) {
				// skip . and ..
			if (entry === '.' || entry === '..') continue;

			const full = `${path}/${entry}`.replace('//', '/');
			const stat = await FS.stat(full);

			if (stat.isDirectory) {
				const node = buildNode(entry, true);
				nodes.push(node);
				// load children lazily when the node is expanded
			} else {
				nodes.push(buildNode(entry, false, stat.size));
			}
		}

		// sort: folders first, then files
		nodes.sort((a, b) => {
			if (a.isDir && !b.isDir) return -1;
			if (!a.isDir && b.isDir) return 1;
			return a.name.localeCompare(b.name);
		});

		if (parentNode) {
			parentNode.children = nodes;
			parentNode.expanded = true;
		}
		return nodes;
	} catch (e) {
		console.error('FS error', e);
		throw e;
	}
}

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------
export async function openRoot() {
	fileSystemStatus.set('LOADING');
	try {
		const rootNode = buildNode('/', true);
		rootNode.children = await loadDirectory('/');
		fileTree.set([rootNode]);
		selectedPath.set('/');
		fileSystemStatus.set('IDLE');
	} catch (e) {
		fileSystemStatus.set('ERROR');
	}
}

/** Expand a folder in the tree (lazy load) */
export async function expandNode(nodePath) {
	// find the node in the current tree
	const updateTree = (tree) => {
		for (const n of tree) {
			if (`${selectedPath}/${n.name}`.replace('//', '/') === nodePath) {
				if (!n.expanded) {
					fileSystemStatus.set('LOADING');
					loadDirectory(nodePath, n).finally(() => fileSystemStatus.set('IDLE'));
				}
				return true;
			}
			if (n.isDir && n.children && updateTree(n.children)) return true;
		}
		return false;
	};
	fileTree.update(t => { updateTree(t); return t; });
}

/** Change the viewed folder (right pane) */
export async function openFolder(path) {
	fileSystemStatus.set('LOADING');
	try {
		const nodes = await loadDirectory(path);
		// store flat list for the table view
		fileList.set(nodes);
		selectedPath.set(path);
		fileSystemStatus.set('IDLE');
	} catch (e) {
		fileSystemStatus.set('ERROR');
	}
}

/** Flat list for the current folder (used by the table) */
export const fileList = writable([]);

/** Upload a File / DataTransferItemList */
export async function uploadFiles(path, files) {
	fileSystemStatus.set('UPLOADING');
	try {
		for (const file of files) {
			const arrayBuffer = await file.arrayBuffer();
			const fullPath = `${path}/${file.name}`.replace('//', '/');
			FS.writeFile(fullPath, new Uint8Array(arrayBuffer), { encoding: 'binary' });
		}
		// refresh current view
		await openFolder(path);
		fileSystemStatus.set('IDLE');
	} catch (e) {
		console.error(e);
		fileSystemStatus.set('ERROR');
	}
}

/** Download a file */
export function downloadFile(path, name) {
	const data = FS.readFile(path, { encoding: 'binary' });
	const blob = new Blob([data], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = name;
	a.click();
	URL.revokeObjectURL(url);
}

/** Delete */
export async function deletePath(path) {
	await FS.unlink(path);
	await openFolder(selectedPath.get());
	await refreshTreeNode(selectedPath.get());
}

/** Create folder */
export async function createFolder(parent, name) {
	const p = `${parent}/${name}`.replace('//', '/');
	FS.mkdir(p);
	await openFolder(parent);
	await refreshTreeNode(parent);
}

/** Helper – refresh a tree node after mutation */
async function refreshTreeNode(path) {
	const update = (tree) => {
		for (const n of tree) {
			const nodeFull = `${selectedPath.get()}/${n.name}`.replace('//', '/');
			if (nodeFull === path) {
				loadDirectory(path, n);
				return true;
			}
			if (n.isDir && n.children && update(n.children)) return true;
		}
		return false;
	};
	fileTree.update(t => { update(t); return t; });
}