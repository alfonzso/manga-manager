<template>
  <button @click='hiddenToggle = !hiddenToggle'> Hidden Mangas </button>
  <div v-show='hiddenToggle'>
    <div class="row" v-for="manga in hiddenMangas" :key="manga.id">
      <div class="star"> * </div>
      <div class="url">{{ manga.name }}</div>
      <div class="spacer"></div>
      <div class="pageNum">
        <input type="number" min="0" :value="manga.pageNum">
      </div>
      <div class="checkbox-wrapper">
        <input type="checkbox" v-on:click="hideManga(manga, $event)">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HiddenMangas',
  props: ['hiddenMangas'],
  data() {
    return {
      hiddenToggle: false,
    }
  },
  methods: {
    hideManga(manga, event) {
      this.emitter.emit("hide-manga", manga, event);
    },
  },

}
</script>