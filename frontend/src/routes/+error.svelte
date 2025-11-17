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
  <div class="w-full max-w-sm text-center">
    <h1 class="mb-2 text-2xl font-bold sm:text-3xl">{title}</h1>

    <p class="mb-3 text-sm text-gray-400">{description}</p>

    <p class="mb-4 text-xs text-gray-500">
      Kamu bisa kembali ke halaman utama atau mencoba memuat ulang halaman ini.
    </p>

    {#if status !== 404 && error?.message}
      <div class="mt-2 rounded-md bg-black/40 px-3 py-2 text-left text-[11px] text-gray-400">
        <p class="mb-1 text-xs font-semibold">Detail teknis (untuk debugging):</p>
        <pre class="whitespace-pre-wrap break-all text-[11px]">{error.message}</pre>
      </div>
    {/if}

    <div class="mt-4 flex items-center justify-center gap-3 text-sm">
      <Button onclick={() => goto('/')}>Ke halaman utama</Button>

      <button
        type="button"
        class="text-xs text-gray-400 underline-offset-4 transition-colors hover:text-white hover:underline"
        onclick={() => location.reload()}
      >
        Coba lagi
      </button>
    </div>
  </div>
</div>
