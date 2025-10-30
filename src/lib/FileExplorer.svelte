<!-- src/lib/FileExplorer.svelte -->
<script>
	import { onMount } from 'svelte';
	import { fileTree, selectedPath, fileList, fileSystemStatus,
	         openRoot, expandNode, openFolder, uploadFiles,
	         downloadFile, deletePath, createFolder } from './filesystem.js';

	let dragOver = false;
	let contextMenu = { show: false, x: 0, y: 0, path: '', name: '' };

	// -----------------------------------------------------------------
	// Boot the VM (you probably already have this somewhere)
	// -----------------------------------------------------------------
	onMount(async () => {
		// Wait until WebVM exposes FS
		while (!window.FS) await new Promise(r => setTimeout(r, 50));
		await openRoot();
	});

	// -----------------------------------------------------------------
	// Tree node component (recursive)
	// -----------------------------------------------------------------
	const TreeNode = ({ node, depth = 0 }) => `
		<div style="padding-left: ${depth * 16}px;" class="flex items-center hover:bg-gray-100 cursor-pointer"
		     on:click|stopPropagation={() => handleNodeClick(node)}>
			${node.isDir
				? `<i class="fas ${node.expanded ? 'fa-folder-open' : 'fa-folder'} mr-1"></i>`
				: `<i class="fas fa-file mr-1"></i>`}
			<span>${node.name}</span>
		</div>
		${node.isDir && node.expanded
			? node.children.map(child => TreeNode({ node: child, depth: depth + 1 })).join('')
			: ''}
	`;

	async function handleNodeClick(node) {
		const full = `${$selectedPath}/${node.name}`.replace('//', '/');
		if (node.isDir) {
			if (!node.expanded) await expandNode(full);
			await openFolder(full);
		}
	}

	// -----------------------------------------------------------------
	// Drag & Drop upload
	// -----------------------------------------------------------------
	function handleDrop(e) {
		e.preventDefault();
		dragOver = false;
		const items = [...e.dataTransfer.items].map(i => i.webkitGetAsEntry?.() ?? i.getAsFile?.()).filter(Boolean);
		const files = items.filter(f => f.isFile).map(f => f.file(file => file));
		if (files.length) uploadFiles($selectedPath, files);
	}

	// -----------------------------------------------------------------
	// Context menu (right-click on file/folder)
	// -----------------------------------------------------------------
	function showContext(e, path, name, isDir) {
		e.preventDefault();
		contextMenu = { show: true, x: e.clientX, y: e.clientY, path, name, isDir };
	}
	function hideContext() { contextMenu = { show: false }; }

	// -----------------------------------------------------------------
	// Actions from context menu
	// -----------------------------------------------------------------
	async function ctxDownload() {
		downloadFile(contextMenu.path, contextMenu.name);
		hideContext();
	}
	async function ctxDelete() {
		if (confirm(`Delete ${contextMenu.name}?`)) {
			await deletePath(contextMenu.path);
		}
		hideContext();
	}
	async function ctxNewFolder() {
		const name = prompt('Folder name');
		if (name) await createFolder($selectedPath, name);
		hideContext();
	}
</script>

<div class="flex h-full">
	<!-- ================== LEFT TREE ================== -->
	<div class="w-64 border-r overflow-y-auto p-2 bg-gray-50">
		{#if $fileTree.length}
			{#each $fileTree as root}
				{@html TreeNode({ node: root })}
			{/each}
		{:else}
			<p class="text-gray-500">Loading…</p>
		{/if}
	</div>

	<!-- ================== RIGHT LIST ================== -->
	<div class="flex-1 p-4"
	     on:dragover|preventDefault={() => dragOver = true}
	     on:dragleave={() => dragOver = false}
	     on:drop|preventDefault={handleDrop}
	     class:drag-over={dragOver}>

		<div class="flex justify-between items-center mb-3">
			<h2 class="text-xl font-semibold">{$selectedPath}</h2>
			<button class="px-3 py-1 bg-blue-600 text-white rounded"
			        on:click={ctxNewFolder}>
				<i class="fas fa-folder-plus mr-1"></i>New Folder
			</button>
		</div>

		{#if $fileSystemStatus === 'LOADING'}
			<p><i class="fas fa-spinner fa-spin"></i> Loading…</p>
		{:else if $fileSystemStatus === 'ERROR'}
			<p class="text-red-600">Error loading folder.</p>
		{:else}
			<table class="w-full table-auto border">
				<thead class="bg-gray-200">
					<tr>
						<th class="px-2 py-1 text-left">Name</th>
						<th class="px-2 py-1 w-24">Size</th>
						<th class="px-2 py-1 w-20">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each $fileList as entry}
						<tr class="hover:bg-gray-100"
						    on:contextmenu={(e) => showContext(e,
						              `${$selectedPath}/${entry.name}`.replace('//','/'),
						              entry.name, entry.isDir)}>
							<td class="px-2 py-1 flex items-center">
								<i class="fas mr-2 {entry.isDir ? 'fa-folder text-yellow-600' : 'fa-file'}"></i>
								<span class="truncate">{entry.name}</span>
							</td>
							<td class="px-2 py-1 text-right">
								{entry.isDir ? '—' : (entry.size/1024).toFixed(1) + ' KB'}
							</td>
							<td class="px-2 py-1 text-center">
								{#if !entry.isDir}
									<button class="text-xs text-blue-600"
									        on:click={() => downloadFile(`${$selectedPath}/${entry.name}`.replace('//','/'), entry.name)}>
										<i class="fas fa-download"></i>
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<p class="mt-4 text-sm text-gray-600">
				Drag files here to upload, or right-click for more options.
			</p>
		{/if}
	</div>
</div>

<!-- ================== CONTEXT MENU ================== -->
{#if contextMenu.show}
	<div class="fixed bg-white shadow-lg border rounded py-1 z-50"
	     style="left:{contextMenu.x}px; top:{contextMenu.y}px;"
	     on:click|stopPropagation on:contextmenu|preventDefault>
		{#if !contextMenu.isDir}
			<button class="block w-full text-left px-4 py-1 hover:bg-gray-100"
			        on:click={ctxDownload}>Download</button>
		{/if}
		<button class="block w-full text-left px-4 py-1 hover:bg-gray-100 text-red-600"
		        on:click={ctxDelete}>Delete</button>
	</div>
{/if}

<svelte:window on:click={hideContext} on:contextmenu={hideContext}/>

<style>
	.drag-over { @apply border-2 border-dashed border-blue-500 bg-blue-50; }
</style>