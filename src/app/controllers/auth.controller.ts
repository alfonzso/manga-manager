import { ApiInfo, Config, Context, createSession, dependency, Get, HttpResponseOK, HttpResponseRedirect, HttpResponseUnauthorized, Post, Session, Store, ValidateBody, verifyPassword } from '@foal/core';

import { User } from '../entities';

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

}