<script>
	import PanelButton from './PanelButton.svelte';
	import FileExplorer from './FileExplorer.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	let showExplorer = false;

	function handleOpenFolder() {
		showExplorer = true;
		dispatch('openFolder');
	}
</script>

<h1 class="text-lg font-bold">Files</h1>

<PanelButton
	buttonIcon="fas fa-folder-open"
	clickHandler={handleOpenFolder}
	buttonText="Open Folder"
/>

<p>Access your WebVM files, upload and download directly.</p>

{#if showExplorer}
	<FileExplorer on:close={() => (showExplorer = false)} />
{/if}