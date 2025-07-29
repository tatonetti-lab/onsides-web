export const getIngredients = async () => {
    const response = await fetch('/api/v1/ingredients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
    });
    return response.json();
}