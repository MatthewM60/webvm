<script>
	import PanelButton from './PanelButton.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let state = "IDLE";

	function handleOpenFolder() {
		state = "OPENING";
		dispatch('openFolder'); // Event for the parent or future GUI
		setTimeout(() => (state = "IDLE"), 1000); // resets button text after a short delay
	}

	function getButtonText(state) {
		if (state === "OPENING") return "Opening...";
		return "Open Folder";
	}

	function getBgColor(state) {
		if (state === "OPENING") return "bg-blue-900";
		return undefined;
	}

	function getHoverColor(state) {
		if (state === "OPENING") return "hover:bg-blue-700";
		return undefined;
	}
</script>

<h1 class="text-lg font-bold">Files</h1>

<PanelButton
	buttonIcon="fas fa-folder-open"
	clickHandler={handleOpenFolder}
	buttonText={getButtonText(state)}
	bgColor={getBgColor(state)}
	hoverColor={getHoverColor(state)}
/>

{#if state === "OPENING"}
	<p><span class="font-bold">Opening folder...</span> Please wait.</p>
{:else}
	<p>Access your file directory and manage files within WebVM.</p>
{/if}

<p>Click “Open Folder” to browse or upload files. The full directory GUI will appear here later.</p>