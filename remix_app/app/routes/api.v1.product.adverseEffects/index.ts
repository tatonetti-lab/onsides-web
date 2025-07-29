import { ActionFunction, json } from '@remix-run/node';
import { getProductAdverseEffects } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({ request}) => {
    const { id } = await request.json();
    const productAdverseEffects = await getProductAdverseEffects(id);
    return json({ success: true, productAdverseEffects });
};

