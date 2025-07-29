import { ActionFunction, json } from '@remix-run/node';
import { getAdverseEffect } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({request}) => {
    const { id } = await request.json();
    const adverseEffect = await getAdverseEffect(id);
    return json({ success: true, adverseEffect });
};

