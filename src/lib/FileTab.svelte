<!-- src/lib/FilesPanel.svelte  (or wherever you kept the original) -->
<script>
	import FileExplorer from './FileExplorer.svelte';
	import PanelButton from './PanelButton.svelte';
	import { createEventDispatcher } from 'svelte';
	import { fileSystemStatus, openRoot } from './filesystem.js';

	const dispatch = createEventDispatcher();
	let buttonState = 'IDLE';

	$: buttonState = $fileSystemStatus;   // sync with backend store

	async function handleOpen() {
		buttonState = 'OPENING';
		await openRoot();                 // now opens the full explorer
		buttonState = 'IDLE';
	}
</script>

<h1 class="text-lg font-bold">Files</h1>

<PanelButton
	buttonIcon={buttonState === 'OPENING' ? 'fas fa-spinner fa-spin' : 'fas fa-folder-open'}
	clickHandler={handleOpen}
	buttonText={buttonState === 'OPENING' ? 'Opening…' : 'Open Folder'}
	bgColor={buttonState === 'OPENING' ? 'bg-blue-900' : undefined}
	hoverColor={buttonState === 'OPENING' ? 'hover:bg-blue-700' : undefined}
/>

{#if buttonState === 'OPENING'}
	<p><span class="font-bold">Opening folder…</span> Please wait.</p>
{:else}
	<p>Access your file directory and manage files within WebVM.</p>
{/if}

<!-- The full explorer replaces the placeholder -->
<FileExplorer />