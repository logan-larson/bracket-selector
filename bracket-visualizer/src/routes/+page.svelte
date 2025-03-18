<script lang="ts">
  import Bracket from '$lib/components/Bracket.svelte';
  import TeamEditor from '$lib/components/TeamEditor.svelte';
  import { bracketStore } from '$lib/stores';
</script>

<svelte:head>
  <title>March Madness Bracket Visualizer</title>
</svelte:head>

<main>
  <header>
    <h1>March Madness Bracket Randomizer</h1>
    <p>Randomize your bracket and see how it plays out.</p>
  </header>
  
  <div class="bracket-section">
    <Bracket />
  </div>
  
  <div class="team-section">
    <TeamEditor teams={$bracketStore.allTeams} />
  </div>
</main>

<style>
  main {
    margin: 0 auto;
    padding: 10px;
    max-width: 100%;
  }
  
  header {
    text-align: center;
    margin-bottom: 24px;
  }
  
  h1 {
    color: var(--primary-color);
    font-size: 28px;
    margin-bottom: 8px;
  }
  
  .bracket-section {
    overflow-x: auto;
    margin-bottom: 24px;
  }
  
  .team-section {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  @media (min-width: 1600px) {
    main {
      padding: 20px;
    }
    
    .bracket-section {
      margin-bottom: 32px;
    }
  }
</style>
