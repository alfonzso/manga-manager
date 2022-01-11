import { Context, Get, hashPassword, HttpResponseOK, HttpResponseRedirect, HttpResponseUnauthorized, Post, Session, ValidateBody, verifyPassword } from '@foal/core';

import { User } from '../entities';

const credentialsSchema = {
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' }
  },
  required: [ 'email', 'password' ],
  type: 'object',
};

export class AuthController {

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
}