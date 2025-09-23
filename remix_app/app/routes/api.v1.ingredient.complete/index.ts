import { ActionFunction, json } from '@remix-run/node';
import { getIngredientWithAdverseEffects } from '~/.server/services/onsidesDB/db';

// Simple in-memory cache for ingredient data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const action: ActionFunction = async ({ request}) => {
    const { id } = await request.json();
    
    // Check cache first
    const cacheKey = `ingredient-${id}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        return json(cached.data, {
            headers: {
                'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
            }
        });
    }
    
    try {
        const data = await getIngredientWithAdverseEffects(id);
        const response = { 
            success: true, 
            ingredient: data.ingredient,
            adverseEffects: data.adverseEffects 
        };
        
        // Cache the response
        cache.set(cacheKey, { data: response, timestamp: now });
        
        // Clean up old cache entries (simple cleanup)
        if (cache.size > 1000) {
            const oldestKeys = Array.from(cache.keys()).slice(0, 100);
            oldestKeys.forEach(key => cache.delete(key));
        }
        
        return json(response, {
            headers: {
                'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
            }
        });
    } catch (error) {
        console.error('Error fetching ingredient data:', error);
        return json({ 
            success: false, 
            error: 'Failed to fetch ingredient data' 
        }, { status: 500 });
    }
};
