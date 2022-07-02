<template>
  <MangaManager />
</template>

<script>
import MangaManager from './components/MangaManager.vue'

export default {
  name: 'App',
  components: {
    MangaManager
  },
}
</script>

<style lang="scss">
body {
  margin: 0;
  background-color: #f7f7f7;
  font-family: avenir next, helvetica neue, Arial, sans-serif, apple color emoji, segoe ui emoji, segoe ui symbol;
}

#app {

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  width: 100%;

}
</style>
