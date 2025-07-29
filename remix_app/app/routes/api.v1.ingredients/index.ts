import { ActionFunction, json } from '@remix-run/node';
import { getIngredients } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({}) => {
    const ingredients = await getIngredients();
    return json({ success: true, ingredients });
};

