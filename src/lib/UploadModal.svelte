<!-- filepath: c:\Users\matth\Documents\GitHub\webvm\src\lib\UploadModal.svelte -->
<script>
	export let isOpen = false;
	export let terminal;
	export let cx = null;
	
	let fileInput;
	let message = "";
	let messageType = ""; // "success", "error", "info"
	let isUploading = false;

	function toggleModal() {
		isOpen = !isOpen;
		message = "";
	}

	function triggerFileInput() {
		fileInput.click();
	}

	async function handleFileUpload(event) {
		console.log("handleFileUpload called");
		
		const files = event.target.files;
		if (!files || files.length === 0) {
			console.log("No files selected");
			return;
		}

		const file = files[0];
		console.log("Selected file:", file.name);

		isUploading = true;
		message = `Uploading ${file.name}...`;
		messageType = "info";

		try {
			if (!cx) {
				throw new Error("CheerpX environment not available");
			}

			// Read the file as binary data
			const fileBuffer = await file.arrayBuffer();
			const filename = file.name;
			const finalPath = `/home/user/files/${filename}`;

			console.log("File size:", fileBuffer.byteLength);

			// Convert binary data to base64
			const uint8Array = new Uint8Array(fileBuffer);
			let binaryString = '';
			for (let i = 0; i < uint8Array.length; i++) {
				binaryString += String.fromCharCode(uint8Array[i]);
			}
			const base64Content = btoa(binaryString);

			console.log("Base64 length:", base64Content.length);

			// Use bash to decode base64 and write the file (no terminal output)
			const command = `mkdir -p /home/user/files && echo "${base64Content}" | base64 -d > "${finalPath}"`;
			
			await cx.run("/bin/bash", ["-c", command]);

			console.log("File written to:", finalPath);

			isUploading = false;
			message = `✓ File "${filename}" uploaded to /home/user/files/`;
			messageType = "success";

			// Keep message visible for 5 seconds
			setTimeout(() => {
				message = "";
			}, 5000);
		} catch (error) {
			isUploading = false;
			message = `✗ Error: ${error.message}`;
			messageType = "error";
			console.error("Upload error:", error);
		}

		// Reset the file input
		event.target.value = "";
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
			<h2 class="text-xl font-bold text-gray-100">Upload File</h2>
			<button
				on:click={toggleModal}
				class="text-gray-400 hover:text-gray-200 text-2xl leading-none"
			>
				×
			</button>
		</div>

		<p class="text-gray-300 text-sm mb-4">
			Select a file from your computer to upload it to /home/user/files/ in the VM.
		</p>

		<button
			on:click={triggerFileInput}
			disabled={isUploading}
			class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-2 px-4 rounded mb-4 transition"
		>
			{isUploading ? "Uploading..." : "Choose File"}
		</button>

		<input
			type="file"
			bind:this={fileInput}
			on:change={handleFileUpload}
			style="display: none;"
		/>

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
				<strong>Tip:</strong> You can upload text files, code, documents, or any file type.
			</p>
		</div>
	</div>
</div>

<style>
	.hidden {
		display: none;
	}
</style>
