<script lang="ts">
import { onMount } from "svelte";

let isGlassMode = false;

function applyGlassMode() {
    if (isGlassMode) {
        document.documentElement.classList.add("glass-mode");
    } else {
        document.documentElement.classList.remove("glass-mode");
    }
}

function toggleGlassMode() {
    isGlassMode = !isGlassMode;
    localStorage.setItem("glassMode", String(isGlassMode));
    applyGlassMode();
}

onMount(() => {
    isGlassMode = localStorage.getItem("glassMode") === "true";
    applyGlassMode();
});
</script>

<button aria-label="Glass Mode" class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" on:click={toggleGlassMode}>
    <div class="text-[1.25rem] w-full h-full flex items-center justify-center">
    {#if isGlassMode}
        <img src="/icons/blur-on.svg" alt="Glass Mode On" class="w-full h-full object-contain" />
    {:else}
        <img src="/icons/blur-off.svg" alt="Glass Mode Off" class="w-full h-full object-contain" />
    {/if}
    </div>
</button>
