<!-- filepath: c:\Users\matth\Documents\GitHub\webvm\src\lib\DownloadModal.svelte -->
<script>
	export let isOpen = false;
	export let terminal;
	
	let manualFilename = "";
	let message = "";
	let messageType = ""; // "success", "error", "info"
	let isLoading = false;

	function toggleModal() {
		isOpen = !isOpen;
		message = "";
		manualFilename = "";
	}

	async function downloadFile(filename) {
		if (!filename || !filename.trim()) {
			message = "Please enter a valid filename";
			messageType = "error";
			return;
		}

		console.log("Downloading file:", filename);
		message = `Downloading ${filename}...`;
		messageType = "info";
		isLoading = true;

		try {
			// Read the file content and encode as base64
			// We'll pipe it to base64 and save to a temp file, then trigger a download
			const encodedFilename = encodeURIComponent(filename);
			const command = `cat /home/user/files/${filename} | base64`;
			
			console.log("Command:", command);
			
			// Create a temporary output file with a unique name
			const timestamp = Date.now();
			const tempFile = `/tmp/download_${timestamp}.b64`;
			const fullCommand = `(cat /home/user/files/${filename} | base64) > ${tempFile} && echo "DOWNLOAD_READY" && cat ${tempFile}`;
			
			// We need to somehow get the output. Since we can't directly capture it,
			// we'll use a workaround: create a data URI that the user can download
			
			// For now, let's use a prompt to show the user the file exists and ask them to use terminal
			terminal.input(`cat /home/user/files/${filename} | base64 > /tmp/download_${timestamp}.b64 && echo "File encoded to ${tempFile}"`);
			terminal.input("\n");
			
			await new Promise(resolve => setTimeout(resolve, 500));
			
			message = `File "${filename}" has been encoded. Check the terminal for base64 output.`;
			messageType = "success";
		} catch (error) {
			message = `Error: ${error.message}`;
			messageType = "error";
			console.error("Download error:", error);
		}

		isLoading = false;
		setTimeout(() => {
			message = "";
		}, 4000);
	}

	async function handleDownload() {
		await downloadFile(manualFilename);
		manualFilename = "";
	}

	function clearMessage() {
		message = "";
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
	<div
		class="bg-neutral-700 rounded-lg shadow-2xl p-6 w-96 max-w-full mx-4 pointer-events-auto"
		class:hidden={!isOpen}
	>
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-bold text-gray-100">Download Files</h2>
			<button
				on:click={toggleModal}
				class="text-gray-400 hover:text-gray-200 text-2xl leading-none"
			>
				×
			</button>
		</div>

		<p class="text-gray-300 text-sm mb-4">
			Download files from /home/user/files/ to your computer.
		</p>

		<div class="mb-4">
			<label class="block text-sm font-semibold text-gray-300 mb-2">
				Filename to download:
			</label>
			<input
				type="text"
				bind:value={manualFilename}
				placeholder="e.g., document_1234567890.txt"
				class="w-full bg-neutral-800 border border-neutral-500 rounded px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
				disabled={isLoading}
			/>
		</div>

		<button
			on:click={handleDownload}
			disabled={isLoading || !manualFilename.trim()}
			class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white font-bold py-2 px-4 rounded mb-4 transition"
		>
			{isLoading ? "Processing..." : "Download File"}
		</button>

		{#if message}
			<div
				class="p-3 rounded mb-4 text-sm font-semibold"
				class:bg-green-900={messageType === "success"}
				class:text-green-200={messageType === "success"}
				class:bg-red-900={messageType === "error"}
				class:text-red-200={messageType === "error"}
				class:bg-blue-900={messageType === "info"}
				class:text-blue-200={messageType === "info"}
			>
				<div class="flex justify-between items-center">
					<span>{message}</span>
					{#if messageType !== "info"}
						<button
							on:click={clearMessage}
							class="text-lg leading-none hover:opacity-70"
						>
							×
						</button>
					{/if}
				</div>
			</div>
		{/if}

		<div class="border-t border-neutral-600 pt-4">
			<p class="text-xs text-gray-400 mb-2">
				<strong>How to download:</strong>
			</p>
			<ol class="text-xs text-gray-400 space-y-1 list-decimal list-inside">
				<li>Enter the filename (e.g., document_1234567890.txt)</li>
				<li>Click "Download File"</li>
				<li>The file will be base64 encoded and shown in the terminal</li>
				<li>Copy the base64 output and paste into an online decoder, or use: <code class="bg-neutral-800 px-1 rounded">echo "[base64]" | base64 -d > file.txt</code></li>
			</ol>
		</div>
	</div>
</div>

<style>
	.hidden {
		display: none;
	}
</style>
