<script lang="ts">
  /* eslint-disable svelte/valid-prop-names-in-kit-pages */
  import Button from '$lib/components/Button.svelte';
  import { goto } from '$app/navigation';

  let { error, status } = $props<{
    error: App.Error;
    status: number | string | undefined;
  }>();

  const is404 = $derived(String(status) === '404');

  const title = $derived(is404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan');
  const description = $derived(
    is404
      ? 'Kami tidak dapat menemukan halaman yang kamu minta. URL mungkin salah, halaman sudah dihapus, atau tautannya sudah tidak berlaku.'
      : 'Aplikasi mengalami kesalahan saat memuat data atau memproses permintaan.'
  );
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-16">
  <div class="tile w-full max-w-md p-6 text-center sm:p-8">
    <p class="hud-text mb-3 text-xs text-hot-text">{is404 ? 'Target not found' : 'System fault'} // {status ?? 'ERR'}</p>
    <h1 class="mb-3 font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">{title}</h1>

    <p class="mb-3 text-sm text-muted">{description}</p>

    <p class="mb-4 text-xs text-dim">
      Kamu bisa kembali ke halaman utama atau mencoba memuat ulang halaman ini.
    </p>

    {#if status !== 404 && error?.message}
      <div class="plate mt-2 border border-line bg-bg/60 px-3 py-2 text-left">
        <p class="hud-text mb-1 text-[11px] text-muted">Detail teknis (untuk debugging)</p>
        <pre class="whitespace-pre-wrap break-all font-mono text-[11px] text-muted">{error.message}</pre>
      </div>
    {/if}

    <div class="mt-6 flex items-center justify-center gap-4 text-sm">
      <Button onclick={() => goto('/')}>Ke halaman utama</Button>

      <button
        type="button"
        class="hud-text text-xs text-muted transition-colors hover:text-hud-text"
        onclick={() => location.reload()}
      >
        Coba lagi
      </button>
    </div>
  </div>
</div>
