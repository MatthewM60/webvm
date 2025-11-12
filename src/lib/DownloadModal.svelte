<!-- filepath: c:\Users\matth\Documents\GitHub\webvm\src\lib\DownloadModal.svelte -->
<script>
	export let isOpen = false;
	export let terminal;
	
	let manualFilename = "";
	let message = "";
	let messageType = ""; // "success", "error", "info"
	let isLoading = false;
	let fileOutput = "";
	let showOutput = false;

	function toggleModal() {
		isOpen = !isOpen;
		message = "";
		manualFilename = "";
		fileOutput = "";
		showOutput = false;
	}

	async function downloadFile(filename) {
		if (!filename || !filename.trim()) {
			message = "Please enter a valid filename";
			messageType = "error";
			return;
		}

		console.log("Downloading file:", filename);
		message = `Reading file from VM...`;
		messageType = "info";
		isLoading = true;
		showOutput = false;

		try {
			if (!terminal) {
				throw new Error("Terminal not available");
			}

			// We need to capture the file content through the terminal
			// Since we can't directly capture output, we'll use a workaround:
			// Write the file to a web-accessible location, then fetch it
			
			// Copy the file to /tmp so we can potentially serve it
			const timestamp = Date.now();
			const tempName = `download_${timestamp}_${filename}`;
			
			// Command to copy file with a unique name
			const copyCommand = `cp /home/user/files/${filename} /tmp/${tempName}`;
			terminal.input(copyCommand);
			terminal.input("\n");
			
			// Wait for copy to complete
			await new Promise(resolve => setTimeout(resolve, 300));
			
			// Try to fetch the file through the web device
			try {
				const response = await fetch(`/tmp/${tempName}`);
				if (response.ok) {
					const blob = await response.blob();
					
					// Trigger browser download
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = filename;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);
					
					message = `✓ File "${filename}" downloaded successfully!`;
					messageType = "success";
					
					// Clean up temp file
					terminal.input(`rm -f /tmp/${tempName}`);
					terminal.input("\n");
				} else {
					throw new Error("Could not read file from /tmp");
				}
			} catch (fetchError) {
				console.error("Fetch failed, trying alternative method");
				// Fallback: show instructions for manual download
				message = `To download: Run this in the terminal: cat /home/user/files/${filename} | base64`;
				messageType = "info";
			}
		} catch (error) {
			console.error("Download error:", error);
			message = `Error: ${error.message}`;
			messageType = "error";
		}

		isLoading = false;
		setTimeout(() => {
			if (messageType === "success") {
				message = "";
			}
		}, 3000);
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
			<p class="text-xs text-gray-400">
				<strong>How to use:</strong> Enter the filename from /home/user/files/ and click Download. A save dialog will appear.
			</p>
		</div>
	</div>
</div>

<style>
	.hidden {
		display: none;
	}
</style>
