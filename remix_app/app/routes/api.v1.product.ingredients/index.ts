import { ActionFunction, json } from '@remix-run/node';
import { getProductIngredients } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({ request}) => {
    const { id } = await request.json();
    const productIngredients = await getProductIngredients(id);
    console.log("Fetched product ingredients:", productIngredients); // Log the fetched ingredients for debugging
    return json({ success: true, productIngredients });
};

