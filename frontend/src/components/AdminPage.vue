<template>
  <button @click='adminToggle = !adminToggle'> Admin </button>
  <div class="adminBox" v-show='adminToggle'>
    <form class="adminRow" ref="form" v-for="(manga) in adminMangas" :key="manga.id"
      @change="updateManga(manga, $event)" method="post">
      <input class="adminText" type="text" v-model="manga.name">
      <input class="adminUrl" type="text" v-model="manga.url">
      <input class="adminOrder" type="number" min="0" v-model="manga.order">
      <input type="submit" v-on:click="deleteManga(manga, $event)" value="X">
    </form>
  </div>
</template>

<script>
export default {
  name: 'AdminPage',
  props: ["adminMangas"],
  data() {
    return {
      adminToggle: false,
    }
  },
  methods: {
    updateManga(manga, event) {
      this.emitter.emit("update-manga", manga, event);
    },
    deleteManga(manga, event) {
      this.emitter.emit("delete-manga", manga, event);
    },
  }
}
</script>