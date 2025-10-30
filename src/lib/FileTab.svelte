<script>
  import PanelButton from './PanelButton.svelte';
  import FileTree from './FileTree.svelte';
  import { createEventDispatcher } from 'svelte';
  import { fileSystemState, currentPath, openFolder } from './filesystem.js';

  const dispatch = createEventDispatcher();
  let state = "IDLE";

  fileSystemState.subscribe(s => state = s);

  function handleOpenFolder() {
    openFolder("/");
    dispatch('openFolder');
  }

  function getButtonText(state) {
    if (state === "OPENING") return "Opening...";
    if (state === "UPLOADING") return "Uploading...";
    if (state === "DOWNLOADING") return "Downloading...";
    if (state === "ERROR") return "Error - Retry?";
    return "Open Folder";
  }

  function getBgColor(state) {
    if (state === "OPENING" || state === "UPLOADING" || state === "DOWNLOADING") return "bg-blue-900";
    return undefined;
  }
</script>

<h1 class="text-lg font-bold">Files</h1>

<PanelButton
  buttonIcon="fas fa-folder-open"
  clickHandler={handleOpenFolder}
  buttonText={getButtonText(state)}
  bgColor={getBgColor(state)}
  hoverColor={getBgColor(state) ? "hover:bg-blue-700" : undefined}
/>

{#if state === "OPENING"}
  <p><span class="font-bold">Opening folder...</span> Please wait.</p>
{:else if state === "ERROR"}
  <p class="text-red-600">An error occurred. Please retry.</p>
{:else}
  <p>Browse files below:</p>
  <FileTree />
{/if}