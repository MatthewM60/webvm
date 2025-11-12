<!-- filepath: c:\Users\matth\Documents\GitHub\webvm\src\lib\FilesTab.svelte -->
<script>
	import PanelButton from './PanelButton.svelte';
	import { createEventDispatcher } from 'svelte';
	var dispatch = createEventDispatcher();
	export let terminal;
	let state = "START";
	let message = "";
	let fileInput;

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

	function triggerFileInput()
	{
		fileInput.click();
	}

	async function handleFileUpload(event)
	{
		if(state == "ADDING" || !terminal)
			return;
		
		const files = event.target.files;
		if(!files || files.length === 0)
			return;
		
		const file = files[0];
		state = "ADDING";
		message = `Uploading ${file.name}...`;
		
		try
		{
			// Read the file contents
			const fileContent = await file.text();
			const filename = file.name;
			
			// Create the command to write the file to /home/user/files/
			// Using a here-document (<<EOF) to handle file contents safely
			const command = `mkdir -p /home/user/files && cat > /home/user/files/${filename} << 'EOF'\n${fileContent}\nEOF`;
			
			// Send the command to the terminal
			terminal.input(command);
			terminal.input("\n");
			
			state = "SUCCESS";
			message = `File uploaded! Available at /home/user/files/${filename}`;
			
			// Reset after 3 seconds
			setTimeout(() => {
				state = "START";
				message = "";
			}, 3000);
		}
		catch(error)
		{
			state = "ERROR";
			message = `Error uploading file: ${error.message}`;
			
			// Reset after 3 seconds
			setTimeout(() => {
				state = "START";
				message = "";
			}, 3000);
		}
		
		// Reset the file input
		event.target.value = '';
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
<div class="flex flex-col gap-2">
	<PanelButton 
		buttonIcon="fa-solid fa-file-plus" 
		clickHandler={handleAddFile} 
		buttonText={getButtonText(state)} 
		bgColor={getBgColor(state)} 
		hoverColor={getHoverColor(state)}>
	</PanelButton>
	<PanelButton 
		buttonIcon="fa-solid fa-upload" 
		clickHandler={triggerFileInput} 
		buttonText="Upload File"
		bgColor="bg-blue-900"
		hoverColor="hover:bg-blue-700">
	</PanelButton>
	<input 
		type="file" 
		bind:this={fileInput} 
		on:change={handleFileUpload} 
		style="display: none;"
	/>
</div>
{#if message}
	<p class="{state === 'SUCCESS' ? 'text-green-400' : state === 'ERROR' ? 'text-red-400' : 'text-blue-400'}">
		<span class="font-bold">{state === 'SUCCESS' ? 'Success: ' : state === 'ERROR' ? 'Error: ' : 'Info: '}</span>{message}
	</p>
{:else}
	<p><span class="font-bold">Create Files: </span>Generate a new file in /home/user/files/ using a terminal command.</p>
	<p><span class="font-bold">Upload Files: </span>Select a file from your computer to upload it to /home/user/files/.</p>
	<p>Files are stored in the main filesystem and will persist across page reloads.</p>
{/if}
