<template>
  <div id="auth">
    <form @submit="login" method="post" v-if="!isUserLoggedIn">
      <input v-model="email" type="email" name="email" id="email">
      <input v-model="password" type="password" name="password" id="password">
      <input type="submit" value="Log In">
    </form>
    <button type="submit" class="btn btn-success" @click="logout($event)" v-if="isUserLoggedIn">LogOut</button>
    <div class="box error-box" v-if="errors.length">
      <p>
        <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors" :key="error.id">{{ error }}</li>
      </ul>
      </p>
    </div>
  </div>
</template>

<script>
import { _request } from '@/request'

export default {
  name: 'AuthPage',
  props: ['isUserLoggedIn'],
  data() {
    return {
      errors: [],
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
}
</script>