import { ActionFunction, json } from '@remix-run/node';
import { getProductDetails } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({ request}) => {
    const { id } = await request.json();
    const product = await getProductDetails(id);
    return json({ success: true, product });
};

