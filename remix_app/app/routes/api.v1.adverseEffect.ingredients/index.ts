import { ActionFunction, json } from '@remix-run/node';
import { getAdverseEffectsIngredients } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({ request }) => {
    const { id } = await request.json();
    const adverseEffects = await getAdverseEffectsIngredients(id);
    return json({ success: true, adverseEffects });
};

