<script lang="ts">
  import Bracket from '$lib/components/Bracket.svelte';
  import TeamEditor from '$lib/components/TeamEditor.svelte';
  import { bracketStore } from '$lib/stores';
</script>

<svelte:head>
  <title>March Madness Bracket Visualizer</title>
</svelte:head>

<main>
  <header style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
        <img src="/bb.png" alt="March Madness Bracket Randomizer" style="width: 50px; height: 50px; transform: rotate(90deg);" />
        <h1>March Madness Bracket Randomizer</h1>
        <img src="/bb.png" alt="March Madness Bracket Randomizer" style="width: 50px; height: 50px; transform: scaleX(-1) rotate(90deg);" />
    </div>
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
