<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { files, currentPath, openFolder, uploadFile, downloadFile, getTree } from '../lib/filesystem.js';
	import TreeNode from './TreeNode.svelte';
	import { get } from 'svelte/store';

	const dispatch = createEventDispatcher();
	let localFiles = [];
	let path = "/";
	let isLoading = false;
	let tree = null;
	let expanded = new Set();

	onMount(async () => {
		await refresh("/");
		// also fetch a shallow tree to display the whole filesystem
		tree = await getTree("/", 5);
	});

	async function refresh(dir) {
		isLoading = true;
		await openFolder(dir);
		path = get(currentPath);
		localFiles = get(files);
		isLoading = false;
	}

	async function handleUpload(event) {
		const file = event.target.files[0];
		if (file) {
			await uploadFile(file, path);
			await refresh(path);
		}
	}

	async function handleDownload(file) {
		const fullPath = `${path}/${file.name}`;
		const data = await downloadFile(fullPath);
		const blob = new Blob([data.buffer || data]);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = file.name;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function openSubFolder(folder) {
		const newPath = `${path}/${folder.name}`;
		await refresh(newPath);
		// ensure folder is expanded in the tree view
		expanded.add(folder.path);
	}

	function toggleNode(node) {
		if (expanded.has(node.path)) expanded.delete(node.path);
		else expanded.add(node.path);
	}

	function selectFolder(node) {
		// open the folder and set selected path
		refresh(node.path);
	}

	function handleClose() {
		dispatch("close");
	}
</script>

<style>
	.modal {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	.window {
		background: #1e1e1e;
		color: white;
		border-radius: 8px;
		width: 700px;
		height: 500px;
		display: flex;
		flex-direction: column;
	}
	.header {
		padding: 8px 12px;
		background: #2d2d2d;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.file-list {
		flex: 1;
		overflow-y: auto;
		padding: 10px;
	}
	.content { display: flex; flex: 1; height: calc(100% - 44px); }
	.tree-pane { width: 260px; border-right: 1px solid rgba(255,255,255,0.03); overflow-y: auto; padding: 8px; }
	.files-pane { flex: 1; overflow-y: auto; padding: 10px; }
	.file-entry {
		padding: 4px 6px;
		cursor: pointer;
		border-radius: 6px;
	}
	.file-entry:hover {
		background: rgba(255,255,255,0.1);
	}
</style>

<div class="modal">
	<div class="window">
		<div class="header">
			<div>📂 {path}</div>
			<div class="space-x-2">
				<input type="file" on:change={handleUpload} />
				<button on:click={handleClose} class="text-red-400 hover:text-red-200">✖ Close</button>
			</div>
		</div>

		<div class="content">
			<div class="tree-pane">
				{#if tree}
					<ul class="tree-root">
						<TreeNode node={tree} {expanded} onToggle={toggleNode} onSelect={selectFolder} />
					</ul>
				{:else}
					<p>Loading filesystem...</p>
				{/if}
			</div>

			<div class="files-pane">
				{#if isLoading}
					<p>Loading...</p>
				{:else}
					{#each localFiles as file}
						<div class="file-entry" on:click={() => file.type === "folder" ? openSubFolder(file) : handleDownload(file)}>
							{file.type === "folder" ? "📁" : "📄"} {file.name}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>