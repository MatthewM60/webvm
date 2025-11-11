<!-- filepath: c:\Users\matth\Documents\GitHub\webvm\src\lib\FilesTab.svelte -->
<script>
	import PanelButton from './PanelButton.svelte';
	import { createEventDispatcher } from 'svelte';
	var dispatch = createEventDispatcher();
	export let terminal;
	let state = "START";
	let message = "";

	function handleAddFile()
	{
		if(state == "ADDING" || !terminal)
			return;
		
		state = "ADDING";
		message = "Creating file...";
		
		const timestamp = new Date().toLocaleString();
		const filename = "document_" + Date.now() + ".txt";
		
		// Use echo command to create a file in /home/user/files/
		const command = `mkdir -p /home/user/files && echo "This is a persistent file created at ${timestamp}\\n\\nYou can access this file at /home/user/files/${filename} within the VM.\\n\\nThis file will persist in the filesystem!" > /home/user/files/${filename}`;
		
		// Send the command to the terminal
		terminal.input(command);
		terminal.input("\n");
		
		state = "SUCCESS";
		message = `File created! Available at /home/user/files/${filename}`;
		
		// Reset after 3 seconds
		setTimeout(() => {
			state = "START";
			message = "";
		}, 3000);
	}

	function getButtonText(state)
	{
		if(state == "START")
			return "Create File";
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
	<p><span class="font-bold">Create Files: </span>Generate a new file in /home/user/files/ using a terminal command.</p>
	<p>Files are created in the main filesystem and will persist across page reloads.</p>
	<p>Check the terminal output to see the command execution.</p>
{/if}
