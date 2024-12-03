<template>
    <div>
        <header>
                <button class="header-button">
                    About
                </button>
                <h1 class="title">Sketchdle </h1>
                <button class="header-button">
                    Change Language
                </button>

        </header>
    </div>

    <main>
        <section>

            <router-link to="/playerlobby/">
                <button>
                    Join Game
                </button>
            </router-link>

            <router-link to="/create/">
                <button>
                    Create Game
                </button>
            </router-link>
            
        </section>

    


    </main>

</template>

<script>

</script>

<style>
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f1f1f1;
    border-bottom: 1px solid #ccc;
}


</style>