<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<div class="bg-black text-white">
  {@render children()}
</div>
