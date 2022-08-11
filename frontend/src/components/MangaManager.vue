<template>
  <!-- <div v-if="loading" class="loader"></div> -->
  <a href="#" v-on:click="yourlink()">Open all mangas</a>
  <AuthPage :isUserLoggedIn="isUserLoggedIn" />
  <div class="mangaBox">
    <MangaBox :orderedNotHiddenMangas="orderedNotHiddenMangas" :loading="loading" />
    <HiddenMangas :hiddenMangas="hiddenMangas" />
    <ErrorPage :error="err" :errors="errors" />
  </div>
  <AdminPage :adminMangas="orderedMangas" />
</template>

<script>
import { _request } from '@/request'

import AuthPage from './AuthPage.vue'
import MangaBox from './MangaBox.vue'
import HiddenMangas from './HiddenMangas.vue'
import AdminPage from './AdminPage.vue'
import ErrorPage from './ErrorPage.vue'

export default {
  name: 'MangaManager',
  components: {
    AuthPage,
    MangaBox,
    HiddenMangas,
    AdminPage,
    ErrorPage,
  },

  data() {
    return {
      loading: false,
      isUserLoggedIn: false,
      pageNumTimer: [],
      adminTimer: [],
      newMangaText: '',
      listOfManga: [],
      err: null,
      errors: [],

      updateMangaName: null,
      updateMangaUrl: null,
      updateMangaOrder: null,
      testObject: {},
    }
  },
  computed: {
    notHiddenMangas: function () {
      return this.listOfManga.filter(manga => manga.hidden === false)
    },
    hiddenMangas: function () {
      return this.listOfManga.filter(manga => manga.hidden === true)
    },
    orderedNotHiddenMangas: function () {
      return this.notHiddenMangas.slice(0).sort((a, b) => {
        return a.order - b.order;
      });
    },
    orderedHiddenMangas: function () {
      return this.hiddenMangas.slice(0).sort((a, b) => {
        return a.order - b.order;
      });
    },
    orderedMangas: function () {
      // have to use slice() method too, cuz sort will modify listOfManga object
      // which is reactive because of Vue, so Vue will re-render the page twice ...
      return this.listOfManga.slice().sort((a, b) => {
        return a.order - b.order;
      });
    },
  },
  mounted: function () {
    _request('/api/mangas', 'GET')
      .then((responseOfMangas) => {
        // type Manga = {
        //   id: number;
        //   name: string;
        //   url: string;
        //   pageNum: number;
        //   hidden: boolean;
        //   order: number;
        // }

        const mangasToCheck = []
        for (let manga of responseOfMangas) {
          manga.editedUrl = manga.url.replace('%%N%%', manga.pageNum + 1)
          manga.nextUrl = manga.url.replace('%%N%%', manga.pageNum + 1)
          manga.hasNext = false
          mangasToCheck.push({ id: manga.id, url: manga.nextUrl })
        }
        this.listOfManga = responseOfMangas

        this.loading = true;
        _request('/api/nextChapterChecker', 'POST', { mangas: mangasToCheck }).then((data) => {
          for (let { id, value } of data.results) {
            const oneManga = this.listOfManga.find(manga => manga.id === id)
            if (oneManga) {
              oneManga.hasNext = value
            }
          }
          this.loading = false;
        })

        this.isUserLoggedIn = true
      })
      .catch((error) => {
        console.log("errrrr->", error)
        this.err = error
        this.isUserLoggedIn = false
        _request('/auth/cleanUpExpiredSessions', 'GET')
      });

    // this.emitter.on("add-new-manga", (obj, event) => this.addNewManga(obj, event))
    this.emitter.on("add-new-manga", (obj) => this.addNewManga(obj))
    // this.emitter.on("add-new-manga", (n, u, event) => this.addNewManga(n, u, event))
    this.emitter.on("hide-manga", (manga, event) => this.hideManga(manga, event))
    this.emitter.on("modify-manga-page-number", (manga, event) => this.modifyMangaPageNumber(manga, event));
    this.emitter.on("update-manga", (manga, event) => this.updateManga(manga, event))
    this.emitter.on("delete-manga", (manga, event) => this.deleteManga(manga, event))

  },
  beforeUnmount() {
    this.emitter.off("add-new-manga")
    this.emitter.off("hide-manga")
    this.emitter.off("modify-manga-page-number")
    this.emitter.off("update-manga")
    this.emitter.off("delete-manga")
  },
  methods: {

    yourlink() {
      [...document.querySelectorAll('.star > a')].forEach(
        (element, index, array) => {
          window.open(element.href)
        }
      );
    },

    modifyMangaPageNumber: function (manga, event) {
      if (event) event.preventDefault()

      clearTimeout(this.pageNumTimer[manga.id])

      this.pageNumTimer[manga.id] = setTimeout(() => {
        this.error = null;
        console.log(`/api/manga/page/${manga.id}`)
        _request('/api/manga/page/' + manga.id, 'PATCH', {
          pageNum: manga.pageNum
        })
          .then(manga => {
            console.log(manga);
          })
          .catch(error => this.error = error);
      }, 2500)

      // this.mangaPageNumber = -1;
    },

    addNewManga: function (obj) {
      if (obj.e) obj.e.preventDefault();
      this.errors = [];

      if (!obj.mangaName) {
        this.errors.push('Manga name required.');
      }
      if (!obj.mangaUrl) {
        this.errors.push('Manga url required.');
      }

      _request('/api/manga', 'POST', { name: obj.mangaName, url: obj.mangaUrl })
        .then(manga => this.listOfManga.push(manga))
        .catch(error => this.error = error);

    },

    updateManga: function (manga, e) {
      if (e) e.preventDefault();
      clearTimeout(this.adminTimer[manga.id])

      this.errors = [];
      if (!manga.name) {
        this.errors.push('Manga name required.');
      }
      if (!manga.url) {
        this.errors.push('Manga url required.');
      }
      if (!manga.order) {
        this.errors.push('Manga order required.');
      }

      this.adminTimer[manga.id] = setTimeout(() => {
        this.error = null;
        _request(`/api/manga/admin/edit/${manga.id}`, 'PATCH', {
          name: manga.name,
          url: manga.url,
          order: manga.order,
        })
          .then(manga => {
            console.log(manga);
          })
          .catch(error => this.error = error);
      }, 2500)

    },

    hideManga: function (manga, event) {
      if (event) event.preventDefault()

      this.error = null;
      _request('/api/manga/hide/' + manga.id, 'POST')
        .then(() => {
          const index = this.listOfManga.indexOf(manga);
          this.listOfManga[index].hidden = !this.listOfManga[index].hidden
        })
        .catch(error => {
          this.error = error;
        });
    },

    deleteManga: function (manga, event) {
      if (event) event.preventDefault()

      this.error = null;
      if (confirm("Do you really want to delete?")) {
        _request(`/api/manga/delete/${manga.id}`, 'DELETE')
          .then(() => {
            this.listOfManga.splice(this.listOfManga.indexOf(manga), 1);
          })
          .catch(error => {
            this.error = error;
          });
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" >
.mangaBox {

  padding: 30px;
  width: 500px;
  letter-spacing: 1px;
  color: rgba(74, 74, 74, .9);
  background-color: #fff;
  box-shadow: 0 12px 44px 0 rgba(0, 0, 0, .06);

  * {
    // border: 1px solid;
  }

  @media (max-width: 900px) {
    padding: 0;
    width: 100%;
  }

  h1 {
    color: black;
    margin-top: 10px;
    text-align: center;
  }

  .row {
    display: flex;
    flex-flow: row;

    padding: 0;
    margin: 0;
    list-style: none;
    justify-content: space-between;

    .star {
      text-align: center;
      padding-left: 5px;
      padding-right: 5px;
    }

    .url {
      flex: 4;
      padding-left: 10px;
      text-align: left;
    }

    .pageNum {
      input {
        width: 40px;
        // align-content: center;
        // float: right;
      }
    }

    .hideManga {}

  }

}

.error-box {
  margin-top: 20px;
  color: darkred;
}

.error-header {
  margin-bottom: 10px;
}

.error-body {
  font-size: small;
}

.adminBox {
  padding: 30px;
  width: 1000px;
  letter-spacing: 1px;
  color: rgba(74, 74, 74, .9);
  background-color: #fff;
  box-shadow: 0 12px 44px 0 rgba(0, 0, 0, .06);
}

.adminRow {
  display: flex;
  flex-flow: row;
  list-style: none;
  justify-content: space-between;
}

.row:hover {
  background-color: lightgray;
}

.text {
  flex-grow: 1;
}

.row:last-of-type {
  border-bottom: none;
}

.row:last-of-type:hover {
  background-color: initial;
}

.adminUrl {
  flex-grow: 1;
}

.adminOrder {
  /* flex-grow: 1; */
  width: 5%;
}

.submitForm {
  height: 35px;
  margin-top: 10px;
}

.mangaName {
  width: 25%;
}

.mangaUrl {
  width: 75%;
}
</style>
