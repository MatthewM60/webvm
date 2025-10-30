<script>
  import TreeNode from './TreeNode.svelte';
  export let node;
  export let expanded;
  export let onToggle = () => {};
  export let onSelect = () => {};
</script>

<li>
  <div class="node" on:click|stopPropagation={() => { onToggle(node); onSelect(node); }}>
    {#if node.type === 'folder'}
      {#if expanded.has(node.path)}
        ▼
      {:else}
        ▶
      {/if}
    {:else}
      •
    {/if}
    <span class="name">{node.name}</span>
  </div>

  {#if node.children && node.children.length && node.type === 'folder' && expanded.has(node.path)}
    <ul class="children">
      {#each node.children as child}
        <TreeNode node={child} {expanded} {onToggle} {onSelect} />
      {/each}
    </ul>
  {/if}
</li>

<style>
  :global(.tree-root) { list-style: none; padding-left: 8px; margin: 0; }
  .node { padding: 3px 6px; cursor: pointer; display:flex; gap:6px; align-items:center; }
  .node:hover { background: rgba(255,255,255,0.03); }
  .children { list-style: none; padding-left: 12px; margin: 0; }
  .name { margin-left: 4px; }
</style>
