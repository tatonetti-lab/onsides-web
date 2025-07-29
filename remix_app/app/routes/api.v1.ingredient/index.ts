import { ActionFunction, json } from '@remix-run/node';
import { getIngredient } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({ request}) => {
    const { id } = await request.json();
    const ingredient = await getIngredient(id);
    return json({ success: true, ingredient });
};

