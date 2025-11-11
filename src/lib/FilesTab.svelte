<!-- filepath: c:\Users\matth\Documents\GitHub\webvm\src\lib\FilesTab.svelte -->
<script>
	import PanelButton from './PanelButton.svelte';
	import { createEventDispatcher } from 'svelte';
	var dispatch = createEventDispatcher();
	export let dataDevice;
	let state = "START";
	let message = "";

	async function handleAddFile()
	{
		if(state == "ADDING" || !dataDevice)
			return;
		
		state = "ADDING";
		message = "Adding file...";
		
		try
		{
			const timestamp = new Date().toLocaleString();
			const fileContent = `This is a temporary file created at ${timestamp}\n\nYou can access this file at /tmp/temp_document.txt within the VM.`;
			
			// Write the file to the DataDevice at /tmp/temp_document.txt
			await dataDevice.writeFile("/tmp/temp_document.txt", fileContent);
			
			state = "SUCCESS";
			message = "File created! Available at /tmp/temp_document.txt";
			
			// Reset after 3 seconds
			setTimeout(() => {
				state = "START";
				message = "";
			}, 3000);
		}
		catch(error)
		{
			state = "ERROR";
			message = `Error: ${error.message}`;
			
			// Reset after 3 seconds
			setTimeout(() => {
				state = "START";
				message = "";
			}, 3000);
		}
	}

	function getButtonText(state)
	{
		if(state == "START")
			return "Create Temp File";
		else if (state == "ADDING")
			return "Creating...";
		else if (state == "SUCCESS")
			return "File Created!";
		else
			return "Error Creating File";
	}

	function getBgColor(state)
	{
		if(state == "START")
		{
			// Use default
			return undefined;
		}
		else if (state == "SUCCESS")
		{
			return "bg-green-900";
		}
		else if (state == "ERROR")
		{
			return "bg-red-900";
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
		else if (state == "SUCCESS")
		{
			return "hover:bg-green-700";
		}
		else if (state == "ERROR")
		{
			return "hover:bg-red-700";
		}
		else
		{
			return "hover:bg-blue-700";
		}
	}
</script>

<h1 class="text-lg font-bold">Files</h1>
<PanelButton 
	buttonIcon="fa-solid fa-file-plus" 
	clickHandler={handleAddFile} 
	buttonText={getButtonText(state)} 
	bgColor={getBgColor(state)} 
	hoverColor={getHoverColor(state)}>
</PanelButton>
{#if message}
	<p class="{state === 'SUCCESS' ? 'text-green-400' : state === 'ERROR' ? 'text-red-400' : 'text-blue-400'}">
		<span class="font-bold">{state === 'SUCCESS' ? 'Success: ' : state === 'ERROR' ? 'Error: ' : 'Info: '}</span>{message}
	</p>
{:else}
	<p><span class="font-bold">Temporary Files: </span>Create temporary files that will be available in /tmp/ within the VM.</p>
	<p>These files are stored in memory and will be lost when the VM is refreshed.</p>
	<p>Useful for passing data from the browser to the virtual machine at runtime.</p>
{/if}
