// 3p
import { createConnection } from 'typeorm';
import { Manga } from '../app/entities';

export const schema = {
  additionalProperties: false,
  properties: {
    url: { type: 'string' },
    name: { type: 'string' },
    pageNum: { type: 'number' },
    hidden: { type: 'boolean' },
    order: { type: 'number' },
  },
  required: ['url', 'name'],
  type: 'object',
};

export async function main(args: any) {
  const connection = await createConnection();

  try {
    const manga = new Manga();
    manga.name = args.name;
    manga.url = args.url;
    manga.pageNum = 0;
    manga.hidden = false;
    manga.order = 0;

    console.log(await manga.save());
  } catch (error) {
    console.error(error);
  } finally {
    await connection.close();
  }
}
