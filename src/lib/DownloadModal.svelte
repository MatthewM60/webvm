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
			// We need to read the file from the VM filesystem
			// Since terminal.input only sends commands, we need a different approach
			// We'll use the CheerpX filesystem API to read the file
			
			// Get reference to the window's CheerpX instance
			const CheerpX = window.CheerpX;
			if (!CheerpX) {
				throw new Error("CheerpX not available");
			}

			// Try to read the file using CheerpX's filesystem
			// The VM has the file at /home/user/files/filename
			// We need to access it through the IDBDevice
			
			// Create a command that will output the file content
			// We'll read it via the terminal's output stream
			terminal.input(`cat /home/user/files/${filename}`);
			terminal.input("\n");
			
			// Wait a moment for the command to process
			await new Promise(resolve => setTimeout(resolve, 300));
			
			// Since we can't easily capture terminal output, we'll use a workaround:
			// Read directly from the filesystem using the CheerpX API
			// Create a temporary script that reads and encodes the file
			const readCommand = `hexdump -C /home/user/files/${filename}`;
			
			// For a proper implementation, we need to access the file system directly
			// Let's try using the browser's ability to create a download from the terminal output
			
			// Actually, the best approach is to use CheerpX's file system directly
			// Get the IDBDevice and read the file from it
			const idbDevice = await CheerpX.IDBDevice.create("user_files");
			const fileContent = await idbDevice.readFile(`${filename}`);
			
			// Convert to Blob and create download link
			const blob = new Blob([fileContent], { type: "application/octet-stream" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			
			message = `File "${filename}" downloaded successfully!`;
			messageType = "success";
		} catch (error) {
			console.error("Download error:", error);
			message = `Error: ${error.message}`;
			messageType = "error";
		}

		isLoading = false;
		setTimeout(() => {
			message = "";
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
