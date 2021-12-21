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
    listOfTimer: [],
    toggle: false,
    newMangaText: '',
    listOfManga: [
      // {
      //   id: 1,
      //   text: 'Donald Duck'
      // }
    ],
    error: null
  },
  computed: {
    notHiddenMangas: function () {
      return this.listOfManga.filter(manga => manga.hidden === false)
    },
    hiddenMangas: function () {
      return this.listOfManga.filter(manga => manga.hidden === true)
    },
  },
  methods: {
    modifyMangaPageNumber: function (manga, event) {
      if (event) event.preventDefault()

      clearTimeout(this.listOfTimer[manga.id])

      this.listOfTimer[manga.id] = setTimeout(() => {
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
    addNewManga: function () {
      if (!this.newMangaText) { return; }

      this.error = null;
      request('/api/manga', 'POST', { url: this.newMangaText })
        // .then(manga => this.listOfManga.push(manga))
        .then(manga => {
          console.log(manga);
          this.listOfManga.push(manga);
        })
        .catch(error => this.error = error);

      this.newMangaText = '';
    },
    // deleteManga: function (manga, event) {
    //   if (event) event.preventDefault()
    //   this.error = null;
    //   request('/api/mangas/' + manga.id, 'DELETE')
    //     .then(() => {
    //       const index = this.listOfManga.indexOf(manga);
    //       this.listOfManga.splice(index, 1);
    //     })
    //     .catch(error => {
    //       this.error = error;
    //     });
    // },
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
    }
  }
});

app.error = null;
request('/api/mangas', 'GET')
  .then(listOfManga => app.listOfManga = listOfManga)
  .catch(error => app.error = error);