import { ActionFunction, json } from '@remix-run/node';
import { getAdverseEffects } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({}) => {
    const adverseEffects = await getAdverseEffects();
    return json({ success: true, adverseEffects });
};

