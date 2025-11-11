<!-- filepath: c:\Users\matth\Documents\GitHub\webvm\src\lib\DocumentsTab.svelte -->
<script>
	import PanelButton from './PanelButton.svelte';
	import { createEventDispatcher } from 'svelte';
	var dispatch = createEventDispatcher();
	let state = "START";

	export let documentsDevice = null;

	async function handleAddFile()
	{
		if(state == "START")
		{
			state = "CONFIRM";
		}
		else if (state == "CONFIRM") {
			state = "ADDING";
			try
			{
				// Add a temporary file to the documents device
				await documentsDevice.writeFile("/tempfile.txt", "This is a temporary file added at " + new Date().toISOString() + "\n\nYou can edit or delete this file within the VM.");
				state = "SUCCESS";
				setTimeout(() => {
					// Refresh the page after 2 seconds
					window.location.reload();
				}, 2000);
			}
			catch(e)
			{
				console.error("Error adding file:", e);
				state = "ERROR";
				setTimeout(() => {
					state = "START";
				}, 3000);
			}
		}
	}

	function getButtonText(state)
	{
		if(state == "START")
			return "Add Temporary File";
		else if (state == "ADDING")
			return "Adding file...";
		else if (state == "SUCCESS")
			return "File added! Refreshing...";
		else if (state == "ERROR")
			return "Error adding file";
		else
			return "Add file. Confirm?";
	}

	function getBgColor(state)
	{
		if(state == "START")
		{
			// Use default
			return undefined;
		}
		else if (state == "ERROR")
		{
			return "bg-red-900";
		}
		else if (state == "SUCCESS")
		{
			return "bg-green-900";
		}
		else
		{
			return "bg-blue-900";
		}
	}

	function getHoverColor(state)
	{
		if(state == "START")
		{
			// Use default
			return undefined;
		}
		else
		{
			return state == "ERROR" ? "hover:bg-red-700" : "hover:bg-blue-700";
		}
	}
</script>

<h1 class="text-lg font-bold">Documents</h1>
<PanelButton buttonIcon="fa-solid fa-plus" clickHandler={handleAddFile} buttonText={getButtonText(state)} bgColor={getBgColor(state)} hoverColor={getHoverColor(state)}>
</PanelButton>
{#if state == "CONFIRM"}
	<p><span class="font-bold">Confirm: </span>Add a temporary file to /home/user/documents?</p>
{:else if state == "ADDING"}
	<p><span class="font-bold">Adding file: </span>Please wait...</p>
{:else if state == "SUCCESS"}
	<p><span class="font-bold">Success: </span>File added! The page will refresh shortly.</p>
{:else if state == "ERROR"}
	<p><span class="font-bold">Error: </span>Failed to add file. Please try again.</p>
{:else}
	<p>Add temporary files to the documents folder while the VM is running.</p>
	<p>Temporary files are stored in memory and will be available at <code>/home/user/documents/tempfile.txt</code></p>
	<p>The page will refresh after adding a file to ensure it's properly recognized by the system.</p>
{/if}
