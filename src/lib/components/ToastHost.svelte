<script lang="ts">
    import { toasts } from '$lib/toast';
    import { fly, fade } from 'svelte/transition';
</script>

<div class="toast-container" aria-live="polite" aria-atomic="true">
    {#each $toasts as toast (toast.id)}
    <div class="toast" role="status" in:fly={{ y: -16, duration: 180 }} out:fade={{ duration: 350 }}>
      {toast.message}
</div>
{/each}
</div>

<style>
    .toast-container {
        position: fixed;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
    }

    .toast {
        pointer-events: auto;
        background: #222;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: 10px 14px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        max-width: min(92vw, 520px);
        text-align: center;
    }

    @media (prefers-reduced-motion: reduce) {
        .toast { transition: opacicy 0.01s linear;}
    }
</style>