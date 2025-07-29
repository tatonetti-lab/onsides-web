export const getAllTerms = async () => {
    const response = await fetch('/api/v1/terms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
    });
    return response.json();
}