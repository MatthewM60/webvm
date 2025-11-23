<!-- filepath: c:\Users\matth\Documents\GitHub\webvm\src\lib\FilesTab.svelte -->
<script>
	import PanelButton from './PanelButton.svelte';
	import { createEventDispatcher } from 'svelte';
	var dispatch = createEventDispatcher();
	export let terminal;
	let state = "START";
	let message = "";

	function handleOpenUploadModal()
	{
		dispatch('openUploadModal');
	}

	function handleOpenDownloadModal()
	{
		dispatch('openDownloadModal');
	}
</script>

<h1 class="text-lg font-bold">Files</h1>
<div class="flex flex-col gap-2">
	<PanelButton 
		buttonIcon="fa-solid fa-upload" 
		clickHandler={handleOpenUploadModal} 
		buttonText="Upload File"
		bgColor="bg-blue-900"
		hoverColor="hover:bg-blue-700">
	</PanelButton>
	<PanelButton 
		buttonIcon="fa-solid fa-download" 
		clickHandler={handleOpenDownloadModal} 
		buttonText="Download File"
		bgColor="bg-purple-900"
		hoverColor="hover:bg-purple-700">
	</PanelButton>
</div>
{#if message}
	<p class="{state === 'SUCCESS' ? 'text-green-400' : state === 'ERROR' ? 'text-red-400' : 'text-blue-400'}">
		<span class="font-bold">{state === 'SUCCESS' ? 'Success: ' : state === 'ERROR' ? 'Error: ' : 'Info: '}</span>{message}
	</p>
{:else}
	<p><span class="font-bold">Upload Files: </span>Click the upload button to open a file picker and upload files from your computer to the VM's folder: /home/user/files.</p>
	<p><span class="font-bold">Download Files: </span>Click the download button to retrieve files from /home/user/files/ to your computer.</p>
	<p>Files are stored in the main filesystem and will persist across page reloads.</p>
{/if}

