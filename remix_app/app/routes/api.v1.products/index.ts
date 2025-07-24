import { ActionFunction, json } from '@remix-run/node';
import { getProducts } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({}) => {
    const products = await getProducts();
    return json({ success: true, products });
};

