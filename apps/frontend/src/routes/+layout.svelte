<script lang="ts">
	import '@fontsource/poppins/400.css'
	import '@fontsource/poppins/500.css'
	import '@fontsource/poppins/700.css'
	import '@fontsource-variable/open-sans'

	import './layout.css';
	import './pulse-dashboard.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
