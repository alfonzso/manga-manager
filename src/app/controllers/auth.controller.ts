import { Config, Context, createSession, dependency, Get, HttpResponseOK, HttpResponseRedirect, HttpResponseUnauthorized, Post, Session, Store, ValidateBody, verifyPassword } from '@foal/core';

import { User } from '../entities';

import * as cheerio from 'cheerio';

const credentialsSchema = {
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' }
  },
  required: ['email', 'password'],
  type: 'object',
};

export class AuthController {
  // This line is required.
  @dependency
  store: Store;

  // @Post('/signup')
  // @ValidateBody(credentialsSchema)
  // async signup(ctx: Context<any, Session>) {
  //   const user = new User();
  //   user.email = ctx.request.body.email;
  //   user.password = await hashPassword(ctx.request.body.password);
  //   await user.save();

  //   ctx.session.setUser(user);
  //   await ctx.session.regenerateID();

  //   return new HttpResponseOK();
  // }

  @Post('/login')
  @ValidateBody(credentialsSchema)
  async login(ctx: Context<any, Session>) {
    const user = await User.findOne({ email: ctx.request.body.email });

    if (!user) {
      return new HttpResponseUnauthorized();
    }

    if (!await verifyPassword(ctx.request.body.password, user.password)) {
      return new HttpResponseUnauthorized();
    }

    if (!ctx.session) {
      console.log(ctx.session, this.store)
      ctx.session = await createSession(this.store);
      console.log(ctx.session, this.store)
      // ctx.session.
    }

    ctx.session.setUser(user);
    await ctx.session.regenerateID();

    // return new HttpResponseOK();
    return new HttpResponseRedirect('/');

  }

  // @Get('/logout')
  @Post('/logout')
  async logout(ctx: Context<any, Session>) {
    await ctx.session.destroy();

    // return new HttpResponseOK();
    return new HttpResponseRedirect('/');
  }

  @Get('/cleanUpExpiredSessions')
  async cleanUpExpiredSessions(ctx: Context<any, Session>) {
    const expirationTimeouts: { absolute: number, inactivity: number } = Config.get('settings.session.expirationTimeouts', 'any', { absolute: 604800, inactivity: 900 });
    this.store.cleanUpExpiredSessions(expirationTimeouts.inactivity, expirationTimeouts.absolute)
    return new HttpResponseOK();
  }

  @Get('/tst')
  async tst(ctx: Context<any, Session>) {
    const request = require('request');
    // request('https://w12.mangafreak.net/Read1_Onepunch_Man_156', function (error, response, body) {
    //   // console.error('error:', error); // Print the error if one occurred
    //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //   // console.log('body:', body); // Print the HTML for the Google homepage.
    // });



    request('https://www.mangaread.org/manga/overgeared-2020-manhwa/chapter-111/',
      {
        method: 'GET',
        followRedirect: false,
        followAllRedirects: false
      },
      function (error, response, body) {
        // console.error('error:', error); // Print the error if one occurred
        console.log('111 statusCode:', response.statusCode); // Print the response status code if a response was received
        // console.log('statusCode:', response); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        // var parser = new DOMParser();
        // var htmlDoc = parser.parseFromString(body, 'text/html');
        // console.log(
        //   // htmlDoc.querySelectorAll()
        //   htmlDoc.title
        // )
        // const cheerio = require('cheerio');
        const $ = cheerio.load(body);
        console.log(
          $("title").text(),
          // $.html(),
          // response
        )
      });



    request('https://www.mangaread.org/manga/overgeared-2020-manhwa/chapter-115/',
      {
        method: 'GET',
        followRedirect: false,
        followAllRedirects: false
      },
      function (error, response, body) {
        // console.error('error:', error); // Print the error if one occurred
        console.log('1115 statusCode:', response.statusCode); // Print the response status code if a response was received
        // console.log('statusCode:', response); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        // const cheerio = require('cheerio');
        const $ = cheerio.load(body);
        console.log(
          $("title").text()
        )
      });




    // request('https://w12.mangafreak.net/Read1_Onepunch_Man_156',
    request('https://www.mangaread.org/manga/the-beginning-after-the-end/chapter-130/',
      {
        method: 'GET',
        followRedirect: false,
        followAllRedirects: false
      },
      function (error, response, body) {
        // console.error('error:', error); // Print the error if one occurred
        console.log('ok statusCode:', response.statusCode); // Print the response status code if a response was received
        // console.log('statusCode:', response); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        const $ = cheerio.load(body);
        console.log(
          $("title").text()
        )
      });


    // request('https://w12.mangafreak.net/Read1_Onepunch_Man_157',
    request('https://www.mangaread.org/manga/the-beginning-after-the-end/chapter-128/',
      {
        method: 'GET',
        followRedirect: false,
        followAllRedirects: false
      },
      function (error, response, body) {
        // console.error('error:', error); // Print the error if one occurred
        console.log('mo statusCode:', response.statusCode); // Print the response status code if a response was received
        // console.log('statusCode:', response); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        const $ = cheerio.load(body);
        console.log(
          $("title").text()
        )
      });
    return new HttpResponseOK();
  }
}

