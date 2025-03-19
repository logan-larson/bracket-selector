<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
</script>

<div class="app">
	<slot />
	<Footer />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
