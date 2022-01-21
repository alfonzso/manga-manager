// import request from 'request'
// var request = require('request');
// import { request } from "request"
// import { writeFileSync } from 'fs';
// const request = require("request")

// import { request } from '../node_modules/request/request.js';
// import { request } from '../node_modules/request/request.js';
// import * as request from '../node_modules/request/request.js';

function _request(url, method, body) {
  return fetch(url, {
    method,
    mode: 'no-cors',
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
      // have to use slice() method too, cuz sort will modify listOfManga object
      // which is reactive because of Vue, so Vue will re-render the page twice ...
      return this.listOfManga.slice().sort((a, b) => {
        return a.order - b.order;
      });
    },
  },
  methods: {
    testit: function (txt) {
      // e.preventDefault();
      // console.log(txt)
    },
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
});


const auth = new Vue({
  el: '#auth',
  data: {
    // counter: 0,
    errors: [],
    isUserLoggedIn: false,
    email: null,
    password: null,
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
})

app.error = null;
_request('/api/mangas', 'GET')
  // .then((listOfManga) => {
  .then(function (listOfManga) {
    // .then(async function (listOfManga) {
    for (let manga of listOfManga) {
      manga.editedUrl = manga.url.replace('%%N%%', manga.pageNum)
      manga.nextUrl = manga.url.replace('%%N%%', manga.pageNum + 1)
      // let fef = await nextUrlCheck(manga.editedUrl)
      // let fef = nextUrlCheck(manga.nextUrl)
      // console.log(fef)
    }
    app.listOfManga = listOfManga
    auth.isUserLoggedIn = true
  })
  .catch((error) => {
    app.error = error
    auth.isUserLoggedIn = false
    _request('/auth/cleanUpExpiredSessions', 'GET')
  });

// async function nextUrlCheck(url) {
//   try {
//     const resp = await fetch(
//       url, {
//       method: 'GET',
//       redirect: 'error',
//       mode: 'no-cors',
//       headers: {
//         'Content-Type': 'application/json',
//       }
//     });
//     console.info(resp + " <xxx ");
//     return true;
//   } catch (err) {
//     console.info(err + " <==== ");
//     return false;
//   }
// }

// _request('https://api.github.com/users/KrunalLathiya', 'GET')
//   .then(function (resp) {
//     console.info(resp + " <xxxxx ");
//   })
//   .catch(function (err) {
//     console.info(err + " <==== ");
//   });


// async function firstFunction() {
//   const response = await fetch('https://w12.mangafreak.net/Read1_Onepunch_Man_156', {
//     headers: {
//       // 'Content-Type': 'application/json',
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': '*',
//       "Access-Control-Allow-Methods": '*',
//     },
//     // mode: 'same-origin',
//   })
//   console.log(response.status)
//   const data = await response.text();
//   console.log(data)
//   console.log(response.status)
// };

// firstFunction()

// // fetch('https://api.github.com/users/KrunalLathiya')
// await fetch('https://w12.mangafreak.net/Read1_Onepunch_Man_156', {
//   mode: 'no-cors',
// })
//   .then(response => {
//     try {
//       console.log(response.status); // Will show you the status
//       console.log("kekk")
//       return response.text()
//       return response.json()
//     } catch (error) {
//       console.log("feeeeeeee")
//       return response
//     }
//   })
//   .then(data => {
//     console.log("reeeeeeeeeee")
//     console.log(data) // Prints result from `response.json()` in getRequest
//   })
//   .catch(error => {
//     console.error(error)
//   })

// fetch(
//   'https://w12.mangafreak.net/Read1_Onepunch_Man_156', {
//   method: 'GET',
//   // redirect: 'error',
//   redirect: 'manual',
//   mode: 'no-cors',
//   // body: JSON.stringify(''),
//   headers: {
//     'Content-Type': 'application/json',
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': '*'
//   }
// })
//   .then(function (resp) {
//     console.info(resp + " <xxxxx ");
//   })
//   .catch(function (err) {
//     console.info(err + " <==== ");
//   });

// nextUrlCheck("https://w12.mangafreak.net/Read1_Onepunch_Man_156")

// const request = require('request');
// requirejs(["request"], function (request) {
//   // const headerEl = document.getElementById("header");
//   // headerEl.textContent = lodash.upperCase("hello world");
//   request('http://www.google.com', function (error, response, body) {
//     console.error('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     console.log('body:', body); // Print the HTML for the Google homepage.
//   });
// });

// request('http://www.google.com', function (error, response, body) {
//   console.error('error:', error); // Print the error if one occurred
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   console.log('body:', body); // Print the HTML for the Google homepage.
// });


// fetch('http://www.google.com')
//   .then(response => response.json())
//   .then(data => console.log(data));

// fetch('https://api.github.com/users/KrunalLathiya')
// await fetch(
//   // 'https://w12.mangafreak.net/Read1_Onepunch_Man_156', {
//   'https://api.github.com/users/KrunalLathiya', {
//   headers: {
//     'Content-Type': 'text/html',
//     //     'Access-Control-Allow-Origin': '*',
//     //     'Access-Control-Allow-Headers': '*'
//   },
//   mode: 'no-cors',
// })
//   .then(response => response.json())
//   .then(response => console.log(response.json()))
//   .catch((error) => {
//     console.log(error)
//   });

// await fetch(
//   'https://w12.mangafreak.net/Read1_Onepunch_Man_157', {
//   headers: {
//     'Content-Type': 'text/html',
//     //     'Access-Control-Allow-Origin': '*',
//     //     'Access-Control-Allow-Headers': '*'
//   },
//   mode: 'no-cors',
// })
//   .then(response => console.log(response))
//   .catch((error) => {
//     console.log(error)
//   });


// fetch('https://w12.mangafreak.net/Read1_Onepunch_Man_156', {
//   mode: 'no-cors',
//   // redirect: 'manual',
//   method: "GET",
//   headers: {
//     'Content-Type': 'application/json',
//   //   "Access-Control-Allow-Origin": "*",
//   //   "Access-Control-Allow-Credentials": "true",
//   //   "Access-Control-Allow-Methods": "OPTIONS, GET, POST",
//   //   "Access-Control-Allow-Headers": "Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control",
//   }
// }).then(response => {
//   // if (!response.ok) {
//   //   let faf = Promise.reject({
//   //     status: response.status,
//   //     statusText: response.statusText,
//   //     method: "GET",
//   //     url: response.url
//   //   });
//   //   console.log(faf)
//   //   return
//   // }

//   console.log(response)

//   // return response.json().catch(() => { });
// });