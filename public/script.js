function request(url, method, body) {
  return fetch(url, {
    method,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (!response.ok) {
      return Promise.reject({
        status: response.status,
        statusText: response.statusText,
        method,
        url: response.url
      });
    }

    return response.json().catch(() => { });
  });
}

const app = new Vue({
  el: '#app',
  data: {
    timer: null,
    pageNumTimer: [],
    adminTimer: [],
    hiddenToggle: false,
    adminToggle: false,
    newMangaText: '',
    listOfManga: [
      // {
      //   id: 1,
      //   text: 'Donald Duck'
      // }
    ],
    error: null,
    errors: [],
    mangaName: null,
    mangaUrl: null,
    updateMangaName: null,
    updateMangaUrl: null,
    updateMangaOrder: null,
    testObject: {},
  },
  computed: {
    notHiddenMangas: function () {
      return this.listOfManga.filter(manga => manga.hidden === false)
    },
    hiddenMangas: function () {
      return this.listOfManga.filter(manga => manga.hidden === true)
    },
    orderedNotHiddenMangas: function () {
      return this.notHiddenMangas.sort((a, b) => {
        return a.order - b.order;
      });
    },
    orderedHiddenMangas: function () {
      return this.hiddenMangas.sort((a, b) => {
        return a.order - b.order;
      });
    },
    orderedMangas: function () {
      return this.listOfManga.sort((a, b) => {
        return a.order - b.order;
      });
    },
  },
  methods: {
    modifyMangaPageNumber: function (manga, event) {
      if (event) event.preventDefault()

      clearTimeout(this.pageNumTimer[manga.id])

      this.pageNumTimer[manga.id] = setTimeout(() => {
        this.error = null;
        request('/api/manga/page/' + manga.id, 'PATCH', {
          pageNum: manga.pageNum
        })
          .then(manga => {
            console.log(manga);
          })
          .catch(error => this.error = error);
      }, 2500)

      // this.mangaPageNumber = -1;
    },
    addNewManga: function (e) {
      e.preventDefault();
      this.errors = [];

      if (!this.mangaName) {
        this.errors.push('Manga name required.');
      }
      if (!this.mangaUrl) {
        this.errors.push('Manga url required.');
      }

      request('/api/manga', 'POST', { name: this.mangaName, url: this.mangaUrl })
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
        request('/api/manga/admin/edit/' + manga.id, 'PATCH', {
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
      request('/api/manga/hide/' + manga.id, 'POST')
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
        request('/api/manga/delete/' + manga.id, 'DELETE')
          .then(() => {
            this.listOfManga.splice(this.listOfManga.indexOf(manga), 1);
          })
          .catch(error => {
            this.error = error;
          });
      }
    },
  }
});

console.log(
  `fafa ${app.error}`
)

app.error = null;
request('/api/mangas', 'GET')
  .then(listOfManga => app.listOfManga = listOfManga)
  .catch(error => app.error = error);