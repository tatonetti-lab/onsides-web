import { ActionFunction, json } from '@remix-run/node';
import { getAllTerms } from '~/.server/services/onsidesDB/db';

export const action: ActionFunction = async ({}) => {
    const terms = await getAllTerms();
    return json({ success: true, terms });
};

