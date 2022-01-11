import { Context, controller, dependency, Get, IAppController, render, Session, Store, UserRequired, UseSessions } from '@foal/core';
import { fetchUser } from '@foal/typeorm';
import { createConnection } from 'typeorm';

import { User } from './entities';
import { ApiController, AuthController } from './controllers';

@UseSessions({
  cookie: true,
  user: fetchUser(User)
})
export class AppController implements IAppController {
  // This line is required.
  @dependency
  store: Store;

  subControllers = [
    controller('/auth', AuthController),
    controller('/api', ApiController),
  ];

  async init() {
    await createConnection();
  }

}