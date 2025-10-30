<script>
  import { fileTree, toggleFolder, downloadFile } from './filesystem.js';
  import { get } from 'svelte/store';

  let tree = [];
  fileTree.subscribe(value => tree = value);

  function handleToggle(node) {
    if (node.type === "folder") {
      toggleFolder(node.path);
    }
  }

  function handleDownload(node) {
    if (node.type === "file") {
      downloadFile(node.path);
    }
  }
</script>

<style>
  .folder { cursor: pointer; }
  .file { cursor: pointer; }
  .indent { padding-left: 1rem; }
</style>

<ul>
  {#each tree as node}
    <TreeNode {node}/>
  {/each}
</ul>

<!-- recursive component -->
<script context="module">
  export let node;

  const isFolder = node.type === "folder";
</script>

<li>
  <div class="{isFolder ? 'folder' : 'file'}" on:click={() => isFolder ? handleToggle(node) : handleDownload(node)}>
    {#if isFolder}
      {#if node.isExpanded}▼{:else}▶{/if}
    {/if}
    {node.name} {node.size ? `(${node.size})` : ''}
  </div>

  {#if isFolder && node.isExpanded && node.children}
    <div class="indent">
      <ul>
        {#each node.children as child}
          <TreeNode node={child}/>
        {/each}
      </ul>
    </div>
  {/if}
</li>