<template>
    <div>
        <section class="header">
                <button class="header-button">
                    About
                </button>
                <h1 class="title">Sketchdle </h1>
                <button class="header-button">
                    <img src="/img/flag.png" alt="changeLanguagePic" width="30 px">
                </button>

        </section>
    </div>


        <section >

            <router-link to="/playerlobby/">
                <button class="game-button">
                    Join Game
                </button>
            </router-link>

            <router-link to="/create/">
                <button class="game-button">
                    Create Game
                </button>
            </router-link>
            
        </section>



</template>

<script>

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
* {
    background-color: rgb(158, 221, 245);
    font-family: pacifico, cursive;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
}

.title {
    font-size: 5rem;
}

.header-button{
    font-size: 1.5rem;
    border: 0.2em solid black;
}

.header-button img {
    width: 100%;
}

.game-button {

    font-size: 4rem;
    margin: 2rem;
    width: 400px;
    height: 200px;
    border: 0.5rem solid black;

}

button{
    background-color: white;
}

button:hover {
    background-color: rgb(26, 105, 166);
    color: white;
    cursor:pointer
}


</style>