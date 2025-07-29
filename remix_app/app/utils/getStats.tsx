export const getStats = async () => {
    const response = await fetch('/api/v1/stats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
    });
    return response.json();
}