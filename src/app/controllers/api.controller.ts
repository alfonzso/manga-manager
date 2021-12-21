import { Context, Get, HttpResponseOK } from '@foal/core';
import { Mangas } from '../entities';

export class ApiController {

  // @Get('/')
  // index(ctx: Context) {
  //   return new HttpResponseOK('Hello world!');
  // }

  @Get('/mangas')
  async getTodos() {
    const todos = await Mangas.find();
    return new HttpResponseOK(todos);
  }

}
