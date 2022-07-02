import {
  Context, Get, Post, Delete, HttpResponseOK, HttpResponseCreated,
  HttpResponseNotFound, HttpResponseNoContent, Patch, UserRequired
} from '@foal/core';
import { Manga } from '../entities';
import * as cheerio from 'cheerio';
import axios, { AxiosResponse } from 'axios';

@UserRequired()
export class ApiController {

  // @dependency
  // store: Store;

  // @Get('/')
  // index(ctx: Context) {
  //   return new HttpResponseOK('Hello world!');
  // }

  // @Get('/tst')
  // @Post('/tst')
  // async tst(ctx: Context) {
  //   // const listOfManga = await Manga.find();
  //   console.log(ctx.user)
  //   return new HttpResponseOK();
  // }

  @Get('/mangas')
  async getMangas() {
    const listOfManga = await Manga.find();
    return new HttpResponseOK(listOfManga);
  }

  @Patch('/manga/page/:id')
  async modifyPage(ctx: Context) {

    const manga = await Manga.findOne({ id: ctx.request.params.id });

    // Return a 404 Not Found response if no such manga exists.
    if (!manga) {
      return new HttpResponseNotFound();
    }

    manga.pageNum = ctx.request.body.pageNum;
    // Save the mangas in the database.
    await manga.save();

    // Return the new mangas with the id generated by the database. The status is 201.
    // return new HttpResponseCreated(manga);
    return new HttpResponseNoContent();

  }

  @Patch('/manga/admin/edit/:id')
  async adminEdit(ctx: Context) {

    const manga = await Manga.findOne({ id: ctx.request.params.id });

    // Return a 404 Not Found response if no such manga exists.
    if (!manga) {
      return new HttpResponseNotFound();
    }

    manga.name = ctx.request.body.name
    manga.url = ctx.request.body.url
    manga.order = ctx.request.body.order
    // Save the mangas in the database.
    await manga.save();

    // Return the new mangas with the id generated by the database. The status is 201.
    // return new HttpResponseCreated(manga);
    return new HttpResponseNoContent();

  }

  @Post('/manga')
  async postMangas(ctx: Context) {
    // Create a new mangas with the body of the HTTP request.
    const manga = new Manga();
    manga.name = ctx.request.body.name;
    manga.url = ctx.request.body.url;
    manga.pageNum = 0;
    manga.hidden = false;
    manga.order = 0;

    // Save the mangas in the database.
    await manga.save();

    // Return the new mangas with the id generated by the database. The status is 201.
    return new HttpResponseCreated(manga);
  }

  @Post('/manga/hide/:id')
  async hideManga(ctx: Context) {
    // Create a new mangas with the body of the HTTP request.
    const manga = await Manga.findOne({ id: ctx.request.params.id });

    // Return a 404 Not Found response if no such manga exists.
    if (!manga) {
      return new HttpResponseNotFound();
    }

    // Save the mangas in the database.
    manga.hidden = !manga.hidden;
    await manga.save();

    // Return the new mangas with the id generated by the database. The status is 201.
    return new HttpResponseNoContent();
  }

  @Delete('/manga/delete/:id')
  async deleteManga(ctx: Context) {
    // Get the manga with the id given in the URL if it exists.
    const manga = await Manga.findOne({ id: ctx.request.params.id });

    // Return a 404 Not Found response if no such manga exists.
    if (!manga) {
      return new HttpResponseNotFound();
    }

    // Remove the manga from the database.
    await manga.remove();

    // Returns an successful empty response. The status is 204.
    return new HttpResponseNoContent();
  }

  @Post('/nextChapterChecker')
  async tstPost(ctx: Context) {
    const { mangas } = ctx.request.body

    const axiosGetss = mangas.map(manga => {
      return axios.get(manga.url).then((reqResult) => {
        return {
          'id': manga.id,
          'value': cheerio.load(reqResult.data)("title").text().toLocaleLowerCase().includes("chapter")
        };
      })
    })

    return new HttpResponseOK(
      {
        results: await Promise.all(axiosGetss)
      }
    );
  }

}
