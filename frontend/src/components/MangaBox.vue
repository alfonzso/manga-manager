<template>
  <h1>Manga Manager</h1>

  <div class="row">
    <div class="star" style="padding: 1px;">
      <div v-if="loading" class="loader"></div>
    </div>
    <div class="url"> </div>
    <div class="pageNum"> </div>
    <div class="hideManga"> </div>
  </div>

  <div class="row" v-for="manga in orderedNotHiddenMangas" :key="manga.id">
    <div class="star">
      <a :href="manga.editedUrl" style="text-decoration: none;"
        v-bind:style="manga.hasNext ? 'background-color: greenyellow;' : ''" target="_blank"> *
      </a>
    </div>
    <div class="url">{{ manga.name }}</div>
    <div class="pageNum">
      <input type="number" min="0" @change="modifyMangaPageNumber(manga, $event)" v-model="manga.pageNum">
    </div>
    <div class="hideManga">
      <input type="checkbox" v-on:click="hideManga(manga, $event)">
    </div>
  </div>

  <form class="row submitForm" @submit="addNewManga($event)" method="post">
    <input class="mangaName" v-model="mangaName" type="text" name="mangaName" placeholder="Type a manga name">
    <input class="mangaUrl" v-model="mangaUrl" type="text" name="mangaUrl" placeholder="Type a manga url">
    <input type="submit" value="Submit">
  </form>

</template>

<script>
import { eachMapping } from '@jridgewell/trace-mapping';


export default {
  name: 'MangaBox',
  props: ["orderedNotHiddenMangas", "loading"],
  data() {
    return {
      mangaName: '',
      mangaUrl: '',
    }
  },
  methods: {
    modifyMangaPageNumber(manga, event) {
      this.emitter.emit("modify-manga-page-number", manga, event);
    },
    hideManga(manga, event) {
      this.emitter.emit("hide-manga", manga, event);
    },
    addNewManga(e) {
      this.emitter.emit("add-new-manga", { mangaName: this.mangaName, mangaUrl: this.mangaUrl, e });
    },
  },

}
</script>

<style lang="scss" >
.loader {

  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 5px;
  height: 5px;
  animation: spin 2s linear infinite;

}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>