export const getAdverseEffects = async () => {
    const response = await fetch('/api/v1/adverseEffects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
    });
    return response.json();
}