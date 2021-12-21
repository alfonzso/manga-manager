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

    return response.json().catch(() => {});
  });
}

const app = new Vue({
  el: '#app',
  data: {
    newMangaText: '',
    mangas: [
      // {
      //   id: 1,
      //   text: 'Donald Duck'
      // }
    ],
    error: null
  },
  methods: {
    addNewManga: function () {
      if (!this.newMangaText) { return; }

      this.error = null;
      request('/api/mangas', 'POST', { text: this.newMangaText })
        .then(manga => this.mangas.push(manga))
        .catch(error => this.error = error);

      this.newMangaText = '';
    },
    hideManga: function (manga, event) {
      if (event) event.preventDefault()

      this.error = null;
      request('/api/mangas/' + manga.id, 'DELETE')
        .then(() => {
          const index = this.mangas.indexOf(manga);
          this.mangas.splice(index, 1);
        })
        .catch(error => {
          this.error = error;
        });
    }
  }
});

app.error = null;
request('/api/mangas', 'GET')
  .then(mangas => app.mangas = mangas)
  .catch(error => app.error = error);