function _request(url, method, body) {
  return fetch(url, {
    method,
    // mode: 'no-cors',
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

const app = Vue.createApp({
  data() {
    return {
      pageNumTimer: [],
      adminTimer: [],
      hiddenToggle: false,
      adminToggle: false,
      newMangaText: '',
      listOfManga: [],
      error: null,
      errors: [],
      mangaName: null,
      mangaUrl: null,
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
      // have to use slice() method too, cuz sort will modify listOfManga object
      // which is reactive because of Vue, so Vue will re-render the page twice ...
      return this.listOfManga.slice().sort((a, b) => {
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
    addNewManga: function (e) {
      e.preventDefault();
      this.errors = [];

      if (!this.mangaName) {
        this.errors.push('Manga name required.');
      }
      if (!this.mangaUrl) {
        this.errors.push('Manga url required.');
      }

      _request('/api/manga', 'POST', { name: this.mangaName, url: this.mangaUrl })
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
        _request('/api/manga/admin/edit/' + manga.id, 'PATCH', {
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
        _request('/api/manga/delete/' + manga.id, 'DELETE')
          .then(() => {
            this.listOfManga.splice(this.listOfManga.indexOf(manga), 1);
          })
          .catch(error => {
            this.error = error;
          });
      }
    },

  }
}).mount('#app')

const auth = Vue.createApp({
  data() {
    return {
      errors: [],
      isUserLoggedIn: false,
      email: null,
      password: null,
    }
  },
  methods: {
    login: function (event) {
      if (event) event.preventDefault()

      this.errors = []

      if (!this.email) {
        this.errors.push('email required.');
      }
      if (!this.password) {
        this.errors.push('password required.');
      }

      _request('/auth/login', 'POST',
        { email: this.email, password: this.password })
        .then(() => {
          location.reload();
        })
        .catch(error => this.error = error);
    },
    logout: function (event) {
      if (event) event.preventDefault()
      _request('/auth/logout', 'POST')
        .then(() => {
          location.reload();
        })
        .catch(error => {
          this.error = error;
        });
    },
  }
}).mount('#auth')

app.error = null;

_request('/api/mangas', 'GET')
  .then(function (listOfManga) {
    for (let manga of listOfManga) {
      manga.editedUrl = manga.url.replace('%%N%%', manga.pageNum)
      manga.nextUrl = manga.url.replace('%%N%%', manga.pageNum + 1)
      manga.hasNext = false
    }
    app.listOfManga = listOfManga
    for (let manga of app.listOfManga) {
      _request('/api/tst', 'POST', { url: manga.nextUrl }).then(function (data) {
        manga.hasNext = data.result
      })
    }
    auth.isUserLoggedIn = true
  })
  .catch((error) => {
    app.error = error
    auth.isUserLoggedIn = false
    _request('/auth/cleanUpExpiredSessions', 'GET')
  });
