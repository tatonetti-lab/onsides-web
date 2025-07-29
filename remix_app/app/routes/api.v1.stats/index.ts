import { ActionFunction, json } from '@remix-run/node';
import { getStats } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({}) => {
    const stats = await getStats();
    return json({ success: true, stats });
};

