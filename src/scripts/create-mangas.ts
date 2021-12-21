// 3p
import { createConnection } from 'typeorm';
import { Mangas } from '../app/entities';

export const schema = {
  additionalProperties: false,
  properties: {
    url: { type: 'string' },
    pageNum: { type: 'number' },
    hidden: { type: 'boolean' }
  },
  required: ['url'],
  type: 'object',
};

export async function main(args: any) {
  const connection = await createConnection();

  try {
    const mangas = new Mangas();
    mangas.url = args.url;
    mangas.pageNum = 0;
    mangas.hidden = false;

    console.log(await mangas.save());
  } catch (error) {
    console.error(error);
  } finally {
    await connection.close();
  }
}
